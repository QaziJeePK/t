import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { User, Tenant, Lease, Payment, RentRecord, Settings, RentHistory, DepositAdjustment } from '../types';
import { format, addMonths, differenceInDays, parseISO } from 'date-fns';

interface AppContextType {
  user: User | null;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  tenants: Tenant[];
  addTenant: (tenant: Omit<Tenant, 'id' | 'createdAt'>) => void;
  updateTenant: (id: string, tenant: Partial<Tenant>) => void;
  deleteTenant: (id: string) => void;
  leases: Lease[];
  addLease: (lease: Omit<Lease, 'id'>) => void;
  updateLease: (id: string, lease: Partial<Lease>) => void;
  payments: Payment[];
  addPayment: (payment: Omit<Payment, 'id' | 'createdAt'>) => void;
  rentRecords: RentRecord[];
  generateRentSheet: (monthYear: string) => void;
  settings: Settings;
  updateSettings: (settings: Partial<Settings>) => void;
  rentHistory: RentHistory[];
  applyRentIncrement: (tenantId: string) => void;
  depositAdjustments: DepositAdjustment[];
  addDepositAdjustment: (adjustment: Omit<DepositAdjustment, 'id'>) => void;
  getTenantLedger: (tenantId: string) => { records: RentRecord[]; payments: Payment[] };
  getWhatsAppMessage: (tenantId: string, type: 'rent' | 'overdue' | 'lease') => string;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const defaultUsers: User[] = [
  { id: '1', username: 'admin', password: 'admin123', role: 'admin', name: 'Administrator' },
  { id: '2', username: 'owner', password: 'owner123', role: 'owner', name: 'Plaza Owner' },
  { id: '3', username: 'accountant', password: 'acc123', role: 'accountant', name: 'Accountant' },
];

const defaultSettings: Settings = {
  plazaName: 'Grand Commercial Plaza',
  address: '123 Business District, City Center',
  phone: '+92 300 1234567',
  logoUrl: '',
  headerText: 'Official Rent Invoice',
  footerText: 'Thank you for your timely payments.',
  termsConditions: 'Rent is due on the 1st of each month. Late payments may incur additional charges.',
  whatsappTemplate: 'Dear {{tenant}}, your rent for {{month}} is pending. Outstanding balance: Rs {{balance}}. Kindly pay today.',
  defaultIncrementPercent: 10,
  autoApplyIncrement: false,
};

const sampleTenants: Tenant[] = [
  // December 2025 Rent Sheet Data
  {
    id: '1',
    name: 'Zafar Mahmood',
    cnic: '',
    phone: '+923001234567',
    email: '',
    premises: '1M',
    effectiveDate: '2023-07-01',
    monthlyRent: 97437,
    securityDeposit: 200000,
    depositAccountNo: '172',
    utilityNo: '6855087',
    status: 'active',
    createdAt: '2023-07-01',
  },
  {
    id: '2',
    name: 'Zahoor ul Hassan',
    cnic: '',
    phone: '+923001234568',
    email: '',
    premises: '3M',
    effectiveDate: '2023-09-20',
    monthlyRent: 53944,
    securityDeposit: 100000,
    depositAccountNo: '172',
    utilityNo: '4298250',
    status: 'active',
    createdAt: '2023-09-20',
  },
  {
    id: '3',
    name: 'Nadeem Qaiser',
    cnic: '',
    phone: '+923001234569',
    email: '',
    premises: '4M',
    effectiveDate: '2022-07-01',
    monthlyRent: 50820,
    securityDeposit: 100000,
    depositAccountNo: '521',
    utilityNo: '4534401',
    status: 'active',
    createdAt: '2022-07-01',
  },
  {
    id: '4',
    name: 'Gulfam Tailor',
    cnic: '',
    phone: '+923001234570',
    email: '',
    premises: '5M',
    effectiveDate: '2023-07-01',
    monthlyRent: 46452,
    securityDeposit: 100000,
    depositAccountNo: '172',
    utilityNo: '319974',
    status: 'active',
    createdAt: '2023-07-01',
  },
  {
    id: '5',
    name: 'Yasin Barbar Shop',
    cnic: '',
    phone: '+923001234571',
    email: '',
    premises: '6M',
    effectiveDate: '2021-10-01',
    monthlyRent: 43923,
    securityDeposit: 80000,
    depositAccountNo: '172',
    utilityNo: '319972',
    status: 'active',
    createdAt: '2021-10-01',
  },
  {
    id: '6',
    name: 'Tassadaq Hussain',
    cnic: '',
    phone: '+923001234572',
    email: '',
    premises: '7M',
    effectiveDate: '2017-02-01',
    monthlyRent: 65592,
    securityDeposit: 150000,
    depositAccountNo: '521',
    utilityNo: '5389448',
    status: 'active',
    createdAt: '2017-02-01',
  },
  {
    id: '7',
    name: 'Zulfiqar Tailor',
    cnic: '',
    phone: '+923001234573',
    email: '',
    premises: '7M-2',
    effectiveDate: '2023-02-01',
    monthlyRent: 36443,
    securityDeposit: 70000,
    depositAccountNo: '172',
    utilityNo: '4320055',
    status: 'active',
    createdAt: '2023-02-01',
  },
  {
    id: '8',
    name: 'Shahid Riaz',
    cnic: '',
    phone: '+923001234574',
    email: '',
    premises: '8M',
    effectiveDate: '2024-02-01',
    monthlyRent: 45000,
    securityDeposit: 90000,
    depositAccountNo: '',
    utilityNo: '36314',
    status: 'active',
    createdAt: '2024-02-01',
  },
  {
    id: '9',
    name: 'Shahzad Ali',
    cnic: '',
    phone: '+923001234575',
    email: '',
    premises: '9M',
    effectiveDate: '2024-02-01',
    monthlyRent: 45000,
    securityDeposit: 90000,
    depositAccountNo: '172',
    utilityNo: '319969',
    status: 'active',
    createdAt: '2024-02-01',
  },
  {
    id: '10',
    name: 'Faiz Rasool (Lace)',
    cnic: '',
    phone: '+923001234576',
    email: '',
    premises: '10M',
    effectiveDate: '2022-01-01',
    monthlyRent: 33660,
    securityDeposit: 70000,
    depositAccountNo: '',
    utilityNo: '92923',
    status: 'active',
    createdAt: '2022-01-01',
  },
  {
    id: '11',
    name: 'Zafar/M Boota',
    cnic: '',
    phone: '+923001234577',
    email: '',
    premises: '11M',
    effectiveDate: '2023-05-01',
    monthlyRent: 56514,
    securityDeposit: 120000,
    depositAccountNo: '521',
    utilityNo: '319970',
    status: 'active',
    createdAt: '2023-05-01',
  },
  {
    id: '12',
    name: 'Tariq Mahmood',
    cnic: '',
    phone: '+923001234578',
    email: '',
    premises: '3B',
    effectiveDate: '2023-04-01',
    monthlyRent: 53147,
    securityDeposit: 100000,
    depositAccountNo: '',
    utilityNo: '9006836',
    status: 'active',
    createdAt: '2023-04-01',
  },
  {
    id: '13',
    name: 'Muhammad Nadeem',
    cnic: '',
    phone: '+923001234579',
    email: '',
    premises: '4B',
    effectiveDate: '2023-03-01',
    monthlyRent: 68200,
    securityDeposit: 140000,
    depositAccountNo: '521',
    utilityNo: '7127416',
    status: 'active',
    createdAt: '2023-03-01',
  },
  {
    id: '14',
    name: 'M. Ali',
    cnic: '',
    phone: '+923001234580',
    email: '',
    premises: '6A',
    effectiveDate: '2022-07-01',
    monthlyRent: 77171,
    securityDeposit: 150000,
    depositAccountNo: '521',
    utilityNo: '319962',
    status: 'active',
    createdAt: '2022-07-01',
  },
  {
    id: '15',
    name: 'Asghar Ali',
    cnic: '',
    phone: '+923001234581',
    email: '',
    premises: '6B',
    effectiveDate: '2023-03-23',
    monthlyRent: 78650,
    securityDeposit: 150000,
    depositAccountNo: '',
    utilityNo: '82449',
    status: 'active',
    createdAt: '2023-03-23',
  },
  {
    id: '16',
    name: 'Amjad Tailor',
    cnic: '',
    phone: '+923001234582',
    email: '',
    premises: '8A',
    effectiveDate: '2019-01-01',
    monthlyRent: 70862,
    securityDeposit: 150000,
    depositAccountNo: '521',
    utilityNo: '4303874',
    status: 'active',
    createdAt: '2019-01-01',
  },
  {
    id: '17',
    name: 'M. Ilyas Tailor',
    cnic: '',
    phone: '+923001234583',
    email: '',
    premises: '8B',
    effectiveDate: '2025-08-15',
    monthlyRent: 72000,
    securityDeposit: 150000,
    depositAccountNo: '',
    utilityNo: '319966',
    status: 'active',
    createdAt: '2025-08-15',
  },
  {
    id: '18',
    name: 'M. Rizwan Tailor',
    cnic: '',
    phone: '+923001234584',
    email: '',
    premises: '9A',
    effectiveDate: '2023-09-01',
    monthlyRent: 58564,
    securityDeposit: 120000,
    depositAccountNo: '',
    utilityNo: '458631',
    status: 'active',
    createdAt: '2023-09-01',
  },
  {
    id: '19',
    name: 'M. Khalid (Tandoor)',
    cnic: '',
    phone: '+923001234585',
    email: '',
    premises: '9B',
    effectiveDate: '2024-01-01',
    monthlyRent: 143000,
    securityDeposit: 300000,
    depositAccountNo: '173',
    utilityNo: '4303434',
    status: 'active',
    createdAt: '2024-01-01',
  },
  {
    id: '20',
    name: 'M. Qayyum Khan',
    cnic: '',
    phone: '+923001234586',
    email: '',
    premises: '10A',
    effectiveDate: '2023-07-01',
    monthlyRent: 75515,
    securityDeposit: 150000,
    depositAccountNo: '',
    utilityNo: '320128',
    status: 'active',
    createdAt: '2023-07-01',
  },
  {
    id: '21',
    name: 'M. Yasir (Tailor)',
    cnic: '',
    phone: '+923001234587',
    email: '',
    premises: '10B',
    effectiveDate: '2025-08-01',
    monthlyRent: 98000,
    securityDeposit: 200000,
    depositAccountNo: '',
    utilityNo: '3882',
    status: 'active',
    createdAt: '2025-08-01',
  },
  {
    id: '22',
    name: 'Imran Jew',
    cnic: '',
    phone: '+923001234588',
    email: '',
    premises: 'G1-A',
    effectiveDate: '2023-01-01',
    monthlyRent: 325000,
    securityDeposit: 650000,
    depositAccountNo: '521',
    utilityNo: '4303886',
    status: 'active',
    createdAt: '2023-01-01',
  },
  {
    id: '23',
    name: 'Haji M. Rasool Jew',
    cnic: '',
    phone: '+923001234589',
    email: '',
    premises: 'G1-B',
    effectiveDate: '2016-01-01',
    monthlyRent: 346955,
    securityDeposit: 700000,
    depositAccountNo: '4521',
    utilityNo: '4303402',
    status: 'active',
    createdAt: '2016-01-01',
  },
  {
    id: '24',
    name: 'Ijlal Ice-cream',
    cnic: '',
    phone: '+923001234590',
    email: '',
    premises: 'G2-A',
    effectiveDate: '2023-01-01',
    monthlyRent: 225000,
    securityDeposit: 450000,
    depositAccountNo: '',
    utilityNo: '654381',
    status: 'active',
    createdAt: '2023-01-01',
  },
  {
    id: '25',
    name: 'Shahid Jew',
    cnic: '',
    phone: '+923001234591',
    email: '',
    premises: 'G3-A',
    effectiveDate: '2022-08-01',
    monthlyRent: 278808,
    securityDeposit: 550000,
    depositAccountNo: '',
    utilityNo: '30555',
    status: 'active',
    createdAt: '2022-08-01',
  },
  {
    id: '26',
    name: 'Faisal Jew',
    cnic: '',
    phone: '+923001234592',
    email: '',
    premises: 'G3-B',
    effectiveDate: '2024-01-01',
    monthlyRent: 201300,
    securityDeposit: 360000,
    depositAccountNo: '521',
    utilityNo: '7124129',
    status: 'active',
    createdAt: '2024-01-01',
  },
  {
    id: '27',
    name: 'Vacate',
    cnic: '',
    phone: '',
    email: '',
    premises: 'G2-B+G4',
    effectiveDate: '',
    monthlyRent: 0,
    securityDeposit: 0,
    depositAccountNo: '',
    utilityNo: '3667 + 3772',
    status: 'vacated',
    createdAt: '2020-01-01',
  },
  {
    id: '28',
    name: 'Vacate',
    cnic: '',
    phone: '',
    email: '',
    premises: 'G6-A',
    effectiveDate: '',
    monthlyRent: 0,
    securityDeposit: 0,
    depositAccountNo: '',
    utilityNo: '4302803',
    status: 'vacated',
    createdAt: '2020-01-01',
  },
  {
    id: '29',
    name: 'M&P Courier',
    cnic: '',
    phone: '+923001234593',
    email: '',
    premises: 'G6-B',
    effectiveDate: '2024-10-15',
    monthlyRent: 473000,
    securityDeposit: 950000,
    depositAccountNo: '',
    utilityNo: '3772+3667',
    status: 'active',
    createdAt: '2024-10-15',
  },
  {
    id: '30',
    name: 'Vacate',
    cnic: '',
    phone: '',
    email: '',
    premises: 'G8-A',
    effectiveDate: '',
    monthlyRent: 0,
    securityDeposit: 0,
    depositAccountNo: '',
    utilityNo: '4302803',
    status: 'vacated',
    createdAt: '2020-01-01',
  },
  {
    id: '31',
    name: 'Leopard Courier',
    cnic: '',
    phone: '+923001234594',
    email: '',
    premises: 'G8-B',
    effectiveDate: '2024-04-15',
    monthlyRent: 209000,
    securityDeposit: 420000,
    depositAccountNo: '521',
    utilityNo: '159142',
    status: 'active',
    createdAt: '2024-04-15',
  },
  {
    id: '32',
    name: 'M. Nadeem (Patyala Jew)',
    cnic: '',
    phone: '+923001234595',
    email: '',
    premises: 'G-9/A',
    effectiveDate: '2024-02-01',
    monthlyRent: 197654,
    securityDeposit: 400000,
    depositAccountNo: '',
    utilityNo: '319943',
    status: 'active',
    createdAt: '2024-02-01',
  },
  {
    id: '33',
    name: 'Vacate',
    cnic: '',
    phone: '',
    email: '',
    premises: 'G-12',
    effectiveDate: '',
    monthlyRent: 0,
    securityDeposit: 0,
    depositAccountNo: '',
    utilityNo: '319968',
    status: 'vacated',
    createdAt: '2020-01-01',
  },
  {
    id: '34',
    name: 'Mr. Rasheed',
    cnic: '',
    phone: '+923001234596',
    email: '',
    premises: 'G-9/B',
    effectiveDate: '2023-01-10',
    monthlyRent: 146410,
    securityDeposit: 260000,
    depositAccountNo: '475',
    utilityNo: '3443984',
    status: 'active',
    createdAt: '2023-01-10',
  },
  {
    id: '35',
    name: 'TCS',
    cnic: '',
    phone: '+923001234597',
    email: '',
    premises: 'G-10',
    effectiveDate: '2024-04-01',
    monthlyRent: 385000,
    securityDeposit: 770000,
    depositAccountNo: '542',
    utilityNo: '4544342',
    status: 'active',
    createdAt: '2024-04-01',
  },
  {
    id: '36',
    name: 'Mrs. Bushra (Saloon)',
    cnic: '',
    phone: '+923001234598',
    email: '',
    premises: '6-F',
    effectiveDate: '2024-08-15',
    monthlyRent: 88000,
    securityDeposit: 180000,
    depositAccountNo: '',
    utilityNo: '2505375',
    status: 'active',
    createdAt: '2024-08-15',
  },
  {
    id: '37',
    name: 'Syed Kazim Raza',
    cnic: '',
    phone: '+923001234599',
    email: '',
    premises: '9-F',
    effectiveDate: '2021-12-15',
    monthlyRent: 118278,
    securityDeposit: 240000,
    depositAccountNo: '',
    utilityNo: '319971',
    status: 'active',
    createdAt: '2021-12-15',
  },
  {
    id: '38',
    name: 'Mrs. Bushra (Saloon) 2',
    cnic: '',
    phone: '+923001234600',
    email: '',
    premises: '8-F+10-F',
    effectiveDate: '2021-03-01',
    monthlyRent: 264000,
    securityDeposit: 530000,
    depositAccountNo: '',
    utilityNo: '4459764',
    status: 'active',
    createdAt: '2021-03-01',
  },
  {
    id: '39',
    name: 'M. Haseeb',
    cnic: '',
    phone: '+923001234601',
    email: '',
    premises: '1-S-A',
    effectiveDate: '2025-01-01',
    monthlyRent: 35000,
    securityDeposit: 70000,
    depositAccountNo: '',
    utilityNo: '319965',
    status: 'active',
    createdAt: '2025-01-01',
  },
  {
    id: '40',
    name: 'Office Plaza',
    cnic: '',
    phone: '',
    email: '',
    premises: '1-S-B',
    effectiveDate: '',
    monthlyRent: 0,
    securityDeposit: 0,
    depositAccountNo: '',
    utilityNo: '48410',
    status: 'active',
    createdAt: '2020-01-01',
  },
  {
    id: '41',
    name: 'Syed Kazim Raza 2',
    cnic: '',
    phone: '+923001234602',
    email: '',
    premises: '2-S',
    effectiveDate: '2022-09-01',
    monthlyRent: 59895,
    securityDeposit: 120000,
    depositAccountNo: '',
    utilityNo: '226108',
    status: 'active',
    createdAt: '2022-09-01',
  },
  {
    id: '42',
    name: 'Shah Jahan 10%',
    cnic: '',
    phone: '+923001234603',
    email: '',
    premises: '3-S',
    effectiveDate: '2022-12-05',
    monthlyRent: 74429,
    securityDeposit: 150000,
    depositAccountNo: '',
    utilityNo: '320121',
    status: 'active',
    createdAt: '2022-12-05',
  },
  {
    id: '43',
    name: 'Shafiq Sultan',
    cnic: '',
    phone: '+923001234604',
    email: '',
    premises: '4-S',
    effectiveDate: '2022-12-01',
    monthlyRent: 64130,
    securityDeposit: 130000,
    depositAccountNo: '521',
    utilityNo: '1790975',
    status: 'active',
    createdAt: '2022-12-01',
  },
  {
    id: '44',
    name: 'Vacate',
    cnic: '',
    phone: '',
    email: '',
    premises: '6-S',
    effectiveDate: '',
    monthlyRent: 0,
    securityDeposit: 0,
    depositAccountNo: '',
    utilityNo: '48410',
    status: 'vacated',
    createdAt: '2020-01-01',
  },
  {
    id: '45',
    name: 'Vacate',
    cnic: '',
    phone: '',
    email: '',
    premises: '8-S',
    effectiveDate: '',
    monthlyRent: 0,
    securityDeposit: 0,
    depositAccountNo: '',
    utilityNo: '4303818',
    status: 'vacated',
    createdAt: '2020-01-01',
  },
  {
    id: '46',
    name: 'Rafay',
    cnic: '',
    phone: '+923001234605',
    email: '',
    premises: '9-S',
    effectiveDate: '2025-12-23',
    monthlyRent: 0,
    securityDeposit: 0,
    depositAccountNo: '',
    utilityNo: '319973',
    status: 'vacated',
    createdAt: '2025-12-23',
  },
  {
    id: '47',
    name: 'M. Farukh Saeed (Exp) 10%',
    cnic: '',
    phone: '+923001234606',
    email: '',
    premises: '10-S',
    effectiveDate: '2021-08-01',
    monthlyRent: 86969,
    securityDeposit: 180000,
    depositAccountNo: '',
    utilityNo: '4302646',
    status: 'active',
    createdAt: '2021-08-01',
  },
  {
    id: '48',
    name: 'Muhammad Zaman',
    cnic: '',
    phone: '+923001234607',
    email: '',
    premises: 'Mumty',
    effectiveDate: '2024-02-01',
    monthlyRent: 35200,
    securityDeposit: 70000,
    depositAccountNo: '',
    utilityNo: '1790976',
    status: 'active',
    createdAt: '2024-02-01',
  },
  {
    id: '67',
    name: 'Telenor',
    cnic: '',
    phone: '+923001234608',
    email: '',
    premises: 'Tower',
    effectiveDate: '2020-01-01',
    monthlyRent: 43333,
    securityDeposit: 90000,
    depositAccountNo: '',
    utilityNo: '',
    status: 'active',
    createdAt: '2020-01-01',
  },
  {
    id: '68',
    name: 'Appartment',
    cnic: '',
    phone: '+923001234609',
    email: '',
    premises: '1053',
    effectiveDate: '2023-09-04',
    monthlyRent: 199650,
    securityDeposit: 400000,
    depositAccountNo: '',
    utilityNo: '',
    status: 'active',
    createdAt: '2023-09-04',
  },
  {
    id: '69',
    name: 'Hi Tech Network',
    cnic: '',
    phone: '+923001234610',
    email: '',
    premises: '250',
    effectiveDate: '2024-03-01',
    monthlyRent: 200000,
    securityDeposit: 400000,
    depositAccountNo: '',
    utilityNo: '',
    status: 'active',
    createdAt: '2024-03-01',
  },
];

const sampleLeases: Lease[] = [
  { id: 'l1', tenantId: '1', startDate: '2023-07-01', endDate: '2024-06-30', durationMonths: 12, incrementPercent: 10, reminderDays: 30, status: 'running' },
  { id: 'l2', tenantId: '2', startDate: '2023-09-20', endDate: '2024-09-19', durationMonths: 12, incrementPercent: 10, reminderDays: 30, status: 'running' },
  { id: 'l3', tenantId: '3', startDate: '2022-07-01', endDate: '2023-06-30', durationMonths: 12, incrementPercent: 10, reminderDays: 30, status: 'expired' },
  { id: 'l4', tenantId: '4', startDate: '2023-07-01', endDate: '2024-06-30', durationMonths: 12, incrementPercent: 10, reminderDays: 30, status: 'running' },
  { id: 'l5', tenantId: '5', startDate: '2021-10-01', endDate: '2022-09-30', durationMonths: 12, incrementPercent: 10, reminderDays: 30, status: 'expired' },
  { id: 'l6', tenantId: '6', startDate: '2017-02-01', endDate: '2018-01-31', durationMonths: 12, incrementPercent: 10, reminderDays: 30, status: 'expired' },
  { id: 'l7', tenantId: '7', startDate: '2023-02-01', endDate: '2024-01-31', durationMonths: 12, incrementPercent: 10, reminderDays: 30, status: 'running' },
  { id: 'l8', tenantId: '8', startDate: '2024-02-01', endDate: '2025-01-31', durationMonths: 12, incrementPercent: 10, reminderDays: 30, status: 'running' },
  { id: 'l9', tenantId: '9', startDate: '2024-02-01', endDate: '2025-01-31', durationMonths: 12, incrementPercent: 10, reminderDays: 30, status: 'running' },
  { id: 'l10', tenantId: '10', startDate: '2022-01-01', endDate: '2022-12-31', durationMonths: 12, incrementPercent: 10, reminderDays: 30, status: 'expired' },
  { id: 'l11', tenantId: '11', startDate: '2023-05-01', endDate: '2024-04-30', durationMonths: 12, incrementPercent: 10, reminderDays: 30, status: 'running' },
  { id: 'l12', tenantId: '12', startDate: '2023-04-01', endDate: '2024-03-31', durationMonths: 12, incrementPercent: 10, reminderDays: 30, status: 'running' },
  { id: 'l13', tenantId: '13', startDate: '2023-03-01', endDate: '2024-02-29', durationMonths: 12, incrementPercent: 10, reminderDays: 30, status: 'running' },
  { id: 'l14', tenantId: '14', startDate: '2022-07-01', endDate: '2023-06-30', durationMonths: 12, incrementPercent: 10, reminderDays: 30, status: 'expired' },
  { id: 'l15', tenantId: '15', startDate: '2023-03-23', endDate: '2024-03-22', durationMonths: 12, incrementPercent: 10, reminderDays: 30, status: 'running' },
  { id: 'l16', tenantId: '16', startDate: '2019-01-01', endDate: '2019-12-31', durationMonths: 12, incrementPercent: 10, reminderDays: 30, status: 'expired' },
  { id: 'l17', tenantId: '17', startDate: '2025-08-15', endDate: '2026-08-14', durationMonths: 12, incrementPercent: 10, reminderDays: 30, status: 'running' },
  { id: 'l18', tenantId: '18', startDate: '2023-09-01', endDate: '2024-08-31', durationMonths: 12, incrementPercent: 10, reminderDays: 30, status: 'running' },
  { id: 'l19', tenantId: '19', startDate: '2024-01-01', endDate: '2024-12-31', durationMonths: 12, incrementPercent: 10, reminderDays: 30, status: 'running' },
  { id: 'l20', tenantId: '20', startDate: '2023-07-01', endDate: '2024-06-30', durationMonths: 12, incrementPercent: 10, reminderDays: 30, status: 'running' },
  { id: 'l21', tenantId: '21', startDate: '2025-08-01', endDate: '2026-07-31', durationMonths: 12, incrementPercent: 10, reminderDays: 30, status: 'running' },
  { id: 'l22', tenantId: '22', startDate: '2023-01-01', endDate: '2023-12-31', durationMonths: 12, incrementPercent: 10, reminderDays: 30, status: 'expired' },
  { id: 'l23', tenantId: '23', startDate: '2016-01-01', endDate: '2016-12-31', durationMonths: 12, incrementPercent: 10, reminderDays: 30, status: 'expired' },
  { id: 'l24', tenantId: '24', startDate: '2023-01-01', endDate: '2023-12-31', durationMonths: 12, incrementPercent: 10, reminderDays: 30, status: 'expired' },
  { id: 'l25', tenantId: '25', startDate: '2022-08-01', endDate: '2023-07-31', durationMonths: 12, incrementPercent: 10, reminderDays: 30, status: 'expired' },
  { id: 'l26', tenantId: '26', startDate: '2024-01-01', endDate: '2024-12-31', durationMonths: 12, incrementPercent: 10, reminderDays: 30, status: 'running' },
  { id: 'l29', tenantId: '29', startDate: '2024-10-15', endDate: '2025-10-14', durationMonths: 12, incrementPercent: 10, reminderDays: 30, status: 'running' },
  { id: 'l31', tenantId: '31', startDate: '2024-04-15', endDate: '2025-04-14', durationMonths: 12, incrementPercent: 10, reminderDays: 30, status: 'running' },
  { id: 'l32', tenantId: '32', startDate: '2024-02-01', endDate: '2025-01-31', durationMonths: 12, incrementPercent: 10, reminderDays: 30, status: 'running' },
  { id: 'l34', tenantId: '34', startDate: '2023-01-10', endDate: '2024-01-09', durationMonths: 12, incrementPercent: 10, reminderDays: 30, status: 'running' },
  { id: 'l35', tenantId: '35', startDate: '2024-04-01', endDate: '2025-03-31', durationMonths: 12, incrementPercent: 10, reminderDays: 30, status: 'running' },
  { id: 'l36', tenantId: '36', startDate: '2024-08-15', endDate: '2025-08-14', durationMonths: 12, incrementPercent: 10, reminderDays: 30, status: 'running' },
  { id: 'l37', tenantId: '37', startDate: '2021-12-15', endDate: '2022-12-14', durationMonths: 12, incrementPercent: 10, reminderDays: 30, status: 'expired' },
  { id: 'l38', tenantId: '38', startDate: '2021-03-01', endDate: '2022-02-28', durationMonths: 12, incrementPercent: 10, reminderDays: 30, status: 'expired' },
  { id: 'l39', tenantId: '39', startDate: '2025-01-01', endDate: '2025-12-31', durationMonths: 12, incrementPercent: 10, reminderDays: 30, status: 'running' },
  { id: 'l41', tenantId: '41', startDate: '2022-09-01', endDate: '2023-08-31', durationMonths: 12, incrementPercent: 10, reminderDays: 30, status: 'expired' },
  { id: 'l42', tenantId: '42', startDate: '2022-12-05', endDate: '2023-12-04', durationMonths: 12, incrementPercent: 10, reminderDays: 30, status: 'expired' },
  { id: 'l43', tenantId: '43', startDate: '2022-12-01', endDate: '2023-11-30', durationMonths: 12, incrementPercent: 10, reminderDays: 30, status: 'expired' },
  { id: 'l47', tenantId: '47', startDate: '2021-08-01', endDate: '2022-07-31', durationMonths: 12, incrementPercent: 10, reminderDays: 30, status: 'expired' },
  { id: 'l48', tenantId: '48', startDate: '2024-02-01', endDate: '2025-01-31', durationMonths: 12, incrementPercent: 10, reminderDays: 30, status: 'running' },
  { id: 'l67', tenantId: '67', startDate: '2020-01-01', endDate: '2020-12-31', durationMonths: 12, incrementPercent: 10, reminderDays: 30, status: 'expired' },
  { id: 'l68', tenantId: '68', startDate: '2023-09-04', endDate: '2024-09-03', durationMonths: 12, incrementPercent: 10, reminderDays: 30, status: 'running' },
  { id: 'l69', tenantId: '69', startDate: '2024-03-01', endDate: '2025-02-28', durationMonths: 12, incrementPercent: 10, reminderDays: 30, status: 'running' },
];

const samplePayments: Payment[] = [
  // February 2026 Payments
  { id: 'pf11', tenantId: '11', monthYear: '2026-02', amount: 100000, paymentDate: '2026-02-10', paymentMethod: 'bank', transactionNo: '', depositedAccount: '521', createdAt: '2026-02-10' },
  { id: 'pf13', tenantId: '13', monthYear: '2026-02', amount: 100000, paymentDate: '2026-02-10', paymentMethod: 'bank', transactionNo: '', depositedAccount: '521', createdAt: '2026-02-10' },
  { id: 'pf20', tenantId: '20', monthYear: '2026-02', amount: 275000, paymentDate: '2026-02-10', paymentMethod: 'bank', transactionNo: '', depositedAccount: '521', createdAt: '2026-02-10' },
  { id: 'pf24', tenantId: '24', monthYear: '2026-02', amount: 225000, paymentDate: '2026-01-06', paymentMethod: 'bank', transactionNo: '', depositedAccount: '', createdAt: '2026-01-06' },
  { id: 'pf39', tenantId: '39', monthYear: '2026-02', amount: 105000, paymentDate: '2026-02-10', paymentMethod: 'bank', transactionNo: '', depositedAccount: '', createdAt: '2026-02-10' },
  { id: 'pf42', tenantId: '42', monthYear: '2026-02', amount: 500000, paymentDate: '2026-01-04', paymentMethod: 'bank', transactionNo: '', depositedAccount: '', createdAt: '2026-01-04' },
  { id: 'pf43', tenantId: '43', monthYear: '2026-02', amount: 64051, paymentDate: '2026-02-02', paymentMethod: 'bank', transactionNo: '', depositedAccount: '521', createdAt: '2026-02-02' },
  // December 2025 Payments
  { id: 'p1', tenantId: '1', monthYear: '2025-12', amount: 140000, paymentDate: '2025-12-30', paymentMethod: 'bank', transactionNo: '', depositedAccount: '172', createdAt: '2025-12-30' },
  { id: 'p2', tenantId: '2', monthYear: '2025-12', amount: 70000, paymentDate: '2025-12-30', paymentMethod: 'bank', transactionNo: '', depositedAccount: '172', createdAt: '2025-12-30' },
  { id: 'p3', tenantId: '3', monthYear: '2025-12', amount: 51000, paymentDate: '2025-12-11', paymentMethod: 'bank', transactionNo: '', depositedAccount: '521', createdAt: '2025-12-11' },
  { id: 'p4', tenantId: '4', monthYear: '2025-12', amount: 47000, paymentDate: '2025-12-26', paymentMethod: 'bank', transactionNo: '', depositedAccount: '172', createdAt: '2025-12-26' },
  { id: 'p5', tenantId: '5', monthYear: '2025-12', amount: 39930, paymentDate: '2025-12-15', paymentMethod: 'bank', transactionNo: '', depositedAccount: '172', createdAt: '2025-12-15' },
  { id: 'p6', tenantId: '6', monthYear: '2025-12', amount: 100000, paymentDate: '2025-12-29', paymentMethod: 'bank', transactionNo: '', depositedAccount: '521', createdAt: '2025-12-29' },
  { id: 'p7', tenantId: '7', monthYear: '2025-12', amount: 40000, paymentDate: '2025-12-26', paymentMethod: 'bank', transactionNo: '', depositedAccount: '172', createdAt: '2025-12-26' },
  { id: 'p8', tenantId: '8', monthYear: '2025-12', amount: 70000, paymentDate: '2025-12-30', paymentMethod: 'bank', transactionNo: '', depositedAccount: '', createdAt: '2025-12-30' },
  { id: 'p9', tenantId: '9', monthYear: '2025-12', amount: 55000, paymentDate: '2025-12-26', paymentMethod: 'bank', transactionNo: '', depositedAccount: '172', createdAt: '2025-12-26' },
  { id: 'p10', tenantId: '10', monthYear: '2025-12', amount: 33660, paymentDate: '2025-12-30', paymentMethod: 'bank', transactionNo: '', depositedAccount: '', createdAt: '2025-12-30' },
  { id: 'p11', tenantId: '11', monthYear: '2025-12', amount: 100000, paymentDate: '2025-12-01', paymentMethod: 'bank', transactionNo: '', depositedAccount: '521', createdAt: '2025-12-01' },
  { id: 'p12', tenantId: '12', monthYear: '2025-12', amount: 53000, paymentDate: '2025-12-26', paymentMethod: 'bank', transactionNo: '', depositedAccount: '', createdAt: '2025-12-26' },
  { id: 'p13', tenantId: '13', monthYear: '2025-12', amount: 90000, paymentDate: '2025-12-05', paymentMethod: 'bank', transactionNo: '', depositedAccount: '521', createdAt: '2025-12-05' },
  { id: 'p14', tenantId: '14', monthYear: '2025-12', amount: 85000, paymentDate: '2025-12-28', paymentMethod: 'bank', transactionNo: '', depositedAccount: '521', createdAt: '2025-12-28' },
  { id: 'p15', tenantId: '15', monthYear: '2025-12', amount: 78650, paymentDate: '2025-12-29', paymentMethod: 'bank', transactionNo: '', depositedAccount: '', createdAt: '2025-12-29' },
  { id: 'p16', tenantId: '16', monthYear: '2025-12', amount: 375000, paymentDate: '2025-12-09', paymentMethod: 'bank', transactionNo: '', depositedAccount: '521', createdAt: '2025-12-09' },
  { id: 'p17', tenantId: '17', monthYear: '2025-12', amount: 72000, paymentDate: '2025-12-15', paymentMethod: 'bank', transactionNo: '', depositedAccount: '', createdAt: '2025-12-15' },
  { id: 'p18', tenantId: '18', monthYear: '2025-12', amount: 234000, paymentDate: '2025-12-25', paymentMethod: 'bank', transactionNo: '', depositedAccount: '', createdAt: '2025-12-25' },
  { id: 'p19', tenantId: '19', monthYear: '2025-12', amount: 143000, paymentDate: '2025-12-16', paymentMethod: 'bank', transactionNo: '', depositedAccount: '173', createdAt: '2025-12-16' },
  { id: 'p20', tenantId: '20', monthYear: '2025-12', amount: 100000, paymentDate: '2025-12-29', paymentMethod: 'bank', transactionNo: '', depositedAccount: '', createdAt: '2025-12-29' },
  { id: 'p21', tenantId: '21', monthYear: '2025-12', amount: 98000, paymentDate: '2025-12-29', paymentMethod: 'bank', transactionNo: '', depositedAccount: '', createdAt: '2025-12-29' },
  { id: 'p22', tenantId: '22', monthYear: '2025-12', amount: 225470, paymentDate: '2025-12-12', paymentMethod: 'bank', transactionNo: '', depositedAccount: '521', createdAt: '2025-12-12' },
  { id: 'p23', tenantId: '23', monthYear: '2025-12', amount: 346955, paymentDate: '2025-12-09', paymentMethod: 'bank', transactionNo: '', depositedAccount: '4521', createdAt: '2025-12-09' },
  { id: 'p24', tenantId: '24', monthYear: '2025-12', amount: 225000, paymentDate: '2026-01-02', paymentMethod: 'bank', transactionNo: '', depositedAccount: '', createdAt: '2026-01-02' },
  { id: 'p25', tenantId: '25', monthYear: '2025-12', amount: 320000, paymentDate: '2025-12-20', paymentMethod: 'bank', transactionNo: '', depositedAccount: '', createdAt: '2025-12-20' },
  { id: 'p26', tenantId: '26', monthYear: '2025-12', amount: 183000, paymentDate: '2025-12-22', paymentMethod: 'bank', transactionNo: '', depositedAccount: '', createdAt: '2025-12-22' },
  { id: 'p31', tenantId: '31', monthYear: '2025-12', amount: 418000, paymentDate: '2026-01-12', paymentMethod: 'bank', transactionNo: '', depositedAccount: '521', createdAt: '2026-01-12' },
  { id: 'p34', tenantId: '34', monthYear: '2025-12', amount: 133100, paymentDate: '2025-12-15', paymentMethod: 'bank', transactionNo: '', depositedAccount: '', createdAt: '2025-12-15' },
  { id: 'p35', tenantId: '35', monthYear: '2025-12', amount: 315094, paymentDate: '2025-12-11', paymentMethod: 'bank', transactionNo: '', depositedAccount: '542', createdAt: '2025-12-11' },
  { id: 'p36', tenantId: '36', monthYear: '2025-12', amount: 88000, paymentDate: '2025-12-22', paymentMethod: 'bank', transactionNo: '', depositedAccount: '', createdAt: '2025-12-22' },
  { id: 'p38', tenantId: '38', monthYear: '2025-12', amount: 264000, paymentDate: '2025-12-22', paymentMethod: 'bank', transactionNo: '', depositedAccount: '', createdAt: '2025-12-22' },
  { id: 'p39', tenantId: '39', monthYear: '2025-12', amount: 35000, paymentDate: '2025-12-31', paymentMethod: 'bank', transactionNo: '', depositedAccount: '', createdAt: '2025-12-31' },
  { id: 'p43', tenantId: '43', monthYear: '2025-12', amount: 64000, paymentDate: '2025-12-07', paymentMethod: 'bank', transactionNo: '', depositedAccount: '521', createdAt: '2025-12-07' },
];

const sampleRentRecords: RentRecord[] = [
  // February 2026 Rent Records
  { id: 'f1', tenantId: '1', monthYear: '2026-02', rent: 97437, outstandingPrevious: 170183, paid: 0, balance: 267620, carryForward: 267620 },
  { id: 'f2', tenantId: '2', monthYear: '2026-02', rent: 53944, outstandingPrevious: 71154, paid: 0, balance: 125098, carryForward: 125098 },
  { id: 'f3', tenantId: '3', monthYear: '2026-02', rent: 50820, outstandingPrevious: 24080, paid: 0, balance: 74900, carryForward: 74900 },
  { id: 'f4', tenantId: '4', monthYear: '2026-02', rent: 46452, outstandingPrevious: 134584, paid: 0, balance: 181036, carryForward: 181036 },
  { id: 'f5', tenantId: '5', monthYear: '2026-02', rent: 43923, outstandingPrevious: 11979, paid: 0, balance: 55902, carryForward: 55902 },
  { id: 'f6', tenantId: '6', monthYear: '2026-02', rent: 65592, outstandingPrevious: 66955, paid: 0, balance: 132547, carryForward: 132547 },
  { id: 'f7', tenantId: '7', monthYear: '2026-02', rent: 36443, outstandingPrevious: 11891, paid: 0, balance: 48334, carryForward: 48334 },
  { id: 'f8', tenantId: '8', monthYear: '2026-02', rent: 45000, outstandingPrevious: 127766, paid: 0, balance: 172766, carryForward: 172766 },
  { id: 'f9', tenantId: '9', monthYear: '2026-02', rent: 45000, outstandingPrevious: 41366, paid: 0, balance: 86366, carryForward: 86366 },
  { id: 'f10', tenantId: '10', monthYear: '2026-02', rent: 33660, outstandingPrevious: 39660, paid: 0, balance: 73320, carryForward: 73320 },
  { id: 'f11', tenantId: '11', monthYear: '2026-02', rent: 56514, outstandingPrevious: 377260, paid: 100000, balance: 333774, carryForward: 333774 },
  { id: 'f12', tenantId: '12', monthYear: '2026-02', rent: 53147, outstandingPrevious: 942, paid: 0, balance: 54089, carryForward: 54089 },
  { id: 'f13', tenantId: '13', monthYear: '2026-02', rent: 68200, outstandingPrevious: 142064, paid: 100000, balance: 110264, carryForward: 110264 },
  { id: 'f14', tenantId: '14', monthYear: '2026-02', rent: 77171, outstandingPrevious: 17247, paid: 0, balance: 94418, carryForward: 94418 },
  { id: 'f15', tenantId: '15', monthYear: '2026-02', rent: 78650, outstandingPrevious: 0, paid: 0, balance: 78650, carryForward: 78650 },
  { id: 'f16', tenantId: '16', monthYear: '2026-02', rent: 70862, outstandingPrevious: 317735, paid: 0, balance: 388597, carryForward: 388597 },
  { id: 'f17', tenantId: '17', monthYear: '2026-02', rent: 72000, outstandingPrevious: -6115, paid: 0, balance: 65885, carryForward: 65885 },
  { id: 'f18', tenantId: '18', monthYear: '2026-02', rent: 58564, outstandingPrevious: 0, paid: 0, balance: 58564, carryForward: 58564 },
  { id: 'f19', tenantId: '19', monthYear: '2026-02', rent: 143000, outstandingPrevious: 143000, paid: 0, balance: 286000, carryForward: 286000 },
  { id: 'f20', tenantId: '20', monthYear: '2026-02', rent: 75515, outstandingPrevious: 496413, paid: 275000, balance: 296928, carryForward: 296928 },
  { id: 'f21', tenantId: '21', monthYear: '2026-02', rent: 98000, outstandingPrevious: 97524, paid: 0, balance: 195524, carryForward: 195524 },
  { id: 'f22', tenantId: '22', monthYear: '2026-02', rent: 325000, outstandingPrevious: 49314, paid: 0, balance: 374314, carryForward: 374314 },
  { id: 'f23', tenantId: '23', monthYear: '2026-02', rent: 346955, outstandingPrevious: 5, paid: 0, balance: 346960, carryForward: 346960 },
  { id: 'f24', tenantId: '24', monthYear: '2026-02', rent: 225000, outstandingPrevious: 225000, paid: 225000, balance: 225000, carryForward: 225000 },
  { id: 'f25', tenantId: '25', monthYear: '2026-02', rent: 278808, outstandingPrevious: 3372, paid: 0, balance: 282180, carryForward: 282180 },
  { id: 'f26', tenantId: '26', monthYear: '2026-02', rent: 201300, outstandingPrevious: 0, paid: 0, balance: 201300, carryForward: 201300 },
  { id: 'f31', tenantId: '31', monthYear: '2026-02', rent: 209000, outstandingPrevious: 217750, paid: 0, balance: 426750, carryForward: 426750 },
  { id: 'f32', tenantId: '32', monthYear: '2026-02', rent: 197654, outstandingPrevious: 760273, paid: 0, balance: 957927, carryForward: 957927 },
  { id: 'f34', tenantId: '34', monthYear: '2026-02', rent: 146410, outstandingPrevious: 0, paid: 0, balance: 146410, carryForward: 146410 },
  { id: 'f35', tenantId: '35', monthYear: '2026-02', rent: 385000, outstandingPrevious: 664623, paid: 0, balance: 1049623, carryForward: 1049623 },
  { id: 'f36', tenantId: '36', monthYear: '2026-02', rent: 88000, outstandingPrevious: 0, paid: 0, balance: 88000, carryForward: 88000 },
  { id: 'f37', tenantId: '37', monthYear: '2026-02', rent: 118278, outstandingPrevious: 161592, paid: 0, balance: 279870, carryForward: 279870 },
  { id: 'f38', tenantId: '38', monthYear: '2026-02', rent: 264000, outstandingPrevious: 0, paid: 0, balance: 264000, carryForward: 264000 },
  { id: 'f39', tenantId: '39', monthYear: '2026-02', rent: 35000, outstandingPrevious: 175000, paid: 105000, balance: 105000, carryForward: 105000 },
  { id: 'f41', tenantId: '41', monthYear: '2026-02', rent: 59895, outstandingPrevious: 353375, paid: 0, balance: 413270, carryForward: 413270 },
  { id: 'f42', tenantId: '42', monthYear: '2026-02', rent: 74429, outstandingPrevious: 1208334, paid: 500000, balance: 782763, carryForward: 782763 },
  { id: 'f43', tenantId: '43', monthYear: '2026-02', rent: 64130, outstandingPrevious: 72420, paid: 64051, balance: 72499, carryForward: 72499 },
  { id: 'f47', tenantId: '47', monthYear: '2026-02', rent: 86969, outstandingPrevious: 370154, paid: 0, balance: 457123, carryForward: 457123 },
  { id: 'f48', tenantId: '48', monthYear: '2026-02', rent: 35200, outstandingPrevious: 105600, paid: 0, balance: 140800, carryForward: 140800 },
  { id: 'f67', tenantId: '67', monthYear: '2026-02', rent: 43333, outstandingPrevious: 173332, paid: 0, balance: 216665, carryForward: 216665 },
  { id: 'f68', tenantId: '68', monthYear: '2026-02', rent: 199650, outstandingPrevious: 399300, paid: 0, balance: 598950, carryForward: 598950 },
  { id: 'f69', tenantId: '69', monthYear: '2026-02', rent: 200000, outstandingPrevious: -310000, paid: 0, balance: -110000, carryForward: -110000 },
  // December 2025 Rent Records
  { id: 'r1', tenantId: '1', monthYear: '2025-12', rent: 97437, outstandingPrevious: 215309, paid: 140000, balance: 172746, carryForward: 172746 },
  { id: 'r2', tenantId: '2', monthYear: '2025-12', rent: 53944, outstandingPrevious: 33266, paid: 70000, balance: 17210, carryForward: 17210 },
  { id: 'r3', tenantId: '3', monthYear: '2025-12', rent: 50820, outstandingPrevious: 74440, paid: 51000, balance: 74260, carryForward: 74260 },
  { id: 'r4', tenantId: '4', monthYear: '2025-12', rent: 46452, outstandingPrevious: 135680, paid: 47000, balance: 135132, carryForward: 135132 },
  { id: 'r5', tenantId: '5', monthYear: '2025-12', rent: 43923, outstandingPrevious: 7986, paid: 39930, balance: 11979, carryForward: 11979 },
  { id: 'r6', tenantId: '6', monthYear: '2025-12', rent: 65592, outstandingPrevious: 135771, paid: 100000, balance: 101363, carryForward: 101363 },
  { id: 'r7', tenantId: '7', monthYear: '2025-12', rent: 36443, outstandingPrevious: 19005, paid: 40000, balance: 15448, carryForward: 15448 },
  { id: 'r8', tenantId: '8', monthYear: '2025-12', rent: 45000, outstandingPrevious: 157766, paid: 70000, balance: 132766, carryForward: 132766 },
  { id: 'r9', tenantId: '9', monthYear: '2025-12', rent: 45000, outstandingPrevious: 91366, paid: 55000, balance: 81366, carryForward: 81366 },
  { id: 'r10', tenantId: '10', monthYear: '2025-12', rent: 33660, outstandingPrevious: 39660, paid: 33660, balance: 39660, carryForward: 39660 },
  { id: 'r11', tenantId: '11', monthYear: '2025-12', rent: 56514, outstandingPrevious: 364232, paid: 100000, balance: 320746, carryForward: 320746 },
  { id: 'r12', tenantId: '12', monthYear: '2025-12', rent: 53147, outstandingPrevious: 648, paid: 53000, balance: 795, carryForward: 795 },
  { id: 'r13', tenantId: '13', monthYear: '2025-12', rent: 68200, outstandingPrevious: 195664, paid: 90000, balance: 173864, carryForward: 173864 },
  { id: 'r14', tenantId: '14', monthYear: '2025-12', rent: 77171, outstandingPrevious: 27555, paid: 85000, balance: 19726, carryForward: 19726 },
  { id: 'r15', tenantId: '15', monthYear: '2025-12', rent: 78650, outstandingPrevious: 0, paid: 78650, balance: 0, carryForward: 0 },
  { id: 'r16', tenantId: '16', monthYear: '2025-12', rent: 70862, outstandingPrevious: 551011, paid: 375000, balance: 246873, carryForward: 246873 },
  { id: 'r17', tenantId: '17', monthYear: '2025-12', rent: 72000, outstandingPrevious: -6115, paid: 72000, balance: -6115, carryForward: -6115 },
  { id: 'r18', tenantId: '18', monthYear: '2025-12', rent: 58564, outstandingPrevious: 176112, paid: 234000, balance: 676, carryForward: 676 },
  { id: 'r19', tenantId: '19', monthYear: '2025-12', rent: 143000, outstandingPrevious: 143000, paid: 143000, balance: 143000, carryForward: 143000 },
  { id: 'r20', tenantId: '20', monthYear: '2025-12', rent: 75515, outstandingPrevious: 545383, paid: 100000, balance: 520898, carryForward: 520898 },
  { id: 'r21', tenantId: '21', monthYear: '2025-12', rent: 98000, outstandingPrevious: 97524, paid: 98000, balance: 97524, carryForward: 97524 },
  { id: 'r22', tenantId: '22', monthYear: '2025-12', rent: 325000, outstandingPrevious: 974784, paid: 225470, balance: 1074314, carryForward: 1074314 },
  { id: 'r23', tenantId: '23', monthYear: '2025-12', rent: 346955, outstandingPrevious: 5, paid: 346955, balance: 5, carryForward: 5 },
  { id: 'r24', tenantId: '24', monthYear: '2025-12', rent: 225000, outstandingPrevious: 0, paid: 225000, balance: 0, carryForward: 0 },
  { id: 'r25', tenantId: '25', monthYear: '2025-12', rent: 278808, outstandingPrevious: 75756, paid: 320000, balance: 34564, carryForward: 34564 },
  { id: 'r26', tenantId: '26', monthYear: '2025-12', rent: 183000, outstandingPrevious: 0, paid: 183000, balance: 0, carryForward: 0 },
  { id: 'r29', tenantId: '29', monthYear: '2025-12', rent: 473000, outstandingPrevious: -537750, paid: 0, balance: -64750, carryForward: -64750 },
  { id: 'r31', tenantId: '31', monthYear: '2025-12', rent: 209000, outstandingPrevious: 217750, paid: 418000, balance: 8750, carryForward: 8750 },
  { id: 'r32', tenantId: '32', monthYear: '2025-12', rent: 197654, outstandingPrevious: 364965, paid: 0, balance: 562619, carryForward: 562619 },
  { id: 'r34', tenantId: '34', monthYear: '2025-12', rent: 133100, outstandingPrevious: 0, paid: 133100, balance: 0, carryForward: 0 },
  { id: 'r35', tenantId: '35', monthYear: '2025-12', rent: 385000, outstandingPrevious: 524812, paid: 315094, balance: 594718, carryForward: 594718 },
  { id: 'r36', tenantId: '36', monthYear: '2025-12', rent: 88000, outstandingPrevious: 0, paid: 88000, balance: 0, carryForward: 0 },
  { id: 'r37', tenantId: '37', monthYear: '2025-12', rent: 118278, outstandingPrevious: 425036, paid: 0, balance: 543314, carryForward: 543314 },
  { id: 'r38', tenantId: '38', monthYear: '2025-12', rent: 264000, outstandingPrevious: 0, paid: 264000, balance: 0, carryForward: 0 },
  { id: 'r39', tenantId: '39', monthYear: '2025-12', rent: 35000, outstandingPrevious: 140000, paid: 35000, balance: 140000, carryForward: 140000 },
  { id: 'r41', tenantId: '41', monthYear: '2025-12', rent: 59895, outstandingPrevious: 233585, paid: 0, balance: 293480, carryForward: 293480 },
  { id: 'r42', tenantId: '42', monthYear: '2025-12', rent: 74429, outstandingPrevious: 1059476, paid: 0, balance: 1133905, carryForward: 1133905 },
  { id: 'r43', tenantId: '43', monthYear: '2025-12', rent: 64130, outstandingPrevious: 72160, paid: 64000, balance: 72290, carryForward: 72290 },
  { id: 'r47', tenantId: '47', monthYear: '2025-12', rent: 86969, outstandingPrevious: 196216, paid: 0, balance: 283185, carryForward: 283185 },
  { id: 'r48', tenantId: '48', monthYear: '2025-12', rent: 35200, outstandingPrevious: 35200, paid: 0, balance: 70400, carryForward: 70400 },
  { id: 'r67', tenantId: '67', monthYear: '2025-12', rent: 43333, outstandingPrevious: 86666, paid: 0, balance: 129999, carryForward: 129999 },
  { id: 'r68', tenantId: '68', monthYear: '2025-12', rent: 199650, outstandingPrevious: 0, paid: 0, balance: 199650, carryForward: 199650 },
  { id: 'r69', tenantId: '69', monthYear: '2025-12', rent: 200000, outstandingPrevious: -140000, paid: 0, balance: 60000, carryForward: 60000 },
];

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('currentUser');
    return saved ? JSON.parse(saved) : null;
  });

  const [tenants, setTenants] = useState<Tenant[]>(() => {
    const saved = localStorage.getItem('tenants');
    return saved ? JSON.parse(saved) : sampleTenants;
  });

  const [leases, setLeases] = useState<Lease[]>(() => {
    const saved = localStorage.getItem('leases');
    return saved ? JSON.parse(saved) : sampleLeases;
  });

  const [payments, setPayments] = useState<Payment[]>(() => {
    const saved = localStorage.getItem('payments');
    return saved ? JSON.parse(saved) : samplePayments;
  });

  const [rentRecords, setRentRecords] = useState<RentRecord[]>(() => {
    const saved = localStorage.getItem('rentRecords');
    return saved ? JSON.parse(saved) : sampleRentRecords;
  });

  const [settings, setSettings] = useState<Settings>(() => {
    const saved = localStorage.getItem('settings');
    return saved ? JSON.parse(saved) : defaultSettings;
  });

  const [rentHistory, setRentHistory] = useState<RentHistory[]>(() => {
    const saved = localStorage.getItem('rentHistory');
    return saved ? JSON.parse(saved) : [];
  });

  const [depositAdjustments, setDepositAdjustments] = useState<DepositAdjustment[]>(() => {
    const saved = localStorage.getItem('depositAdjustments');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('tenants', JSON.stringify(tenants));
  }, [tenants]);

  useEffect(() => {
    localStorage.setItem('leases', JSON.stringify(leases));
  }, [leases]);

  useEffect(() => {
    localStorage.setItem('payments', JSON.stringify(payments));
  }, [payments]);

  useEffect(() => {
    localStorage.setItem('rentRecords', JSON.stringify(rentRecords));
  }, [rentRecords]);

  useEffect(() => {
    localStorage.setItem('settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('rentHistory', JSON.stringify(rentHistory));
  }, [rentHistory]);

  useEffect(() => {
    localStorage.setItem('depositAdjustments', JSON.stringify(depositAdjustments));
  }, [depositAdjustments]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('currentUser', JSON.stringify(user));
    } else {
      localStorage.removeItem('currentUser');
    }
  }, [user]);

  const login = (username: string, password: string): boolean => {
    const foundUser = defaultUsers.find(
      (u) => u.username === username && u.password === password
    );
    if (foundUser) {
      setUser(foundUser);
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
  };

  const addTenant = (tenant: Omit<Tenant, 'id' | 'createdAt'>) => {
    const newTenant: Tenant = {
      ...tenant,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
    };
    setTenants((prev) => [...prev, newTenant]);
  };

  const updateTenant = (id: string, updates: Partial<Tenant>) => {
    setTenants((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updates } : t))
    );
  };

  const deleteTenant = (id: string) => {
    setTenants((prev) => prev.filter((t) => t.id !== id));
  };

  const addLease = (lease: Omit<Lease, 'id'>) => {
    const newLease: Lease = {
      ...lease,
      id: uuidv4(),
    };
    setLeases((prev) => [...prev, newLease]);
  };

  const updateLease = (id: string, updates: Partial<Lease>) => {
    setLeases((prev) =>
      prev.map((l) => (l.id === id ? { ...l, ...updates } : l))
    );
  };

  const addPayment = (payment: Omit<Payment, 'id' | 'createdAt'>) => {
    const newPayment: Payment = {
      ...payment,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
    };
    setPayments((prev) => [...prev, newPayment]);

    // Update rent record
    setRentRecords((prev) =>
      prev.map((r) => {
        if (r.tenantId === payment.tenantId && r.monthYear === payment.monthYear) {
          const newPaid = r.paid + payment.amount;
          const newBalance = r.outstandingPrevious + r.rent - newPaid;
          return {
            ...r,
            paid: newPaid,
            balance: newBalance,
            carryForward: newBalance,
          };
        }
        return r;
      })
    );
  };

  const generateRentSheet = (monthYear: string) => {
    const activeTenants = tenants.filter((t) => t.status === 'active');
    
    activeTenants.forEach((tenant) => {
      const existingRecord = rentRecords.find(
        (r) => r.tenantId === tenant.id && r.monthYear === monthYear
      );

      if (!existingRecord) {
        // Get previous month's carry forward
        const prevDate = addMonths(parseISO(`${monthYear}-01`), -1);
        const prevMonthYear = format(prevDate, 'yyyy-MM');
        const prevRecord = rentRecords.find(
          (r) => r.tenantId === tenant.id && r.monthYear === prevMonthYear
        );
        const outstandingPrevious = prevRecord?.carryForward || 0;

        const newRecord: RentRecord = {
          id: uuidv4(),
          tenantId: tenant.id,
          monthYear,
          rent: tenant.monthlyRent,
          outstandingPrevious,
          paid: 0,
          balance: outstandingPrevious + tenant.monthlyRent,
          carryForward: outstandingPrevious + tenant.monthlyRent,
        };

        setRentRecords((prev) => [...prev, newRecord]);
      }
    });
  };

  const updateSettings = (updates: Partial<Settings>) => {
    setSettings((prev) => ({ ...prev, ...updates }));
  };

  const applyRentIncrement = (tenantId: string) => {
    const tenant = tenants.find((t) => t.id === tenantId);
    const lease = leases.find((l) => l.tenantId === tenantId);
    
    if (tenant && lease) {
      const incrementPercent = lease.incrementPercent || settings.defaultIncrementPercent;
      const newRent = Math.round(tenant.monthlyRent * (1 + incrementPercent / 100));

      // Add to rent history
      const historyEntry: RentHistory = {
        id: uuidv4(),
        tenantId,
        oldRent: tenant.monthlyRent,
        newRent,
        effectiveDate: new Date().toISOString(),
        incrementPercent,
      };
      setRentHistory((prev) => [...prev, historyEntry]);

      // Update tenant rent
      updateTenant(tenantId, { monthlyRent: newRent });
    }
  };

  const addDepositAdjustment = (adjustment: Omit<DepositAdjustment, 'id'>) => {
    const newAdjustment: DepositAdjustment = {
      ...adjustment,
      id: uuidv4(),
    };
    setDepositAdjustments((prev) => [...prev, newAdjustment]);
  };

  const getTenantLedger = (tenantId: string) => {
    const records = rentRecords
      .filter((r) => r.tenantId === tenantId)
      .sort((a, b) => a.monthYear.localeCompare(b.monthYear));
    const tenantPayments = payments
      .filter((p) => p.tenantId === tenantId)
      .sort((a, b) => a.paymentDate.localeCompare(b.paymentDate));
    return { records, payments: tenantPayments };
  };

  const getWhatsAppMessage = (tenantId: string, type: 'rent' | 'overdue' | 'lease'): string => {
    const tenant = tenants.find((t) => t.id === tenantId);
    const currentMonth = format(new Date(), 'MMMM yyyy');
    const record = rentRecords.find(
      (r) => r.tenantId === tenantId && r.monthYear === format(new Date(), 'yyyy-MM')
    );

    if (!tenant) return '';

    let template = settings.whatsappTemplate;
    
    if (type === 'lease') {
      const lease = leases.find((l) => l.tenantId === tenantId);
      if (lease) {
        const daysToExpiry = differenceInDays(parseISO(lease.endDate), new Date());
        template = `Dear {{tenant}}, your lease agreement is expiring in ${daysToExpiry} days on ${format(parseISO(lease.endDate), 'dd MMM yyyy')}. Please contact us for renewal.`;
      }
    }

    return template
      .replace('{{tenant}}', tenant.name)
      .replace('{{month}}', currentMonth)
      .replace('{{balance}}', record ? record.balance.toLocaleString() : '0');
  };

  return (
    <AppContext.Provider
      value={{
        user,
        login,
        logout,
        tenants,
        addTenant,
        updateTenant,
        deleteTenant,
        leases,
        addLease,
        updateLease,
        payments,
        addPayment,
        rentRecords,
        generateRentSheet,
        settings,
        updateSettings,
        rentHistory,
        applyRentIncrement,
        depositAdjustments,
        addDepositAdjustment,
        getTenantLedger,
        getWhatsAppMessage,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
