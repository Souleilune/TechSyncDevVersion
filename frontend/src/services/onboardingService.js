import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests
const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

export const onboardingService = {
  // Get all programming languages (public endpoint)
  getProgrammingLanguages: async () => {
    const response = await api.get('/onboarding/programming-languages');
    return response.data;
  },

  // Get all topics (public endpoint)
  getTopics: async () => {
    const response = await api.get('/onboarding/topics');
    return response.data;
  },

  // Save user's programming languages (requires auth)
  saveUserLanguages: async (languages, token) => {
    setAuthToken(token);
    const response = await api.post('/onboarding/languages', { languages });
    return response.data;
  },

  // Save user's topics (requires auth)
  saveUserTopics: async (topics, token) => {
    setAuthToken(token);
    const response = await api.post('/onboarding/topics', { topics });
    return response.data;
  },

  // Update user's years of experience (requires auth)
  updateUserExperience: async (years_experience, token) => {
    setAuthToken(token);
    const response = await api.put('/onboarding/experience', { years_experience });
    return response.data;
  },

  // Complete entire onboarding process at once (requires auth)
  completeOnboarding: async (onboardingData, token) => {
    setAuthToken(token);
    const response = await api.post('/onboarding/complete', onboardingData);
    return response.data;
  }
};