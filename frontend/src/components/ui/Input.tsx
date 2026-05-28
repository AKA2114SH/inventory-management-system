import React from 'react';
import { type LucideIcon } from 'lucide-react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: LucideIcon;
  error?: string;
}

export const Input: React.FC<InputProps> = ({ label, icon: Icon, error, className = '', value, onChange, type = 'text', ...props }) => {
  // Handle number inputs to prevent NaN
  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onChange) {
      const val = e.target.value;
      if (type === 'number') {
        if (val === '' || val === '-') {
          onChange(e);
          return;
        }
        const num = parseFloat(val);
        if (!isNaN(num)) {
          onChange(e);
        }
      } else {
        onChange(e);
      }
    }
  };

  // Ensure value is not NaN for number inputs
  const inputValue = type === 'number' && (value === undefined || isNaN(Number(value))) ? '' : value;

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-mono text-gray-300">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neon-cyan" />
        )}
        <input
          type={type}
          className={`w-full bg-dark-100 border ${error ? 'border-neon-red' : 'border-neon-cyan/30'} rounded-lg px-4 py-2 focus:outline-none focus:border-neon-cyan focus:shadow-lg focus:shadow-neon-cyan/20 transition-all text-gray-200 ${Icon ? 'pl-10' : ''} ${className}`}
          value={inputValue}
          onChange={handleNumberChange}
          {...props}
        />
      </div>
      {error && (
        <p className="text-xs text-neon-red">{error}</p>
      )}
    </div>
  );
};
