// frontend/src/services/soloProjectService.js
import api from './api';

class SoloProjectService {
  
  // ===== DASHBOARD METHODS =====

  /**
   * Get dashboard data for solo project
   * @param {string} projectId - Solo project ID
   * @returns {Promise} - Dashboard data with stats and project info
   */
  static async getDashboardData(projectId) {
    try {
      console.log('🔄 SoloProjectService: Getting dashboard data for project:', projectId);
      const response = await api.get(`/solo-projects/${projectId}/dashboard`);
      console.log('✅ SoloProjectService: Dashboard data retrieved successfully');
      return response.data;
    } catch (error) {
      console.error('💥 SoloProjectService: Get dashboard data error:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Get recent activity for solo project
   * @param {string} projectId - Solo project ID
   * @param {number} limit - Number of activities to fetch (default: 10)
   * @returns {Promise} - Recent activity list
   */
  static async getRecentActivity(projectId, limit = 10) {
    try {
      console.log('🔄 SoloProjectService: Getting recent activity for project:', projectId);
      const response = await api.get(`/solo-projects/${projectId}/recent-activity?limit=${limit}`);
      console.log('✅ SoloProjectService: Recent activity retrieved successfully');
      return response.data;
    } catch (error) {
      console.error('💥 SoloProjectService: Get recent activity error:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Log new activity for solo project
   * @param {string} projectId - Solo project ID
   * @param {Object} activityData - Activity data (action, target, type, metadata)
   * @returns {Promise} - Created activity
   */
  static async logActivity(projectId, activityData) {
    try {
      console.log('🔄 SoloProjectService: Logging activity for project:', projectId);
      const response = await api.post(`/solo-projects/${projectId}/activity`, activityData);
      console.log('✅ SoloProjectService: Activity logged successfully');
      return response.data;
    } catch (error) {
      console.error('💥 SoloProjectService: Log activity error:', error.response?.data || error.message);
      throw error;
    }
  }

  // ===== GOALS METHODS =====

  /**
   * Get all goals for solo project
   * @param {string} projectId - Solo project ID
   * @param {Object} filters - Filter options (status, category, sort_by, sort_order)
   * @returns {Promise} - Goals list
   */
  static async getGoals(projectId, filters = {}) {
    try {
      console.log('🔄 SoloProjectService: Getting goals for project:', projectId);
      const params = new URLSearchParams();
      
      Object.keys(filters).forEach(key => {
        if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
          params.append(key, filters[key]);
        }
      });

      const response = await api.get(`/solo-projects/${projectId}/goals?${params.toString()}`);
      console.log('✅ SoloProjectService: Goals retrieved successfully');
      return response.data;
    } catch (error) {
      console.error('💥 SoloProjectService: Get goals error:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Create new goal for solo project
   * @param {string} projectId - Solo project ID
   * @param {Object} goalData - Goal data (title, description, priority, category, target_date)
   * @returns {Promise} - Created goal
   */
  static async createGoal(projectId, goalData) {
    try {
      console.log('🔄 SoloProjectService: Creating goal for project:', projectId);
      console.log('📝 SoloProjectService: Goal data:', goalData);
      
      const response = await api.post(`/solo-projects/${projectId}/goals`, goalData);
      console.log('✅ SoloProjectService: Goal created successfully');
      return response.data;
    } catch (error) {
      console.error('💥 SoloProjectService: Create goal error:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Update goal for solo project
   * @param {string} projectId - Solo project ID
   * @param {string} goalId - Goal ID
   * @param {Object} updateData - Updated goal data
   * @returns {Promise} - Updated goal
   */
  static async updateGoal(projectId, goalId, updateData) {
    try {
      console.log('🔄 SoloProjectService: Updating goal:', goalId, 'for project:', projectId);
      console.log('📝 SoloProjectService: Update data:', updateData);
      
      const response = await api.put(`/solo-projects/${projectId}/goals/${goalId}`, updateData);
      console.log('✅ SoloProjectService: Goal updated successfully');
      return response.data;
    } catch (error) {
      console.error('💥 SoloProjectService: Update goal error:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Delete goal from solo project
   * @param {string} projectId - Solo project ID
   * @param {string} goalId - Goal ID
   * @returns {Promise} - Success response
   */
  static async deleteGoal(projectId, goalId) {
    try {
      console.log('🔄 SoloProjectService: Deleting goal:', goalId, 'from project:', projectId);
      
      const response = await api.delete(`/solo-projects/${projectId}/goals/${goalId}`);
      console.log('✅ SoloProjectService: Goal deleted successfully');
      return response.data;
    } catch (error) {
      console.error('💥 SoloProjectService: Delete goal error:', error.response?.data || error.message);
      throw error;
    }
  }

  // ===== NOTES METHODS =====

  /**
   * Get all notes for solo project
   * @param {string} projectId - Solo project ID
   * @param {Object} filters - Filter options (category, search, sort_by, sort_order)
   * @returns {Promise} - Notes list
   */
  static async getNotes(projectId, filters = {}) {
    try {
      console.log('🔄 SoloProjectService: Getting notes for project:', projectId);
      const params = new URLSearchParams();
      
      Object.keys(filters).forEach(key => {
        if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
          params.append(key, filters[key]);
        }
      });

      const response = await api.get(`/solo-projects/${projectId}/notes?${params.toString()}`);
      console.log('✅ SoloProjectService: Notes retrieved successfully');
      return response.data;
    } catch (error) {
      console.error('💥 SoloProjectService: Get notes error:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Get specific note for solo project
   * @param {string} projectId - Solo project ID
   * @param {string} noteId - Note ID
   * @returns {Promise} - Note data
   */
  static async getNote(projectId, noteId) {
    try {
      console.log('🔄 SoloProjectService: Getting note:', noteId, 'for project:', projectId);
      
      const response = await api.get(`/solo-projects/${projectId}/notes/${noteId}`);
      console.log('✅ SoloProjectService: Note retrieved successfully');
      return response.data;
    } catch (error) {
      console.error('💥 SoloProjectService: Get note error:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Create new note for solo project
   * @param {string} projectId - Solo project ID
   * @param {Object} noteData - Note data (title, content, category)
   * @returns {Promise} - Created note
   */
  static async createNote(projectId, noteData) {
    try {
      console.log('🔄 SoloProjectService: Creating note for project:', projectId);
      console.log('📝 SoloProjectService: Note data:', noteData);
      
      const response = await api.post(`/solo-projects/${projectId}/notes`, noteData);
      console.log('✅ SoloProjectService: Note created successfully');
      return response.data;
    } catch (error) {
      console.error('💥 SoloProjectService: Create note error:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Update note for solo project
   * @param {string} projectId - Solo project ID
   * @param {string} noteId - Note ID
   * @param {Object} updateData - Updated note data
   * @returns {Promise} - Updated note
   */
  static async updateNote(projectId, noteId, updateData) {
    try {
      console.log('🔄 SoloProjectService: Updating note:', noteId, 'for project:', projectId);
      console.log('📝 SoloProjectService: Update data:', updateData);
      
      const response = await api.put(`/solo-projects/${projectId}/notes/${noteId}`, updateData);
      console.log('✅ SoloProjectService: Note updated successfully');
      return response.data;
    } catch (error) {
      console.error('💥 SoloProjectService: Update note error:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Delete note from solo project
   * @param {string} projectId - Solo project ID
   * @param {string} noteId - Note ID
   * @returns {Promise} - Success response
   */
  static async deleteNote(projectId, noteId) {
    try {
      console.log('🔄 SoloProjectService: Deleting note:', noteId, 'from project:', projectId);
      
      const response = await api.delete(`/solo-projects/${projectId}/notes/${noteId}`);
      console.log('✅ SoloProjectService: Note deleted successfully');
      return response.data;
    } catch (error) {
      console.error('💥 SoloProjectService: Delete note error:', error.response?.data || error.message);
      throw error;
    }
  }

  // ===== TIME TRACKING METHODS =====

  /**
   * Get time tracking data for solo project
   * @param {string} projectId - Solo project ID
   * @param {Object} filters - Filter options (date_from, date_to)
   * @returns {Promise} - Time tracking data with entries and summary
   */
  static async getTimeTracking(projectId, filters = {}) {
    try {
      console.log('🔄 SoloProjectService: Getting time tracking for project:', projectId);
      const params = new URLSearchParams();
      
      Object.keys(filters).forEach(key => {
        if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
          params.append(key, filters[key]);
        }
      });

      const response = await api.get(`/solo-projects/${projectId}/time-tracking?${params.toString()}`);
      console.log('✅ SoloProjectService: Time tracking data retrieved successfully');
      return response.data;
    } catch (error) {
      console.error('💥 SoloProjectService: Get time tracking error:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Log time entry for solo project
   * @param {string} projectId - Solo project ID
   * @param {Object} timeData - Time entry data (description, duration_minutes, activity_type)
   * @returns {Promise} - Created time entry
   */
  static async logTimeEntry(projectId, timeData) {
    try {
      console.log('🔄 SoloProjectService: Logging time entry for project:', projectId);
      console.log('⏱️ SoloProjectService: Time data:', timeData);
      
      const response = await api.post(`/solo-projects/${projectId}/time-tracking`, timeData);
      console.log('✅ SoloProjectService: Time entry logged successfully');
      return response.data;
    } catch (error) {
      console.error('💥 SoloProjectService: Log time entry error:', error.response?.data || error.message);
      throw error;
    }
  }

  // ===== PROJECT INFO METHODS =====

  /**
   * Get detailed project information for solo project
   * @param {string} projectId - Solo project ID
   * @returns {Promise} - Detailed project information
   */
  static async getProjectInfo(projectId) {
    try {
      console.log('🔄 SoloProjectService: Getting project info for project:', projectId);
      
      const response = await api.get(`/solo-projects/${projectId}/info`);
      console.log('✅ SoloProjectService: Project info retrieved successfully');
      return response.data;
    } catch (error) {
      console.error('💥 SoloProjectService: Get project info error:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Update project information for solo project
   * @param {string} projectId - Solo project ID
   * @param {Object} updateData - Updated project data
   * @returns {Promise} - Updated project information
   */
  static async updateProjectInfo(projectId, updateData) {
    try {
      console.log('🔄 SoloProjectService: Updating project info for project:', projectId);
      console.log('📝 SoloProjectService: Update data:', updateData);
      
      const response = await api.put(`/solo-projects/${projectId}/info`, updateData);
      console.log('✅ SoloProjectService: Project info updated successfully');
      return response.data;
    } catch (error) {
      console.error('💥 SoloProjectService: Update project info error:', error.response?.data || error.message);
      throw error;
    }
  }

  // ===== UTILITY METHODS =====

  /**
   * Format time duration from minutes to human readable format
   * @param {number} minutes - Duration in minutes
   * @returns {string} - Formatted duration (e.g., "2h 30m")
   */
  static formatDuration(minutes) {
    if (!minutes || minutes <= 0) return '0m';
    
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (hours === 0) {
      return `${remainingMinutes}m`;
    } else if (remainingMinutes === 0) {
      return `${hours}h`;
    } else {
      return `${hours}h ${remainingMinutes}m`;
    }
  }

  /**
   * Calculate completion percentage
   * @param {number} completed - Number of completed items
   * @param {number} total - Total number of items
   * @returns {number} - Completion percentage (0-100)
   */
  static calculateCompletionPercentage(completed, total) {
    if (!total || total === 0) return 0;
    return Math.round((completed / total) * 100);
  }

  /**
   * Format activity timestamp to relative time
   * @param {string|Date} timestamp - Activity timestamp
   * @returns {string} - Relative time (e.g., "2 hours ago")
   */
  static formatTimeAgo(timestamp) {
    const now = new Date();
    const diff = now - new Date(timestamp);
    
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const weeks = Math.floor(days / 7);
    const months = Math.floor(days / 30);
    
    if (months > 0) return `${months} month${months > 1 ? 's' : ''} ago`;
    if (weeks > 0) return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    return 'Just now';
  }

  /**
   * Get activity type icon
   * @param {string} activityType - Type of activity
   * @returns {string} - Emoji icon for the activity type
   */
  static getActivityTypeIcon(activityType) {
    const icons = {
      'task_completed': '✅',
      'task_started': '🚀',
      'task_created': '📝',
      'goal_created': '🎯',
      'goal_completed': '🏆',
      'note_created': '📄',
      'project_updated': '🔄',
      'file_uploaded': '📎',
      'time_logged': '⏰'
    };
    
    return icons[activityType] || '📋';
  }

  /**
   * Get priority color class
   * @param {string} priority - Priority level (low, medium, high)
   * @returns {string} - CSS color for priority
   */
  static getPriorityColor(priority) {
    const colors = {
      'low': '#28a745',      // Green
      'medium': '#ffc107',   // Yellow
      'high': '#dc3545'      // Red
    };
    
    return colors[priority] || colors.medium;
  }

  /**
   * Get status color class
   * @param {string} status - Status (active, completed, paused, etc.)
   * @returns {string} - CSS color for status
   */
  static getStatusColor(status) {
    const colors = {
      'active': '#007bff',     // Blue
      'completed': '#28a745',  // Green
      'paused': '#6c757d',     // Gray
      'todo': '#6c757d',       // Gray
      'in_progress': '#007bff', // Blue
      'in_review': '#ffc107',  // Yellow
      'blocked': '#dc3545'     // Red
    };
    
    return colors[status] || colors.active;
  }

  /**
   * Get category icon for goals/notes
   * @param {string} category - Category name
   * @param {string} type - 'goal' or 'note'
   * @returns {string} - Emoji icon for category
   */
  static getCategoryIcon(category, type = 'goal') {
    if (type === 'goal') {
      const goalIcons = {
        'learning': '📚',
        'feature': '⚡',
        'bug_fix': '🐛',
        'optimization': '⚡',
        'documentation': '📄',
        'testing': '🧪'
      };
      return goalIcons[category] || '🎯';
    } else {
      const noteIcons = {
        'general': '📝',
        'planning': '📋',
        'development': '💻',
        'learning': '📚',
        'ideas': '💡',
        'bugs': '🐛'
      };
      return noteIcons[category] || '📝';
    }
  }

  /**
   * Validate goal data before sending to API
   * @param {Object} goalData - Goal data to validate
   * @returns {Object} - { isValid: boolean, errors: string[] }
   */
  static validateGoalData(goalData) {
    const errors = [];
    
    if (!goalData.title || goalData.title.trim().length === 0) {
      errors.push('Goal title is required');
    }
    
    if (goalData.title && goalData.title.length > 200) {
      errors.push('Goal title must be 200 characters or less');
    }
    
    if (goalData.description && goalData.description.length > 1000) {
      errors.push('Goal description must be 1000 characters or less');
    }
    
    if (goalData.priority && !['low', 'medium', 'high'].includes(goalData.priority)) {
      errors.push('Invalid priority level');
    }
    
    if (goalData.category && !['learning', 'feature', 'bug_fix', 'optimization', 'documentation', 'testing'].includes(goalData.category)) {
      errors.push('Invalid goal category');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate note data before sending to API
   * @param {Object} noteData - Note data to validate
   * @returns {Object} - { isValid: boolean, errors: string[] }
   */
  static validateNoteData(noteData) {
    const errors = [];
    
    if (!noteData.title || noteData.title.trim().length === 0) {
      errors.push('Note title is required');
    }
    
    if (noteData.title && noteData.title.length > 200) {
      errors.push('Note title must be 200 characters or less');
    }
    
    if (!noteData.content || noteData.content.trim().length === 0) {
      errors.push('Note content is required');
    }
    
    if (noteData.category && !['general', 'planning', 'development', 'learning', 'ideas', 'bugs'].includes(noteData.category)) {
      errors.push('Invalid note category');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Format goal/note for display
   * @param {Object} item - Goal or note object
   * @param {string} type - 'goal' or 'note'
   * @returns {Object} - Formatted item with additional display properties
   */
  static formatForDisplay(item, type = 'goal') {
    return {
      ...item,
      formattedCreatedAt: this.formatTimeAgo(item.created_at),
      formattedUpdatedAt: this.formatTimeAgo(item.updated_at),
      categoryIcon: this.getCategoryIcon(item.category, type),
      priorityColor: type === 'goal' ? this.getPriorityColor(item.priority) : null,
      statusColor: type === 'goal' ? this.getStatusColor(item.status) : null
    };
  }
}

export default SoloProjectService;