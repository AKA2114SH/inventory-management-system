import React from 'react';
import { type LucideIcon } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  icon?: LucideIcon;
  loading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md',
  icon: Icon, 
  loading, 
  className = '', 
  ...props 
}) => {
  const variants = {
    primary: 'bg-neon-cyan/20 hover:bg-neon-cyan/30 text-neon-cyan border-neon-cyan',
    secondary: 'bg-dark-100 hover:bg-dark-200 text-gray-300 border-gray-600',
    danger: 'bg-neon-red/20 hover:bg-neon-red/30 text-neon-red border-neon-red',
    success: 'bg-neon-green/20 hover:bg-neon-green/30 text-neon-green border-neon-green',
  };

  const sizes = {
    sm: 'px-3 py-1 text-sm',
    md: 'px-6 py-2',
    lg: 'px-8 py-3 text-lg',
  };

  return (
    <button
      className={`flex items-center justify-center gap-2 rounded-lg border transition-all disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? (
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
      ) : (
        Icon && <Icon className="w-4 h-4" />
      )}
      {children}
    </button>
  );
};
