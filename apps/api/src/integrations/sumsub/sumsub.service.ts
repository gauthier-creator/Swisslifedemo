import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';
import * as crypto from 'crypto';

export interface CreateApplicantRequest {
  externalUserId: string;
  email: string;
  phone?: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  country: string;
}

export interface ApplicantStatus {
  applicantId: string;
  status: 'init' | 'pending' | 'queued' | 'completed';
  reviewResult?: {
    reviewAnswer: 'GREEN' | 'RED' | 'ERROR';
    rejectLabels?: string[];
    reviewRejectType?: string;
    moderationComment?: string;
  };
}

@Injectable()
export class SumsubService {
  private readonly logger = new Logger(SumsubService.name);
  private readonly client: AxiosInstance;
  private readonly appToken: string;
  private readonly secretKey: string;

  constructor(private readonly configService: ConfigService) {
    this.appToken = this.configService.get<string>('sumsub.appToken') || '';
    this.secretKey = this.configService.get<string>('sumsub.secretKey') || '';

    this.client = axios.create({
      baseURL: 'https://api.sumsub.com',
      timeout: 30000,
    });

    // Add Sumsub auth signature to every request
    this.client.interceptors.request.use((config) => {
      const ts = Math.floor(Date.now() / 1000).toString();
      const method = (config.method || 'GET').toUpperCase();
      const path = config.url || '';
      const body = config.data ? JSON.stringify(config.data) : '';

      const signature = crypto
        .createHmac('sha256', this.secretKey)
        .update(ts + method + path + body)
        .digest('hex');

      config.headers['X-App-Token'] = this.appToken;
      config.headers['X-App-Access-Ts'] = ts;
      config.headers['X-App-Access-Sig'] = signature;

      return config;
    });
  }

  /**
   * Create a KYC applicant in Sumsub
   */
  async createApplicant(request: CreateApplicantRequest): Promise<string> {
    this.logger.log(`Creating KYC applicant for ${request.externalUserId}`);

    const levelName = this.configService.get<string>('sumsub.levelName');

    const response = await this.client.post(
      `/resources/applicants?levelName=${levelName}`,
      {
        externalUserId: request.externalUserId,
        email: request.email,
        phone: request.phone,
        fixedInfo: {
          firstName: request.firstName,
          lastName: request.lastName,
          dob: request.dateOfBirth,
          country: request.country,
        },
      },
    );

    return response.data.id;
  }

  /**
   * Generate a verification URL for the client to complete KYC
   */
  async generateAccessToken(applicantId: string, externalUserId: string): Promise<string> {
    const response = await this.client.post(
      `/resources/accessTokens?userId=${externalUserId}&levelName=${this.configService.get<string>('sumsub.levelName')}`,
    );

    return response.data.token;
  }

  /**
   * Get applicant verification status
   */
  async getApplicantStatus(applicantId: string): Promise<ApplicantStatus> {
    const response = await this.client.get(`/resources/applicants/${applicantId}/status`);

    return {
      applicantId,
      status: response.data.reviewStatus,
      reviewResult: response.data.reviewResult,
    };
  }

  /**
   * Verify webhook signature from Sumsub
   */
  verifyWebhookSignature(payload: string, signature: string): boolean {
    const webhookSecret = this.configService.get<string>('sumsub.webhookSecret') || '';
    const computed = crypto
      .createHmac('sha256', webhookSecret)
      .update(payload)
      .digest('hex');
    return computed === signature;
  }
}
