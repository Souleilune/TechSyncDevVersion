// frontend/src/services/collaborativeProjectCompletionService.js
import api from './api';

const collaborativeProjectCompletionService = {
  /**
   * Get project completion status and voting information
   * @param {string} projectId - Project UUID
   * @returns {Promise} - Completion status data
   */
  getCompletionStatus: async (projectId) => {
    try {
      const response = await api.get(`/projects/${projectId}/completion-status`);
      return response.data;
    } catch (error) {
      console.error('Get completion status error:', error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Mark project as complete (owner/lead only)
   * @param {string} projectId - Project UUID
   * @param {boolean} skipValidation - Skip 80% completion check (optional)
   * @returns {Promise} - Completion result
   */
  markProjectComplete: async (projectId, skipValidation = false) => {
    try {
      const response = await api.post(`/projects/${projectId}/complete`, {
        skip_validation: skipValidation
      });
      return response.data;
    } catch (error) {
      console.error('Mark project complete error:', error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Check if project should auto-complete (all tasks done)
   * @param {string} projectId - Project UUID
   * @returns {Promise} - Auto-complete check result
   */
  checkAutoComplete: async (projectId) => {
    try {
      const response = await api.post(`/projects/${projectId}/check-auto-complete`);
      return response.data;
    } catch (error) {
      console.error('Check auto-complete error:', error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Vote on project completion
   * @param {string} projectId - Project UUID
   * @param {string} vote - 'approve' or 'reject'
   * @returns {Promise} - Vote result
   */
  voteOnCompletion: async (projectId, vote) => {
    try {
      if (!['approve', 'reject'].includes(vote)) {
        throw new Error('Vote must be either "approve" or "reject"');
      }

      const response = await api.post(`/projects/${projectId}/completion-vote`, {
        vote: vote
      });
      return response.data;
    } catch (error) {
      console.error('Vote on completion error:', error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Get all votes for project completion
   * @param {string} projectId - Project UUID
   * @returns {Promise} - Votes data
   */
  getCompletionVotes: async (projectId) => {
    try {
      const response = await api.get(`/projects/${projectId}/completion-votes`);
      return response.data;
    } catch (error) {
      console.error('Get completion votes error:', error.response?.data || error.message);
      throw error;
    }
  }
};

export default collaborativeProjectCompletionService;