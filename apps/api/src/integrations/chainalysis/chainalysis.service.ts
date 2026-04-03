import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';
import { AmlScore } from '../../database/entities';

export interface ScreeningResult {
  address: string;
  risk: AmlScore;
  cluster: string | null;
  category: string | null;
  details: Record<string, unknown>;
  isSanctioned: boolean;
}

@Injectable()
export class ChainanalysisService {
  private readonly logger = new Logger(ChainanalysisService.name);
  private readonly client: AxiosInstance;

  constructor(private readonly configService: ConfigService) {
    this.client = axios.create({
      baseURL: this.configService.get<string>('chainalysis.apiUrl'),
      headers: {
        'Content-Type': 'application/json',
        'Token': this.configService.get<string>('chainalysis.apiKey'),
      },
      timeout: 15000,
    });
  }

  /**
   * Screen a crypto address before allowing withdrawal (MiCA AML obligation)
   */
  async screenAddress(address: string, asset: string): Promise<ScreeningResult> {
    this.logger.log(`Screening address ${address.substring(0, 10)}... for ${asset}`);

    try {
      // Register the transfer
      await this.client.post('/transfers', {
        network: this.mapAssetToNetwork(asset),
        asset: asset,
        transferReference: `screen-${Date.now()}`,
        direction: 'sent',
        outputAddress: address,
      });

      // Get the screening result
      const response = await this.client.get(`/transfers/screen`, {
        params: { address, asset: this.mapAssetToNetwork(asset) },
      });

      const alerts = response.data.alerts || [];
      const isSanctioned = alerts.some((a: Record<string, string>) => a.category === 'sanctions');

      return {
        address,
        risk: this.calculateRisk(alerts),
        cluster: response.data.cluster?.name || null,
        category: response.data.cluster?.category || null,
        details: response.data,
        isSanctioned,
      };
    } catch (error) {
      this.logger.error(`Screening failed for ${address}: ${error}`);
      // Fail-safe: if screening fails, flag as high risk
      return {
        address,
        risk: AmlScore.HIGH,
        cluster: null,
        category: 'screening_failed',
        details: { error: 'Screening service unavailable' },
        isSanctioned: false,
      };
    }
  }

  /**
   * Register a transaction for ongoing monitoring
   */
  async registerTransaction(
    txHash: string,
    asset: string,
    direction: 'received' | 'sent',
    outputAddress: string,
  ): Promise<void> {
    await this.client.post('/transfers', {
      network: this.mapAssetToNetwork(asset),
      asset,
      transferReference: txHash,
      direction,
      outputAddress,
    });
  }

  private calculateRisk(alerts: Array<Record<string, string>>): AmlScore {
    if (alerts.length === 0) return AmlScore.LOW;

    const hasSanctions = alerts.some(a => a.category === 'sanctions');
    if (hasSanctions) return AmlScore.CRITICAL;

    const hasSevere = alerts.some(a =>
      ['darknet market', 'ransomware', 'terrorist financing'].includes(a.category),
    );
    if (hasSevere) return AmlScore.CRITICAL;

    const hasHighRisk = alerts.some(a =>
      ['mixer', 'high risk exchange', 'gambling'].includes(a.category),
    );
    if (hasHighRisk) return AmlScore.HIGH;

    return AmlScore.MEDIUM;
  }

  private mapAssetToNetwork(asset: string): string {
    const mapping: Record<string, string> = {
      BTC: 'Bitcoin',
      ETH: 'Ethereum',
      USDC: 'Ethereum',
      EURC: 'Ethereum',
      SOL: 'Solana',
    };
    return mapping[asset] || asset;
  }
}
