import api from './api';
import type { Product } from '../types';

export const productService = {
  async getProducts(params?: { skip?: number; limit?: number; category_id?: number; search?: string }): Promise<{ items: Product[]; total: number; page: number; page_size: number; total_pages: number }> {
    const response = await api.get('/products', { params });
    return response.data;
  },
  
  async getProduct(id: number): Promise<Product> {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },
  
  async createProduct(productData: Omit<Product, 'id' | 'created_at' | 'updated_at' | 'category'>): Promise<Product> {
    const response = await api.post('/products', productData);
    return response.data;
  },
  
  async updateProduct(id: number, productData: Partial<Product>): Promise<Product> {
    const response = await api.put(`/products/${id}`, productData);
    return response.data;
  },
  
  async deleteProduct(id: number): Promise<{ message: string }> {
    const response = await api.delete(`/products/${id}`);
    return response.data;
  }
};

export default productService;
