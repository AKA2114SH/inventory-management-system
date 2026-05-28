import api from './api';
import type { Transaction } from '../types';

export const transactionService = {
  async createTransaction(data: { product_id: number; type: 'IN' | 'OUT'; quantity: number; total_price: number }): Promise<{ product_id: number; product_name: string; previous_stock: number; new_stock: number; transaction_id: number }> {
    const response = await api.post('/transactions', data);
    return response.data;
  },
  
  async getTransactions(params?: { 
    skip?: number; 
    limit?: number; 
    product_id?: number; 
    transaction_type?: 'IN' | 'OUT';
    start_date?: string;
    end_date?: string;
  }): Promise<{ items: Transaction[]; total: number; page: number; page_size: number; total_pages: number }> {
    const response = await api.get('/transactions', { params });
    return response.data;
  },
  
  async getProductHistory(product_id: number, limit?: number): Promise<Transaction[]> {
    const response = await api.get(`/transactions/product/${product_id}/history`, { params: { limit } });
    return response.data;
  }
};

export default transactionService;
