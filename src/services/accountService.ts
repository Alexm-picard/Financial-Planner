import api from './api';
import { Account } from '@/types';

export const accountService = {
  // Get all accounts for a user
  async getAll(userId: string) {
    const response = await api.get(`/accounts?userId=${userId}`);
    return response.data; // Array of accounts
  },

  // Get single account by ID
  async getById(id: string) {
    const response = await api.get(`/accounts/${id}`);
    return response.data; // Single account
  },

  // Create account
  async create(accountData: Omit<Account, 'id' | 'userId'> & { userId: string }) {
    const response = await api.post('/accounts', accountData);
    return response.data; // Created account with _id
  },

  // Update account
  async update(id: string, updates: Partial<Account>) {
    const response = await api.patch(`/accounts/${id}`, updates);
    return response.data; // Updated account
  },

  // Delete account
  async delete(id: string) {
    await api.delete(`/accounts/${id}`);
    return { success: true };
  }
};

