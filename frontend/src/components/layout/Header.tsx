import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import type { User, Business } from '../../types';

interface HeaderProps {
  user: User | null;
  business: Business | null;
}

const Header: React.FC<HeaderProps> = ({ user, business }) => {
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Business Info */}
          <div className="flex-1">
            {business && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  {business.name}
                </h2>
                <p className="text-sm text-gray-500">
                  Plan: {business.subscriptionPlan} • Status: {business.subscriptionStatus}
                </p>
              </div>
            )}
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {user && (
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    {user.firstName} {user.lastName}
                  </p>
                  <p className="text-xs text-gray-500">
                    {user.role.replace('_', ' ')}
                  </p>
                </div>
                
                <div className="relative">
                  <button
                    onClick={handleLogout}
                    className="bg-red-600 text-white px-3 py-1 rounded-md text-sm hover:bg-red-700 transition-colors"
                  >
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;