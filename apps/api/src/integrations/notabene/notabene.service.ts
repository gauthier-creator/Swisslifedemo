import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';

export interface TravelRuleTransfer {
  originator: {
    name: string;
    accountNumber: string;
    dateOfBirth?: string;
    placeOfBirth?: string;
    nationalIdentification?: string;
    address?: {
      street: string;
      city: string;
      country: string;
    };
  };
  beneficiary: {
    name: string;
    accountNumber: string;
    vaspDid?: string;
  };
  amount: string;
  asset: string;
  transactionHash?: string;
}

export interface TravelRuleResponse {
  transferId: string;
  status: 'pending' | 'sent' | 'received' | 'rejected' | 'not_required';
  counterpartyVasp?: string;
}

@Injectable()
export class NotabeneService {
  private readonly logger = new Logger(NotabeneService.name);
  private readonly client: AxiosInstance;

  constructor(private readonly configService: ConfigService) {
    this.client = axios.create({
      baseURL: this.configService.get<string>('notabene.apiUrl'),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.configService.get<string>('notabene.apiKey')}`,
      },
      timeout: 15000,
    });
  }

  /**
   * Submit travel rule data for an outgoing transfer (TFR obligation)
   * Required for all transfers > EUR 1,000 to another CASP
   */
  async submitTransfer(transfer: TravelRuleTransfer): Promise<TravelRuleResponse> {
    this.logger.log(`Submitting travel rule transfer: ${transfer.amount} ${transfer.asset}`);

    const vaspDid = this.configService.get<string>('notabene.vaspDid');

    const response = await this.client.post('/v1/transfers', {
      originatorVaspDid: vaspDid,
      beneficiaryVaspDid: transfer.beneficiary.vaspDid,
      originator: {
        originatorPersons: [
          {
            naturalPerson: {
              name: [{ nameIdentifier: [{ primaryIdentifier: transfer.originator.name }] }],
              dateOfBirth: transfer.originator.dateOfBirth,
              placeOfBirth: transfer.originator.placeOfBirth,
              geographicAddress: transfer.originator.address
                ? [
                    {
                      streetName: transfer.originator.address.street,
                      townName: transfer.originator.address.city,
                      country: transfer.originator.address.country,
                    },
                  ]
                : undefined,
            },
          },
        ],
        accountNumber: [transfer.originator.accountNumber],
      },
      beneficiary: {
        beneficiaryPersons: [
          {
            naturalPerson: {
              name: [{ nameIdentifier: [{ primaryIdentifier: transfer.beneficiary.name }] }],
            },
          },
        ],
        accountNumber: [transfer.beneficiary.accountNumber],
      },
      transferAmount: {
        amount: transfer.amount,
        assetType: transfer.asset,
      },
      transactionHash: transfer.transactionHash,
    });

    return {
      transferId: response.data.id,
      status: response.data.status,
      counterpartyVasp: response.data.beneficiaryVaspDid,
    };
  }

  /**
   * Check if a destination address belongs to a known VASP
   */
  async identifyVasp(address: string, asset: string): Promise<{ isVasp: boolean; vaspDid?: string; vaspName?: string }> {
    try {
      const response = await this.client.get(`/v1/vasp/lookup`, {
        params: { address, asset },
      });

      if (response.data?.vasp) {
        return {
          isVasp: true,
          vaspDid: response.data.vasp.did,
          vaspName: response.data.vasp.name,
        };
      }
    } catch {
      this.logger.warn(`VASP lookup failed for address ${address.substring(0, 10)}...`);
    }

    return { isVasp: false };
  }

  /**
   * Get transfer status
   */
  async getTransferStatus(transferId: string): Promise<TravelRuleResponse> {
    const response = await this.client.get(`/v1/transfers/${transferId}`);
    return {
      transferId: response.data.id,
      status: response.data.status,
      counterpartyVasp: response.data.beneficiaryVaspDid,
    };
  }
}
