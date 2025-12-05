import { useState, useEffect } from 'react';
import { accountService } from '@/services/accountService';
import { Account } from '@/types';

export const useAccounts = (userId: string | null) => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchAccounts = async (uid: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await accountService.getAll(uid);
      
      // Convert MongoDB _id to id and format dates
      const accountsData: Account[] = response.map((account: any) => ({
        id: account.id || account._id,
        ...account,
        createdAt: account.createdAt ? new Date(account.createdAt) : undefined,
        updatedAt: account.updatedAt ? new Date(account.updatedAt) : undefined,
      })) as Account[];
      
      setAccounts(accountsData);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch accounts');
      setError(error);
      console.error('Error fetching accounts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchAccounts(userId);
    } else {
      setAccounts([]);
      setIsLoading(false);
    }
  }, [userId]);

  const addAccount = async (account: Omit<Account, 'id' | 'userId'>) => {
    if (!userId) throw new Error('User not authenticated');
    
    try {
      const newBalance = account.type === 'debt' ? -Math.abs(account.balance) : Math.abs(account.balance);
      
      const response = await accountService.create({
        ...account,
        userId,
        balance: newBalance,
      });
      
      await fetchAccounts(userId);
      return response.id || response._id;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to add account');
      setError(error);
      throw error;
    }
  };

  const updateAccount = async (accountId: string, updates: Partial<Account>) => {
    if (!userId) throw new Error('User not authenticated');
    
    try {
      const updateData: any = { ...updates };
      
      if (updates.balance !== undefined && updates.type) {
        updateData.balance = updates.type === 'debt' 
          ? -Math.abs(updates.balance) 
          : Math.abs(updates.balance);
      }
      
      await accountService.update(accountId, updateData);
      await fetchAccounts(userId);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to update account');
      setError(error);
      throw error;
    }
  };

  const deleteAccount = async (accountId: string) => {
    if (!userId) throw new Error('User not authenticated');
    
    try {
      await accountService.delete(accountId);
      await fetchAccounts(userId);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to delete account');
      setError(error);
      throw error;
    }
  };

  return {
    accounts,
    isLoading,
    error,
    fetchAccounts,
    addAccount,
    updateAccount,
    deleteAccount,
  };
};
