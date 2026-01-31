import axios from 'axios';
import type { AxiosInstance, AxiosResponse } from 'axios';
import type { 
  LoginRequest, 
  User, 
  UserRegistrationRequest, 
  UserProfile, 
  UserProfileRequest,
  UserRequest,
  TokenRefresh,
  PaginatedUserList,
  PaginatedRoleList
} from '../types';

const API_BASE_URL = 'http://localhost:8000/api';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('access_token');
        if (token) {
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
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const refreshToken = localStorage.getItem('refresh_token');
            if (refreshToken) {
              const response = await this.refreshToken(refreshToken);
              const { access, refresh } = response.data;
              
              localStorage.setItem('access_token', access);
              if (refresh) {
                localStorage.setItem('refresh_token', refresh);
              }

              // Retry the original request
              originalRequest.headers.Authorization = `Bearer ${access}`;
              return this.api(originalRequest);
            }
          } catch (refreshError) {
            // Refresh failed, redirect to login
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            window.location.href = '/login';
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  // Authentication endpoints
  async login(credentials: LoginRequest): Promise<AxiosResponse<User>> {
    const response = await this.api.post<User>('/auth/login/', credentials);
    // Note: The actual tokens should be in the response body
    // You may need to adjust this based on your actual API response
    if (response.data) {
      // Assuming tokens are included in the response or set in cookies
      // If tokens are returned separately, adjust accordingly
      const tokens = (response.data as { tokens?: { access?: unknown; refresh?: unknown } }).tokens || response.data as { access?: unknown; refresh?: unknown };
      if (tokens?.access) {
        localStorage.setItem('access_token', tokens.access as string);
      }
      if (tokens?.refresh) {
        localStorage.setItem('refresh_token', tokens.refresh as string);
      }
    }
    return response;
  }

  async register(userData: UserRegistrationRequest): Promise<AxiosResponse<User>> {
    return this.api.post<User>('/auth/register/', userData);
  }

  async logout(): Promise<AxiosResponse<void>> {
    const response = await this.api.post<void>('/auth/logout/');
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    return response;
  }

  async refreshToken(refreshToken: string): Promise<AxiosResponse<TokenRefresh>> {
    return this.api.post<TokenRefresh>('/auth/token/refresh/', { refresh: refreshToken });
  }

  async getCurrentUser(): Promise<AxiosResponse<User>> {
    return this.api.get<User>('/auth/me/');
  }

  async getUserDetails(): Promise<AxiosResponse<User>> {
    return this.api.get<User>('/auth/user/');
  }

  async updateUser(userData: UserRequest): Promise<AxiosResponse<User>> {
    return this.api.patch<User>('/auth/user/', userData);
  }

  async changePassword(oldPassword: string, newPassword: string): Promise<AxiosResponse<void>> {
    return this.api.post<void>('/auth/change-password/', {
      old_password: oldPassword,
      new_password: newPassword,
    });
  }

  // Profile endpoints
  async getProfile(): Promise<AxiosResponse<UserProfile>> {
    return this.api.get<UserProfile>('/auth/profile/');
  }

  async updateProfile(profileData: UserProfileRequest): Promise<AxiosResponse<UserProfile>> {
    const formData = new FormData();
    
    Object.entries(profileData).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (key === 'avatar' && value instanceof File) {
          formData.append(key, value);
        } else if (key === 'role_ids' && Array.isArray(value)) {
          value.forEach((roleId, index) => {
            formData.append(`${key}[${index}]`, roleId.toString());
          });
        } else if (typeof value === 'boolean') {
          formData.append(key, value.toString());
        } else {
          formData.append(key, value);
        }
      }
    });

    return this.api.patch<UserProfile>('/auth/profile/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  // Admin/Management endpoints
  async getUsers(page = 1): Promise<AxiosResponse<PaginatedUserList>> {
    return this.api.get<PaginatedUserList>('/auth/users/', {
      params: { page },
    });
  }

  async getRoles(page = 1): Promise<AxiosResponse<PaginatedRoleList>> {
    return this.api.get<PaginatedRoleList>('/auth/roles/', {
      params: { page },
    });
  }
}

export const apiService = new ApiService();
export default apiService;