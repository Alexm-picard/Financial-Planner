export interface Account {
  id?: string;
  name: string;
  balance: number;
  dueDate: string | null;
  description: string;
  type: 'savings' | 'debt';
  userId: string;
  monthlyPayment?: MonthlyPayment | null;
  incomeSchedule?: IncomeSchedule | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface MonthlyPayment {
  amount: number;
  linkedAccountId: string;
  nextPaymentDate: string;
}

export interface IncomeSchedule {
  payDayDate: string;
  estimatedEarnings: number;
  frequency: 'weekly' | 'bi-weekly' | 'monthly';
}

export interface Transaction {
  id?: string;
  accountId: string;
  accountName: string;
  userId: string;
  type: 'create' | 'update' | 'delete';
  previousBalance?: number;
  newBalance?: number;
  timestamp: Date;
  description: string;
}

export interface ChartData {
  date: string;
  balance: number;
  label?: string;
}

export interface FinancialSummary {
  totalAssets: number;
  totalLiabilities: number;
  netWorth: number;
  savingsAccounts: number;
  debtAccounts: number;
}

export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

