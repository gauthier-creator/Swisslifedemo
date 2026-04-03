import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  Transaction, TransactionType, TransactionStatus, AmlScore,
  Wallet, WalletStatus,
} from '../../database/entities';
import { CreateWithdrawalDto } from './dto/create-withdrawal.dto';
import { AuditService, AuditContext } from '../../common/audit/audit.service';
import { AuditAction } from '../../database/entities';
import { TaurusService } from '../../integrations/taurus/taurus.service';
import { ChainanalysisService } from '../../integrations/chainalysis/chainalysis.service';
import { NotabeneService } from '../../integrations/notabene/notabene.service';

// Transaction Authorization Policy (TAP) - from PRD section 4.2.3
interface ApprovalRule {
  name: string;
  maxAmountEur: number;
  maxAmlScore: AmlScore;
  approvalType: 'auto' | 'single' | 'multi';
  requiredRoles?: string[];
  quorum?: number;
}

const TAP_RULES: ApprovalRule[] = [
  { name: 'small_withdrawal', maxAmountEur: 5000, maxAmlScore: AmlScore.LOW, approvalType: 'auto' },
  { name: 'medium_withdrawal', maxAmountEur: 50000, maxAmlScore: AmlScore.MEDIUM, approvalType: 'single', requiredRoles: ['advisor_manager'] },
  { name: 'large_withdrawal', maxAmountEur: Infinity, maxAmlScore: AmlScore.HIGH, approvalType: 'multi', requiredRoles: ['advisor_manager', 'compliance_officer'], quorum: 2 },
];

