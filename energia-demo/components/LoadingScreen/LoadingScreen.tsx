import React from 'react';

const LoadingScreen: React.FC = () => {
  return (
    <div className="flex justify-center items-center h-screen flex-col font-sans">
      <h1 className="text-3xl font-bold mb-2">ÉnergIA</h1>
      <p className="text-gray-600 mb-6">Chargement en cours...</p>
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );
};

export default LoadingScreen;