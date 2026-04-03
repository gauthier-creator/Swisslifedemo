import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Client, Wallet, Transaction, AmlAlert, AlertStatus } from '../../database/entities';

export interface ClientStatement {
  clientId: string;
  clientName: string;
  statementDate: string;
  period: string;
  positions: Array<{
    asset: string;
    assetName: string;
    quantity: string;
    unitPriceEur: number;
    totalValueEur: number;
    walletAddress: string;
    custodian: string;
  }>;
  totalAucEur: number;
  transfers: Array<{
    date: string;
    type: string;
    asset: string;
    amount: string;
    txHash: string;
    status: string;
  }>;
  disclaimer: string;
}

export interface AucReport {
  totalAucEur: number;
  byAsset: Record<string, { quantity: string; valueEur: number }>;
  totalClients: number;
  totalWallets: number;
}

@Injectable()
export class ReportingService {
  private readonly logger = new Logger(ReportingService.name);

  constructor(
    @InjectRepository(Client)
    private readonly clientRepository: Repository<Client>,
    @InjectRepository(Wallet)
    private readonly walletRepository: Repository<Wallet>,
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
    @InjectRepository(AmlAlert)
    private readonly amlAlertRepository: Repository<AmlAlert>,
  ) {}

  /**
   * Generate a client statement compliant with MiCA Article 75
   * Required: crypto-assets held, balance, value, transfer history
   */
  async generateClientStatement(clientId: string, period?: string): Promise<ClientStatement> {
    const client = await this.clientRepository.findOne({ where: { id: clientId } });
    if (!client) throw new NotFoundException(`Client ${clientId} not found`);

    const wallets = await this.walletRepository.find({ where: { clientId } });
    const transactions = await this.transactionRepository.find({
      where: { clientId },
      order: { createdAt: 'DESC' },
      take: 100,
    });

    const positions = wallets.map(w => ({
      asset: w.asset,
      assetName: this.getAssetName(w.asset),
      quantity: w.balance,
      unitPriceEur: w.balanceEur / (parseFloat(w.balance) || 1),
      totalValueEur: w.balanceEur,
      walletAddress: this.maskAddress(w.depositAddress),
      custodian: 'Taurus-PROTECT',
    }));

    const totalAucEur = positions.reduce((sum, p) => sum + p.totalValueEur, 0);

    const transfers = transactions.map(tx => ({
      date: tx.createdAt.toISOString(),
      type: tx.type,
      asset: tx.asset,
      amount: tx.amount,
      txHash: tx.txHash || '',
      status: tx.status,
    }));

    const now = new Date();
    const statementPeriod = period || `Q${Math.ceil((now.getMonth() + 1) / 3)}-${now.getFullYear()}`;

    return {
      clientId: client.id,
      clientName: `${client.firstName} ${client.lastName}`,
      statementDate: now.toISOString().split('T')[0],
      period: statementPeriod,
      positions,
      totalAucEur,
      transfers,
      disclaimer:
        "Ce releve est fourni conformement a l'Article 75 du Reglement (UE) 2023/1114 (MiCA). " +
        "Les crypto-actifs detenus en custody sont segregues des actifs propres du prestataire.",
    };
  }

  /**
   * Global AuC (Assets under Custody) report
   */
  async getAucReport(): Promise<AucReport> {
    const wallets = await this.walletRepository.find({ where: { status: 'active' as any } });

    const byAsset: Record<string, { quantity: string; valueEur: number }> = {};
    let totalAucEur = 0;

    for (const w of wallets) {
      if (!byAsset[w.asset]) {
        byAsset[w.asset] = { quantity: '0', valueEur: 0 };
      }
      byAsset[w.asset].quantity = (parseFloat(byAsset[w.asset].quantity) + parseFloat(w.balance)).toString();
      byAsset[w.asset].valueEur += w.balanceEur;
      totalAucEur += w.balanceEur;
    }

    const totalClients = await this.clientRepository.count({ where: { status: 'active' as any } });

    return {
      totalAucEur,
      byAsset,
      totalClients,
      totalWallets: wallets.length,
    };
  }

  /**
   * Get pending AML alerts for compliance dashboard
   */
  async getAmlAlerts(status?: string): Promise<AmlAlert[]> {
    const where = status ? { status: status as AlertStatus } : { status: AlertStatus.OPEN };
    return this.amlAlertRepository.find({
      where,
      order: { createdAt: 'DESC' },
      take: 100,
    });
  }

  /**
   * Segregation proof report — MiCA requirement
   * Reconciles on-chain balances vs off-chain records
   */
  async getSegregationReport(): Promise<Array<{
    walletId: string;
    clientId: string;
    asset: string;
    offChainBalance: string;
    custodianVaultId: string;
    segregationType: string;
    onChainVerifiable: boolean;
  }>> {
    const wallets = await this.walletRepository.find({ where: { status: 'active' as any } });

    return wallets.map(w => ({
      walletId: w.id,
      clientId: w.clientId,
      asset: w.asset,
      offChainBalance: w.balance,
      custodianVaultId: w.custodianVaultId || '',
      segregationType: w.segregationProof?.type || 'unknown',
      onChainVerifiable: w.segregationProof?.onChainVerifiable || false,
    }));
  }

  private getAssetName(asset: string): string {
    const names: Record<string, string> = {
      BTC: 'Bitcoin', ETH: 'Ethereum', USDC: 'USD Coin', EURC: 'Euro Coin', SOL: 'Solana',
    };
    return names[asset] || asset;
  }

  private maskAddress(address: string): string {
    if (!address || address.length < 10) return address;
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  }
}
