// frontend/src/services/aiChatService.js - Enhanced with tasks support
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

export const aiChatService = {
  // Send message to AI chat
  sendMessage: async (message, conversationHistory = [], token) => {
    setAuthToken(token);
    const response = await api.post('/ai-chat', { 
      message, 
      conversationHistory 
    });
    return response.data;
  },

  // Generate project ideas
  generateProjectIdeas: async (userPreferences = {}, token) => {
    setAuthToken(token);
    const response = await api.post('/ai-chat/generate-project', userPreferences);
    return response.data;
  },

  // ENHANCED: Create project from AI response with tasks
  createProjectFromResponse: async (projectData, token) => {
    setAuthToken(token);
    
    console.log('═══════════════════════════════════════════════');
    console.log('🔄 AI CHAT SERVICE - CREATE PROJECT');
    console.log('═══════════════════════════════════════════════');
    console.log('📥 projectData.tasks:', projectData.tasks?.length || 0);
    if (projectData.tasks && projectData.tasks.length > 0) {
      console.log('📋 Input task titles:', projectData.tasks.map(t => t.title));
    }
    console.log('═══════════════════════════════════════════════');
    
    // Format the data to match backend API expectations
    const formattedProjectData = {
      title: projectData.title,
      description: projectData.description,
      detailed_description: projectData.detailed_description,
      required_experience_level: projectData.required_experience_level || 'beginner',
      maximum_members: projectData.maximum_members || 1,
      estimated_duration_weeks: projectData.estimated_duration_weeks || null,
      difficulty_level: projectData.difficulty_level || 'medium',
      github_repo_url: projectData.github_repo_url || null,
      deadline: projectData.deadline || null,
      programming_languages: projectData.programming_languages || ['JavaScript'],
      topics: projectData.topics || ['Web Development'],
      project_type: 'solo',
      // NEW: Include tasks array
      tasks: projectData.tasks || []
    };
    
    console.log('═══════════════════════════════════════════════');
    console.log('📤 FORMATTED PROJECT DATA');
    console.log('═══════════════════════════════════════════════');
    console.log('📦 formattedProjectData.tasks:', formattedProjectData.tasks?.length || 0);
    if (formattedProjectData.tasks && formattedProjectData.tasks.length > 0) {
      console.log('📋 Formatted task titles:', formattedProjectData.tasks.map(t => t.title));
    }
    console.log('📨 Sending POST to /api/ai-chat/create-project');
    console.log('═══════════════════════════════════════════════');
    
    // Send to backend AI chat project creation endpoint
    const response = await api.post('/ai-chat/create-project', { 
      projectData: formattedProjectData 
    });
    
    return response.data;
  },

  // Get conversation history
  getConversationHistory: async (userId, token) => {
    setAuthToken(token);
    const response = await api.get(`/ai-chat/history/${userId}`);
    return response.data;
  },

  // Save conversation
  saveConversation: async (conversationData, token) => {
    setAuthToken(token);
    const response = await api.post('/ai-chat/save-conversation', conversationData);
    return response.data;
  }
};

export default aiChatService;