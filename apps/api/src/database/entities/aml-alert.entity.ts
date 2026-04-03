import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum AlertSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export enum AlertStatus {
  OPEN = 'open',
  UNDER_REVIEW = 'under_review',
  RESOLVED_FALSE_POSITIVE = 'resolved_false_positive',
  RESOLVED_CONFIRMED = 'resolved_confirmed',
  SAR_FILED = 'sar_filed',
  ESCALATED = 'escalated',
}

export enum AlertType {
  SANCTIONED_ADDRESS = 'sanctioned_address',
  HIGH_RISK_ADDRESS = 'high_risk_address',
  SUSPICIOUS_PATTERN = 'suspicious_pattern',
  STRUCTURING = 'structuring',
  MIXING_SERVICE = 'mixing_service',
  DARKNET_EXPOSURE = 'darknet_exposure',
  PEP_MATCH = 'pep_match',
  SANCTIONS_MATCH = 'sanctions_match',
  THRESHOLD_EXCEEDED = 'threshold_exceeded',
}

@Entity('aml_alerts')
export class AmlAlert {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  clientId: string;

  @Column({ nullable: true })
  transactionId: string;

  @Column({ type: 'enum', enum: AlertType })
  type: AlertType;

  @Column({ type: 'enum', enum: AlertSeverity })
  @Index()
  severity: AlertSeverity;

  @Column({ type: 'enum', enum: AlertStatus, default: AlertStatus.OPEN })
  @Index()
  status: AlertStatus;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'jsonb', nullable: true })
  screeningData: Record<string, unknown>;

  @Column({ nullable: true })
  assignedTo: string;

  @Column({ nullable: true })
  resolvedBy: string;

  @Column({ nullable: true })
  resolvedAt: Date;

  @Column({ type: 'text', nullable: true })
  resolutionNotes: string;

  @Column({ nullable: true })
  sarReference: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
