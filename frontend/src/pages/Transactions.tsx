import React, { useState, useEffect } from 'react';
import { Table } from '../components/ui/Table';
import { Badge } from '../components/ui/Badge';
import { transactionService } from '../services/transactionService';
import toast from 'react-hot-toast';

interface Transaction {
  id: number;
  product_id: number;
  product?: { name: string };
  type: 'IN' | 'OUT';
  quantity: number;
  total_price: number;
  timestamp: string;
}

export function Transactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    setLoading(true);
    try {
      const response = await transactionService.getTransactions({ limit: 100 });
      setTransactions(response.items);
    } catch (error) {
      console.error('Failed to load transactions:', error);
      toast.error('Failed to load transactions');
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { key: 'id', header: 'ID' },
    {
      key: 'product',
      header: 'Product',
      render: (value: any, item: Transaction) => item.product?.name || `Product ID: ${item.product_id}`,
    },
    {
      key: 'type',
      header: 'Type',
      render: (value: string) => (
        <Badge status={value === 'IN' ? 'success' : 'warning'}>
          {value}
        </Badge>
      ),
    },
    { key: 'quantity', header: 'Quantity' },
    {
      key: 'total_price',
      header: 'Total Price',
      render: (value: number) => `$${value.toFixed(2)}`,
    },
    {
      key: 'timestamp',
      header: 'Date',
      render: (value: string) => new Date(value).toLocaleString(),
    },
  ];

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neon-cyan"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-mono text-neon-cyan animate-glow">Transaction History</h1>
      <Table columns={columns} data={transactions} />
    </div>
  );
}
