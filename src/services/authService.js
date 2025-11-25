import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_AUTH_SERVICE_URL || 'http://localhost:3001';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
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
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          const response = await authService.refreshToken(refreshToken);
          if (response.success) {
            localStorage.setItem('authToken', response.accessToken);
            // Update the authorization header and retry the request
            originalRequest.headers.Authorization = `Bearer ${response.accessToken}`;
            return apiClient(originalRequest);
          }
        } catch (refreshError) {
          // Refresh failed, redirect to login
          localStorage.removeItem('authToken');
          localStorage.removeItem('refreshToken');
          window.location.href = '/login';
          return Promise.reject(refreshError);
        }
      } else {
        // No refresh token, redirect to login
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

const authService = {
  /**
   * Verify JWT token
   */
  async verifyToken(token) {
    try {
      const response = await apiClient.post('/auth/verify', { token });
      return response.data;
    } catch (error) {
      console.error('Token verification error:', error);
      throw new Error(error.response?.data?.message || 'Token verification failed');
    }
  },

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken) {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/auth/refresh`, {
        refreshToken
      });
      return response.data;
    } catch (error) {
      console.error('Token refresh error:', error);
      throw new Error(error.response?.data?.message || 'Token refresh failed');
    }
  },

  /**
   * Logout user
   */
  async logout(refreshToken) {
    try {
      const response = await apiClient.post('/auth/logout', { refreshToken });
      return response.data;
    } catch (error) {
      console.error('Logout error:', error);
      // Don't throw error for logout - we want to clear local state regardless
      return { success: false, message: error.response?.data?.message || 'Logout error' };
    }
  },

  /**
   * Get authentication status
   */
  async getAuthStatus() {
    try {
      const response = await apiClient.get('/auth/status');
      return response.data;
    } catch (error) {
      console.error('Auth status error:', error);
      throw new Error(error.response?.data?.message || 'Failed to get auth status');
    }
  },

  /**
   * Get all users (admin only)
   */
  async getUsers(params = {}) {
    try {
      const response = await apiClient.get('/users', { params });
      return response.data;
    } catch (error) {
      console.error('Get users error:', error);
      throw new Error(error.response?.data?.message || 'Failed to get users');
    }
  },

  /**
   * Get user by ID
   */
  async getUser(userId) {
    try {
      const response = await apiClient.get(`/users/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Get user error:', error);
      throw new Error(error.response?.data?.message || 'Failed to get user');
    }
  },

  /**
   * Create new user
   */
  async createUser(userData) {
    try {
      const response = await apiClient.post('/users', userData);
      return response.data;
    } catch (error) {
      console.error('Create user error:', error);
      throw new Error(error.response?.data?.message || 'Failed to create user');
    }
  },

  /**
   * Update user
   */
  async updateUser(userId, userData) {
    try {
      const response = await apiClient.put(`/users/${userId}`, userData);
      return response.data;
    } catch (error) {
      console.error('Update user error:', error);
      throw new Error(error.response?.data?.message || 'Failed to update user');
    }
  },

  /**
   * Get user's applications
   */
  async getUserApplications(userId) {
    try {
      const response = await apiClient.get(`/users/${userId}/applications`);
      return response.data;
    } catch (error) {
      console.error('Get user applications error:', error);
      throw new Error(error.response?.data?.message || 'Failed to get user applications');
    }
  },

  /**
   * Assign user to application
   */
  async assignUserToApplication(userId, assignmentData) {
    try {
      const response = await apiClient.post(`/users/${userId}/assign`, assignmentData);
      return response.data;
    } catch (error) {
      console.error('Assign user error:', error);
      throw new Error(error.response?.data?.message || 'Failed to assign user');
    }
  },

  /**
   * Get all applications
   */
  async getApplications() {
    try {
      const response = await apiClient.get('/applications');
      return response.data;
    } catch (error) {
      console.error('Get applications error:', error);
      throw new Error(error.response?.data?.message || 'Failed to get applications');
    }
  },

  /**
   * Create new application
   */
  async createApplication(applicationData) {
    try {
      const response = await apiClient.post('/applications', applicationData);
      return response.data;
    } catch (error) {
      console.error('Create application error:', error);
      throw new Error(error.response?.data?.message || 'Failed to create application');
    }
  },

  /**
   * Update application
   */
  async updateApplication(applicationId, applicationData) {
    try {
      const response = await apiClient.put(`/applications/${applicationId}`, applicationData);
      return response.data;
    } catch (error) {
      console.error('Update application error:', error);
      throw new Error(error.response?.data?.message || 'Failed to update application');
    }
  },

  /**
   * Get application roles
   */
  async getApplicationRoles(applicationId) {
    try {
      const response = await apiClient.get(`/applications/${applicationId}/roles`);
      return response.data;
    } catch (error) {
      console.error('Get application roles error:', error);
      throw new Error(error.response?.data?.message || 'Failed to get application roles');
    }
  },

  /**
   * Create role for application
   */
  async createRole(applicationId, roleData) {
    try {
      const response = await apiClient.post(`/applications/${applicationId}/roles`, roleData);
      return response.data;
    } catch (error) {
      console.error('Create role error:', error);
      throw new Error(error.response?.data?.message || 'Failed to create role');
    }
  },

  /**
   * Get all roles
   */
  async getRoles(params = {}) {
    try {
      const response = await apiClient.get('/roles', { params });
      return response.data;
    } catch (error) {
      console.error('Get roles error:', error);
      throw new Error(error.response?.data?.message || 'Failed to get roles');
    }
  },

  /**
   * Update role
   */
  async updateRole(roleId, roleData) {
    try {
      const response = await apiClient.put(`/roles/${roleId}`, roleData);
      return response.data;
    } catch (error) {
      console.error('Update role error:', error);
      throw new Error(error.response?.data?.message || 'Failed to update role');
    }
  },

  /**
   * Delete role
   */
  async deleteRole(roleId) {
    try {
      const response = await apiClient.delete(`/roles/${roleId}`);
      return response.data;
    } catch (error) {
      console.error('Delete role error:', error);
      throw new Error(error.response?.data?.message || 'Failed to delete role');
    }
  },

  /**
   * Get role templates
   */
  async getRoleTemplates() {
    try {
      const response = await apiClient.get('/roles/templates');
      return response.data;
    } catch (error) {
      console.error('Get role templates error:', error);
      throw new Error(error.response?.data?.message || 'Failed to get role templates');
    }
  },

  /**
   * Set a user's global system role
   */
  async setGlobalSystemRole(userId, systemRole, adminUserId) {
    try {
      const response = await apiClient.put(`/user-roles/${userId}/global`, {
        systemRole,
        adminUserId
      });
      return response.data;
    } catch (error) {
      console.error('Set global system role error:', error);
      throw new Error(error.response?.data?.message || 'Failed to set global system role');
    }
  },

  /**
   * Set a user's system role for a specific application
   */
  async setAppSystemRole(userId, applicationId, systemRole, options, adminUserId) {
    try {
      const response = await apiClient.put(`/user-roles/${userId}/application/${applicationId}`, {
        systemRole,
        delegatedPermissions: options?.delegatedPermissions || [],
        metadata: options?.metadata || {},
        adminUserId
      });
      return response.data;
    } catch (error) {
      console.error('Set app system role error:', error);
      throw new Error(error.response?.data?.message || 'Failed to set app system role');
    }
  },

  /**
   * Grant delegated permissions to a user
   */
  async grantDelegatedPermissions(userId, applicationId, permissions, adminUserId) {
    try {
      const response = await apiClient.post(`/user-roles/${userId}/application/${applicationId}/permissions`, {
        permissions,
        adminUserId
      });
      return response.data;
    } catch (error) {
      console.error('Grant delegated permissions error:', error);
      throw new Error(error.response?.data?.message || 'Failed to grant delegated permissions');
    }
  },

  /**
   * Get all users with their system roles
   */
  async getUsersWithRoles(filters = {}) {
    try {
      const response = await apiClient.get('/user-roles', { params: filters });
      return response.data;
    } catch (error) {
      console.error('Get users with roles error:', error);
      throw new Error(error.response?.data?.message || 'Failed to get users with roles');
    }
  },

  /**
   * Get user profile
   */
  async getProfile(userId) {
    try {
      const response = await apiClient.get(`/profile/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Get profile error:', error);
      throw new Error(error.response?.data?.message || 'Failed to get profile');
    }
  },

  /**
   * Update user profile
   */
  async updateProfile(userId, profileData) {
    try {
      const response = await apiClient.put(`/profile/${userId}`, profileData);
      return response.data;
    } catch (error) {
      console.error('Update profile error:', error);
      throw new Error(error.response?.data?.message || 'Failed to update profile');
    }
  },

  /**
   * Get vCard data for QR code generation
   */
  async getVCard(userId, format = 'json') {
    try {
      const response = await apiClient.get(`/profile/${userId}/vcard`, {
        params: { format }
      });
      return response.data;
    } catch (error) {
      console.error('Get vCard error:', error);
      throw new Error(error.response?.data?.message || 'Failed to get vCard');
    }
  }
};

export default authService;
