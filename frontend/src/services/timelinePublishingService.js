// frontend/src/services/timelinePublishingService.js
import api from './api';

class TimelinePublishingService {
  
  /**
   * Check if project is published to timeline
   * @param {string} projectId - Project ID
   * @returns {Promise} - Timeline post status
   */
  static async getTimelineStatus(projectId) {
    try {
      console.log('🔄 Checking timeline status for project:', projectId);
      const response = await api.get(`/solo-projects/${projectId}/timeline`);
      console.log('✅ Timeline status retrieved');
      return response.data;
    } catch (error) {
      console.error('💥 Get timeline status error:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Publish project to timeline
   * @param {string} projectId - Project ID
   * @param {Object} publishData - { githubUrl, liveDemoUrl, visibility, customMessage }
   * @returns {Promise} - Created timeline post
   */
  static async publishToTimeline(projectId, publishData = {}) {
    try {
      console.log('📤 Publishing to timeline:', projectId);
      const response = await api.post(`/solo-projects/${projectId}/timeline`, publishData);
      console.log('✅ Published to timeline successfully');
      return response.data;
    } catch (error) {
      console.error('💥 Publish to timeline error:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Update timeline post
   * @param {string} projectId - Project ID
   * @param {Object} updateData - { githubUrl, liveDemoUrl, visibility, customMessage }
   * @returns {Promise} - Updated timeline post
   */
  static async updateTimelinePost(projectId, updateData) {
    try {
      console.log('✏️ Updating timeline post:', projectId);
      const response = await api.put(`/solo-projects/${projectId}/timeline`, updateData);
      console.log('✅ Timeline post updated successfully');
      return response.data;
    } catch (error) {
      console.error('💥 Update timeline post error:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Delete/unpublish timeline post
   * @param {string} projectId - Project ID
   * @returns {Promise} - Success message
   */
  static async deleteTimelinePost(projectId) {
    try {
      console.log('🗑️ Deleting timeline post:', projectId);
      const response = await api.delete(`/solo-projects/${projectId}/timeline`);
      console.log('✅ Timeline post deleted successfully');
      return response.data;
    } catch (error) {
      console.error('💥 Delete timeline post error:', error.response?.data || error.message);
      throw error;
    }
  }
}

export default TimelinePublishingService;