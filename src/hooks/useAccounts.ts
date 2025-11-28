import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, addDoc, doc, updateDoc, deleteDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase-config';
import { Account } from '@/types';

export const useAccounts = (userId: string | null) => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchAccounts = async (uid: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const accountsRef = collection(db, 'accounts');
      const q = query(accountsRef, where('userId', '==', uid));
      const querySnapshot = await getDocs(q);
      
      const accountsData: Account[] = [];
      querySnapshot.forEach((doc) => {
        accountsData.push({ id: doc.id, ...doc.data() } as Account);
      });
      
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
      const accountsRef = collection(db, 'accounts');
      const newBalance = account.type === 'debt' ? -Math.abs(account.balance) : Math.abs(account.balance);
      
      const docRef = await addDoc(accountsRef, {
        ...account,
        userId,
        balance: newBalance,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
      
      await fetchAccounts(userId);
      return docRef.id;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to add account');
      setError(error);
      throw error;
    }
  };

  const updateAccount = async (accountId: string, updates: Partial<Account>) => {
    if (!userId) throw new Error('User not authenticated');
    
    try {
      const accountRef = doc(db, 'accounts', accountId);
      const updateData: any = { ...updates, updatedAt: Timestamp.now() };
      
      if (updates.balance !== undefined && updates.type) {
        updateData.balance = updates.type === 'debt' 
          ? -Math.abs(updates.balance) 
          : Math.abs(updates.balance);
      }
      
      await updateDoc(accountRef, updateData);
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
      const accountRef = doc(db, 'accounts', accountId);
      await deleteDoc(accountRef);
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

