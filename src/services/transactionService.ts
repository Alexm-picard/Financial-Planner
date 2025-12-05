import api from './api';
import { Transaction } from '@/types';

export const transactionService = {
  // Get all transactions for a user
  async getAll(userId: string) {
    const response = await api.get(`/transactions?userId=${userId}`);
    return response.data; // Array of transactions
  },

  // Get single transaction by ID
  async getById(id: string) {
    const response = await api.get(`/transactions/${id}`);
    return response.data; // Single transaction
  },

  // Create transaction
  async create(transactionData: Omit<Transaction, 'id' | 'timestamp'>) {
    const response = await api.post('/transactions', transactionData);
    return response.data; // Created transaction with _id
  }
};

