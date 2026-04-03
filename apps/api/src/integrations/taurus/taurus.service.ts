import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';

export interface CreateVaultRequest {
  name: string;
  clientId: string;
  asset: string;
  network: string;
}

export interface CreateVaultResponse {
  vaultId: string;
  walletId: string;
  depositAddress: string;
  status: string;
}

export interface SignTransactionRequest {
  vaultId: string;
  destinationAddress: string;
  amount: string;
  asset: string;
  note?: string;
}

export interface SignTransactionResponse {
  transactionId: string;
  txHash: string;
  status: string;
}

@Injectable()
export class TaurusService {
  private readonly logger = new Logger(TaurusService.name);
  private readonly client: AxiosInstance;

  constructor(private readonly configService: ConfigService) {
    this.client = axios.create({
      baseURL: this.configService.get<string>('taurus.apiUrl'),
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': this.configService.get<string>('taurus.apiKey'),
      },
      timeout: 30000,
    });
  }

  /**
   * Create a segregated vault for a client (1 vault per client = MiCA segregation)
   */
  async createVault(request: CreateVaultRequest): Promise<CreateVaultResponse> {
    this.logger.log(`Creating vault for client ${request.clientId}, asset: ${request.asset}`);

    // TODO: Replace with actual Taurus-PROTECT API calls once sandbox access is granted
    // Taurus API docs: https://docs.taurus-protect.com
    const response = await this.client.post('/v1/vaults', {
      name: `${request.name}-${request.asset}`,
      type: 'segregated',
      blockchain: this.mapNetwork(request.network),
      metadata: {
        clientId: request.clientId,
      },
    });

    return {
      vaultId: response.data.id,
      walletId: response.data.walletId,
      depositAddress: response.data.address,
      status: response.data.status,
    };
  }

  /**
   * Get deposit address for a vault
   */
  async getDepositAddress(vaultId: string): Promise<string> {
    const response = await this.client.get(`/v1/vaults/${vaultId}/address`);
    return response.data.address;
  }

  /**
   * Get real-time balance for a vault
   */
  async getBalance(vaultId: string): Promise<{ balance: string; balanceEur: number }> {
    const response = await this.client.get(`/v1/vaults/${vaultId}/balance`);
    return {
      balance: response.data.balance,
      balanceEur: response.data.fiatValue?.EUR || 0,
    };
  }

  /**
   * Initiate a withdrawal (MPC signing via Taurus)
   */
  async signTransaction(request: SignTransactionRequest): Promise<SignTransactionResponse> {
    this.logger.log(`Signing tx from vault ${request.vaultId}, amount: ${request.amount} ${request.asset}`);

    const response = await this.client.post('/v1/transactions', {
      vaultId: request.vaultId,
      destination: request.destinationAddress,
      amount: request.amount,
      asset: request.asset,
      note: request.note,
    });

    return {
      transactionId: response.data.id,
      txHash: response.data.txHash,
      status: response.data.status,
    };
  }

  /**
   * Get transaction status from custodian
   */
  async getTransactionStatus(transactionId: string): Promise<{ status: string; txHash?: string; confirmations?: number }> {
    const response = await this.client.get(`/v1/transactions/${transactionId}`);
    return {
      status: response.data.status,
      txHash: response.data.txHash,
      confirmations: response.data.confirmations,
    };
  }

  /**
   * List all vaults (for reconciliation)
   */
  async listVaults(): Promise<Array<{ vaultId: string; balance: string; asset: string; address: string }>> {
    const response = await this.client.get('/v1/vaults');
    return response.data.vaults.map((v: Record<string, string>) => ({
      vaultId: v.id,
      balance: v.balance,
      asset: v.asset,
      address: v.address,
    }));
  }

  private mapNetwork(network: string): string {
    const mapping: Record<string, string> = {
      bitcoin_mainnet: 'bitcoin',
      ethereum_mainnet: 'ethereum',
      solana_mainnet: 'solana',
      base_mainnet: 'base',
    };
    return mapping[network] || network;
  }
}
