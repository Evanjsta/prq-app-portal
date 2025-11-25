import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import authService from '../services/authService';

// Auth states
const authInitialState = {
  user: null,
  token: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: true,
  error: null
};

// Auth actions
const AUTH_ACTIONS = {
  LOGIN_START: 'LOGIN_START',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILURE: 'LOGIN_FAILURE',
  LOGOUT: 'LOGOUT',
  VERIFY_TOKEN_START: 'VERIFY_TOKEN_START',
  VERIFY_TOKEN_SUCCESS: 'VERIFY_TOKEN_SUCCESS',
  VERIFY_TOKEN_FAILURE: 'VERIFY_TOKEN_FAILURE',
  REFRESH_TOKEN_SUCCESS: 'REFRESH_TOKEN_SUCCESS',
  CLEAR_ERROR: 'CLEAR_ERROR'
};

// Auth reducer
function authReducer(state, action) {
  switch (action.type) {
    case AUTH_ACTIONS.LOGIN_START:
    case AUTH_ACTIONS.VERIFY_TOKEN_START:
      return {
        ...state,
        isLoading: true,
        error: null
      };
      
    case AUTH_ACTIONS.LOGIN_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        refreshToken: action.payload.refreshToken,
        isAuthenticated: true,
        isLoading: false,
        error: null
      };
      
    case AUTH_ACTIONS.VERIFY_TOKEN_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        isAuthenticated: true,
        isLoading: false,
        error: null
      };
      
    case AUTH_ACTIONS.REFRESH_TOKEN_SUCCESS:
      return {
        ...state,
        token: action.payload.token,
        isLoading: false,
        error: null
      };
      
    case AUTH_ACTIONS.LOGIN_FAILURE:
    case AUTH_ACTIONS.VERIFY_TOKEN_FAILURE:
      return {
        ...state,
        user: null,
        token: null,
        refreshToken: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload.error
      };
      
    case AUTH_ACTIONS.LOGOUT:
      return {
        ...authInitialState,
        isLoading: false
      };
      
    case AUTH_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null
      };
      
    default:
      return state;
  }
}

// Create context
const AuthContext = createContext();

// Auth provider component
export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, authInitialState);

  // Initialize auth state on app load
  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('authToken');
      const refreshToken = localStorage.getItem('refreshToken');
      
      if (token) {
        try {
          dispatch({ type: AUTH_ACTIONS.VERIFY_TOKEN_START });
          
          // Verify token with backend
          const response = await authService.verifyToken(token);
          
          if (response.success) {
            dispatch({
              type: AUTH_ACTIONS.VERIFY_TOKEN_SUCCESS,
              payload: {
                user: response.user,
                token,
                refreshToken
              }
            });
          } else {
            // Token invalid, try refresh
            if (refreshToken) {
              await refreshAccessToken(refreshToken);
            } else {
              throw new Error('No valid tokens');
            }
          }
        } catch (error) {
          console.error('Auth initialization error:', error);
          // Clear invalid tokens
          localStorage.removeItem('authToken');
          localStorage.removeItem('refreshToken');
          dispatch({
            type: AUTH_ACTIONS.VERIFY_TOKEN_FAILURE,
            payload: { error: 'Session expired' }
          });
        }
      } else {
        dispatch({
          type: AUTH_ACTIONS.VERIFY_TOKEN_FAILURE,
          payload: { error: null }
        });
      }
    };
    
    initializeAuth();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Login function
  const login = useCallback(async (tokens) => {
    try {
      dispatch({ type: AUTH_ACTIONS.LOGIN_START });

      const { token, refreshToken } = tokens;

      // Verify token and get user info
      const response = await authService.verifyToken(token);

      if (response.success) {
        // Store tokens
        localStorage.setItem('authToken', token);
        localStorage.setItem('refreshToken', refreshToken);

        dispatch({
          type: AUTH_ACTIONS.LOGIN_SUCCESS,
          payload: {
            user: response.user,
            token,
            refreshToken
          }
        });

        return { success: true };
      } else {
        throw new Error('Token verification failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      dispatch({
        type: AUTH_ACTIONS.LOGIN_FAILURE,
        payload: { error: error.message }
      });
      return { success: false, error: error.message };
    }
  }, [dispatch]);

  // Logout function
  const logout = useCallback(async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');

      // Call backend logout endpoint
      if (refreshToken) {
        await authService.logout(refreshToken);
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local storage and state regardless of backend call result
      localStorage.removeItem('authToken');
      localStorage.removeItem('refreshToken');
      dispatch({ type: AUTH_ACTIONS.LOGOUT });
    }
  }, [dispatch]);

  // Refresh token function
  const refreshAccessToken = async (refreshToken) => {
    try {
      const response = await authService.refreshToken(refreshToken);
      
      if (response.success) {
        localStorage.setItem('authToken', response.accessToken);
        
        dispatch({
          type: AUTH_ACTIONS.REFRESH_TOKEN_SUCCESS,
          payload: { token: response.accessToken }
        });
        
        return response.accessToken;
      } else {
        throw new Error('Token refresh failed');
      }
    } catch (error) {
      console.error('Token refresh error:', error);
      // If refresh fails, logout
      await logout();
      throw error;
    }
  };

  // Clear error function
  const clearError = useCallback(() => {
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
  }, [dispatch]);

  // Initiate Google login
  const initiateGoogleLogin = useCallback(() => {
    const backendUrl = process.env.REACT_APP_AUTH_SERVICE_URL || 'http://localhost:3001';
    window.location.href = `${backendUrl}/api/auth/google`;
  }, []);

  const value = {
    ...state,
    login,
    logout,
    refreshAccessToken,
    clearError,
    initiateGoogleLogin
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
