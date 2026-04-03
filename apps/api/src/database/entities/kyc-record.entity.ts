import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Client } from './client.entity';

export enum KycStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  EXPIRED = 'expired',
  REVIEW_REQUIRED = 'review_required',
}

export enum KycCheckType {
  IDENTITY_DOCUMENT = 'identity_document',
  SELFIE_LIVENESS = 'selfie_liveness',
  PEP_SCREENING = 'pep_screening',
  SANCTIONS_SCREENING = 'sanctions_screening',
  SOURCE_OF_FUNDS = 'source_of_funds',
  RISK_SCORING = 'risk_scoring',
}

@Entity('kyc_records')
export class KycRecord {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  clientId: string;

  @ManyToOne(() => Client)
  @JoinColumn({ name: 'clientId' })
  client: Client;

  @Column({ type: 'enum', enum: KycStatus, default: KycStatus.PENDING })
  @Index()
  status: KycStatus;

  @Column({ nullable: true })
  externalApplicantId: string;

  @Column({ nullable: true })
  externalVerificationId: string;

  @Column({ nullable: true })
  verificationUrl: string;

  @Column({ type: 'jsonb', nullable: true })
  checks: Array<{
    type: KycCheckType;
    status: 'pending' | 'passed' | 'failed' | 'review';
    details: Record<string, unknown>;
    completedAt?: string;
  }>;

  @Column({ type: 'int', default: 0 })
  riskScore: number;

  @Column({ type: 'text', nullable: true })
  rejectionReason: string;

  @Column({ nullable: true })
  reviewedBy: string;

  @Column({ nullable: true })
  reviewedAt: Date;

  @Column({ nullable: true })
  expiresAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
