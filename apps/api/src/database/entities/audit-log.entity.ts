import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

export enum AuditAction {
  // Auth
  LOGIN = 'login',
  LOGOUT = 'logout',
  TOKEN_ISSUED = 'token_issued',

  // Client
  CLIENT_CREATED = 'client.created',
  CLIENT_UPDATED = 'client.updated',
  CLIENT_KYC_INITIATED = 'client.kyc_initiated',
  CLIENT_KYC_APPROVED = 'client.kyc_approved',
  CLIENT_KYC_REJECTED = 'client.kyc_rejected',

  // Wallet
  WALLET_CREATED = 'wallet.created',
  WALLET_FROZEN = 'wallet.frozen',
  WALLET_ADDRESS_GENERATED = 'wallet.address_generated',

  // Transaction
  TRANSACTION_INITIATED = 'transaction.initiated',
  TRANSACTION_AML_SCREENED = 'transaction.aml_screened',
  TRANSACTION_APPROVED = 'transaction.approved',
  TRANSACTION_REJECTED = 'transaction.rejected',
  TRANSACTION_SIGNED = 'transaction.signed',
  TRANSACTION_BROADCASTED = 'transaction.broadcasted',
  TRANSACTION_CONFIRMED = 'transaction.confirmed',
  TRANSACTION_BLOCKED = 'transaction.blocked',

  // AML
  AML_ALERT_CREATED = 'aml.alert_created',
  AML_ALERT_RESOLVED = 'aml.alert_resolved',
  AML_SAR_FILED = 'aml.sar_filed',

  // Reporting
  STATEMENT_GENERATED = 'statement.generated',
  RECONCILIATION_RUN = 'reconciliation.run',

  // Config
  CONFIG_UPDATED = 'config.updated',
  WEBHOOK_CONFIGURED = 'webhook.configured',
}

@Entity('audit_logs')
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: AuditAction })
  @Index()
  action: AuditAction;

  @Column({ nullable: true })
  @Index()
  entityType: string;

  @Column({ nullable: true })
  @Index()
  entityId: string;

  @Column({ nullable: true })
  userId: string;

  @Column({ nullable: true })
  userRole: string;

  @Column({ nullable: true })
  ipAddress: string;

  @Column({ nullable: true })
  userAgent: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, unknown>;

  @Column({ type: 'jsonb', nullable: true })
  previousState: Record<string, unknown>;

  @Column({ type: 'jsonb', nullable: true })
  newState: Record<string, unknown>;

  @Column()
  @Index()
  requestId: string;

  @CreateDateColumn()
  @Index()
  createdAt: Date;
}
