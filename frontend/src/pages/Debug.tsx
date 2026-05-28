import React, { useEffect, useState } from 'react';
import { productService } from '../services/productService';
import { categoryService } from '../services/categoryService';
import { transactionService } from '../services/transactionService';

export function Debug() {
  const [status, setStatus] = useState({
    backend: 'checking',
    categories: [],
    products: [],
    transactions: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkBackend();
  }, []);

  const checkBackend = async () => {
    try {
      // Test categories API
      const categories = await categoryService.getCategories();
      
      // Test products API
      const products = await productService.getProducts({ limit: 10 });
      
      // Test transactions API
      const transactions = await transactionService.getTransactions({ limit: 10 });
      
      setStatus({
        backend: 'connected',
        categories: categories,
        products: products.items,
        transactions: transactions.items
      });
    } catch (error: any) {
      console.error('Backend connection failed:', error);
      setStatus(prev => ({ 
        ...prev, 
        backend: `error: ${error.message}` 
      }));
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-6">Checking backend connection...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-mono text-neon-cyan">Debug Information</h1>
      
      <div className="card-glow p-4">
        <h2 className="text-xl font-bold text-neon-cyan mb-2">Backend Status</h2>
        <p className={status.backend === 'connected' ? 'text-neon-green' : 'text-neon-red'}>
          {status.backend === 'connected' ? '✅ Connected' : `❌ ${status.backend}`}
        </p>
        <p className="text-sm text-gray-400 mt-2">API URL: {import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'}</p>
      </div>

      <div className="card-glow p-4">
        <h2 className="text-xl font-bold text-neon-cyan mb-2">Categories ({status.categories.length})</h2>
        <pre className="text-xs text-gray-400 overflow-auto max-h-60">
          {JSON.stringify(status.categories, null, 2)}
        </pre>
      </div>

      <div className="card-glow p-4">
        <h2 className="text-xl font-bold text-neon-cyan mb-2">Products ({status.products.length})</h2>
        <pre className="text-xs text-gray-400 overflow-auto max-h-60">
          {JSON.stringify(status.products, null, 2)}
        </pre>
      </div>

      <div className="card-glow p-4">
        <h2 className="text-xl font-bold text-neon-cyan mb-2">Transactions ({status.transactions.length})</h2>
        <pre className="text-xs text-gray-400 overflow-auto max-h-60">
          {JSON.stringify(status.transactions, null, 2)}
        </pre>
      </div>
    </div>
  );
}
