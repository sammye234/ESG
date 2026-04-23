// client/src/services/authService.js
import api from './api';

export const authService = {
  // Register new user
  register: async (userData) => {
    try {
      console.log('🔵 Registering with data:', userData);
      const response = await api.post('/auth/register', userData);
      console.log('✅ Registration response:', response.data);
      if (response.data.token) {
        localStorage.setItem('accessToken', response.data.token);
        localStorage.setItem('refreshToken', response.data.refreshToken);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      return response.data;
    } catch (error) {
      console.error('❌ Registration error:', error.response?.data);
      throw error.response?.data || error;
    }
  },

  // Login user
  // login: async (credentials) => {
  //   try {
  //     console.log('🔵 Logging in with:', credentials);
  //     const response = await api.post('/auth/login', credentials);
  //     if (response.data.token) {
  //       localStorage.setItem('accessToken', response.data.token);
  //       localStorage.setItem('refreshToken', response.data.refreshToken);
  //       localStorage.setItem('user', JSON.stringify(response.data.user));
  //     }
  //     return response.data;
  //   } catch (error) {
  //     console.error('❌ Login error:', error.response?.data);
  //     throw error.response?.data || error;
  //   }
  // },
  // client/src/services/authService.js → login method
login: async (credentials) => {
  try {
    console.log('🔵 Logging in with:', credentials);
    const response = await api.post('/auth/login', credentials);
    
    console.log('Login full response:', response.data); 

    if (response.data.token) {
      localStorage.setItem('accessToken', response.data.token);
      // localStorage.setItem('refreshToken', response.data.refreshToken || ''); 
      localStorage.setItem('user', JSON.stringify(response.data.user));
      console.log('Token saved:', response.data.token.substring(0, 20) + '...');
    } else {
      console.warn('No token in login response!');
    }

    return response.data;
  } catch (error) {
    console.error('❌ Login error:', error.response?.data);
    throw error.response?.data || error;
  }
},

  // Logout user
  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    }
  },

  // Get current user
  // getCurrentUser: async () => {
  //   try {
  //     const response = await api.get('/auth/me');
  //     return response.data;
  //   } catch (error) {
  //     throw error.response?.data || error;
  //   }
  // },
getCurrentUser: async () => {
  try {
    console.log('Calling /auth/me - current token exists?', !!localStorage.getItem('accessToken'));
    const response = await api.get('/auth/me');
    console.log('/me response:', response.data);
    
    if (response.data.user) {
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    
    return response.data;
  } catch (error) {
    console.error('Get current user failed:', error.response?.data || error.message);
    throw error;
  }
},
  // Update profile
  updateProfile: async (userData) => {
    try {
      const response = await api.put('/auth/update-profile', userData);
      if (response.data.user) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Change password
  changePassword: async (passwords) => {
    try {
      const response = await api.put('/auth/change-password', passwords);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    return !!localStorage.getItem('accessToken');
  },

  // Get stored user
  getStoredUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }
};

export default authService;


