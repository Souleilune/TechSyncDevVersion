// backend/controllers/suggestionsController.js
const supabase = require('../config/supabase');

// Get all programming languages for suggestions
const getProgrammingLanguages = async (req, res) => {
  try {
    const { data: languages, error } = await supabase
      .from('programming_languages')
      .select('id, name, description')
      .eq('is_active', true)
      .order('usage_count', { ascending: false })
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

// Get all topics for suggestions
const getTopics = async (req, res) => {
  try {
    const { data: topics, error } = await supabase
      .from('topics')
      .select('id, name, category, description')
      .eq('is_active', true)
      .order('usage_count', { ascending: false })
      .order('name');

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

// Search programming languages (for more dynamic suggestions)
const searchProgrammingLanguages = async (req, res) => {
  try {
    const { q } = req.query; // search query
    
    let query = supabase
      .from('programming_languages')
      .select('id, name, description')
      .eq('is_active', true)
      .order('usage_count', { ascending: false })
      .limit(20);

    if (q && q.length > 0) {
      query = query.ilike('name', `%${q}%`);
    }

    const { data: languages, error } = await query;

    if (error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to search programming languages',
        error: error.message
      });
    }

    res.json({
      success: true,
      data: languages
    });

  } catch (error) {
    console.error('Search programming languages error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Search topics (for more dynamic suggestions)
const searchTopics = async (req, res) => {
  try {
    const { q } = req.query; // search query
    
    let query = supabase
      .from('topics')
      .select('id, name, category, description')
      .eq('is_active', true)
      .order('usage_count', { ascending: false })
      .limit(20);

    if (q && q.length > 0) {
      query = query.ilike('name', `%${q}%`);
    }

    const { data: topics, error } = await query;

    if (error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to search topics',
        error: error.message
      });
    }

    res.json({
      success: true,
      data: topics
    });

  } catch (error) {
    console.error('Search topics error:', error);
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
  searchProgrammingLanguages,
  searchTopics
};