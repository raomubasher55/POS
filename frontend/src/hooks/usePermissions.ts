import { useAuth } from '@/contexts/auth-context';
import { PERMISSIONS, ROLE_PERMISSIONS, type Permission, type UserRole } from '@/constants/permissions';

export function usePermissions() {
  const { user } = useAuth();

  const hasPermission = (permission: Permission): boolean => {
    if (!user) return false;

    // Get role-based permissions
    const rolePermissions = ROLE_PERMISSIONS[user.role as UserRole] || [];
    
    // Check if user has the permission from their role
    const hasRolePermission = rolePermissions.includes(permission);
    
    // Also check user's explicit permissions array if it exists
    const hasExplicitPermission = user.permissions?.includes(permission) || false;
    
    return hasRolePermission || hasExplicitPermission;
  };

  const hasAnyPermission = (permissions: Permission[]): boolean => {
    return permissions.some(permission => hasPermission(permission));
  };

  const hasAllPermissions = (permissions: Permission[]): boolean => {
    return permissions.every(permission => hasPermission(permission));
  };

  const canAccess = (feature: keyof typeof FEATURE_PERMISSIONS): boolean => {
    const requiredPermissions = FEATURE_PERMISSIONS[feature];
    return hasAnyPermission(requiredPermissions);
  };

  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    canAccess,
    userRole: user?.role as UserRole,
    userPermissions: user?.permissions || [],
  };
}

// Define what permissions are needed for each major feature
const FEATURE_PERMISSIONS = {
  dashboard: [PERMISSIONS.DASHBOARD_VIEW] as Permission[],
  sales: [PERMISSIONS.SALES_VIEW, PERMISSIONS.SALES_CREATE] as Permission[],
  products: [PERMISSIONS.PRODUCTS_VIEW] as Permission[],
  categories: [PERMISSIONS.CATEGORIES_VIEW] as Permission[],
  customers: [PERMISSIONS.CUSTOMERS_VIEW] as Permission[],
  inventory: [PERMISSIONS.INVENTORY_VIEW] as Permission[],
  suppliers: [PERMISSIONS.SUPPLIERS_VIEW] as Permission[],
  purchase_orders: [PERMISSIONS.PURCHASE_ORDERS_VIEW] as Permission[],
  credit_sales: [PERMISSIONS.CREDIT_SALES_VIEW] as Permission[],
  reports: [PERMISSIONS.REPORTS_VIEW] as Permission[],
  settings: [PERMISSIONS.SETTINGS_VIEW] as Permission[],
};