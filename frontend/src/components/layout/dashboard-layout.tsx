import { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/auth-context';
import { usePermissions } from '@/hooks/usePermissions';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { PERMISSIONS } from '@/constants/permissions';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  BarChart3,
  Settings,
  Menu,
  X,
  LogOut,
  User,
  ClipboardList,
  Building2,
  FileText,
  CreditCard,
  Users,
  Tag,
} from 'lucide-react';

const allNavigationItems = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    permission: PERMISSIONS.DASHBOARD_VIEW,
  },
  {
    name: 'Sales',
    href: '/sales',
    icon: ShoppingCart,
    permission: PERMISSIONS.SALES_VIEW,
  },
  {
    name: 'Products',
    href: '/products',
    icon: Package,
    permission: PERMISSIONS.PRODUCTS_VIEW,
  },
  {
    name: 'Categories',
    href: '/categories',
    icon: Tag,
    permission: PERMISSIONS.CATEGORIES_VIEW,
  },
  {
    name: 'Customers',
    href: '/customers',
    icon: Users,
    permission: PERMISSIONS.CUSTOMERS_VIEW,
  },
  {
    name: 'Inventory',
    href: '/inventory',
    icon: ClipboardList,
    permission: PERMISSIONS.INVENTORY_VIEW,
  },
  {
    name: 'Suppliers',
    href: '/suppliers',
    icon: Building2,
    permission: PERMISSIONS.SUPPLIERS_VIEW,
  },
  {
    name: 'Purchase Orders',
    href: '/purchase-orders',
    icon: FileText,
    permission: PERMISSIONS.PURCHASE_ORDERS_VIEW,
  },
  {
    name: 'Credit Sales',
    href: '/credit-sales',
    icon: CreditCard,
    permission: PERMISSIONS.CREDIT_SALES_VIEW,
  },
  {
    name: 'Reports',
    href: '/reports',
    icon: BarChart3,
    permission: PERMISSIONS.REPORTS_VIEW,
  },
  {
    name: 'Settings',
    href: '/settings',
    icon: Settings,
    permission: PERMISSIONS.SETTINGS_VIEW,
  },
];

export function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, business, logout } = useAuth();
  const { hasPermission } = usePermissions();
  const location = useLocation();

  // Filter navigation items based on user permissions
  const navigation = allNavigationItems.filter(item => 
    hasPermission(item.permission)
  );

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      <div
        className={cn(
          'fixed inset-0 z-50 lg:hidden',
          sidebarOpen ? 'block' : 'hidden'
        )}
      >
        <div className="fixed inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
        <div className="fixed left-0 top-0 h-full w-64 bg-white shadow-lg">
          <div className="flex items-center justify-between p-4 border-b border-gray-100">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">POS</span>
              </div>
              <span className="font-semibold text-lg">POS System</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          <nav className="p-4 space-y-2">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    'flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary-500 text-white shadow-md'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow bg-white shadow-xl">
          <div className="flex items-center space-x-2 p-4 border-b border-gray-100">
            <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">POS</span>
            </div>
            <span className="font-semibold text-lg">POS System</span>
          </div>
          <nav className="flex-1 p-4 space-y-2">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    'flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary-500 text-white shadow-md'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <div className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">
                  {navigation.find(item => item.href === location.pathname)?.name || 'Dashboard'}
                </h1>
                {business && (
                  <p className="text-sm text-gray-500">{business.name}</p>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="hidden sm:flex items-center space-x-2 text-sm">
                <User className="h-4 w-4" />
                <span>{user?.firstName} {user?.lastName}</span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                title="Logout"
              >
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}