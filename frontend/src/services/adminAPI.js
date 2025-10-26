// frontend/src/services/adminAPI.js
import api from './api';

class AdminAPI {
  /**
   * Get admin dashboard stats
   */
  static async getDashboardStats() {
    try {
      const response = await api.get('/admin/dashboard');
      return response.data;
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw error;
    }
  }

  /**
   * Get users with filtering and pagination
   */
  static async getUsers(filters = {}) {
    try {
      // Clean filters - remove empty values
      const cleanFilters = Object.entries(filters).reduce((acc, [key, value]) => {
        if (value !== '' && value !== null && value !== undefined) {
          acc[key] = value;
        }
        return acc;
      }, {});

      const response = await api.get('/admin/users', { params: cleanFilters });
      return response.data;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  }

  /**
   * Update user status/role with proper validation
   */
  static async updateUser(userId, updateData) {
    try {
      // Validate user ID
      if (!userId || typeof userId !== 'string') {
        throw new Error('Invalid user ID');
      }

      // Clean and validate update data
      const cleanData = {};
      
      // Handle role
      if (updateData.role !== undefined) {
        if (!['user', 'moderator', 'admin'].includes(updateData.role)) {
          throw new Error('Invalid role value');
        }
        cleanData.role = updateData.role;
      }
      
      // Handle boolean fields - ensure they're actual booleans
      if (updateData.is_active !== undefined) {
        cleanData.is_active = Boolean(updateData.is_active);
      }
      
      if (updateData.is_suspended !== undefined) {
        cleanData.is_suspended = Boolean(updateData.is_suspended);
      }
      
      // Handle suspension reason
      if (updateData.suspension_reason !== undefined) {
        if (updateData.suspension_reason === null) {
          cleanData.suspension_reason = null;
        } else if (typeof updateData.suspension_reason === 'string') {
          const reason = updateData.suspension_reason.trim();
          if (reason.length === 0) {
            throw new Error('Suspension reason cannot be empty');
          }
          if (reason.length > 500) {
            throw new Error('Suspension reason must be less than 500 characters');
          }
          cleanData.suspension_reason = reason;
        }
      }
      
      // Handle suspension duration
      if (updateData.suspension_duration !== undefined) {
        const duration = parseInt(updateData.suspension_duration);
        if (isNaN(duration) || duration < 1 || duration > 525600) {
          throw new Error('Suspension duration must be between 1 and 525600 minutes');
        }
        cleanData.suspension_duration = duration;
      }

      // Ensure we have data to send
      if (Object.keys(cleanData).length === 0) {
        throw new Error('No valid fields to update');
      }

      console.log('Sending cleaned data:', cleanData);
      console.log('User ID:', userId);

      const response = await api.put(`/admin/users/${userId}`, cleanData);
      return response.data;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  /**
   * Delete user permanently
   */
  static async deleteUser(userId) {
    try {
      // Validate user ID
      if (!userId || typeof userId !== 'string') {
        throw new Error('Invalid user ID');
      }

      console.log('Deleting user:', userId);

      const response = await api.delete(`/admin/users/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }

  /**
   * Get projects for admin management
   */
  static async getProjects(filters = {}) {
    try {
      const response = await api.get('/admin/projects', { params: filters });
      return response.data;
    } catch (error) {
      console.error('Error fetching projects:', error);
      throw error;
    }
  }

  /**
   * Get challenges for admin management
   */
  static async getChallenges(filters = {}) {
    try {
      const response = await api.get('/admin/challenges', { params: filters });
      return response.data;
    } catch (error) {
      console.error('Error fetching challenges:', error);
      throw error;
    }
  }

  /**
   * Get system settings
   */
  static async getSystemSettings() {
    try {
      const response = await api.get('/admin/settings');
      return response.data;
    } catch (error) {
      console.error('Error fetching system settings:', error);
      throw error;
    }
  }

  /**
   * Update system settings
   */
  static async updateSystemSettings(settings) {
    try {
      const response = await api.put('/admin/settings', { settings });
      return response.data;
    } catch (error) {
      console.error('Error updating system settings:', error);
      throw error;
    }
  }

  /**
   * Get admin activity logs
   */
  static async getActivityLogs(filters = {}) {
    try {
      const response = await api.get('/admin/activity-logs', { params: filters });
      return response.data;
    } catch (error) {
      console.error('Error fetching activity logs:', error);
      throw error;
    }
  }

  /**
   * Get analytics data
   */
  static async getUserGrowthAnalytics(timeframe = '30d') {
    try {
      const response = await api.get('/admin/analytics/user-growth', { 
        params: { timeframe } 
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching user growth analytics:', error);
      throw error;
    }
  }

  static async getProjectStatsAnalytics(timeframe = '30d') {
    try {
      const response = await api.get('/admin/analytics/project-stats', { 
        params: { timeframe } 
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching project stats analytics:', error);
      throw error;
    }
  }

  static async getChallengePerformanceAnalytics(timeframe = '30d') {
    try {
      const response = await api.get('/admin/analytics/challenge-performance', { 
        params: { timeframe } 
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching challenge performance analytics:', error);
      throw error;
    }
  }

  /**
   * Development/Testing endpoints (only available in development mode)
   */
  static async seedConfusionMatrixData(userCount = 50, projectCount = 20) {
    try {
      const response = await api.post('/admin/dev/seed-confusion-matrix', {
        userCount,
        projectCount
      });
      return response.data;
    } catch (error) {
      console.error('Error seeding confusion matrix data:', error);
      throw error;
    }
  }

  static async testConfusionMatrix(userId, limit = 10) {
    try {
      const response = await api.post('/admin/dev/test-confusion-matrix', {
        userId,
        limit
      });
      return response.data;
    } catch (error) {
      console.error('Error testing confusion matrix:', error);
      throw error;
    }
  }

  static async clearConfusionMatrixData() {
    try {
      const response = await api.delete('/admin/dev/clear-confusion-matrix');
      return response.data;
    } catch (error) {
      console.error('Error clearing confusion matrix data:', error);
      throw error;
    }
  }

  /**
   * Convenience methods for common actions
   */
  static async suspendUser(userId, reason, durationMinutes) {
    return this.updateUser(userId, {
      is_suspended: true,
      suspension_reason: reason,
      suspension_duration: durationMinutes
    });
  }

  static async unsuspendUser(userId) {
    return this.updateUser(userId, {
      is_suspended: false,
      suspension_reason: null
    });
  }

  static async changeUserRole(userId, newRole) {
    return this.updateUser(userId, {
      role: newRole
    });
  }

  static async toggleUserStatus(userId, isActive) {
    return this.updateUser(userId, {
      is_active: isActive
    });
  }

  /**
   * Convenience method for deleting a user
   */
  static async deleteUserPermanently(userId) {
    return this.deleteUser(userId);
  }
}

export default AdminAPI;