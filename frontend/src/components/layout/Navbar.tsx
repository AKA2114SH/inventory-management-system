import React from 'react';
import { User, Bell } from 'lucide-react';
import { authService } from '../../services/authService';

export const Navbar: React.FC = () => {
  const user = authService.getCurrentUser();

  return (
    <nav className="bg-dark-200/50 backdrop-blur-sm border-b border-neon-cyan/30 px-6 py-4">
      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-400">
          Welcome back, <span className="text-neon-cyan">{user?.username || 'User'}</span>
        </div>
        <div className="flex items-center gap-4">
          <Bell className="w-5 h-5 text-gray-400 hover:text-neon-cyan cursor-pointer transition-all" />
          <User className="w-5 h-5 text-gray-400 hover:text-neon-cyan cursor-pointer transition-all" />
        </div>
      </div>
    </nav>
  );
};
