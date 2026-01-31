// API Response Types based on OpenAPI schema

export interface Role {
  id: number;
  name: string;
  description: string;
  permissions: Record<string, unknown>;
  created_at: string;
}

export interface UserProfile {
  id: number;
  bio: string;
  avatar: string | null;
  location: string;
  website: string;
  roles: Role[];
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  date_of_birth: string | null;
  is_verified: boolean;
  profile: UserProfile;
  created_at: string;
  updated_at: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface UserRegistrationRequest {
  username: string;
  email: string;
  password: string;
  password_confirm: string;
  first_name?: string;
  last_name?: string;
  phone?: string | null;
  date_of_birth?: string | null;
}

export interface UserProfileRequest {
  bio?: string;
  avatar?: File | null;
  location?: string;
  website?: string;
  role_ids?: number[];
  is_public?: boolean;
}

export interface UserRequest {
  username: string;
  email: string;
  password?: string;
  first_name?: string;
  last_name?: string;
  phone?: string | null;
  date_of_birth?: string | null;
}

export interface TokenRefreshRequest {
  refresh: string;
}

export interface TokenRefresh {
  access: string;
  refresh: string;
}

export interface PaginatedUserList {
  count: number;
  next: string | null;
  previous: string | null;
  results: User[];
}

export interface PaginatedRoleList {
  count: number;
  next: string | null;
  previous: string | null;
  results: Role[];
}

// Authentication Context Types
export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (userData: UserRegistrationRequest) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
  updateProfile: (profileData: UserProfileRequest) => Promise<void>;
  updateUser: (userData: UserRequest) => Promise<void>;
  clearError: () => void;
}

// API Error Types
export interface ApiError {
  message: string;
  field?: string;
  code?: string;
}

export interface ApiResponse<T = unknown> {
  data: T;
  error?: ApiError;
}