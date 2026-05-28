import React from 'react';

export const Loader: React.FC = () => {
  return (
    <div className="flex items-center justify-center h-96">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neon-cyan"></div>
    </div>
  );
};
