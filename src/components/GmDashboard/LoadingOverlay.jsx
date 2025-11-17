import React from 'react';

const LoadingOverlay = () => (
  <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-30">
    <div className="bg-white p-4 rounded-lg shadow-lg flex items-center space-x-2">
      <div className="w-6 h-6 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      <span className="text-gray-700">Loading...</span>
    </div>
  </div>
);

export default LoadingOverlay;
