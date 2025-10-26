// frontend/src/services/profileUpdateAPI.js
import api from './api';

class ProfileUpdateAPI {
  /**
   * Request to add a new programming language
   * Returns a coding challenge that must be completed
   */
  static async requestAddLanguage(languageId, proficiencyLevel) {
    try {
      const response = await api.post('/profile-update/languages/request', {
        language_id: languageId,
        proficiency_level: proficiencyLevel
      });
      return response.data;
    } catch (error) {
      console.error('Error requesting add language:', error);
      throw error;
    }
  }

  /**
   * Verify challenge completion and add language to profile
   */
  static async verifyAndAddLanguage(languageId, proficiencyLevel, challengeId, attemptId, yearsExperience = 0) {
    try {
      const response = await api.post('/profile-update/languages/verify', {
        language_id: languageId,
        proficiency_level: proficiencyLevel,
        challenge_id: challengeId,
        attempt_id: attemptId,
        years_experience: yearsExperience
      });
      return response.data;
    } catch (error) {
      console.error('Error verifying and adding language:', error);
      throw error;
    }
  }

  /**
   * Remove a programming language from profile
   */
  static async removeLanguage(languageId) {
    try {
      const response = await api.delete(`/profile-update/languages/${languageId}`);
      return response.data;
    } catch (error) {
      console.error('Error removing language:', error);
      throw error;
    }
  }

  /**
   * Update proficiency level of an existing language
   */
  static async updateLanguageProficiency(languageId, proficiencyLevel, yearsExperience) {
    try {
      const response = await api.put(`/profile-update/languages/${languageId}`, {
        proficiency_level: proficiencyLevel,
        years_experience: yearsExperience
      });
      return response.data;
    } catch (error) {
      console.error('Error updating language proficiency:', error);
      throw error;
    }
  }

  /**
   * Add a new topic (area of interest) to profile
   */
  static async addTopic(topicId, interestLevel, experienceLevel = 'beginner') {
    try {
      const response = await api.post('/profile-update/topics', {
        topic_id: topicId,
        interest_level: interestLevel,
        experience_level: experienceLevel
      });
      return response.data;
    } catch (error) {
      console.error('Error adding topic:', error);
      throw error;
    }
  }

  /**
   * Remove a topic from profile
   */
  static async removeTopic(topicId) {
    try {
      const response = await api.delete(`/profile-update/topics/${topicId}`);
      return response.data;
    } catch (error) {
      console.error('Error removing topic:', error);
      throw error;
    }
  }

  /**
   * Update interest level of an existing topic
   */
  static async updateTopicInterest(topicId, interestLevel, experienceLevel) {
    try {
      const response = await api.put(`/profile-update/topics/${topicId}`, {
        interest_level: interestLevel,
        experience_level: experienceLevel
      });
      return response.data;
    } catch (error) {
      console.error('Error updating topic interest:', error);
      throw error;
    }
  }
}

export default ProfileUpdateAPI;