@Injectable()
export class TransactionsService {
  private readonly logger = new Logger(TransactionsService.name);

  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
    @InjectRepository(Wallet)
    private readonly walletRepository: Repository<Wallet>,
    private readonly auditService: AuditService,
    private readonly taurusService: TaurusService,
    private readonly chainanalysisService: ChainanalysisService,
    private readonly notabeneService: NotabeneService,
  ) {}

  async createWithdrawal(dto: CreateWithdrawalDto, auditCtx: AuditContext): Promise<Transaction> {
    // 1. Validate wallet
    const wallet = await this.walletRepository.findOne({ where: { id: dto.walletId } });
    if (!wallet) throw new NotFoundException(`Wallet ${dto.walletId} not found`);
    if (wallet.status !== WalletStatus.ACTIVE) throw new BadRequestException('Wallet is not active');
    if (wallet.asset !== dto.asset) throw new BadRequestException(`Asset mismatch: wallet is ${wallet.asset}`);

    // 2. Create transaction in pending state
    const tx = this.transactionRepository.create({
      walletId: dto.walletId,
      clientId: wallet.clientId,
      type: TransactionType.WITHDRAWAL,
      asset: dto.asset,
      amount: dto.amount,
      destinationAddress: dto.destinationAddress,
      sourceAddress: wallet.depositAddress,
      status: TransactionStatus.PENDING_AML,
      initiatedBySalesforceUserId: dto.initiatedBy.salesforceUserId,
      initiatedByRole: dto.initiatedBy.role,
      initiatedByIp: dto.initiatedBy.ipAddress || null,
      memo: dto.memo || null,
      travelRuleData: {
        originator: {
          name: '', // Will be filled from client data
          accountId: wallet.depositAddress,
          address: wallet.depositAddress,
        },
        beneficiary: {
          name: dto.beneficiary.name,
          accountType: dto.beneficiary.accountType,
          vaspName: dto.beneficiary.vaspName,
          vaspLei: dto.beneficiary.vaspLei,
        },
      },
    });

    const saved = await this.transactionRepository.save(tx);

    await this.auditService.log(AuditAction.TRANSACTION_INITIATED, auditCtx, {
      entityType: 'transaction',
      entityId: saved.id,
      metadata: { walletId: dto.walletId, amount: dto.amount, asset: dto.asset, destination: dto.destinationAddress },
    });

    // 3. Run AML screening (async but blocking for withdrawal)
    await this.runAmlScreening(saved, auditCtx);

    return this.transactionRepository.findOne({ where: { id: saved.id } }) as Promise<Transaction>;
  }

  private async runAmlScreening(tx: Transaction, auditCtx: AuditContext): Promise<void> {
    const screening = await this.chainanalysisService.screenAddress(tx.destinationAddress, tx.asset);

    tx.amlScore = screening.risk;
    tx.amlScreeningResult = screening.details as Record<string, unknown>;

    await this.auditService.log(AuditAction.TRANSACTION_AML_SCREENED, auditCtx, {
      entityType: 'transaction',
      entityId: tx.id,
      metadata: { risk: screening.risk, isSanctioned: screening.isSanctioned },
    });

    // BLOCKED if sanctioned or critical
    if (screening.isSanctioned || screening.risk === AmlScore.CRITICAL) {
      tx.status = TransactionStatus.BLOCKED;
      await this.transactionRepository.save(tx);
      await this.auditService.log(AuditAction.TRANSACTION_BLOCKED, auditCtx, {
        entityType: 'transaction', entityId: tx.id,
        metadata: { reason: screening.isSanctioned ? 'sanctioned_address' : 'critical_risk' },
      });
      return;
    }

    // Determine approval path via TAP
    const rule = this.determineApprovalRule(tx.amountEur || 0, screening.risk);
    if (rule.approvalType === 'auto') {
      tx.status = TransactionStatus.PENDING_SIGNING;
      tx.approvals = [{ role: 'system', userId: 'auto', decision: 'approved', timestamp: new Date().toISOString() }];
    } else {
      tx.status = TransactionStatus.PENDING_APPROVAL;
    }

    await this.transactionRepository.save(tx);

    // 4. Travel Rule check (TFR) — for transfers > EUR 1,000 to a CASP
    if (tx.amountEur && tx.amountEur > 1000 && tx.travelRuleData?.beneficiary?.accountType === 'casp') {
      await this.submitTravelRule(tx);
    }
  }

  private determineApprovalRule(amountEur: number, amlScore: AmlScore): ApprovalRule {
    const scoreOrder = [AmlScore.LOW, AmlScore.MEDIUM, AmlScore.HIGH, AmlScore.CRITICAL];
    for (const rule of TAP_RULES) {
      if (amountEur <= rule.maxAmountEur && scoreOrder.indexOf(amlScore) <= scoreOrder.indexOf(rule.maxAmlScore)) {
        return rule;
      }
    }
    return TAP_RULES[TAP_RULES.length - 1];
  }

  private async submitTravelRule(tx: Transaction): Promise<void> {
    if (!tx.travelRuleData) return;

    try {
      const vasp = await this.notabeneService.identifyVasp(tx.destinationAddress, tx.asset);
      if (vasp.isVasp) {
        await this.notabeneService.submitTransfer({
          originator: {
            name: tx.travelRuleData.originator.name,
            accountNumber: tx.travelRuleData.originator.accountId,
          },
          beneficiary: {
            name: tx.travelRuleData.beneficiary.name,
            accountNumber: tx.destinationAddress,
            vaspDid: vasp.vaspDid,
          },
          amount: tx.amount,
          asset: tx.asset,
        });
      }
    } catch (error) {
      this.logger.error(`Travel rule submission failed for tx ${tx.id}: ${error}`);
    }
  }

  async findOne(txId: string): Promise<Transaction> {
    const tx = await this.transactionRepository.findOne({ where: { id: txId } });
    if (!tx) throw new NotFoundException(`Transaction ${txId} not found`);
    return tx;
  }

  async findByClient(clientId: string, page = 1, limit = 20): Promise<{ data: Transaction[]; total: number }> {
    const [data, total] = await this.transactionRepository.findAndCount({
      where: { clientId },
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });
    return { data, total };
  }

  async getTravelRuleData(txId: string): Promise<Transaction['travelRuleData']> {
    const tx = await this.findOne(txId);
    return tx.travelRuleData;
  }

  async approveTransaction(txId: string, userId: string, role: string, auditCtx: AuditContext): Promise<Transaction> {
    const tx = await this.findOne(txId);
    if (tx.status !== TransactionStatus.PENDING_APPROVAL) {
      throw new BadRequestException('Transaction is not pending approval');
    }

    const approvals = tx.approvals || [];
    approvals.push({ role, userId, decision: 'approved', timestamp: new Date().toISOString() });
    tx.approvals = approvals;

    const rule = this.determineApprovalRule(tx.amountEur || 0, tx.amlScore || AmlScore.LOW);
    const approvedCount = approvals.filter(a => a.decision === 'approved').length;

    if (rule.approvalType === 'single' || (rule.quorum && approvedCount >= rule.quorum)) {
      tx.status = TransactionStatus.PENDING_SIGNING;
    }

    const saved = await this.transactionRepository.save(tx);

    await this.auditService.log(AuditAction.TRANSACTION_APPROVED, auditCtx, {
      entityType: 'transaction', entityId: txId,
      metadata: { approvedBy: userId, role, totalApprovals: approvedCount },
    });

    // If fully approved, sign and broadcast
    if (saved.status === TransactionStatus.PENDING_SIGNING) {
      await this.signAndBroadcast(saved, auditCtx);
    }

    return this.transactionRepository.findOne({ where: { id: txId } }) as Promise<Transaction>;
  }

  private async signAndBroadcast(tx: Transaction, auditCtx: AuditContext): Promise<void> {
    const wallet = await this.walletRepository.findOne({ where: { id: tx.walletId } });
    if (!wallet?.custodianVaultId) return;

    try {
      const result = await this.taurusService.signTransaction({
        vaultId: wallet.custodianVaultId,
        destinationAddress: tx.destinationAddress,
        amount: tx.amount,
        asset: tx.asset,
        note: tx.memo || undefined,
      });

      tx.custodianTransactionId = result.transactionId;
      tx.txHash = result.txHash;
      tx.status = TransactionStatus.PENDING_CONFIRMATION;
      await this.transactionRepository.save(tx);

      await this.auditService.log(AuditAction.TRANSACTION_BROADCASTED, auditCtx, {
        entityType: 'transaction', entityId: tx.id,
        metadata: { txHash: result.txHash, custodianTxId: result.transactionId },
      });
    } catch (error) {
      tx.status = TransactionStatus.FAILED;
      await this.transactionRepository.save(tx);
      this.logger.error(`Transaction signing failed for ${tx.id}: ${error}`);
    }
  }
}
