// backend/routes/admin.js
const express = require('express');
const router = express.Router();
const { body, param, query, validationResult } = require('express-validator');
const AnalyticsService = require('../services/analyticsService');
const { DataSeeder } = require('../scripts/seedConfusionMatrixData');
const { ConfusionMatrixTester } = require('../scripts/testConfusionMatrix');

// Import controllers and middleware
const {
  getDashboardStats,
  getUsers,
  updateUser,
  deleteUser,  // Add this import
  getProjects,
  getChallenges,
  getSystemSettings,
  updateSystemSettings,
  getActivityLogs
} = require('../controllers/adminController');

const authMiddleware = require('../middleware/auth');
const { requireAdmin, requireModerator } = require('../middleware/adminAuth');

// Validation middleware
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// All admin routes require authentication
router.use(authMiddleware);

// Dashboard (Admin & Moderator)
router.get('/dashboard', requireModerator, getDashboardStats);

// User management (Admin only)
router.get('/users', requireAdmin, [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('search').optional().isLength({ min: 1, max: 100 }),
  query('role').optional().isIn(['user', 'admin', 'moderator']),
  query('status').optional().isIn(['active', 'inactive']),
  query('suspended').optional().isIn(['true', 'false'])
], handleValidationErrors, getUsers);

router.put('/users/:userId', requireAdmin, [
  param('userId').isUUID(),
  body('role').optional().isIn(['user', 'admin', 'moderator']),
  body('is_active').optional().isBoolean(),
  body('is_suspended').optional().isBoolean(),
  body('suspension_reason').optional().isLength({ max: 500 }),
  body('suspension_duration').optional().isInt({ min: 1, max: 525600 }) // max 1 year in minutes
], handleValidationErrors, updateUser);

// DELETE /admin/users/:userId - Delete user permanently (Admin only)
router.delete('/users/:userId', requireAdmin, [
  param('userId').isUUID().withMessage('Invalid user ID format')
], handleValidationErrors, deleteUser);

// DELETE /admin/users/:userId - Delete user permanently (Admin only)
router.delete('/users/:userId', requireAdmin, [
  param('userId').isUUID().withMessage('Invalid user ID format')
], handleValidationErrors, deleteUser);

// Project management (Admin & Moderator)
router.get('/projects', requireModerator, [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('search').optional().isLength({ min: 1, max: 100 }),
  query('status').optional().isIn(['recruiting', 'active', 'completed', 'paused', 'cancelled']),
  query('difficulty').optional().isIn(['easy', 'medium', 'hard', 'expert'])
], handleValidationErrors, getProjects);

// Challenge management (Admin & Moderator)
router.get('/challenges', requireModerator, [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('search').optional().isLength({ min: 1, max: 100 }),
  query('difficulty').optional().isIn(['easy', 'medium', 'hard', 'expert']),
  query('language').optional().isInt({ min: 1 }),
  query('is_active').optional().isIn(['true', 'false'])
], handleValidationErrors, getChallenges);

// System settings (Admin only)
router.get('/settings', requireAdmin, getSystemSettings);

router.put('/settings', requireAdmin, [
  body('settings').isObject().withMessage('Settings must be an object')
], handleValidationErrors, updateSystemSettings);

// Activity logs (Admin only)
router.get('/activity-logs', requireAdmin, [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 200 }),
  query('admin_id').optional().isUUID(),
  query('action').optional().isLength({ min: 1, max: 100 }),
  query('resource_type').optional().isLength({ min: 1, max: 50 }),
  query('date_from').optional().isISO8601(),
  query('date_to').optional().isISO8601()
], handleValidationErrors, getActivityLogs);

// Analytics endpoints (Admin only)
router.get('/analytics/user-growth', requireAdmin, async (req, res) => {
  try {
    const { timeframe = '30d' } = req.query;
    const data = await AnalyticsService.getUserGrowth(timeframe);
    res.json({ success: true, data });
  } catch (error) {
    console.error('User growth analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user growth analytics'
    });
  }
});

router.get('/analytics/project-stats', requireAdmin, async (req, res) => {
  try {
    const { timeframe = '30d' } = req.query;
    const data = await AnalyticsService.getProjectStats(timeframe);
    res.json({ success: true, data });
  } catch (error) {
    console.error('Project stats analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch project analytics'
    });
  }
});

router.get('/analytics/challenge-performance', requireAdmin, async (req, res) => {
  try {
    const { timeframe = '30d' } = req.query;
    const data = await AnalyticsService.getChallengePerformance(timeframe);
    res.json({ success: true, data });
  } catch (error) {
    console.error('Challenge performance analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch challenge analytics'
    });
  }
});

// Development/Testing endpoints (Admin only, only in development)
if (process.env.NODE_ENV === 'development') {
  // Seed confusion matrix data
  router.post('/dev/seed-confusion-matrix', requireAdmin, async (req, res) => {
    try {
      const { userCount = 50, projectCount = 20 } = req.body;
      await DataSeeder.seedConfusionMatrixData(userCount, projectCount);
      res.json({
        success: true,
        message: `Seeded confusion matrix data for ${userCount} users and ${projectCount} projects`
      });
    } catch (error) {
      console.error('Seeding error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to seed confusion matrix data',
        error: error.message
      });
    }
  });

  // Test confusion matrix
  router.post('/dev/test-confusion-matrix', requireAdmin, async (req, res) => {
    try {
      const { userId, limit = 10 } = req.body;
      
      if (!userId) {
        return res.status(400).json({
          success: false,
          message: 'User ID is required'
        });
      }

      const results = await ConfusionMatrixTester.testUserRecommendations(userId, limit);
      res.json({
        success: true,
        data: results
      });
    } catch (error) {
      console.error('Confusion matrix test error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to test confusion matrix',
        error: error.message
      });
    }
  });

  // Clear all confusion matrix data
  router.delete('/dev/clear-confusion-matrix', requireAdmin, async (req, res) => {
    try {
      await DataSeeder.clearConfusionMatrixData();
      res.json({
        success: true,
        message: 'Cleared all confusion matrix data'
      });
    } catch (error) {
      console.error('Clear data error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to clear confusion matrix data',
        error: error.message
      });
    }
  });
}

// Error handling middleware for this router
router.use((error, req, res, next) => {
  console.error('Admin router error:', error);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

module.exports = router;