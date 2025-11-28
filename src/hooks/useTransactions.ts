import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase-config';
import { Transaction } from '@/types';

export const useTransactions = (userId: string | null) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchTransactions = async (uid: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const transactionsRef = collection(db, 'transactions');
      const q = query(transactionsRef, where('userId', '==', uid));
      const querySnapshot = await getDocs(q);
      
      const transactionsData: Transaction[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        transactionsData.push({
          id: doc.id,
          ...data,
          timestamp: data.timestamp.toDate()
        } as Transaction);
      });
      
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
      const transactionsRef = collection(db, 'transactions');
      await addDoc(transactionsRef, {
        ...transaction,
        timestamp: Timestamp.now()
      });
      
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

