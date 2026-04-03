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
import { Wallet } from './wallet.entity';
import { CryptoAsset } from './wallet.entity';

export enum TransactionType {
  DEPOSIT = 'deposit',
  WITHDRAWAL = 'withdrawal',
  INTERNAL_TRANSFER = 'internal_transfer',
}

export enum TransactionStatus {
  PENDING_AML = 'pending_aml',
  PENDING_APPROVAL = 'pending_approval',
  PENDING_SIGNING = 'pending_signing',
  BROADCASTING = 'broadcasting',
  PENDING_CONFIRMATION = 'pending_confirmation',
  CONFIRMED = 'confirmed',
  FAILED = 'failed',
  REJECTED = 'rejected',
  BLOCKED = 'blocked',
}

export enum AmlScore {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

@Entity('transactions')
export class Transaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  walletId: string;

  @ManyToOne(() => Wallet)
  @JoinColumn({ name: 'walletId' })
  wallet: Wallet;

  @Column()
  @Index()
  clientId: string;

  @Column({ type: 'enum', enum: TransactionType })
  type: TransactionType;

  @Column({ type: 'enum', enum: CryptoAsset })
  asset: CryptoAsset;

  @Column({ type: 'decimal', precision: 28, scale: 18 })
  amount: string;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  amountEur: number;

  @Column({ nullable: true })
  sourceAddress: string;

  @Column({ nullable: true })
  destinationAddress: string;

  @Column({ nullable: true })
  txHash: string;

  @Column({ type: 'enum', enum: TransactionStatus, default: TransactionStatus.PENDING_AML })
  @Index()
  status: TransactionStatus;

  @Column({ type: 'enum', enum: AmlScore, nullable: true })
  amlScore: AmlScore;

  @Column({ type: 'jsonb', nullable: true })
  amlScreeningResult: Record<string, unknown>;

  // Travel Rule data (TFR compliance)
  @Column({ type: 'jsonb', nullable: true })
  travelRuleData: {
    originator: {
      name: string;
      accountId: string;
      address: string;
      dateOfBirth?: string;
      placeOfBirth?: string;
    };
    beneficiary: {
      name: string;
      accountType: 'casp' | 'self_hosted';
      vaspName?: string;
      vaspLei?: string;
      address?: string;
    };
    notabeneTransferId?: string;
  };

  // Approval chain
  @Column({ type: 'jsonb', nullable: true })
  approvals: Array<{
    role: string;
    userId: string;
    decision: 'approved' | 'rejected';
    timestamp: string;
    comment?: string;
  }>;

  @Column({ nullable: true })
  initiatedBySalesforceUserId: string;

  @Column({ nullable: true })
  initiatedByRole: string;

  @Column({ nullable: true })
  initiatedByIp: string;

  @Column({ nullable: true })
  memo: string;

  @Column({ type: 'int', nullable: true })
  blockConfirmations: number;

  // Custodian reference
  @Column({ nullable: true })
  custodianTransactionId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ nullable: true })
  confirmedAt: Date;
}
