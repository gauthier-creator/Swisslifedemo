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

export enum WalletStatus {
  CREATING = 'creating',
  ACTIVE = 'active',
  FROZEN = 'frozen',
  CLOSED = 'closed',
}

export enum CryptoAsset {
  BTC = 'BTC',
  ETH = 'ETH',
  USDC = 'USDC',
  EURC = 'EURC',
  SOL = 'SOL',
}

export enum Network {
  BITCOIN_MAINNET = 'bitcoin_mainnet',
  ETHEREUM_MAINNET = 'ethereum_mainnet',
  SOLANA_MAINNET = 'solana_mainnet',
  BASE_MAINNET = 'base_mainnet',
}

@Entity('wallets')
export class Wallet {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  clientId: string;

  @ManyToOne(() => Client)
  @JoinColumn({ name: 'clientId' })
  client: Client;

  @Column({ type: 'enum', enum: CryptoAsset })
  asset: CryptoAsset;

  @Column({ type: 'enum', enum: Network })
  network: Network;

  @Column({ nullable: true })
  label: string;

  @Column({ nullable: true })
  depositAddress: string;

  @Column({ type: 'decimal', precision: 28, scale: 18, default: 0 })
  balance: string;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  balanceEur: number;

  @Column({ type: 'enum', enum: WalletStatus, default: WalletStatus.CREATING })
  status: WalletStatus;

  // Custodian references — segregation proof
  @Column({ nullable: true })
  custodianVaultId: string;

  @Column({ nullable: true })
  custodianWalletId: string;

  @Column({ type: 'jsonb', nullable: true })
  segregationProof: {
    type: 'dedicated_address' | 'omnibus_subaccount';
    onChainVerifiable: boolean;
    custodianReference: string;
  };

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
