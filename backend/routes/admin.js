// backend/routes/admin.js - FIXED VERSION
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
  deleteUser,
  getProjects,
  getChallenges,
  getSystemSettings,
  updateSystemSettings,
  getActivityLogs
} = require('../controllers/adminController');

// Import challenge controller functions for admin use
const {
  createChallenge,
  updateChallenge,
  deleteChallenge
} = require('../controllers/challengeController');

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

// Challenge validation - FIXED to use programming_language_id (integer) not programming_language (string)
const challengeValidation = [
  body('title').isString().isLength({ min: 1, max: 200 }).withMessage('Title must be between 1 and 200 characters'),
  body('description').isString().isLength({ min: 1, max: 5000 }).withMessage('Description must be between 1 and 5000 characters'),
  body('difficulty_level').isIn(['easy', 'medium', 'hard', 'expert']).withMessage('Difficulty must be easy|medium|hard|expert'),
  body('programming_language_id').optional().isInt({ min: 1 }).withMessage('Programming language ID must be a positive integer'),
  body('time_limit_minutes').optional().isInt({ min: 1, max: 480 }).withMessage('Time limit must be between 1 and 480 minutes'),
  body('is_active').optional().isBoolean(),
  body('test_cases').optional(),
  body('starter_code').optional().isLength({ max: 10000 }),
  body('expected_solution').optional().isLength({ max: 50000 }),
  body('project_id').optional().isUUID().withMessage('Project ID must be a valid UUID if provided')
];

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

// ===== CHALLENGE MANAGEMENT (Admin & Moderator) - FIXED =====

// GET /admin/challenges - Get all challenges with filters
router.get('/challenges', requireModerator, [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('search').optional().isLength({ min: 1, max: 100 }),
  query('difficulty_level').optional().isIn(['easy', 'medium', 'hard', 'expert']),
  query('programming_language_id').optional().isInt({ min: 1 }),
  query('is_active').optional().isIn(['true', 'false'])
], handleValidationErrors, getChallenges);

// POST /admin/challenges - Create new challenge
router.post('/challenges', requireModerator, challengeValidation, handleValidationErrors, createChallenge);

// PUT /admin/challenges/:id - Update challenge
router.put('/challenges/:id', requireModerator, [
  param('id').isUUID().withMessage('Challenge ID must be a valid UUID'),
  ...challengeValidation
], handleValidationErrors, updateChallenge);

// DELETE /admin/challenges/:id - Delete challenge
router.delete('/challenges/:id', requireModerator, [
  param('id').isUUID().withMessage('Challenge ID must be a valid UUID')
], handleValidationErrors, deleteChallenge);

// System settings (Admin only)
router.get('/settings', requireAdmin, getSystemSettings);

router.put('/settings', requireAdmin, [
  body('settings').isObject().withMessage('Settings must be an object')
], handleValidationErrors, updateSystemSettings);

// Activity logs (Admin only)
router.get('/activity-logs', requireAdmin, [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('action').optional().isString(),
  query('resource_type').optional().isString(),
  query('date_from').optional().isISO8601(),
  query('date_to').optional().isISO8601()
], handleValidationErrors, getActivityLogs);

// Analytics routes
router.get('/analytics/overview', requireAdmin, async (req, res) => {
  try {
    const overview = await AnalyticsService.getOverviewMetrics();
    res.json({ success: true, data: overview });
  } catch (error) {
    console.error('Analytics overview error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch analytics', error: error.message });
  }
});

router.get('/analytics/confusion-matrix', requireAdmin, async (req, res) => {
  try {
    const { from, to } = req.query;
    const matrix = await AnalyticsService.getConfusionMatrixData(from, to);
    res.json({ success: true, data: matrix });
  } catch (error) {
    console.error('Confusion matrix error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch confusion matrix', error: error.message });
  }
});

// Development/Testing routes (only in development)
if (process.env.NODE_ENV !== 'production') {
  router.post('/dev/seed-confusion-matrix', requireAdmin, async (req, res) => {
    try {
      const seeder = new DataSeeder();
      const result = await seeder.seedAll();
      res.json({ success: true, data: result });
    } catch (error) {
      console.error('Seed error:', error);
      res.status(500).json({ success: false, message: 'Seeding failed', error: error.message });
    }
  });

  router.get('/dev/test-confusion-matrix', requireAdmin, async (req, res) => {
    try {
      const tester = new ConfusionMatrixTester();
      const result = await tester.runAllTests();
      res.json({ success: true, data: result });
    } catch (error) {
      console.error('Test error:', error);
      res.status(500).json({ success: false, message: 'Testing failed', error: error.message });
    }
  });
}

module.exports = router;