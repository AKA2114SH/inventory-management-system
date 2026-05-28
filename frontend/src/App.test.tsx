import React from 'react';

function App() {
  return (
    <div className="min-h-screen bg-dark-300 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-neon-cyan animate-glow">
          Inventory Management System
        </h1>
        <p className="text-gray-400 mt-4">Frontend is working!</p>
        <p className="text-gray-500 text-sm mt-2">
        Backend API: {import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'}
        </p>
      </div>
    </div>
  );
}

export default App;
