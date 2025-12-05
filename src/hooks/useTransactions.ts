import { useState, useEffect } from 'react';
import { transactionService } from '@/services/transactionService';
import { Transaction } from '@/types';

export const useTransactions = (userId: string | null) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchTransactions = async (uid: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await transactionService.getAll(uid);
      
      // Convert MongoDB _id to id and format timestamp
      const transactionsData: Transaction[] = response.map((transaction: any) => ({
        id: transaction.id || transaction._id,
        ...transaction,
        timestamp: transaction.timestamp ? new Date(transaction.timestamp) : new Date()
      })) as Transaction[];
      
      // Sort by timestamp (newest first)
      setTransactions(
        transactionsData.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      );
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch transactions');
      setError(error);
      console.error('Error fetching transactions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchTransactions(userId);
    } else {
      setTransactions([]);
      setIsLoading(false);
    }
  }, [userId]);

  const addTransaction = async (transaction: Omit<Transaction, 'id' | 'timestamp'>) => {
    if (!userId) throw new Error('User not authenticated');
    
    try {
      await transactionService.create(transaction);
      await fetchTransactions(userId);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to add transaction');
      setError(error);
      throw error;
    }
  };

  return {
    transactions,
    isLoading,
    error,
    fetchTransactions,
    addTransaction,
  };
};

