export type UserRole = 'admin' | 'owner' | 'accountant';

export interface User {
  id: string;
  username: string;
  password: string;
  role: UserRole;
  name: string;
}

export type TenantStatus = 'active' | 'vacated' | 'suspended';

export interface Tenant {
  id: string;
  name: string;
  cnic: string;
  phone: string;
  email: string;
  premises: string;
  effectiveDate: string;
  monthlyRent: number;
  securityDeposit: number;
  depositAccountNo: string;
  utilityNo: string;
  status: TenantStatus;
  createdAt: string;
}

export type LeaseStatus = 'running' | 'expired' | 'renewed';

export interface Lease {
  id: string;
  tenantId: string;
  startDate: string;
  endDate: string;
  durationMonths: number;
  incrementPercent: number;
  reminderDays: number;
  status: LeaseStatus;
  documentUrl?: string;
}

export interface RentRecord {
  id: string;
  tenantId: string;
  monthYear: string;
  rent: number;
  outstandingPrevious: number;
  paid: number;
  balance: number;
  carryForward: number;
}

export type PaymentMethod = 'cash' | 'bank' | 'online';

export interface Payment {
  id: string;
  tenantId: string;
  monthYear: string;
  amount: number;
  paymentDate: string;
  paymentMethod: PaymentMethod;
  transactionNo: string;
  depositedAccount: string;
  attachmentUrl?: string;
  createdAt: string;
}

export interface RentHistory {
  id: string;
  tenantId: string;
  oldRent: number;
  newRent: number;
  effectiveDate: string;
  incrementPercent: number;
}

export interface DepositAdjustment {
  id: string;
  tenantId: string;
  description: string;
  amount: number;
  date: string;
}

export interface Settings {
  plazaName: string;
  address: string;
  phone: string;
  logoUrl: string;
  headerText: string;
  footerText: string;
  termsConditions: string;
  whatsappTemplate: string;
  defaultIncrementPercent: number;
  autoApplyIncrement: boolean;
  bankName?: string;
  accountTitle?: string;
  accountNumber?: string;
}

export interface DashboardStats {
  totalMonthlyRent: number;
  totalPaidThisMonth: number;
  totalOutstanding: number;
  activeTenantsCount: number;
  vacatedShopsCount: number;
  leaseExpiringSoon: number;
}
