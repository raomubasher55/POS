import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Navigation from './Navigation';
import Header from './Header';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, business } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Sidebar */}
      <Navigation />
      
      {/* Main Content Area */}
      <div className="lg:pl-64">
        {/* Header */}
        <Header user={user} business={business} />
        
        {/* Page Content */}
        <main className="py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;