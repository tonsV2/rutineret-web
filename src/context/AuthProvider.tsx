import React, { useReducer, useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { AuthContext } from './AuthContext';
import type { User, UserRegistrationRequest, UserProfileRequest, UserRequest, AuthState } from '../types';
import type { AuthContextType } from '../types';
import apiService from '../services/api';

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

type AuthAction =
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: User }
  | { type: 'LOGIN_FAILURE'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'REGISTER_START' }
  | { type: 'REGISTER_SUCCESS'; payload: User }
  | { type: 'REGISTER_FAILURE'; payload: string }
  | { type: 'GOOGLE_SIGNIN_START' }
  | { type: 'GOOGLE_SIGNIN_SUCCESS'; payload: User }
  | { type: 'GOOGLE_SIGNIN_FAILURE'; payload: string }
  | { type: 'LOAD_USER_START' }
  | { type: 'LOAD_USER_SUCCESS'; payload: User }
  | { type: 'LOAD_USER_FAILURE' }
  | { type: 'UPDATE_PROFILE_SUCCESS'; payload: User }
  | { type: 'UPDATE_USER_SUCCESS'; payload: User }
  | { type: 'CLEAR_ERROR' }
  | { type: 'REFRESH_TOKEN_SUCCESS'; payload: User }
  | { type: 'REFRESH_TOKEN_FAILURE' };

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'LOGIN_START':
    case 'REGISTER_START':
    case 'GOOGLE_SIGNIN_START':
      return { ...state, isLoading: true, error: null };
    
    case 'LOAD_USER_START':
      return { ...state, isLoading: true };
    
    case 'LOGIN_SUCCESS':
    case 'REGISTER_SUCCESS':
    case 'GOOGLE_SIGNIN_SUCCESS':
    case 'LOAD_USER_SUCCESS':
    case 'REFRESH_TOKEN_SUCCESS':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    
    case 'LOGIN_FAILURE':
    case 'REGISTER_FAILURE':
    case 'GOOGLE_SIGNIN_FAILURE':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
      };
    
    case 'LOAD_USER_FAILURE':
    case 'REFRESH_TOKEN_FAILURE':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };
    
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };
    
    case 'UPDATE_PROFILE_SUCCESS':
    case 'UPDATE_USER_SUCCESS':
      return {
        ...state,
        user: action.payload,
        isLoading: false,
        error: null,
      };
    
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    
    default:
      return state;
  }
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const isLoadingUserRef = useRef(false);

  // Load user on app start
  useEffect(() => {
    // Prevent concurrent user loading attempts
    if (isLoadingUserRef.current) return;
    isLoadingUserRef.current = true;

    const loadUser = async () => {
      const token = localStorage.getItem('access_token');
      if (token) {
        try {
          dispatch({ type: 'LOAD_USER_START' });
          const response = await apiService.getCurrentUser();
          dispatch({ type: 'LOAD_USER_SUCCESS', payload: response.data });
        } catch (error) {
          console.error('Failed to load user:', error);
          dispatch({ type: 'LOAD_USER_FAILURE' });
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
        }
      } else {
        dispatch({ type: 'LOAD_USER_FAILURE' });
      }
    };

    loadUser().finally(() => {
      isLoadingUserRef.current = false;
    });
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    try {
      dispatch({ type: 'LOGIN_START' });
      const response = await apiService.login({ email, password });
      dispatch({ type: 'LOGIN_SUCCESS', payload: response.data });
    } catch (error: unknown) {
      const errorMessage = error && typeof error === 'object' && 'response' in error 
        ? ((error as { response?: { data?: { detail?: string } } }).response?.data?.detail || 'Login failed')
        : 'Login failed';
      dispatch({ type: 'LOGIN_FAILURE', payload: errorMessage });
      throw error;
    }
  };

  const register = async (userData: UserRegistrationRequest): Promise<void> => {
    try {
      dispatch({ type: 'REGISTER_START' });
      const response = await apiService.register(userData);
      dispatch({ type: 'REGISTER_SUCCESS', payload: response.data });
    } catch (error: unknown) {
      const errorMessage = error && typeof error === 'object' && 'response' in error 
        ? ((error as { response?: { data?: { detail?: string } } }).response?.data?.detail || 'Registration failed')
        : 'Registration failed';
      dispatch({ type: 'REGISTER_FAILURE', payload: errorMessage });
      throw error;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await apiService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      dispatch({ type: 'LOGOUT' });
    }
  };

  const refreshToken = async (): Promise<void> => {
    try {
      const refreshTokenValue = localStorage.getItem('refresh_token');
      if (refreshTokenValue) {
        const response = await apiService.refreshToken(refreshTokenValue);
        localStorage.setItem('access_token', response.data.access);
        if (response.data.refresh) {
          localStorage.setItem('refresh_token', response.data.refresh);
        }
        // Reload user data after token refresh
        const userResponse = await apiService.getCurrentUser();
        dispatch({ type: 'REFRESH_TOKEN_SUCCESS', payload: userResponse.data });
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
      dispatch({ type: 'REFRESH_TOKEN_FAILURE' });
    }
  };

  const updateProfile = async (profileData: UserProfileRequest): Promise<void> => {
    try {
      await apiService.updateProfile(profileData);
      const userResponse = await apiService.getCurrentUser();
      dispatch({ type: 'UPDATE_PROFILE_SUCCESS', payload: userResponse.data });
    } catch (error: unknown) {
      const errorMessage = error && typeof error === 'object' && 'response' in error 
        ? ((error as { response?: { data?: { detail?: string } } }).response?.data?.detail || 'Profile update failed')
        : 'Profile update failed';
      dispatch({ type: 'LOGIN_FAILURE', payload: errorMessage });
      throw error;
    }
  };

  const updateUser = async (userData: UserRequest): Promise<void> => {
    try {
      const response = await apiService.updateUser(userData);
      dispatch({ type: 'UPDATE_USER_SUCCESS', payload: response.data });
    } catch (error: unknown) {
      const errorMessage = error && typeof error === 'object' && 'response' in error 
        ? ((error as { response?: { data?: { detail?: string } } }).response?.data?.detail || 'User update failed')
        : 'User update failed';
      dispatch({ type: 'LOGIN_FAILURE', payload: errorMessage });
      throw error;
    }
  };

  const googleSignIn = async (): Promise<{ success: boolean; error?: string }> => {
    // For OAuth2 redirect flow, this method won't be used
    // The redirect handles everything, but keeping method for consistency
    try {
      dispatch({ type: 'GOOGLE_SIGNIN_START' });
      // const response = await apiService.handleGoogleCallback(idToken);
      // dispatch({ type: 'GOOGLE_SIGNIN_SUCCESS', payload: response.data });
      return { success: true };
    } catch (error: unknown) {
      const errorMessage = error && typeof error === 'object' && 'response' in error 
        ? ((error as { response?: { data?: { detail?: string } } }).response?.data?.detail || 'Google sign-in failed')
        : 'Google sign-in failed';
      dispatch({ type: 'GOOGLE_SIGNIN_FAILURE', payload: errorMessage });
      return { success: false, error: errorMessage };
    }
  };

  // New method to handle OAuth callback success
  const handleGoogleOAuthSuccess = async (code: string): Promise<{ success: boolean; error?: string }> => {
    try {
      dispatch({ type: 'GOOGLE_SIGNIN_START' });
      
      const response = await apiService.exchangeCodeForTokens(code);
      const { access, refresh, user } = response.data;
      
      // Store tokens in localStorage
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
      
      // Update auth state
      dispatch({ type: 'GOOGLE_SIGNIN_SUCCESS', payload: user });
      
      return { success: true };
    } catch (error: unknown) {
      const errorMessage = error && typeof error === 'object' && 'response' in error 
        ? ((error as { response?: { data?: { detail?: string } } }).response?.data?.detail || 'Google sign-in failed')
        : 'Google sign-in failed';
      dispatch({ type: 'GOOGLE_SIGNIN_FAILURE', payload: errorMessage });
      return { success: false, error: errorMessage };
    }
  };

  // New method to complete OAuth sign-in with tokens from URL
  const completeOAuthSignIn = async (accessToken: string, refreshToken: string): Promise<{ success: boolean; error?: string }> => {
    try {
      dispatch({ type: 'GOOGLE_SIGNIN_START' });
      
      // Store tokens in localStorage
      localStorage.setItem('access_token', accessToken);
      if (refreshToken) {
        localStorage.setItem('refresh_token', refreshToken);
      }
      
      // Get user data using the access token
      const userResponse = await apiService.getCurrentUser();
      const userData = userResponse.data;
      
      // Update auth context state
      dispatch({ type: 'GOOGLE_SIGNIN_SUCCESS', payload: userData });
      
      return { success: true };
    } catch (error: unknown) {
      const errorMessage = error && typeof error === 'object' && 'response' in error 
        ? ((error as { response?: { data?: { detail?: string } } }).response?.data?.detail || 'Failed to complete sign-in')
        : 'Failed to complete sign-in';
      dispatch({ type: 'GOOGLE_SIGNIN_FAILURE', payload: errorMessage });
      return { success: false, error: errorMessage };
    }
  };

  const clearError = (): void => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const value: AuthContextType = {
    ...state,
    login,
    register,
    googleSignIn,
    handleGoogleOAuthSuccess,
    completeOAuthSignIn,
    logout,
    refreshToken,
    updateProfile,
    updateUser,
    clearError,
  };

  return (
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};