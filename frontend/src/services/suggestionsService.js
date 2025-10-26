// frontend/src/services/suggestionsService.js
import api from './api';

export const suggestionsService = {
  // Get all programming languages
  getProgrammingLanguages: async () => {
    try {
      const response = await api.get('/suggestions/programming-languages');
      const languages = response.data.data || [];
      
      // Backend now returns objects with id, name, description
      return languages;
    } catch (error) {
      console.error('Error fetching programming languages:', error);
      return [];
    }
  },

  // Get all topics
  getTopics: async () => {
    try {
      const response = await api.get('/suggestions/topics');
      const topics = response.data.data || [];
      
      // Backend now returns objects with id, name, category, description
      return topics;
    } catch (error) {
      console.error('Error fetching topics:', error);
      return [];
    }
  },

  // Search programming languages
  searchProgrammingLanguages: async (query) => {
    try {
      const response = await api.get(`/suggestions/programming-languages/search?q=${encodeURIComponent(query)}`);
      return response.data.data || [];
    } catch (error) {
      console.error('Error searching programming languages:', error);
      return [];
    }
  },

  // Search topics
  searchTopics: async (query) => {
    try {
      const response = await api.get(`/suggestions/topics/search?q=${encodeURIComponent(query)}`);
      return response.data.data || [];
    } catch (error) {
      console.error('Error searching topics:', error);
      return [];
    }
  }
};