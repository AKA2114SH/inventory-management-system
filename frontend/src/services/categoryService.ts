import api from './api';
import type { Category } from '../types';

export const categoryService = {
  async getCategories(): Promise<Category[]> {
    const response = await api.get('/categories');
    return response.data;
  },

  async getCategory(id: number): Promise<Category> {
    const response = await api.get(`/categories/${id}`);
    return response.data;
  },

  async createCategory(data: { name: string; description?: string }): Promise<Category> {
    const response = await api.post('/categories', data);
    return response.data;
  },

  async updateCategory(id: number, data: { name?: string; description?: string }): Promise<Category> {
    const response = await api.put(`/categories/${id}`, data);
    return response.data;
  },

  async deleteCategory(id: number): Promise<{ message: string }> {
    const response = await api.delete(`/categories/${id}`);
    return response.data;
  },
};

export default categoryService;
