import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  };

  return (
    <div className={`min-h-screen flex items-center justify-center bg-gray-50 ${className}`}>
      <div className="text-center">
        <div 
          className={`animate-spin rounded-full border-b-2 border-blue-600 ${sizeClasses[size]}`}
        />
        <p className="mt-4 text-gray-600">Loading...</p>
      </div>
    </div>
  );
};

export { LoadingSpinner };
export default LoadingSpinner;