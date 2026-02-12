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
    PaginatedRoleList,
    Routine,
    RoutineRequest,
    PatchedRoutineRequest,
    Task,
    TaskRequest,
    PatchedTaskRequest,
    TaskCompleteRequest,
    TaskCompletion,
    PaginatedTaskCompletionListList,
    TodayTasksResponse,
    SocialAccount
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
      const tokens = response.data as { access?: string; refresh?: string; tokens?: { access?: string; refresh?: string } };
      if (tokens?.access) {
        localStorage.setItem('access_token', tokens.access);
      }
      if (tokens?.refresh) {
        localStorage.setItem('refresh_token', tokens.refresh);
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

  // Google OAuth endpoints
  async getGoogleAuthUrl(): Promise<AxiosResponse<{ authorization_url: string }>> {
    return this.api.get<{ authorization_url: string }>('/auth/google/');
  }

  async handleGoogleCallback(code: string): Promise<AxiosResponse<User>> {
    const response = await this.api.post<User>('/auth/google/callback/', { 
      code: code 
    });
    
    // Store tokens if returned
    if (response.data) {
      const responseData = response.data as { access?: string; refresh?: string; tokens?: { access?: string; refresh?: string } };
      const tokens = responseData.access && responseData.refresh ? responseData : responseData.tokens || {};
      
      if (tokens.access) {
        localStorage.setItem('access_token', tokens.access);
      }
      if (tokens.refresh) {
        localStorage.setItem('refresh_token', tokens.refresh);
      }
    }
    
    return response;
  }

  // New method to handle OAuth2 authorization code flow
  async exchangeCodeForTokens(code: string): Promise<AxiosResponse<{access: string, refresh: string, user: User}>> {
    return this.api.post<{access: string, refresh: string, user: User}>('/auth/google/callback/', { 
      code: code 
    });
  }

  async getSocialAccounts(): Promise<AxiosResponse<{ social_accounts: SocialAccount[] }>> {
    return this.api.get<{ social_accounts: SocialAccount[] }>('/auth/social-accounts/');
  }

  async unlinkSocialAccount(accountId: number): Promise<AxiosResponse<{ message: string }>> {
    return this.api.delete<{ message: string }>(`/auth/social-accounts/${accountId}/unlink/`);
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

  // Routine endpoints
  async getTodayTasks(date?: string): Promise<AxiosResponse<TodayTasksResponse>> {
    return this.api.get<TodayTasksResponse>('/routines/today/', {
      params: date ? { date } : {},
    });
  }

  async getRoutines(): Promise<AxiosResponse<Routine[]>> {
    return this.api.get<Routine[]>('/routines/routines/');
  }

  async createRoutine(routineData: RoutineRequest): Promise<AxiosResponse<Routine>> {
    return this.api.post<Routine>('/routines/routines/', routineData);
  }

  async getRoutine(id: number): Promise<AxiosResponse<Routine>> {
    return this.api.get<Routine>(`/routines/routines/${id}/`);
  }

  async updateRoutine(id: number, routineData: PatchedRoutineRequest): Promise<AxiosResponse<Routine>> {
    return this.api.patch<Routine>(`/routines/routines/${id}/`, routineData);
  }

  async deleteRoutine(id: number): Promise<AxiosResponse<void>> {
    return this.api.delete<void>(`/routines/routines/${id}/`);
  }

  // Task endpoints
  async getTasks(routineId: number): Promise<AxiosResponse<Task[]>> {
    return this.api.get<Task[]>(`/routines/routines/${routineId}/tasks/`);
  }

  async createTask(routineId: number, taskData: TaskRequest): Promise<AxiosResponse<Task>> {
    return this.api.post<Task>(`/routines/routines/${routineId}/tasks/`, taskData);
  }

  async getTask(id: number): Promise<AxiosResponse<Task>> {
    return this.api.get<Task>(`/routines/tasks/${id}/`);
  }

  async updateTask(id: number, taskData: PatchedTaskRequest): Promise<AxiosResponse<Task>> {
    return this.api.patch<Task>(`/routines/tasks/${id}/`, taskData);
  }

  async deleteTask(id: number): Promise<AxiosResponse<void>> {
    return this.api.delete<void>(`/routines/tasks/${id}/`);
  }

  async completeTask(taskId: number, completionData?: TaskCompleteRequest): Promise<AxiosResponse<TaskCompletion>> {
    return this.api.post<TaskCompletion>(`/routines/tasks/${taskId}/complete/`, completionData || {});
  }

  async uncompleteTask(taskId: number): Promise<AxiosResponse<void>> {
    return this.api.delete<void>(`/routines/tasks/${taskId}/complete/`);
  }

  async reorderTasks(routineId: number, taskIds: number[]): Promise<AxiosResponse<{ message: string }>> {
    return this.api.post<{ message: string }>(`/routines/routines/${routineId}/tasks/reorder/`, {
      task_ids: taskIds,
    });
  }

  // Completion endpoints
  async getCompletions(page = 1): Promise<AxiosResponse<PaginatedTaskCompletionListList>> {
    return this.api.get<PaginatedTaskCompletionListList>('/routines/completions/', {
      params: { page },
    });
  }
}

export const apiService = new ApiService();
export default apiService;