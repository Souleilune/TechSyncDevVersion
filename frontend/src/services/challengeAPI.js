// frontend/src/services/challengeAPI.js - FIXED ROUTES
import api from './api';

class ChallengeAPI {
  /**
   * Create a new coding challenge
   * @param {Object} challengeData - Challenge data
   * @returns {Promise} - Created challenge
   */
  static async createChallenge(challengeData) {
    try {
      const response = await api.post('/challenges', challengeData);
      return response.data;
    } catch (error) {
      console.error('Error creating challenge:', error);
      throw error;
    }
  }

  /**
   * Get all challenges with filters - FIXED with proper parameter handling
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
   * Admin: Get all challenges (admin route) - FIXED
   * @param {Object} filters - Filter parameters
   * @returns {Promise} - Array of challenges for admin
   */
  static async getAdminChallenges(filters = {}) {
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

      const response = await api.get('/admin/challenges', { params: cleanParams });
      return response.data;
    } catch (error) {
      console.error('Error fetching admin challenges:', error);
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
   * Update a challenge
   * @param {string} challengeId - Challenge ID
   * @param {Object} updateData - Updated challenge data
   * @returns {Promise} - Updated challenge
   */
  static async updateChallenge(challengeId, updateData) {
    try {
      const response = await api.put(`/challenges/${challengeId}`, updateData);
      return response.data;
    } catch (error) {
      console.error('Error updating challenge:', error);
      throw error;
    }
  }

  /**
   * Delete a challenge
   * @param {string} challengeId - Challenge ID
   * @returns {Promise} - Deletion confirmation
   */
  static async deleteChallenge(challengeId) {
    try {
      const response = await api.delete(`/challenges/${challengeId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting challenge:', error);
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
   * Get next challenge for user
   * @param {Object} params - Parameters (programming_language_id, project_id)
   * @returns {Promise} - Next challenge
   */
  static async getNextChallenge(params = {}) {
    try {
      // params can include: programming_language_id, project_id
      const response = await api.get('/challenges/next', { params });
      return response.data;  // { success, data: { challenge, reason, diagnostics } }
    } catch (error) {
      console.error('Error fetching next challenge:', error);
      throw error;
    }
  }

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

  /**
   * Get all programming languages - FIXED with multiple fallback endpoints
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

  // ===== PROJECT RECRUITMENT CHALLENGE ROUTES (FIXED) =====

  /**
   * Get project challenge (for recruitment) - FIXED ROUTE
   * @param {string} projectId - Project ID
   * @returns {Promise} - Project challenge details
   */
  static async getProjectChallenge(projectId) {
    try {
      // FIXED: Use correct backend route
      const response = await api.get(`/challenges/project/${projectId}/challenge`);
      return response.data;
    } catch (error) {
      console.error('Error fetching project challenge:', error);
      throw error;
    }
  }

  /**
   * Check if user can attempt challenge - FIXED ROUTE
   * @param {string} projectId - Project ID
   * @returns {Promise} - Attempt eligibility
   */
  static async canAttemptChallenge(projectId) {
    try {
      // FIXED: Use correct backend route
      const response = await api.get(`/challenges/project/${projectId}/can-attempt`);
      return response.data;
    } catch (error) {
      console.error('Error checking challenge attempt eligibility:', error);
      throw error;
    }
  }

  /**
   * Submit challenge attempt - FIXED ROUTE
   * @param {string} projectId - Project ID
   * @param {Object} attemptData - Attempt submission data
   * @returns {Promise} - Submission result
   */
  static async submitChallengeAttempt(projectId, attemptData) {
    try {
      // FIXED: Use correct backend route
      const response = await api.post(`/challenges/project/${projectId}/attempt`, attemptData);
      return response.data;
    } catch (error) {
      console.error('Error submitting challenge attempt:', error);
      throw error;
    }
  }

  /**
   * Get failed attempts count for project - NEW METHOD
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
   * Submit a simple challenge attempt (for solo weekly challenges) - NEW METHOD
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
}

export default ChallengeAPI;