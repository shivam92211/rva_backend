export interface ApiResponse<T = any> {
  code: string;
  data: T;
  msg?: string;
  success?: boolean;
}

export interface BrokerInfo {
  accountSize: number;
  maxAccountSize: number | null;
  level: number;
}

export interface SubAccount {
  accountName: string;
  uid: string;
  createdAt: number;
  level: number;
}

export interface PaginatedResponse<T> {
  currentPage: number;
  pageSize: number;
  totalNum: number;
  totalPage: number;
  items: T[];
}

export interface ApiKeyInfo {
  uid: string;
  label: string;
  apiKey: string;
  secretKey?: string;
  apiVersion: number;
  permissions: ('general' | 'spot' | 'futures')[];
  ipWhitelist: string[];
  createdAt: number;
}

export interface TransferResponse {
  orderId: string;
}

export interface TransferDetail {
  orderId: string;
  currency: string;
  amount: string;
  fromUid: string;
  fromAccountType: string;
  toUid: string;
  toAccountType: string;
  status: 'PROCESSING' | 'SUCCESS' | 'FAILURE';
  createdAt: number;
}

export interface DepositRecord {
  uid: string;
  hash: string;
  address: string;
  amount: string;
  currency: string;
  status: 'PROCESSING' | 'SUCCESS' | 'FAILURE';
  chain: string;
  createdAt: number;
  updatedAt: number;
}

export interface DepositDetail {
  chain: string;
  hash: string;
  walletTxId: string;
  uid: string;
  amount: string;
  address: string;
  status: 'PROCESSING' | 'SUCCESS' | 'FAILURE';
  createdAt: number;
  isInner: boolean;
}

export interface WithdrawalDetail {
  id: string;
  chain: string;
  walletTxId: string;
  uid: string;
  amount: string;
  address: string;
  currency: string;
  status: 'PROCESSING' | 'SUCCESS' | 'FAILURE';
  createdAt: number;
  updatedAt: number;
}

export interface RebateRecord {
  date: string;
  brokerUid: string;
  affiliateUid: string;
  uid: string;
  bizLine: 'Spot' | 'Futures';
  volume: string;
  totalCommission: string;
  brokerCommission: string;
  userCommission: string;
  affiliateCommission: string;
  createdAt: number;
}
