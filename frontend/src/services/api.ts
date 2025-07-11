import axios from 'axios';
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import type { 
  LoginRequest, 
  RegisterRequest, 
  AuthResponse, 
  RefreshTokenRequest,
  User,
  Business,
  Product,
  ProductFilters,
  CreateProductRequest,
  Sale,
  SaleFilters,
  CreateSaleRequest,
  SalesReport,
  Category,
  Shop,
  Staff,
  PaginatedResponse
} from '../types';

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const API_VERSION = '/api/v1';

class ApiService {
  private client: AxiosInstance;
  private authToken: string | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: `${API_BASE_URL}${API_VERSION}`,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      (config) => {
        if (this.authToken) {
          config.headers.Authorization = `Bearer ${this.authToken}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor to handle common errors
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          // Try to refresh token
          const refreshToken = localStorage.getItem('refreshToken');
          if (refreshToken) {
            try {
              await this.refreshToken({ refreshToken });
              // Retry the original request
              return this.client.request(error.config);
            } catch (refreshError) {
              // Refresh failed, redirect to login
              this.clearAuth();
              window.location.href = '/login';
            }
          } else {
            // No refresh token, redirect to login
            this.clearAuth();
            window.location.href = '/login';
          }
        }
        return Promise.reject(error);
      }
    );

    // Load token from localStorage on initialization
    this.loadAuthFromStorage();
  }

  // Auth Management
  setAuthToken(token: string): void {
    this.authToken = token;
    localStorage.setItem('accessToken', token);
  }

  clearAuth(): void {
    this.authToken = null;
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    localStorage.removeItem('business');
  }

  loadAuthFromStorage(): void {
    const token = localStorage.getItem('accessToken');
    if (token) {
      this.authToken = token;
    }
  }

  // Helper method for API calls
  private async request<T>(config: AxiosRequestConfig): Promise<T> {
    try {
      const response: AxiosResponse<T> = await this.client.request(config);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw error.response.data;
      }
      throw new Error('Network error occurred');
    }
  }

  // Authentication Endpoints
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>({
      method: 'POST',
      url: '/auth/login',
      data: credentials,
    });

    // Store auth data
    this.setAuthToken(response.tokens.accessToken);
    localStorage.setItem('refreshToken', response.tokens.refreshToken);
    localStorage.setItem('user', JSON.stringify(response.user));
    if (response.business) {
      localStorage.setItem('business', JSON.stringify(response.business));
    }

    return response;
  }

  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>({
      method: 'POST',
      url: '/auth/register',
      data,
    });

    // Store auth data
    this.setAuthToken(response.tokens.accessToken);
    localStorage.setItem('refreshToken', response.tokens.refreshToken);
    localStorage.setItem('user', JSON.stringify(response.user));
    if (response.business) {
      localStorage.setItem('business', JSON.stringify(response.business));
    }

    return response;
  }

  async refreshToken(data: RefreshTokenRequest): Promise<{ tokens: { accessToken: string; refreshToken: string } }> {
    const response = await this.request<{ tokens: { accessToken: string; refreshToken: string } }>({
      method: 'POST',
      url: '/auth/refresh',
      data,
    });

    // Update stored tokens
    this.setAuthToken(response.tokens.accessToken);
    localStorage.setItem('refreshToken', response.tokens.refreshToken);

    return response;
  }

  async logout(): Promise<void> {
    try {
      await this.request({
        method: 'POST',
        url: '/auth/logout',
      });
    } finally {
      this.clearAuth();
    }
  }

  async getProfile(): Promise<{ user: User; business?: Business }> {
    return this.request({
      method: 'GET',
      url: '/auth/profile',
    });
  }

  // Product Endpoints
  async getProducts(filters?: ProductFilters): Promise<PaginatedResponse<Product>> {
    return this.request({
      method: 'GET',
      url: '/products',
      params: filters,
    });
  }

  async getProduct(id: string): Promise<Product> {
    return this.request({
      method: 'GET',
      url: `/products/${id}`,
    });
  }

  async createProduct(data: CreateProductRequest): Promise<Product> {
    return this.request({
      method: 'POST',
      url: '/products',
      data,
    });
  }

  async updateProduct(id: string, data: Partial<CreateProductRequest>): Promise<Product> {
    return this.request({
      method: 'PUT',
      url: `/products/${id}`,
      data,
    });
  }

  async deleteProduct(id: string): Promise<void> {
    return this.request({
      method: 'DELETE',
      url: `/products/${id}`,
    });
  }

  // Category Endpoints
  async getCategories(): Promise<Category[]> {
    return this.request({
      method: 'GET',
      url: '/categories',
    });
  }

  async createCategory(data: { name: string; description?: string; parentCategory?: string }): Promise<Category> {
    return this.request({
      method: 'POST',
      url: '/categories',
      data,
    });
  }

  // Sales Endpoints
  async getSales(filters?: SaleFilters): Promise<PaginatedResponse<Sale>> {
    return this.request({
      method: 'GET',
      url: '/sales',
      params: filters,
    });
  }

  async getSale(id: string): Promise<Sale> {
    return this.request({
      method: 'GET',
      url: `/sales/${id}`,
    });
  }

  async createSale(data: CreateSaleRequest): Promise<Sale> {
    return this.request({
      method: 'POST',
      url: '/sales',
      data,
    });
  }

  async refundSale(id: string): Promise<Sale> {
    return this.request({
      method: 'PUT',
      url: `/sales/${id}/refund`,
    });
  }

  async voidSale(id: string): Promise<Sale> {
    return this.request({
      method: 'PUT',
      url: `/sales/${id}/void`,
    });
  }

  // Shop Endpoints
  async getShops(): Promise<Shop[]> {
    return this.request({
      method: 'GET',
      url: '/shops',
    });
  }

  async createShop(data: Omit<Shop, 'id' | 'createdAt' | 'updatedAt'>): Promise<Shop> {
    return this.request({
      method: 'POST',
      url: '/shops',
      data,
    });
  }

  // Staff Endpoints
  async getStaff(): Promise<Staff[]> {
    return this.request({
      method: 'GET',
      url: '/staff',
    });
  }

  async createStaff(data: any): Promise<Staff> {
    return this.request({
      method: 'POST',
      url: '/staff',
      data,
    });
  }

  // Reports Endpoints
  async getSalesReport(params: {
    startDate: string;
    endDate: string;
    shopId?: string;
  }): Promise<SalesReport> {
    return this.request({
      method: 'GET',
      url: '/reports/sales',
      params,
    });
  }

  async getInventoryReport(shopId?: string): Promise<any> {
    return this.request({
      method: 'GET',
      url: '/reports/inventory',
      params: { shopId },
    });
  }

  // Business Endpoints
  async updateBusiness(id: string, data: Partial<Business>): Promise<Business> {
    return this.request({
      method: 'PUT',
      url: `/businesses/${id}`,
      data,
    });
  }

  async getBusinessSettings(id: string): Promise<any> {
    return this.request({
      method: 'GET',
      url: `/businesses/${id}/settings`,
    });
  }

  async updateBusinessSettings(id: string, settings: any): Promise<any> {
    return this.request({
      method: 'PUT',
      url: `/businesses/${id}/settings`,
      data: settings,
    });
  }

  // Health Check
  async healthCheck(): Promise<{ status: string; timestamp: string; environment: string }> {
    return this.request({
      method: 'GET',
      url: '/health',
      baseURL: API_BASE_URL, // Use base URL without version prefix
    });
  }
}

// Create and export singleton instance
export const apiService = new ApiService();
export default apiService;