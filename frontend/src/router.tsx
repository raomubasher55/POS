import { createBrowserRouter, Navigate } from 'react-router-dom';
import { LoginForm } from '@/components/forms/login-form';
import { RegisterForm } from '@/components/forms/register-form';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { DashboardPage } from '@/pages/dashboard/dashboard-page';
import { ProductsPage } from '@/pages/products/products-page';
import { SalesPage } from '@/pages/sales/sales-page';
import { ReportsPage } from '@/pages/reports/reports-page';
import { SettingsPage } from '@/pages/settings/settings-page';
import { InventoryPage } from '@/pages/inventory/inventory-page';
import { SuppliersPage } from '@/pages/suppliers/suppliers-page';
import { PurchaseOrdersPage } from '@/pages/purchase-orders/purchase-orders-page';
import { CreditSalesPage } from '@/pages/credit-sales/credit-sales-page';
import { CategoriesPage } from '@/pages/categories/categories-page';
import { CustomersPage } from '@/pages/customers/customers-page';
import { MFASettingsPage } from '@/pages/settings/mfa-settings';
import { ProtectedRoute } from '@/components/auth/protected-route';


export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/dashboard" replace />,
  },
  {
    path: '/login',
    element: <LoginForm />,
  },
  {
    path: '/register',
    element: <RegisterForm />,
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        path: 'dashboard',
        element: <DashboardPage />,
      },
      {
        path: 'products',
        element: <ProductsPage />,
      },
      {
        path: 'categories',
        element: <CategoriesPage />,
      },
      {
        path: 'customers',
        element: <CustomersPage />,
      },
      {
        path: 'sales',
        element: <SalesPage />,
      },
      {
        path: 'reports',
        element: <ReportsPage />,
      },
      {
        path: 'inventory',
        element: <InventoryPage />,
      },
      {
        path: 'suppliers',
        element: <SuppliersPage />,
      },
      {
        path: 'purchase-orders',
        element: <PurchaseOrdersPage />,
      },
      {
        path: 'credit-sales',
        element: <CreditSalesPage />,
      },
      {
        path: 'settings',
        element: <SettingsPage />,
      },
      {
        path: 'settings/mfa',
        element: <MFASettingsPage />,
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/dashboard" replace />,
  },
]);