import React from 'react';

const ErrorAlert = ({ message }) => {
  if (!message) return null;
  return (
    <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg shadow">
      {message}
    </div>
  );
};

export default ErrorAlert;
