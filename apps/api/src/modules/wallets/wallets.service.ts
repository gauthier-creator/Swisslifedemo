import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Wallet, WalletStatus, CryptoAsset, Network, ClientStatus, Client } from '../../database/entities';
import { CreateWalletDto } from './dto/create-wallet.dto';
import { AuditService, AuditContext } from '../../common/audit/audit.service';
import { AuditAction } from '../../database/entities';
import { TaurusService } from '../../integrations/taurus/taurus.service';

const ASSET_NETWORK_MAP: Record<CryptoAsset, Network> = {
  [CryptoAsset.BTC]: Network.BITCOIN_MAINNET,
  [CryptoAsset.ETH]: Network.ETHEREUM_MAINNET,
  [CryptoAsset.USDC]: Network.ETHEREUM_MAINNET,
  [CryptoAsset.EURC]: Network.ETHEREUM_MAINNET,
  [CryptoAsset.SOL]: Network.SOLANA_MAINNET,
};

@Injectable()
export class WalletsService {
  private readonly logger = new Logger(WalletsService.name);

  constructor(
    @InjectRepository(Wallet)
    private readonly walletRepository: Repository<Wallet>,
    @InjectRepository(Client)
    private readonly clientRepository: Repository<Client>,
    private readonly auditService: AuditService,
    private readonly taurusService: TaurusService,
  ) {}

  async create(clientId: string, dto: CreateWalletDto, auditCtx: AuditContext): Promise<Wallet> {
    const client = await this.clientRepository.findOne({ where: { id: clientId } });
    if (!client) throw new NotFoundException(`Client ${clientId} not found`);
    if (client.status !== ClientStatus.ACTIVE && client.status !== ClientStatus.KYC_APPROVED) {
      throw new BadRequestException(`Client must have approved KYC before creating wallets`);
    }

    const network = ASSET_NETWORK_MAP[dto.asset];

    // Create segregated vault on custodian (1 vault per client per asset = MiCA segregation)
    const vault = await this.taurusService.createVault({
      name: `${client.lastName}-${client.id.substring(0, 8)}`,
      clientId,
      asset: dto.asset,
      network,
    });

    const wallet = this.walletRepository.create({
      clientId,
      asset: dto.asset,
      network,
      label: dto.label || `${dto.asset} Principal`,
      depositAddress: vault.depositAddress,
      status: WalletStatus.ACTIVE,
      custodianVaultId: vault.vaultId,
      custodianWalletId: vault.walletId,
      segregationProof: {
        type: 'dedicated_address',
        onChainVerifiable: true,
        custodianReference: vault.vaultId,
      },
    });

    const saved = await this.walletRepository.save(wallet);

    await this.auditService.log(AuditAction.WALLET_CREATED, auditCtx, {
      entityType: 'wallet',
      entityId: saved.id,
      metadata: { clientId, asset: dto.asset, custodianVaultId: vault.vaultId },
    });

    this.logger.log(`Wallet created: ${saved.id} (${dto.asset}) for client ${clientId}`);
    return saved;
  }

  async findByClient(clientId: string): Promise<Wallet[]> {
    return this.walletRepository.find({
      where: { clientId },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(walletId: string): Promise<Wallet> {
    const wallet = await this.walletRepository.findOne({ where: { id: walletId } });
    if (!wallet) throw new NotFoundException(`Wallet ${walletId} not found`);
    return wallet;
  }

  async getBalance(walletId: string): Promise<{ balance: string; balanceEur: number }> {
    const wallet = await this.findOne(walletId);
    if (!wallet.custodianVaultId) {
      return { balance: wallet.balance, balanceEur: wallet.balanceEur };
    }

    const custodianBalance = await this.taurusService.getBalance(wallet.custodianVaultId);

    // Update local balance cache
    wallet.balance = custodianBalance.balance;
    wallet.balanceEur = custodianBalance.balanceEur;
    await this.walletRepository.save(wallet);

    return custodianBalance;
  }

  async getDepositAddress(walletId: string): Promise<{ address: string; asset: string; network: string }> {
    const wallet = await this.findOne(walletId);
    return {
      address: wallet.depositAddress,
      asset: wallet.asset,
      network: wallet.network,
    };
  }
}
