// === Client Types ===

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

export interface ClientAddress {
  street: string;
  city: string;
  postalCode: string;
  country: string;
}

export interface Client {
  id: string;
  salesforceContactId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  dateOfBirth: string;
  nationality: string;
  taxResidency: string;
  address: ClientAddress;
  riskProfile: RiskProfile;
  pepStatus: boolean;
  status: ClientStatus;
  createdAt: string;
  updatedAt: string;
}

// === Wallet Types ===

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

export enum WalletStatus {
  CREATING = 'creating',
  ACTIVE = 'active',
  FROZEN = 'frozen',
  CLOSED = 'closed',
}

export interface SegregationProof {
  type: 'dedicated_address' | 'omnibus_subaccount';
  onChainVerifiable: boolean;
  custodianReference: string;
}

export interface Wallet {
  id: string;
  clientId: string;
  asset: CryptoAsset;
  network: Network;
  label: string;
  depositAddress: string;
  balance: string;
  balanceEur: number;
  status: WalletStatus;
  custodianVaultId: string;
  segregationProof: SegregationProof;
  createdAt: string;
  updatedAt: string;
}

// === Transaction Types ===

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

export interface TravelRuleData {
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
  };
  notabeneTransferId?: string;
}

export interface TransactionApproval {
  role: string;
  userId: string;
  decision: 'approved' | 'rejected';
  timestamp: string;
  comment?: string;
}

export interface Transaction {
  id: string;
  walletId: string;
  clientId: string;
  type: TransactionType;
  asset: CryptoAsset;
  amount: string;
  amountEur?: number;
  sourceAddress?: string;
  destinationAddress?: string;
  txHash?: string;
  status: TransactionStatus;
  amlScore?: AmlScore;
  travelRuleData?: TravelRuleData;
  approvals?: TransactionApproval[];
  memo?: string;
  createdAt: string;
  confirmedAt?: string;
}

// === Report Types ===

export interface ClientStatement {
  clientId: string;
  clientName: string;
  statementDate: string;
  period: string;
  positions: Array<{
    asset: string;
    assetName: string;
    quantity: string;
    unitPriceEur: number;
    totalValueEur: number;
    walletAddress: string;
    custodian: string;
  }>;
  totalAucEur: number;
  transfers: Array<{
    date: string;
    type: string;
    asset: string;
    amount: string;
    txHash: string;
    status: string;
  }>;
  disclaimer: string;
}

export interface AucReport {
  totalAucEur: number;
  byAsset: Record<string, { quantity: string; valueEur: number }>;
  totalClients: number;
  totalWallets: number;
}

// === API Response Types ===

export interface ApiError {
  statusCode: number;
  message: string;
  requestId: string;
  timestamp: string;
  path: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}
