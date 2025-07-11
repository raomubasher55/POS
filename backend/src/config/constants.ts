export const ROLES = {
  ADMIN: 'admin',
  BUSINESS_OWNER: 'business_owner',
  STAFF: 'staff'
} as const;

export const PLANS = {
  BASIC: 'basic',
  PREMIUM: 'premium',
  ENTERPRISE: 'enterprise'
} as const;

export const SUBSCRIPTION_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  SUSPENDED: 'suspended',
  TRIAL: 'trial',
  CANCELLED: 'cancelled',
  PAST_DUE: 'past_due'
} as const;

export const PAYMENT_METHODS = {
  CASH: 'cash',
  CARD: 'card',
  CREDIT: 'credit',
  MOBILE: 'mobile'
} as const;

export const SALE_STATUS = {
  COMPLETED: 'completed',
  REFUNDED: 'refunded',
  VOIDED: 'voided',
  PARTIAL_REFUND: 'partial_refund'
} as const;

export const EXPENSE_CATEGORIES = {
  RENT: 'rent',
  UTILITIES: 'utilities',
  SALARIES: 'salaries',
  SUPPLIES: 'supplies',
  MAINTENANCE: 'maintenance',
  MARKETING: 'marketing',
  TRANSPORTATION: 'transportation',
  INSURANCE: 'insurance',
  TAXES: 'taxes',
  OTHER: 'other'
} as const;

export const PERMISSIONS = {
  SALES: 'sales',
  REFUNDS: 'refunds',
  INVENTORY_VIEW: 'inventory_view',
  INVENTORY_EDIT: 'inventory_edit',
  REPORTS_VIEW: 'reports_view',
  REPORTS_FULL: 'reports_full',
  STAFF_VIEW: 'staff_view',
  STAFF_MANAGE: 'staff_manage',
  SETTINGS_VIEW: 'settings_view',
  SETTINGS_EDIT: 'settings_edit'
} as const;

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100
} as const;

export const UPLOAD = {
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'application/pdf']
} as const;

export const TRIAL_DAYS = 30;

export const TAX = {
  MIN_RATE: 0,
  MAX_RATE: 100
} as const;