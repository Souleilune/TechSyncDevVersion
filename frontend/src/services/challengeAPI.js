// frontend/src/services/challengeAPI.js - COMPLETE FIXED VERSION
import api from './api';

class ChallengeAPI {
  // ===== HELPER METHOD =====
  
  /**
   * Check if current user is admin or moderator
   * @returns {boolean} - True if user is admin/moderator
   */
  static isAdminUser() {
    try {
      const userData = localStorage.getItem('user');
      if (!userData) return false;
      
      const user = JSON.parse(userData);
      return user.role === 'admin' || user.role === 'moderator';
    } catch (error) {
      console.warn('Failed to parse user data:', error);
      return false;
    }
  }

  // ===== ADMIN-SPECIFIC METHODS =====

  /**
   * Admin: Get all challenges (admin route)
   * @param {Object} filters - Filter parameters
   * @returns {Promise} - Array of challenges for admin
   */
  static async getAdminChallenges(filters = {}) {
    try {
      // Clean and validate parameters before sending
      const cleanParams = {};
      
      // Use difficulty_level (matching backend)
      if (filters.difficulty_level && filters.difficulty_level !== '') {
        cleanParams.difficulty_level = filters.difficulty_level;
      }
      
      // Use programming_language_id (matching backend)
      if (filters.programming_language_id && filters.programming_language_id !== '') {
        const langId = parseInt(filters.programming_language_id);
        if (!isNaN(langId) && langId > 0) {
          cleanParams.programming_language_id = langId;
        }
      }
      
      // Add search parameter
      if (filters.search && filters.search.trim() !== '') {
        cleanParams.search = filters.search.trim();
      }

      // Add is_active filter if provided
      if (filters.is_active !== undefined && filters.is_active !== '') {
        cleanParams.is_active = filters.is_active;
      }

      // Add pagination defaults if not provided
      if (!cleanParams.page) cleanParams.page = 1;
      if (!cleanParams.limit) cleanParams.limit = 20;

      console.log('Fetching admin challenges with params:', cleanParams);

      const response = await api.get('/admin/challenges', { params: cleanParams });
      return response.data;
    } catch (error) {
      console.error('Error fetching admin challenges:', error);
      throw error;
    }
  }

  /**
   * Admin: Create a new challenge (admin route)
   * @param {Object} challengeData - Challenge data
   * @returns {Promise} - Created challenge
   */
  static async createAdminChallenge(challengeData) {
    try {
      const response = await api.post('/admin/challenges', challengeData);
      return response.data;
    } catch (error) {
      console.error('Error creating admin challenge:', error);
      throw error;
    }
  }

  /**
   * Admin: Update a challenge (admin route)
   * @param {string} challengeId - Challenge ID
   * @param {Object} updateData - Updated challenge data
   * @returns {Promise} - Updated challenge
   */
  static async updateAdminChallenge(challengeId, updateData) {
    try {
      const response = await api.put(`/admin/challenges/${challengeId}`, updateData);
      return response.data;
    } catch (error) {
      console.error('Error updating admin challenge:', error);
      throw error;
    }
  }

