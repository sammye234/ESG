//client/ src/context/AuthContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';
import { authService } from '../services/authService';

// Create context
export const AuthContext = createContext(null);

// Custom hook – this is what was missing!
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check auth status on mount
  // useEffect(() => {
  //   const initAuth = async () => {
  //     const token = localStorage.getItem('accessToken');
  //     if (token) {
  //       try {
  //         const userData = await authService.getCurrentUser();
  //         setUser(userData.user);
  //       } catch (err) {
  //         console.error('Failed to fetch user:', err);
  //         localStorage.removeItem('accessToken');
  //         localStorage.removeItem('refreshToken');
  //         localStorage.removeItem('user');
  //       }
  //     }
  //     setLoading(false);
  //   };

  //   initAuth();
  // }, []);
  useEffect(() => {
  const initAuth = async () => {
    const token = localStorage.getItem('accessToken');
    console.log('Init auth - token present?', !!token);

    if (token) {
      try {
        const userData = await authService.getCurrentUser();
        console.log('User loaded from /me:', userData.user);
        setUser(userData.user);
      } catch (err) {
        console.error('Failed to fetch user on init:', err);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  };

  initAuth();
}, []);

  const login = async (credentials) => {
    try {
      setError(null);
      console.log('🟢 AuthContext: Calling authService.login');
      const data = await authService.login(credentials);
      console.log('✅ Login response:', data);
      setUser(data.user);
      return { success: true ,
      user: data.user };
    } catch (err) {
      console.error('🔴 AuthContext: Login error:', err);
      const errorMsg = err.message || 'Login failed';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    }
  };

  const signup = async (userData) => {
    try {
      setError(null);
      console.log('🟢 AuthContext: Calling authService.register');
      const data = await authService.register(userData);
      console.log('✅ Register response:', data);
      return { success: true };
    } catch (err) {
      console.error('🔴 AuthContext: Signup error:', err);
      const errorMsg = err.message || 'Signup failed';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    }
  };

  // Accept optional onNavigate callback for redirect
  const logout = (onNavigate) => {
    authService.logout();
    setUser(null);
    setError(null);

    // Redirect if callback provided
    if (onNavigate && typeof onNavigate === 'function') {
      onNavigate('landing');
    }

    console.log('🚪 User logged out, redirecting to landing page');
  };
  const refreshUser = async () => {
    try {
      console.log('[refreshUser] Starting – current user before refresh:', user);
      const userData = await authService.getCurrentUser();
      console.log('[refreshUser] Fresh data from /me:', userData.user);
      setUser(userData.user);
      localStorage.setItem('user', JSON.stringify(userData.user));
      console.log('[refreshUser] User state updated to:', userData.user);
    } catch (err) {
      console.error('[refreshUser] Failed:', err);
    }
  };

  const value = {
    user,
    loading,
    error,
    login,
    signup,
    logout,
    refreshUser,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};