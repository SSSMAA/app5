import { useState, useEffect } from 'react';
import { authAPI, setAuthToken } from '../services/api';
import type { User } from '../types';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    // Check if user is already authenticated on app load
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (token) {
          setAuthToken(token);
          const response = await authAPI.verify();
          setAuthState({
            user: response.user,
            isLoading: false,
            error: null,
          });
        } else {
          setAuthState({
            user: null,
            isLoading: false,
            error: null,
          });
        }
      } catch (error) {
        console.error('Auth verification failed:', error);
        setAuthToken(null);
        setAuthState({
          user: null,
          isLoading: false,
          error: null,
        });
      }
    };

    checkAuth();
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const response = await authAPI.login(username, password);
      
      setAuthState({
        user: response.user,
        isLoading: false,
        error: null,
      });
      
      return true;
    } catch (error) {
      setAuthState({
        user: null,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Login failed',
      });
      return false;
    }
  };

  const logout = () => {
    authAPI.logout();
    setAuthState({
      user: null,
      isLoading: false,
      error: null,
    });
  };

  return {
    ...authState,
    login,
    logout,
  };
};