  /**
   * Admin: Delete a challenge (admin route)
   * @param {string} challengeId - Challenge ID
   * @returns {Promise} - Deletion confirmation
   */
  static async deleteAdminChallenge(challengeId) {
    try {
      const response = await api.delete(`/admin/challenges/${challengeId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting admin challenge:', error);
      throw error;
    }
  }

  // ===== STANDARD CHALLENGE METHODS (WITH ADMIN ROUTING) =====

  /**
   * Create a new coding challenge
   * Routes to admin endpoint if user is admin/moderator
   * @param {Object} challengeData - Challenge data
   * @returns {Promise} - Created challenge
   */
  static async createChallenge(challengeData) {
    try {
      // Check if user is admin/moderator and route accordingly
      if (this.isAdminUser()) {
        return await this.createAdminChallenge(challengeData);
      } else {
        const response = await api.post('/challenges', challengeData);
        return response.data;
      }
    } catch (error) {
      console.error('Error creating challenge:', error);
      throw error;
    }
  }

  /**
   * Update a challenge
   * Routes to admin endpoint if user is admin/moderator
   * @param {string} challengeId - Challenge ID
   * @param {Object} updateData - Updated challenge data
   * @returns {Promise} - Updated challenge
   */
  static async updateChallenge(challengeId, updateData) {
    try {
      // Check if user is admin/moderator and route accordingly
      if (this.isAdminUser()) {
        return await this.updateAdminChallenge(challengeId, updateData);
      } else {
        const response = await api.put(`/challenges/${challengeId}`, updateData);
        return response.data;
      }
    } catch (error) {
      console.error('Error updating challenge:', error);
      throw error;
    }
  }

  /**
   * Delete a challenge
   * Routes to admin endpoint if user is admin/moderator
   * @param {string} challengeId - Challenge ID
   * @returns {Promise} - Deletion confirmation
   */
  static async deleteChallenge(challengeId) {
    try {
      // Check if user is admin/moderator and route accordingly
      if (this.isAdminUser()) {
        return await this.deleteAdminChallenge(challengeId);
      } else {
        const response = await api.delete(`/challenges/${challengeId}`);
        return response.data;
      }
    } catch (error) {
      console.error('Error deleting challenge:', error);
      throw error;
    }
  }

  /**
   * Get all challenges with filters
   * @param {Object} filters - Filter parameters
   * @returns {Promise} - Array of challenges
   */
  static async getChallenges(filters = {}) {
    try {
      // Clean and validate parameters before sending
      const cleanParams = {};
      
      if (filters.difficulty_level && filters.difficulty_level !== '') {
        cleanParams.difficulty_level = filters.difficulty_level;
      }
      
      if (filters.programming_language_id && filters.programming_language_id !== '') {
        const langId = parseInt(filters.programming_language_id);
        if (!isNaN(langId) && langId > 0) {
          cleanParams.programming_language_id = langId;
        }
      }
      
      if (filters.search && filters.search.trim() !== '') {
        cleanParams.search = filters.search.trim();
      }

      // Add pagination defaults if not provided
      if (!cleanParams.page) cleanParams.page = 1;
      if (!cleanParams.limit) cleanParams.limit = 20;

      const response = await api.get('/challenges', { params: cleanParams });
      return response.data;
    } catch (error) {
      console.error('Error fetching challenges:', error);
      throw error;
    }
  }

  /**
   * Get challenge by ID
   * @param {string} challengeId - Challenge ID
   * @returns {Promise} - Challenge details
   */
  static async getChallengeById(challengeId) {
    try {
      const response = await api.get(`/challenges/${challengeId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching challenge:', error);
      throw error;
    }
  }

  /**
   * Get challenges by programming language
   * @param {number} languageId - Language ID
   * @param {Object} filters - Additional filters
   * @returns {Promise} - Array of challenges
   */
  static async getChallengesByLanguage(languageId, filters = {}) {
    try {
      const cleanParams = {};
      
      if (filters.difficulty_level && filters.difficulty_level !== '') {
        cleanParams.difficulty_level = filters.difficulty_level;
      }
      
      if (filters.project_id && filters.project_id !== '') {
        cleanParams.project_id = filters.project_id;
      }
      
      if (filters.search && filters.search.trim() !== '') {
        cleanParams.search = filters.search.trim();
      }

      if (!cleanParams.page) cleanParams.page = 1;
      if (!cleanParams.limit) cleanParams.limit = 20;

      const response = await api.get(`/challenges/language/${languageId}`, { params: cleanParams });
      return response.data;
    } catch (error) {
      console.error('Error fetching challenges by language:', error);
      throw error;
    }
  }

  /**
   * Get next challenge for user (adaptive difficulty)
   * @param {Object} params - Parameters (programming_language_id, project_id)
   * @returns {Promise} - Next challenge
   */
  static async getNextChallenge(params = {}) {
    try {
      const response = await api.get('/challenges/next', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching next challenge:', error);
      throw error;
    }
  }

  // ===== USER ATTEMPT METHODS =====

  /**
   * Get user's challenge attempts
   * @param {Object} params - Parameters (page, limit, etc.)
   * @returns {Promise} - Array of user attempts
   */
  static async getUserAttempts(params = {}) {
    try {
      const cleanParams = {
        page: params.page || 1,
        limit: params.limit || 20
      };

      const response = await api.get('/challenges/attempts', { params: cleanParams });
      return response.data;
    } catch (error) {
      console.error('Error fetching user attempts:', error);
      throw error;
    }
  }

  /**
   * Get user's challenge statistics
   * @returns {Promise} - User challenge stats
   */
  static async getUserStats() {
    try {
      const response = await api.get('/challenges/stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching user stats:', error);
      throw error;
    }
  }

  /**
 * Attempt a challenge (for profile language verification)
 * This method submits a challenge attempt for language verification purposes
 * @param {string} challengeId - Challenge ID
 * @param {Object} attemptData - Attempt submission data
 * @param {string} attemptData.solution_code - The submitted solution code
 * @param {number} attemptData.programming_language_id - Programming language ID
 * @returns {Promise} - Submission result with attempt details
 */
static async attemptChallenge(challengeId, attemptData) {
  try {
    const response = await api.post('/challenges/submit', {
      challenge_id: challengeId,
      submitted_code: attemptData.solution_code,
      programming_language_id: attemptData.programming_language_id
    });
    return response.data;
  } catch (error) {
    console.error('Error attempting challenge:', error);
    throw error;
  }
}

  /**
   * Get attempt details by ID
   * @param {string} attemptId - Attempt ID
   * @returns {Promise} - Attempt details
   */
  static async getAttemptDetails(attemptId) {
    try {
      const response = await api.get(`/challenges/attempts/${attemptId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching attempt details:', error);
      throw error;
    }
  }

  // ===== PROJECT RECRUITMENT CHALLENGE METHODS =====

  /**
   * Get project challenge (for recruitment)
   * @param {string} projectId - Project ID
   * @returns {Promise} - Project challenge details
   */
  static async getProjectChallenge(projectId) {
    try {
      const response = await api.get(`/challenges/project/${projectId}/challenge`);
      return response.data;
    } catch (error) {
      console.error('Error fetching project challenge:', error);
      throw error;
    }
  }

  /**
   * Check if user can attempt challenge
   * @param {string} projectId - Project ID
   * @returns {Promise} - Attempt eligibility
   */
  static async canAttemptChallenge(projectId) {
    try {
      const response = await api.get(`/challenges/project/${projectId}/can-attempt`);
      return response.data;
    } catch (error) {
      console.error('Error checking challenge attempt eligibility:', error);
      throw error;
    }
  }

  /**
   * Submit challenge attempt for project recruitment
   * @param {string} projectId - Project ID
   * @param {Object} attemptData - Attempt submission data
   * @returns {Promise} - Submission result
   */
  static async submitChallengeAttempt(projectId, attemptData) {
    try {
      const response = await api.post(`/challenges/project/${projectId}/attempt`, attemptData);
      return response.data;
    } catch (error) {
      console.error('Error submitting challenge attempt:', error);
      throw error;
    }
  }

  /**
   * Get failed attempts count for project
   * @param {string} projectId - Project ID
   * @returns {Promise} - Failed attempts count and alert info
   */
  static async getFailedAttemptsCount(projectId) {
    try {
      const response = await api.get(`/challenges/project/${projectId}/failed-attempts-count`);
      return response.data;
    } catch (error) {
      console.error('Error fetching failed attempts count:', error);
      throw error;
    }
  }

  /**
   * Submit a simple challenge attempt (for solo weekly challenges)
   * @param {Object} attemptData - Attempt data (challenge_id, submitted_code, etc.)
   * @returns {Promise} - Submission result
   */
  static async submitSimpleChallenge(attemptData) {
    try {
      const response = await api.post('/challenges/submit', attemptData);
      return response.data;
    } catch (error) {
      console.error('Error submitting simple challenge:', error);
      throw error;
    }
  }

  // ===== HELPER DATA METHODS =====

  /**
   * Get all programming languages with multiple fallback endpoints
   * @returns {Promise} - Array of programming languages
   */
  static async getProgrammingLanguages() {
    try {
      // Try multiple endpoints in order of preference
      const endpoints = [
        '/onboarding/programming-languages',
        '/suggestions/programming-languages',
        '/admin/programming-languages'
      ];

      let lastError;
      for (const endpoint of endpoints) {
        try {
          const response = await api.get(endpoint);
          // Handle different response structures
          return {
            success: true,
            data: response.data?.data || response.data?.languages || response.data || []
          };
        } catch (error) {
          lastError = error;
          console.log(`Endpoint ${endpoint} failed, trying next...`);
          continue;
        }
      }

      // If all endpoints fail, throw the last error
      throw lastError;
    } catch (error) {
      console.error('Error fetching programming languages:', error);
      throw error;
    }
  }

  /**
   * Get all topics
   * @returns {Promise} - Array of topics
   */
  static async getTopics() {
    try {
      // Try multiple endpoints
      const endpoints = [
        '/onboarding/topics',
        '/suggestions/topics'
      ];

      let lastError;
      for (const endpoint of endpoints) {
        try {
          const response = await api.get(endpoint);
          return {
            success: true,
            data: response.data?.data || response.data?.topics || response.data || []
          };
        } catch (error) {
          lastError = error;
          console.log(`Topic endpoint ${endpoint} failed, trying next...`);
          continue;
        }
      }

      throw lastError;
    } catch (error) {
      console.error('Error fetching topics:', error);
      throw error;
    }
  }
}

export default ChallengeAPI;