import { useState, useEffect } from 'react';
import { productService } from '../services/productService';
import { Product } from '../types';

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const response = await productService.getProducts({ limit: 100 });
      setProducts(response.items);
    } catch (err) {
      setError('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const refetch = () => {
    setLoading(true);
    loadProducts();
  };

  return { products, loading, error, refetch };
};
