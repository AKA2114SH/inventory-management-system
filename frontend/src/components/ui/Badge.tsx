import React from 'react';

interface BadgeProps {
  status: 'success' | 'warning' | 'danger' | 'info';
  children: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({ status, children }) => {
  const variants = {
    success: 'bg-neon-green/20 text-neon-green border-neon-green/50',
    warning: 'bg-neon-yellow/20 text-neon-yellow border-neon-yellow/50',
    danger: 'bg-neon-red/20 text-neon-red border-neon-red/50',
    info: 'bg-neon-cyan/20 text-neon-cyan border-neon-cyan/50',
  };

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-mono border ${variants[status]}`}>
      {children}
    </span>
  );
};
