// backend/routes/users.js
const express = require('express');
const router = express.Router();
const { param, validationResult } = require('express-validator');
const authMiddleware = require('../middleware/auth');
const supabase = require('../config/supabase');

// Validation middleware
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation errors',
      errors: errors.array()
    });
  }
  next();
};

// GET /api/users/:userId - Get public user info (requires authentication)
router.get('/:userId',
  authMiddleware,
  [
    param('userId')
      .isUUID()
      .withMessage('User ID must be a valid UUID')
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const { userId } = req.params;

      console.log('📋 Fetching user info for:', userId);

      // Get basic public user information
      const { data: user, error } = await supabase
        .from('users')
        .select(`
          id,
          username,
          full_name,
          email,
          avatar_url,
          years_experience,
          github_username,
          created_at
        `)
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching user:', error);
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      console.log('✅ Found user:', user.username || user.email);

      res.json({
        success: true,
        user: user
      });

    } catch (error) {
      console.error('💥 Get user error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }
);

module.exports = router;