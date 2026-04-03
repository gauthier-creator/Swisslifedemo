import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index,
} from 'typeorm';

export enum ClientStatus {
  PENDING_KYC = 'pending_kyc',
  KYC_IN_PROGRESS = 'kyc_in_progress',
  KYC_APPROVED = 'kyc_approved',
  KYC_REJECTED = 'kyc_rejected',
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  CLOSED = 'closed',
}

export enum RiskProfile {
  LOW = 'low',
  BALANCED = 'balanced',
  HIGH = 'high',
}

export enum SourceOfFunds {
  PROFESSIONAL_INCOME = 'professional_income',
  SAVINGS = 'savings',
  INHERITANCE = 'inheritance',
  INVESTMENT_RETURNS = 'investment_returns',
  REAL_ESTATE_SALE = 'real_estate_sale',
  OTHER = 'other',
}

@Entity('clients')
export class Client {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  @Index()
  salesforceContactId: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column()
  email: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ type: 'date' })
  dateOfBirth: Date;

  @Column({ length: 2 })
  nationality: string;

  @Column({ length: 2 })
  taxResidency: string;

  @Column({ type: 'jsonb' })
  address: {
    street: string;
    city: string;
    postalCode: string;
    country: string;
  };

  @Column({ type: 'enum', enum: RiskProfile, default: RiskProfile.BALANCED })
  riskProfile: RiskProfile;

  @Column({ default: false })
  pepStatus: boolean;

  @Column({ type: 'enum', enum: SourceOfFunds, default: SourceOfFunds.PROFESSIONAL_INCOME })
  sourceOfFunds: SourceOfFunds;

  @Column({ nullable: true })
  sourceOfCrypto: string;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  expectedAnnualVolumeEur: number;

  @Column({ type: 'enum', enum: ClientStatus, default: ClientStatus.PENDING_KYC })
  @Index()
  status: ClientStatus;

  @Column({ nullable: true })
  kycExternalId: string;

  @Column({ nullable: true })
  kycVerificationUrl: string;

  @Column({ type: 'jsonb', nullable: true })
  kycData: Record<string, unknown>;

  @Column({ type: 'int', default: 0 })
  riskScore: number;

  @Column({ nullable: true })
  custodyAgreementSignedAt: Date;

  @Column({ nullable: true })
  custodyAgreementDocumentId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
