// backend/controllers/onboardingController.js

const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

// Get all programming languages
const getProgrammingLanguages = async (req, res) => {
  try {
    const { data: languages, error } = await supabase
      .from('programming_languages')
      .select('*')
      .order('name');

    if (error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch programming languages',
        error: error.message
      });
    }

    res.json({
      success: true,
      data: languages
    });

  } catch (error) {
    console.error('Get programming languages error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get all topics
const getTopics = async (req, res) => {
  try {
    const { data: topics, error } = await supabase
      .from('topics')
      .select('*')
      .order('category', { ascending: true })
      .order('name', { ascending: true });

    if (error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch topics',
        error: error.message
      });
    }

    res.json({
      success: true,
      data: topics
    });

  } catch (error) {
    console.error('Get topics error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Save user's programming languages
const saveUserLanguages = async (req, res) => {
  try {
    const { languages } = req.body;
    const userId = req.user.id;

    console.log('Saving user languages for user:', userId);
    console.log('Languages data:', languages);

    if (!languages || !Array.isArray(languages) || languages.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Languages array is required'
      });
    }

    // First, delete existing user languages (in case of re-onboarding)
    const { error: deleteError } = await supabase
      .from('user_programming_languages')
      .delete()
      .eq('user_id', userId);

    if (deleteError) {
      console.error('Error deleting existing languages:', deleteError);
    }

    // Insert new languages
    const languageData = languages.map(lang => ({
      user_id: userId,
      language_id: lang.language_id,
      proficiency_level: lang.proficiency_level || 'intermediate',
      years_experience: lang.years_experience || 0,
      created_at: new Date().toISOString()
    }));

    console.log('Inserting language data:', languageData);

    const { data: savedLanguages, error: insertError } = await supabase
      .from('user_programming_languages')
      .insert(languageData)
      .select(`
        *,
        programming_languages (id, name, description)
      `);

    if (insertError) {
      console.error('Error saving languages:', insertError);
      return res.status(500).json({
        success: false,
        message: 'Failed to save languages',
        error: insertError.message
      });
    }

    res.json({
      success: true,
      message: 'Languages saved successfully',
      data: savedLanguages
    });

  } catch (error) {
    console.error('Save user languages error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Save user's topics of interest
const saveUserTopics = async (req, res) => {
  try {
    const { topics } = req.body;
    const userId = req.user.id;

    console.log('Saving user topics for user:', userId);
    console.log('Topics data:', topics);

    if (!topics || !Array.isArray(topics) || topics.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Topics array is required'
      });
    }

    // First, delete existing user topics (in case of re-onboarding)
    const { error: deleteError } = await supabase
      .from('user_topics')
      .delete()
      .eq('user_id', userId);

    if (deleteError) {
      console.error('Error deleting existing topics:', deleteError);
    }

    // Insert new topics
    const topicData = topics.map(topic => ({
      user_id: userId,
      topic_id: topic.topic_id,
      interest_level: topic.interest_level || 'medium',
      experience_level: topic.experience_level || 'beginner',
      created_at: new Date().toISOString()
    }));

    console.log('Inserting topic data:', topicData);

    const { data: savedTopics, error: insertError } = await supabase
      .from('user_topics')
      .insert(topicData)
      .select(`
        *,
        topics (id, name, category)
      `);

    if (insertError) {
      console.error('Error saving topics:', insertError);
      return res.status(500).json({
        success: false,
        message: 'Failed to save topics',
        error: insertError.message
      });
    }

    res.json({
      success: true,
      message: 'Topics saved successfully',
      data: savedTopics
    });

  } catch (error) {
    console.error('Save user topics error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// FIXED: Complete onboarding - save all data and mark user as onboarded
const completeOnboarding = async (req, res) => {
  try {
    const userId = req.user.id;
    const { languages, topics, years_experience } = req.body;

    console.log('Completing onboarding for user:', userId);
    console.log('Onboarding data:', { languages, topics, years_experience });

    // Validate input
    if (!languages || !Array.isArray(languages) || languages.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Languages array is required and must not be empty'
      });
    }

    if (!topics || !Array.isArray(topics) || topics.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Topics array is required and must not be empty'
      });
    }

    // Start transaction-like approach (multiple operations)
    
    // 1. Delete existing user languages and topics (for re-onboarding)
    const { error: deleteLanguagesError } = await supabase
      .from('user_programming_languages')
      .delete()
      .eq('user_id', userId);

    const { error: deleteTopicsError } = await supabase
      .from('user_topics')
      .delete()
      .eq('user_id', userId);

    if (deleteLanguagesError) {
      console.error('Error deleting existing languages:', deleteLanguagesError);
    }
    if (deleteTopicsError) {
      console.error('Error deleting existing topics:', deleteTopicsError);
    }

    // 2. Insert user's programming languages
    const languageData = languages.map(lang => ({
      user_id: userId,
      language_id: lang.language_id,
      proficiency_level: lang.proficiency_level || 'intermediate',
      years_experience: lang.years_experience || 0,
      created_at: new Date().toISOString()
    }));

    const { data: savedLanguages, error: languageInsertError } = await supabase
      .from('user_programming_languages')
      .insert(languageData)
      .select(`
        *,
        programming_languages (id, name, description)
      `);

    if (languageInsertError) {
      console.error('Error saving languages during onboarding:', languageInsertError);
      return res.status(500).json({
        success: false,
        message: 'Failed to save programming languages',
        error: languageInsertError.message
      });
    }

    // 3. Insert user's topics
    const topicData = topics.map(topic => ({
      user_id: userId,
      topic_id: topic.topic_id,
      interest_level: topic.interest_level || 'medium',
      experience_level: topic.experience_level || 'beginner',
      created_at: new Date().toISOString()
    }));

    const { data: savedTopics, error: topicInsertError } = await supabase
      .from('user_topics')
      .insert(topicData)
      .select(`
        *,
        topics (id, name, category)
      `);

    if (topicInsertError) {
      console.error('Error saving topics during onboarding:', topicInsertError);
      return res.status(500).json({
        success: false,
        message: 'Failed to save topics',
        error: topicInsertError.message
      });
    }

    // 4. Update user profile with years of experience and mark onboarding as complete
    const { data: updatedUser, error: updateUserError } = await supabase
      .from('users')
      .update({
        years_experience: years_experience || 0,
        updated_at: new Date().toISOString(),
        // Note: We don't need a separate 'is_onboarded' field since we check languages/topics existence
      })
      .eq('id', userId)
      .select(`
        id, username, email, full_name, bio, github_username, linkedin_url, 
        years_experience, role, created_at, updated_at, avatar_url
      `)
      .single();

    if (updateUserError) {
      console.error('Error updating user during onboarding completion:', updateUserError);
      return res.status(500).json({
        success: false,
        message: 'Failed to complete onboarding',
        error: updateUserError.message
      });
    }

    // 5. Return complete user profile with onboarding data
    const completeUser = {
      ...updatedUser,
      needsOnboarding: false, // User has just completed onboarding
      programming_languages: savedLanguages || [],
      topics: savedTopics || []
    };

    console.log('Onboarding completed successfully for user:', userId);

    res.json({
      success: true,
      message: 'Onboarding completed successfully',
      data: { 
        user: completeUser
      }
    });

  } catch (error) {
    console.error('Complete onboarding error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during onboarding completion',
      error: error.message
    });
  }
};

// Get user's current onboarding data
const getUserOnboardingData = async (req, res) => {
  try {
    const userId = req.user.id;

    console.log('Getting onboarding data for user:', userId);

    // Get user's programming languages
    const { data: languages, error: langError } = await supabase
      .from('user_programming_languages')
      .select(`
        *,
        programming_languages (id, name)
      `)
      .eq('user_id', userId);

    if (langError) {
      console.error('Error fetching user languages:', langError);
    }

    // Get user's topics
    const { data: topics, error: topicError } = await supabase
      .from('user_topics')
      .select(`
        *,
        topics (id, name, category)
      `)
      .eq('user_id', userId);

    if (topicError) {
      console.error('Error fetching user topics:', topicError);
    }

    res.json({
      success: true,
      data: {
        languages: languages || [],
        topics: topics || []
      }
    });

  } catch (error) {
    console.error('Get user onboarding data error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

module.exports = {
  getProgrammingLanguages,
  getTopics,
  saveUserLanguages,
  saveUserTopics,
  completeOnboarding,
  getUserOnboardingData
};