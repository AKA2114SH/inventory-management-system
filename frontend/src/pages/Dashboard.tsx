import React, { useState, useEffect } from 'react';
import { Package, TrendingUp, TrendingDown, DollarSign, AlertCircle } from 'lucide-react';
import { productService } from '../services/productService';
import { transactionService } from '../services/transactionService';
import toast from 'react-hot-toast';

export function Dashboard() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    lowStockCount: 0,
    totalRevenue: 0,
    totalInTransactions: 0,
    totalOutTransactions: 0,
    recentTransactions: [] as any[],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const productsRes = await productService.getProducts({ limit: 1000 });
      const products = productsRes.items;
      
      const transactionsRes = await transactionService.getTransactions({ limit: 1000 });
      const transactions = transactionsRes.items;
      
      const lowStock = products.filter(p => p.stock_quantity < 20).length;
      const revenue = transactions
        .filter(t => t.type === 'OUT')
        .reduce((sum, t) => sum + t.total_price, 0);
      const inCount = transactions.filter(t => t.type === 'IN').length;
      const outCount = transactions.filter(t => t.type === 'OUT').length;
      const recent = transactions.slice(0, 5);
      
      setStats({
        totalProducts: products.length,
        lowStockCount: lowStock,
        totalRevenue: revenue,
        totalInTransactions: inCount,
        totalOutTransactions: outCount,
        recentTransactions: recent,
      });
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const cards = [
    { title: 'Total Products', value: stats.totalProducts, icon: Package, color: 'text-neon-cyan', bg: 'bg-neon-cyan/10' },
    { title: 'Low Stock Alerts', value: stats.lowStockCount, icon: AlertCircle, color: 'text-neon-red', bg: 'bg-neon-red/10' },
    { title: 'Total Revenue', value: `$${stats.totalRevenue.toFixed(2)}`, icon: DollarSign, color: 'text-neon-green', bg: 'bg-neon-green/10' },
    { title: 'Transactions', value: `${stats.totalInTransactions} IN / ${stats.totalOutTransactions} OUT`, icon: TrendingUp, color: 'text-neon-yellow', bg: 'bg-neon-yellow/10' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neon-cyan"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-mono text-neon-cyan animate-glow">Dashboard</h1>
        <button onClick={loadDashboardData} className="text-neon-cyan hover:text-neon-cyan/80 transition-colors text-sm">
          Refresh
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.title} className="card-glow p-6 hover:shadow-lg hover:shadow-neon-cyan/20 transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${card.bg}`}>
                  <Icon className={`w-6 h-6 ${card.color}`} />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-white">{card.value}</h3>
              <p className="text-gray-400 text-sm mt-2">{card.title}</p>
            </div>
          );
        })}
      </div>
      
      <div className="card-glow p-6">
        <h2 className="text-xl font-bold text-neon-cyan mb-4">Recent Activity</h2>
        {stats.recentTransactions.length === 0 ? (
          <p className="text-gray-400">No recent transactions</p>
        ) : (
          <div className="space-y-2">
            {stats.recentTransactions.map((t: any) => (
              <div key={t.id} className="flex justify-between items-center p-3 bg-dark-100 rounded-lg">
                <div>
                  <p className="font-mono text-sm">Transaction #{t.id}</p>
                  <p className="text-xs text-gray-400">{new Date(t.timestamp).toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <p className={`font-bold ${t.type === 'IN' ? 'text-neon-green' : 'text-neon-yellow'}`}>
                    {t.type === 'IN' ? '+' : '-'}{t.quantity} units
                  </p>
                  <p className="text-sm text-neon-cyan">${t.total_price.toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
