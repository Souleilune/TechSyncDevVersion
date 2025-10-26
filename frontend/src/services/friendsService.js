// frontend/src/services/friendsService.js
import api from './api';

export const friendsService = {
  // Send friend request
  sendFriendRequest: async (addresseeId) => {
    try {
      const response = await api.post('/friends/request', { addresseeId });
      return response.data;
    } catch (error) {
      console.error('Send friend request error:', error.response?.data || error.message);
      throw error;
    }
  },

  // Get user's friends and friend requests
  getFriends: async () => {
    try {
      const response = await api.get('/friends');
      return response.data;
    } catch (error) {
      console.error('Get friends error:', error.response?.data || error.message);
      throw error;
    }
  },

  // Get friend's profile with achievements and awards
  getFriendProfile: async (userId) => {
    try {
      const response = await api.get(`/friends/${userId}/profile`);
      return response.data;
    } catch (error) {
      console.error('Get friend profile error:', error.response?.data || error.message);
      throw error;
    }
  },

  // Accept friend request
  acceptFriendRequest: async (friendshipId) => {
    try {
      const response = await api.put(`/friends/${friendshipId}/accept`);
      return response.data;
    } catch (error) {
      console.error('Accept friend request error:', error.response?.data || error.message);
      throw error;
    }
  },

  // Reject friend request
  rejectFriendRequest: async (friendshipId) => {
    try {
      const response = await api.delete(`/friends/${friendshipId}/reject`);
      return response.data;
    } catch (error) {
      console.error('Reject friend request error:', error.response?.data || error.message);
      throw error;
    }
  },

  // Remove friend
  removeFriend: async (friendshipId) => {
    try {
      const response = await api.delete(`/friends/${friendshipId}`);
      return response.data;
    } catch (error) {
      console.error('Remove friend error:', error.response?.data || error.message);
      throw error;
    }
  }
};