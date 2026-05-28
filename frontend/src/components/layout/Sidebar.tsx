import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Package, Tags, Receipt, ShoppingCart, LogOut, User, FileText } from 'lucide-react';
import { authService } from '../../services/authService';

const menuItems = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/products', icon: Package, label: 'Products' },
  { path: '/categories', icon: Tags, label: 'Categories' },
  { path: '/transactions', icon: Receipt, label: 'Transactions' },
  { path: '/billing', icon: ShoppingCart, label: 'Billing' },
  { path: '/invoices', icon: FileText, label: 'Invoices' },
  { path: '/profile', icon: User, label: 'Profile' },
];

export const Sidebar: React.FC = () => {
  const location = useLocation();

  const handleLogout = () => {
    if (confirm('Are you sure you want to logout?')) {
      authService.logout();
    }
  };

  return (
    <div className="w-64 bg-dark-200 border-r border-neon-cyan/30 flex flex-col">
      <div className="p-6 border-b border-neon-cyan/30">
        <h1 className="text-2xl font-bold text-neon-cyan animate-glow">Inventory</h1>
        <p className="text-xs text-gray-400 mt-1">Management System</p>
      </div>
      
      <nav className="flex-1 py-6">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-6 py-3 transition-all ${
                isActive
                  ? 'bg-neon-cyan/10 text-neon-cyan border-r-2 border-neon-cyan'
                  : 'text-gray-400 hover:text-neon-cyan hover:bg-dark-100'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
      
      <div className="p-6 border-t border-neon-cyan/30">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 text-gray-400 hover:text-neon-red transition-all w-full"
        >
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};
