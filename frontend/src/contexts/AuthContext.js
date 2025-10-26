import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { authService } from '../services/authService';

// Initial state
const initialState = {
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: false,
  loading: true,
  error: null
};

// Action types
const actionTypes = {
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILURE: 'LOGIN_FAILURE',
  LOGOUT: 'LOGOUT',
  CLEAR_ERROR: 'CLEAR_ERROR',
  SET_LOADING: 'SET_LOADING',
  UPDATE_USER: 'UPDATE_USER'
};

// Reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case actionTypes.LOGIN_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        loading: false,
        error: null
      };
    case actionTypes.LOGIN_FAILURE:
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        error: action.payload
      };
    case actionTypes.LOGOUT:
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        error: null
      };
    case actionTypes.CLEAR_ERROR:
      return {
        ...state,
        error: null
      };
    case actionTypes.SET_LOADING:
      return {
        ...state,
        loading: action.payload
      };
    case actionTypes.UPDATE_USER:
      return {
        ...state,
        user: action.payload.completeReplace ? action.payload.user : { ...state.user, ...action.payload }
      };
    default:
      return state;
  }
};

// Create context
const AuthContext = createContext();

// Provider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check if user is logged in on app start - FIXED WITH USEcallback
  const checkAuth = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const response = await authService.getProfile(token);
        if (response.success) {
          dispatch({
            type: actionTypes.LOGIN_SUCCESS,
            payload: {
              user: response.data.user,
              token: token
            }
          });
        } else {
          localStorage.removeItem('token');
          dispatch({ type: actionTypes.LOGOUT });
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        localStorage.removeItem('token');
        dispatch({ type: actionTypes.LOGOUT });
      }
    } else {
      dispatch({ type: actionTypes.SET_LOADING, payload: false });
    }
  }, []);

  // Only run checkAuth once on mount
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Login function
  const login = useCallback(async (credentials) => {
    try {
      dispatch({ type: actionTypes.SET_LOADING, payload: true });
      
      const response = await authService.login(credentials);
      
      if (response.success) {
        localStorage.setItem('token', response.data.token);
        dispatch({
          type: actionTypes.LOGIN_SUCCESS,
          payload: response.data
        });
        return { success: true, data: response.data };
      } else {
        dispatch({ type: actionTypes.LOGIN_FAILURE, payload: response.message });
        return { success: false, message: response.message };
      }
    } catch (error) {
      console.error('Login error:', error);
      const message = error.response?.data?.message || 'Login failed';
      dispatch({ type: actionTypes.LOGIN_FAILURE, payload: message });
      return { success: false, message };
    }
  }, []);

  // Register function
  const register = useCallback(async (userData) => {
    try {
      dispatch({ type: actionTypes.SET_LOADING, payload: true });
      
      const response = await authService.register(userData);
      
      if (response.success) {
        localStorage.setItem('token', response.data.token);
        dispatch({
          type: actionTypes.LOGIN_SUCCESS,
          payload: response.data
        });
        return { success: true, data: response.data };
      } else {
        dispatch({ type: actionTypes.LOGIN_FAILURE, payload: response.message });
        return { success: false, message: response.message };
      }
    } catch (error) {
      console.error('Registration error:', error);
      const message = error.response?.data?.message || 'Registration failed';
      dispatch({ type: actionTypes.LOGIN_FAILURE, payload: message });
      return { success: false, message };
    }
  }, []);

  // Logout function
  const logout = useCallback(() => {
    localStorage.removeItem('token');
    authService.logout();
    dispatch({ type: actionTypes.LOGOUT });
  }, []);

  // Update user profile
  const updateUser = useCallback(async (userData, completeReplace = false) => {
    try {
      // If it's just updating specific flags or doing a complete replacement, do it locally
      if ((userData.hasOwnProperty('needsOnboarding') && Object.keys(userData).length === 1) || completeReplace) {
        dispatch({
          type: actionTypes.UPDATE_USER,
          payload: completeReplace ? 
            { user: userData, completeReplace: true } : userData
        });
        return { success: true };
      }

      // Otherwise, call the API
      const response = await authService.updateProfile(userData, state.token);
      
      if (response.success) {
        dispatch({
          type: actionTypes.UPDATE_USER,
          payload: response.data.user
        });
        return { success: true };
      } else {
        return { success: false, message: response.message };
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Update failed';
      return { success: false, message };
    }
  }, [state.token]);

  // Refresh user profile (useful after onboarding completion)
  const refreshUser = useCallback(async () => {
    try {
      if (state.token) {
        const response = await authService.getProfile(state.token);
        if (response.success) {
          dispatch({
            type: actionTypes.UPDATE_USER,
            payload: response.data.user
          });
          return { success: true };
        }
      }
      return { success: false };
    } catch (error) {
      console.error('Refresh user error:', error);
      return { success: false };
    }
  }, [state.token]);

  // Clear error
  const clearError = useCallback(() => {
    dispatch({ type: actionTypes.CLEAR_ERROR });
  }, []);

  const value = {
    ...state,
    login,
    register,
    logout,
    updateUser,
    refreshUser,
    clearError
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};