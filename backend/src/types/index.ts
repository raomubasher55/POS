import { Document, Types } from 'mongoose';
import { Request } from 'express';

// User Types
export interface IUser extends Document {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'business_owner' | 'staff' | 'admin';
  businessId?: Types.ObjectId;
  permissions: string[];
  isActive: boolean;
  lastLogin?: Date;
  refreshToken?: string;
  fullName: string;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

// Business Types
export interface IBusiness extends Document {
  name: string;
  email: string;
  phone: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  owner: Types.ObjectId;
  subscriptionStatus: 'active' | 'inactive' | 'suspended' | 'trial';
  subscriptionPlan: 'basic' | 'premium' | 'enterprise';
  subscriptionExpiry: Date;
  settings: {
    currency: string;
    timezone: string;
    receiptTemplate: string;
    taxRate: number;
  };
  isActive: boolean;
  isSubscriptionActive: boolean;
}

// Product Types
export interface IProduct extends Document {
  name: string;
  description?: string;
  sku: string;
  barcode?: string;
  businessId: Types.ObjectId;
  categoryId: Types.ObjectId;
  pricing: {
    retailPrice: number;
    wholesalePrice?: number;
    cost?: number;
  };
  inventory: Array<{
    shopId: Types.ObjectId;
    quantity: number;
    minStock: number;
    maxStock?: number;
  }>;
  images: string[];
  isActive: boolean;
  totalInventory: number;
  getShopInventory(shopId: Types.ObjectId): any;
  updateShopInventory(shopId: Types.ObjectId, quantity: number): void;
}

// Shop Types
export interface IShop extends Document {
  name: string;
  businessId: Types.ObjectId;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  phone: string;
  manager?: Types.ObjectId;
  settings: {
    openingTime: string;
    closingTime: string;
    workingDays: string[];
  };
  isActive: boolean;
  fullAddress: string;
  isOpen(): boolean;
}

// Category Types
export interface ICategory extends Document {
  name: string;
  description?: string;
  businessId: Types.ObjectId;
  shopId?: Types.ObjectId;
  parentCategory?: Types.ObjectId;
  isActive: boolean;
  getCategoryPath(): Promise<string>;
}

// Sale Types
export interface ISale extends Document {
  saleNumber: string;
  businessId: Types.ObjectId;
  shopId: Types.ObjectId;
  cashier: Types.ObjectId;
  customer?: {
    name?: string;
    phone?: string;
    email?: string;
  };
  items: Array<{
    productId: Types.ObjectId;
    name: string;
    sku: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }>;
  totals: {
    subtotal: number;
    tax: number;
    discount: number;
    total: number;
  };
  payment: {
    method: 'cash' | 'card' | 'credit' | 'mobile';
    status: 'paid' | 'pending' | 'partial';
    paidAmount: number;
    changeAmount: number;
  };
  status: 'completed' | 'refunded' | 'voided' | 'partial_refund';
  receiptPrinted: boolean;
  notes?: string;
  formattedDate: string;
  calculateProfit(): Promise<number>;
}

// Staff Types
export interface IStaff extends Document {
  userId: Types.ObjectId;
  businessId: Types.ObjectId;
  shopId?: Types.ObjectId;
  position: string;
  permissions: string[];
  salary?: number;
  commissionRate?: number;
  hireDate: Date;
  terminationDate?: Date;
  isActive: boolean;
  workSchedule: Record<string, { start?: string; end?: string }>;
  emergencyContact?: {
    name?: string;
    phone?: string;
    relationship?: string;
  };
  employmentDuration: { years: number; months: number; days: number };
  calculateCommission(startDate: Date, endDate: Date): Promise<number>;
  getPerformanceMetrics(startDate: Date, endDate: Date): Promise<any>;
}

// Subscription Types
export interface ISubscription extends Document {
  businessId: Types.ObjectId;
  plan: 'basic' | 'premium' | 'enterprise';
  status: 'active' | 'cancelled' | 'past_due' | 'trialing' | 'paused';
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  pricing: {
    amount: number;
    currency: string;
    interval: 'monthly' | 'yearly';
  };
  stripeSubscriptionId?: string;
  stripeCustomerId?: string;
  features: {
    maxShops: number;
    maxProducts: number;
    maxStaff: number;
    hasAdvancedReports: boolean;
    hasApiAccess: boolean;
    hasMultiCurrency: boolean;
    hasPrioritySupport: boolean;
  };
  paymentHistory: Array<{
    amount: number;
    currency: string;
    status: 'succeeded' | 'failed' | 'pending' | 'refunded';
    paidAt: Date;
    stripePaymentId?: string;
    invoiceUrl?: string;
    failureReason?: string;
  }>;
  trialEndDate?: Date;
  cancelledAt?: Date;
  pausedAt?: Date;
  metadata?: Map<string, string>;
  isActive: boolean;
  isInTrial: boolean;
  daysUntilRenewal(): number | null;
  getUsage(): Promise<any>;
}

// Express Request with authenticated user
export interface AuthenticatedRequest extends Request {
  user?: IUser;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// Pagination Types
export interface PaginationOptions {
  page: number;
  limit: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

// Query Filters
export interface ProductFilters {
  search?: string;
  category?: string;
  isActive?: boolean;
  shopId?: string;
}

export interface SaleFilters {
  shopId?: string;
  cashier?: string;
  startDate?: Date;
  endDate?: Date;
  status?: string;
}

// JWT Payload
export interface JwtPayload {
  userId: string;
  iat?: number;
  exp?: number;
}