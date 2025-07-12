import axios, { type AxiosResponse, type InternalAxiosRequestConfig } from 'axios';
import { toast } from '@/hooks/use-toast';

export interface ApiResponse<T = any> {
  message?: string;
  data?: T;
  user?: any;
  business?: any;
  tokens?: {
    accessToken: string;
    refreshToken: string;
  };
}

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
  businessAddress: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

class ApiService {
  private baseURL = `http://${window.location.hostname}:5005/api/v1`;
  private api = axios.create({
    baseURL: this.baseURL,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  constructor() {
    console.log('API Service initialized with baseURL:', this.baseURL);
    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const token = localStorage.getItem('accessToken');
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor to handle token refresh
    this.api.interceptors.response.use(
      (response: AxiosResponse) => response,
      async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          const refreshToken = localStorage.getItem('refreshToken');
          if (refreshToken) {
            try {
              const response = await this.refreshToken(refreshToken);
              const { accessToken, refreshToken: newRefreshToken } = response.data.tokens!;
              
              localStorage.setItem('accessToken', accessToken);
              localStorage.setItem('refreshToken', newRefreshToken);
              
              // Retry the original request
              return this.api(originalRequest);
            } catch (refreshError) {
              // Refresh failed, redirect to login
              this.logout();
              window.location.href = '/login';
              return Promise.reject(refreshError);
            }
          } else {
            // No refresh token, redirect to login
            this.logout();
            window.location.href = '/login';
          }
        }

        // Show error toast for other errors
        if (error.response?.data?.message) {
          toast({
            title: 'Error',
            description: error.response.data.message,
            variant: 'destructive',
          });
        }

        return Promise.reject(error);
      }
    );
  }

  // Auth endpoints
  async login(data: LoginRequest): Promise<AxiosResponse<ApiResponse>> {
    const response = await this.api.post('/auth/login', data);
    if (response.data.tokens) {
      localStorage.setItem('accessToken', response.data.tokens.accessToken);
      localStorage.setItem('refreshToken', response.data.tokens.refreshToken);
    }
    return response;
  }

  async register(data: RegisterRequest): Promise<AxiosResponse<ApiResponse>> {
    const response = await this.api.post('/auth/register', data);
    if (response.data.tokens) {
      localStorage.setItem('accessToken', response.data.tokens.accessToken);
      localStorage.setItem('refreshToken', response.data.tokens.refreshToken);
    }
    return response;
  }

  async refreshToken(refreshToken: string): Promise<AxiosResponse<ApiResponse>> {
    return this.api.post('/auth/refresh', { refreshToken });
  }

  async logout(): Promise<void> {
    try {
      await this.api.post('/auth/logout');
    } catch (error) {
      // Continue with logout even if API call fails
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    }
  }

  async getProfile(): Promise<AxiosResponse<ApiResponse>> {
    return this.api.get('/auth/profile');
  }

  // User endpoints
  async getUsers(): Promise<AxiosResponse<ApiResponse>> {
    return this.api.get('/users');
  }

  async getUserProfile(userId: string): Promise<AxiosResponse<ApiResponse>> {
    return this.api.get(`/users/${userId}`);
  }

  async updateUserProfile(userId: string, data: any): Promise<AxiosResponse<ApiResponse>> {
    return this.api.put(`/users/${userId}`, data);
  }

  async deactivateUser(userId: string): Promise<AxiosResponse<ApiResponse>> {
    return this.api.delete(`/users/${userId}`);
  }

  // Product endpoints
  async getProducts(): Promise<AxiosResponse<ApiResponse>> {
    return this.api.get('/products');
  }

  async getProduct(productId: string): Promise<AxiosResponse<ApiResponse>> {
    return this.api.get(`/products/${productId}`);
  }

  async createProduct(data: any): Promise<AxiosResponse<ApiResponse>> {
    return this.api.post('/products', data);
  }

  async updateProduct(productId: string, data: any): Promise<AxiosResponse<ApiResponse>> {
    return this.api.put(`/products/${productId}`, data);
  }

  async deleteProduct(productId: string): Promise<AxiosResponse<ApiResponse>> {
    return this.api.delete(`/products/${productId}`);
  }

  async updateStock(productId: string, quantity: number, operation: 'add' | 'subtract'): Promise<AxiosResponse<ApiResponse>> {
    return this.api.patch(`/products/${productId}/stock`, { quantity, operation });
  }

  async searchProducts(searchTerm: string): Promise<AxiosResponse<ApiResponse>> {
    return this.api.get(`/products/search?q=${encodeURIComponent(searchTerm)}`);
  }

  // Helper methods
  isAuthenticated(): boolean {
    return !!localStorage.getItem('accessToken');
  }

  getToken(): string | null {
    return localStorage.getItem('accessToken');
  }
}

export const apiService = new ApiService();