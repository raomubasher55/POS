// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  errors?: ValidationError[];
}

export interface ValidationError {
  field: string;
  message: string;
}

// User Types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName?: string;
  role: 'business_owner' | 'staff' | 'admin';
  permissions: string[];
  lastLogin?: Date;
  businessId?: string;
}

// Business Types
export interface Business {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: Address;
  subscriptionStatus: 'active' | 'inactive' | 'suspended' | 'trial';
  subscriptionPlan: 'basic' | 'premium' | 'enterprise';
  subscriptionExpiry: Date;
  settings: BusinessSettings;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface BusinessSettings {
  currency: string;
  timezone: string;
  receiptTemplate: string;
  taxRate: number;
}

// Authentication Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  businessName: string;
  businessEmail: string;
  businessPhone: string;
  businessAddress: Address;
}

export interface AuthResponse {
  message: string;
  user: User;
  business?: Business;
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

// Product Types
export interface Product {
  id: string;
  name: string;
  description?: string;
  sku: string;
  barcode?: string;
  businessId: string;
  categoryId: string;
  category?: Category;
  pricing: ProductPricing;
  inventory: ProductInventory[];
  images: string[];
  isActive: boolean;
  totalInventory?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductPricing {
  retailPrice: number;
  wholesalePrice?: number;
  cost?: number;
}

export interface ProductInventory {
  shopId: string;
  quantity: number;
  minStock: number;
  maxStock?: number;
}

export interface CreateProductRequest {
  name: string;
  description?: string;
  sku: string;
  barcode?: string;
  categoryId: string;
  pricing: ProductPricing;
  inventory: ProductInventory[];
}

// Category Types
export interface Category {
  id: string;
  name: string;
  description?: string;
  businessId: string;
  shopId?: string;
  parentCategory?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Shop Types
export interface Shop {
  id: string;
  name: string;
  businessId: string;
  address: Address;
  phone: string;
  manager?: string;
  settings: ShopSettings;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ShopSettings {
  openingTime: string;
  closingTime: string;
  workingDays: string[];
}

// Sale Types
export interface Sale {
  id: string;
  saleNumber: string;
  businessId: string;
  shopId: string;
  cashier: string;
  customer?: SaleCustomer;
  items: SaleItem[];
  totals: SaleTotals;
  payment: SalePayment;
  status: 'completed' | 'refunded' | 'voided' | 'partial_refund';
  receiptPrinted: boolean;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SaleCustomer {
  name?: string;
  phone?: string;
  email?: string;
}

export interface SaleItem {
  productId: string;
  name: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface SaleTotals {
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
}

export interface SalePayment {
  method: 'cash' | 'card' | 'credit' | 'mobile';
  status: 'paid' | 'pending' | 'partial';
  paidAmount: number;
  changeAmount: number;
}

export interface CreateSaleRequest {
  shopId: string;
  customer?: SaleCustomer;
  items: Omit<SaleItem, 'totalPrice'>[];
  payment: Omit<SalePayment, 'changeAmount'>;
}

// Staff Types
export interface Staff {
  id: string;
  userId: string;
  user?: User;
  businessId: string;
  shopId?: string;
  position: string;
  permissions: string[];
  salary?: number;
  commissionRate?: number;
  hireDate: Date;
  terminationDate?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Report Types
export interface SalesReport {
  dateRange: {
    start: Date;
    end: Date;
  };
  summary: {
    totalRevenue: number;
    totalTransactions: number;
    averageTransactionValue: number;
    totalCustomers: number;
  };
  dailyData: Array<{
    date: string;
    totalRevenue: number;
    totalTransactions: number;
    avgTransactionValue: number;
  }>;
  topProducts: Array<{
    productId: string;
    productName: string;
    quantity: number;
    revenue: number;
  }>;
}

// Query Parameters
export interface PaginationParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface ProductFilters extends PaginationParams {
  search?: string;
  category?: string;
  isActive?: boolean;
  shopId?: string;
}

export interface SaleFilters extends PaginationParams {
  shopId?: string;
  cashier?: string;
  startDate?: string;
  endDate?: string;
  status?: string;
}

// Pagination Response
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Form Types
export interface FormFieldError {
  type: string;
  message: string;
}

export interface FormErrors {
  [key: string]: FormFieldError;
}

// UI State Types
export interface LoadingState {
  [key: string]: boolean;
}

export interface ErrorState {
  [key: string]: string | null;
}

// Navigation Types
export interface NavItem {
  name: string;
  href: string;
  icon?: React.ComponentType<{ className?: string }>;
  children?: NavItem[];
  permission?: string;
}

// Theme Types
export interface ThemeConfig {
  mode: 'light' | 'dark';
  primaryColor: string;
  secondaryColor: string;
}

// Settings Types
export interface UserSettings {
  theme: ThemeConfig;
  language: string;
  timezone: string;
  currency: string;
  notifications: NotificationSettings;
}

export interface NotificationSettings {
  email: boolean;
  push: boolean;
  lowStock: boolean;
  dailyReports: boolean;
}