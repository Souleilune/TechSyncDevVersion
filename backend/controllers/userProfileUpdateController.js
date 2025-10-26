// backend/controllers/userProfileUpdateController.js
const supabase = require('../config/supabase');

/**
 * Request to add a new programming language
 * This generates a coding challenge that the user must complete
 */
const requestAddLanguage = async (req, res) => {
  try {
    const userId = req.user.id;
    const { language_id, proficiency_level } = req.body;

    // Validate input
    if (!language_id || !proficiency_level) {
      return res.status(400).json({
        success: false,
        message: 'Language ID and proficiency level are required'
      });
    }

    // Check if language exists
    const { data: language, error: langError } = await supabase
      .from('programming_languages')
      .select('*')
      .eq('id', language_id)
      .eq('is_active', true)
      .single();

    if (langError || !language) {
      return res.status(404).json({
        success: false,
        message: 'Programming language not found'
      });
    }

    // Check if user already has this language
    const { data: existingLang } = await supabase
      .from('user_programming_languages')
      .select('id')
      .eq('user_id', userId)
      .eq('language_id', language_id)
      .single();

    if (existingLang) {
      return res.status(400).json({
        success: false,
        message: 'You already have this programming language in your profile'
      });
    }

    // Map proficiency level to difficulty for challenge selection
    const difficultyMap = {
      'beginner': 'easy',
      'intermediate': 'medium',
      'advanced': 'hard',
      'expert': 'expert'
    };
    const difficulty = difficultyMap[proficiency_level] || 'medium';

    // Get a random challenge for this language and difficulty
    const { data: challenges, error: challengeError } = await supabase
      .from('coding_challenges')
      .select('*')
      .eq('programming_language_id', language_id)
      .eq('difficulty_level', difficulty)
      .eq('is_active', true)
      .limit(10);

    if (challengeError || !challenges || challenges.length === 0) {
      // Fallback: try to get any challenge for this language
      const { data: fallbackChallenges, error: fallbackError } = await supabase
        .from('coding_challenges')
        .select('*')
        .eq('programming_language_id', language_id)
        .eq('is_active', true)
        .limit(10);

      if (fallbackError || !fallbackChallenges || fallbackChallenges.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'No challenges available for this programming language. Please contact support.'
        });
      }

      // Pick a random challenge from fallback
      const randomChallenge = fallbackChallenges[Math.floor(Math.random() * fallbackChallenges.length)];
      
      return res.json({
        success: true,
        data: {
          challenge: randomChallenge,
          language: language,
          proficiency_level: proficiency_level,
          message: 'Complete this coding challenge to verify your proficiency'
        }
      });
    }

    // Pick a random challenge from the list
    const randomChallenge = challenges[Math.floor(Math.random() * challenges.length)];

    res.json({
      success: true,
      data: {
        challenge: randomChallenge,
        language: language,
        proficiency_level: proficiency_level,
        message: 'Complete this coding challenge to verify your proficiency'
      }
    });

  } catch (error) {
    console.error('Request add language error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

/**
 * Verify challenge completion and add language to user profile
 */
const verifyAndAddLanguage = async (req, res) => {
  try {
    const userId = req.user.id;
    const { 
      language_id, 
      proficiency_level, 
      challenge_id, 
      attempt_id,
      years_experience 
    } = req.body;

    // Validate input
    if (!language_id || !proficiency_level || !challenge_id || !attempt_id) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    // Verify that the attempt exists and was successful
    const { data: attempt, error: attemptError } = await supabase
      .from('user_challenge_attempts')
      .select('*')
      .eq('id', attempt_id)
      .eq('user_id', userId)
      .eq('challenge_id', challenge_id)
      .eq('status', 'passed')
      .single();

    if (attemptError || !attempt) {
      return res.status(400).json({
        success: false,
        message: 'Challenge not completed or verification failed. Please complete the challenge first.'
      });
    }

    // Check if user already has this language (double-check)
    const { data: existingLang } = await supabase
      .from('user_programming_languages')
      .select('id')
      .eq('user_id', userId)
      .eq('language_id', language_id)
      .single();

    if (existingLang) {
      return res.status(400).json({
        success: false,
        message: 'You already have this programming language in your profile'
      });
    }

    // Add the language to user's profile
    const { data: newLanguage, error: insertError } = await supabase
      .from('user_programming_languages')
      .insert({
        user_id: userId,
        language_id: language_id,
        proficiency_level: proficiency_level,
        years_experience: years_experience || 0,
        created_at: new Date().toISOString()
      })
      .select(`
        *,
        programming_languages (id, name, description)
      `)
      .single();

    if (insertError) {
      console.error('Error adding language:', insertError);
      return res.status(500).json({
        success: false,
        message: 'Failed to add programming language',
        error: insertError.message
      });
    }

    res.json({
      success: true,
      message: `Successfully added ${newLanguage.programming_languages.name} to your profile!`,
      data: newLanguage
    });

  } catch (error) {
    console.error('Verify and add language error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

/**
 * Remove a programming language from user profile
 */
const removeLanguage = async (req, res) => {
  try {
    const userId = req.user.id;
    const { language_id } = req.params;

    if (!language_id) {
      return res.status(400).json({
        success: false,
        message: 'Language ID is required'
      });
    }

    // Check if the language exists in user's profile
    const { data: existingLang } = await supabase
      .from('user_programming_languages')
      .select('*')
      .eq('user_id', userId)
      .eq('language_id', language_id)
      .single();

    if (!existingLang) {
      return res.status(404).json({
        success: false,
        message: 'Programming language not found in your profile'
      });
    }

    // Delete the language
    const { error: deleteError } = await supabase
      .from('user_programming_languages')
      .delete()
      .eq('user_id', userId)
      .eq('language_id', language_id);

    if (deleteError) {
      console.error('Error removing language:', deleteError);
      return res.status(500).json({
        success: false,
        message: 'Failed to remove programming language',
        error: deleteError.message
      });
    }

    res.json({
      success: true,
      message: 'Programming language removed successfully'
    });

  } catch (error) {
    console.error('Remove language error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

/**
 * Add a topic (area of interest) to user profile
 */
const addTopic = async (req, res) => {
  try {
    const userId = req.user.id;
    const { topic_id, interest_level, experience_level } = req.body;

    // Validate input
    if (!topic_id || !interest_level) {
      return res.status(400).json({
        success: false,
        message: 'Topic ID and interest level are required'
      });
    }

    // Check if topic exists
    const { data: topic, error: topicError } = await supabase
      .from('topics')
      .select('*')
      .eq('id', topic_id)
      .eq('is_active', true)
      .single();

    if (topicError || !topic) {
      return res.status(404).json({
        success: false,
        message: 'Topic not found'
      });
    }

    // Check if user already has this topic
    const { data: existingTopic } = await supabase
      .from('user_topics')
      .select('id')
      .eq('user_id', userId)
      .eq('topic_id', topic_id)
      .single();

    if (existingTopic) {
      return res.status(400).json({
        success: false,
        message: 'You already have this topic in your profile'
      });
    }

    // Add the topic to user's profile
    const { data: newTopic, error: insertError } = await supabase
      .from('user_topics')
      .insert({
        user_id: userId,
        topic_id: topic_id,
        interest_level: interest_level,
        experience_level: experience_level || 'beginner',
        created_at: new Date().toISOString()
      })
      .select(`
        *,
        topics (id, name, description, category)
      `)
      .single();

    if (insertError) {
      console.error('Error adding topic:', insertError);
      return res.status(500).json({
        success: false,
        message: 'Failed to add topic',
        error: insertError.message
      });
    }

    res.json({
      success: true,
      message: `Successfully added ${newTopic.topics.name} to your interests!`,
      data: newTopic
    });

  } catch (error) {
    console.error('Add topic error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

/**
 * Remove a topic from user profile
 */
const removeTopic = async (req, res) => {
  try {
    const userId = req.user.id;
    const { topic_id } = req.params;

    if (!topic_id) {
      return res.status(400).json({
        success: false,
        message: 'Topic ID is required'
      });
    }

    // Check if the topic exists in user's profile
    const { data: existingTopic } = await supabase
      .from('user_topics')
      .select('*')
      .eq('user_id', userId)
      .eq('topic_id', topic_id)
      .single();

    if (!existingTopic) {
      return res.status(404).json({
        success: false,
        message: 'Topic not found in your profile'
      });
    }

    // Delete the topic
    const { error: deleteError } = await supabase
      .from('user_topics')
      .delete()
      .eq('user_id', userId)
      .eq('topic_id', topic_id);

    if (deleteError) {
      console.error('Error removing topic:', deleteError);
      return res.status(500).json({
        success: false,
        message: 'Failed to remove topic',
        error: deleteError.message
      });
    }

    res.json({
      success: true,
      message: 'Topic removed successfully'
    });

  } catch (error) {
    console.error('Remove topic error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

/**
 * Update proficiency level of an existing language
 */
const updateLanguageProficiency = async (req, res) => {
  try {
    const userId = req.user.id;
    const { language_id } = req.params;
    const { proficiency_level, years_experience } = req.body;

    if (!proficiency_level) {
      return res.status(400).json({
        success: false,
        message: 'Proficiency level is required'
      });
    }

    // Validate proficiency level
    const validLevels = ['beginner', 'intermediate', 'advanced', 'expert'];
    if (!validLevels.includes(proficiency_level)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid proficiency level'
      });
    }

    // Check if the language exists in user's profile
    const { data: existingLang } = await supabase
      .from('user_programming_languages')
      .select('*')
      .eq('user_id', userId)
      .eq('language_id', language_id)
      .single();

    if (!existingLang) {
      return res.status(404).json({
        success: false,
        message: 'Programming language not found in your profile'
      });
    }

    // Update the language proficiency
    const updateData = {
      proficiency_level: proficiency_level
    };
    
    if (years_experience !== undefined) {
      updateData.years_experience = years_experience;
    }

    const { data: updatedLang, error: updateError } = await supabase
      .from('user_programming_languages')
      .update(updateData)
      .eq('user_id', userId)
      .eq('language_id', language_id)
      .select(`
        *,
        programming_languages (id, name, description)
      `)
      .single();

    if (updateError) {
      console.error('Error updating language:', updateError);
      return res.status(500).json({
        success: false,
        message: 'Failed to update programming language',
        error: updateError.message
      });
    }

    res.json({
      success: true,
      message: 'Programming language updated successfully',
      data: updatedLang
    });

  } catch (error) {
    console.error('Update language proficiency error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

/**
 * Update interest level of an existing topic
 */
const updateTopicInterest = async (req, res) => {
  try {
    const userId = req.user.id;
    const { topic_id } = req.params;
    const { interest_level, experience_level } = req.body;

    if (!interest_level) {
      return res.status(400).json({
        success: false,
        message: 'Interest level is required'
      });
    }

    // Validate interest level
    const validLevels = ['low', 'medium', 'high'];
    if (!validLevels.includes(interest_level)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid interest level'
      });
    }

    // Check if the topic exists in user's profile
    const { data: existingTopic } = await supabase
      .from('user_topics')
      .select('*')
      .eq('user_id', userId)
      .eq('topic_id', topic_id)
      .single();

    if (!existingTopic) {
      return res.status(404).json({
        success: false,
        message: 'Topic not found in your profile'
      });
    }

    // Update the topic interest
    const updateData = {
      interest_level: interest_level
    };
    
    if (experience_level !== undefined) {
      const validExpLevels = ['beginner', 'intermediate', 'advanced', 'expert'];
      if (validExpLevels.includes(experience_level)) {
        updateData.experience_level = experience_level;
      }
    }

    const { data: updatedTopic, error: updateError } = await supabase
      .from('user_topics')
      .update(updateData)
      .eq('user_id', userId)
      .eq('topic_id', topic_id)
      .select(`
        *,
        topics (id, name, description, category)
      `)
      .single();

    if (updateError) {
      console.error('Error updating topic:', updateError);
      return res.status(500).json({
        success: false,
        message: 'Failed to update topic',
        error: updateError.message
      });
    }

    res.json({
      success: true,
      message: 'Topic updated successfully',
      data: updatedTopic
    });

  } catch (error) {
    console.error('Update topic interest error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

module.exports = {
  requestAddLanguage,
  verifyAndAddLanguage,
  removeLanguage,
  addTopic,
  removeTopic,
  updateLanguageProficiency,
  updateTopicInterest
};