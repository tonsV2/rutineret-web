// Export all generated API types first
export * from './generated';

// React-specific types (not from OpenAPI)
import type { User, UserRegistrationRequest, UserProfileRequest, UserRequest, TodayRoutine } from './generated';

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (userData: UserRegistrationRequest) => Promise<void>;
  googleSignIn: (idToken: string) => Promise<{ success: boolean; error?: string }>;
  handleGoogleOAuthSuccess: (code: string) => Promise<{ success: boolean; error?: string }>;
  completeOAuthSignIn: (accessToken: string, refreshToken: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  refreshToken: () => Promise<void>;
  updateProfile: (profileData: UserProfileRequest) => Promise<void>;
  updateUser: (userData: UserRequest) => Promise<void>;
  clearError: () => void;
}

export interface ApiError {
  message: string;
  field?: string;
  code?: string;
}

export interface ApiResponse<T = unknown> {
  data: T;
  error?: ApiError;
}

// API Response Types - Now properly generated from Django serializer
// Use TodayRoutine type generated from TodayRoutineSerializer
export type { TodayRoutine as TodayTasksResponse };

// Types that should be generated but aren't working correctly
export interface SocialAccount {
  id: number;
  provider: string;
  uid: string;
  provider_display_name?: string;
}