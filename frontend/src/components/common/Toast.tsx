import React from 'react';

export const Toast: React.FC<{ message: string; type?: 'success' | 'error' | 'info' }> = ({ 
  message, 
  type = 'info' 
}) => {
  const colors = {
    success: 'bg-neon-green/20 text-neon-green border-neon-green',
    error: 'bg-neon-red/20 text-neon-red border-neon-red',
    info: 'bg-neon-cyan/20 text-neon-cyan border-neon-cyan',
  };

  return (
    <div className={`fixed bottom-4 right-4 p-4 rounded-lg border ${colors[type]} z-50`}>
      {message}
    </div>
  );
};
