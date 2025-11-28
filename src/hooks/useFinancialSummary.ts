import { useMemo } from 'react';
import { Account, FinancialSummary } from '@/types';

export const useFinancialSummary = (accounts: Account[]): FinancialSummary => {
  return useMemo(() => {
    const savingsAccounts = accounts.filter(acc => acc.type === 'savings');
    const debtAccounts = accounts.filter(acc => acc.type === 'debt');
    
    const totalAssets = savingsAccounts.reduce((sum, acc) => sum + Math.abs(acc.balance), 0);
    const totalLiabilities = debtAccounts.reduce((sum, acc) => sum + Math.abs(acc.balance), 0);
    const netWorth = totalAssets - totalLiabilities;

    return {
      totalAssets,
      totalLiabilities,
      netWorth,
      savingsAccounts: savingsAccounts.length,
      debtAccounts: debtAccounts.length,
    };
  }, [accounts]);
};

