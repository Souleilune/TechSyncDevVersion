// frontend/src/services/awardsService.js
import api from './api';

const awardsService = {
  // Get all awards for the authenticated user
  getUserAwards: async (projectId = null) => {
    try {
      const params = projectId ? { projectId } : {};
      const response = await api.get('/awards', { params });
      return response.data;
    } catch (error) {
      console.error('Get user awards error:', error.response?.data || error.message);
      throw error;
    }
  },

  // Get awards for a specific project
  getProjectAwards: async (projectId) => {
    try {
      const response = await api.get(`/awards/project/${projectId}`);
      return response.data;
    } catch (error) {
      console.error('Get project awards error:', error.response?.data || error.message);
      throw error;
    }
  },

  // Get award statistics for profile
  getAwardStatistics: async () => {
    try {
      const response = await api.get('/awards/statistics');
      return response.data;
    } catch (error) {
      console.error('Get award statistics error:', error.response?.data || error.message);
      throw error;
    }
  },

  // Check and award project completion
  checkProjectCompletion: async (projectId) => {
    try {
      const response = await api.post(`/awards/check/completion/${projectId}`);
      return response.data;
    } catch (error) {
      console.error('Check project completion error:', error.response?.data || error.message);
      throw error;
    }
  },

  // Check and award weekly challenge completion
  checkWeeklyChallenges: async (projectId) => {
    try {
      const response = await api.post(`/awards/check/challenges/${projectId}`);
      return response.data;
    } catch (error) {
      console.error('Check weekly challenges error:', error.response?.data || error.message);
      throw error;
    }
  }
};

export default awardsService;