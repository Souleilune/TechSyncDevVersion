// backend/routes/soloProjectRoutes.js
const express = require('express');
const { body, param, query, validationResult } = require('express-validator');
const authMiddleware = require('../middleware/auth');
const soloProjectController = require('../controllers/soloProjectController');

const router = express.Router();

// Validation middleware
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log('❌ Solo Project validation errors:', errors.array());
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// Common validation rules
const projectIdValidation = [
  param('projectId')
    .isUUID()
    .withMessage('Project ID must be a valid UUID')
];

// Goal validation rules
const createGoalValidation = [
  body('title')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Goal title must be between 1 and 200 characters'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Goal description must not exceed 1000 characters'),
  
  body('target_date')
    .optional()
    .isISO8601()
    .withMessage('Target date must be a valid date'),
  
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high'])
    .withMessage('Priority must be low, medium, or high'),
  
  body('category')
    .optional()
    .isIn(['learning', 'feature', 'bug_fix', 'optimization', 'documentation', 'testing'])
    .withMessage('Invalid goal category')
];

// Note validation rules
const createNoteValidation = [
  body('title')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Note title must be between 1 and 200 characters'),
  
  body('content')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Note content is required'),
  
  body('category')
    .optional()
    .isIn(['general', 'planning', 'development', 'learning', 'ideas', 'bugs'])
    .withMessage('Invalid note category')
];

// Activity log validation
const createActivityValidation = [
  body('action')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Action must be between 1 and 100 characters'),
  
  body('target')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Target must be between 1 and 200 characters'),
  
  body('type')
    .isIn(['task_completed', 'task_started', 'task_created', 'goal_created', 'note_created', 'project_updated', 'file_uploaded'])
    .withMessage('Invalid activity type')
];

// All routes require authentication
router.use(authMiddleware);

// ===== DASHBOARD ROUTES =====

// GET /api/solo-projects/:projectId/dashboard - Get dashboard data
router.get(
  '/:projectId/dashboard',
  projectIdValidation,
  handleValidationErrors,
  soloProjectController.getDashboardData
);

// GET /api/solo-projects/:projectId/recent-activity - Get recent activity
router.get(
  '/:projectId/recent-activity',
  projectIdValidation,
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
  handleValidationErrors,
  soloProjectController.getRecentActivity
);

// POST /api/solo-projects/:projectId/activity - Log new activity
router.post(
  '/:projectId/activity',
  projectIdValidation,
  createActivityValidation,
  handleValidationErrors,
  soloProjectController.logActivity
);

// ===== GOALS ROUTES =====

// GET /api/solo-projects/:projectId/goals - Get all goals
router.get(
  '/:projectId/goals',
  projectIdValidation,
  query('status').optional().isIn(['active', 'completed', 'paused', 'todo', 'in_progress', 'in_review', 'blocked']).withMessage('Invalid status filter'),
  query('category').optional().isIn(['learning', 'feature', 'bug_fix', 'optimization', 'documentation', 'testing']).withMessage('Invalid category filter'),
  handleValidationErrors,
  soloProjectController.getGoals
);

// POST /api/solo-projects/:projectId/goals - Create new goal
router.post(
  '/:projectId/goals',
  projectIdValidation,
  createGoalValidation,
  handleValidationErrors,
  soloProjectController.createGoal
);

// PUT /api/solo-projects/:projectId/goals/:goalId - Update goal
router.put(
  '/:projectId/goals/:goalId',
  projectIdValidation,
  param('goalId').isUUID().withMessage('Goal ID must be a valid UUID'),
  body('title').optional().trim().isLength({ min: 1, max: 200 }).withMessage('Goal title must be between 1 and 200 characters'),
  body('description').optional().trim().isLength({ max: 1000 }).withMessage('Goal description must not exceed 1000 characters'),
  body('status').optional().isIn(['active', 'completed', 'paused', 'todo', 'in_progress', 'in_review', 'blocked']).withMessage('Invalid status'),
  body('priority').optional().isIn(['low', 'medium', 'high']).withMessage('Invalid priority'),
  handleValidationErrors,
  soloProjectController.updateGoal
);

// DELETE /api/solo-projects/:projectId/goals/:goalId - Delete goals
router.delete(
  '/:projectId/goals/:goalId',
  projectIdValidation,
  param('goalId').isUUID().withMessage('Goal ID must be a valid UUID'),
  handleValidationErrors,
  soloProjectController.deleteGoal
);

// ===== NOTES ROUTES =====

// GET /api/solo-projects/:projectId/notes - Get all notes
router.get(
  '/:projectId/notes',
  projectIdValidation,
  query('category').optional().isIn(['general', 'planning', 'development', 'learning', 'ideas', 'bugs']).withMessage('Invalid category filter'),
  query('search').optional().trim().isLength({ min: 1 }).withMessage('Search term must not be empty'),
  query('sort_by').optional().isIn(['created_at', 'updated_at', 'title']).withMessage('Invalid sort field'),
  query('sort_order').optional().isIn(['asc', 'desc']).withMessage('Sort order must be asc or desc'),
  handleValidationErrors,
  soloProjectController.getNotes
);

// POST /api/solo-projects/:projectId/notes - Create new note
router.post(
  '/:projectId/notes',
  projectIdValidation,
  createNoteValidation,
  handleValidationErrors,
  soloProjectController.createNote
);

// GET /api/solo-projects/:projectId/notes/:noteId - Get specific note
router.get(
  '/:projectId/notes/:noteId',
  projectIdValidation,
  param('noteId').isUUID().withMessage('Note ID must be a valid UUID'),
  handleValidationErrors,
  soloProjectController.getNote
);

// PUT /api/solo-projects/:projectId/notes/:noteId - Update note
router.put(
  '/:projectId/notes/:noteId',
  projectIdValidation,
  param('noteId').isUUID().withMessage('Note ID must be a valid UUID'),
  body('title').optional().trim().isLength({ min: 1, max: 200 }).withMessage('Note title must be between 1 and 200 characters'),
  body('content').optional().trim().isLength({ min: 1 }).withMessage('Note content cannot be empty'),
  body('category').optional().isIn(['general', 'planning', 'development', 'learning', 'ideas', 'bugs']).withMessage('Invalid note category'),
  handleValidationErrors,
  soloProjectController.updateNote
);

// DELETE /api/solo-projects/:projectId/notes/:noteId - Delete note
router.delete(
  '/:projectId/notes/:noteId',
  projectIdValidation,
  param('noteId').isUUID().withMessage('Note ID must be a valid UUID'),
  handleValidationErrors,
  soloProjectController.deleteNote
);

// ===== TIME TRACKING ROUTES =====

// GET /api/solo-projects/:projectId/time-tracking - Get time tracking data
router.get(
  '/:projectId/time-tracking',
  projectIdValidation,
  query('date_from').optional().isISO8601().withMessage('Invalid date format'),
  query('date_to').optional().isISO8601().withMessage('Invalid date format'),
  handleValidationErrors,
  soloProjectController.getTimeTracking
);

// POST /api/solo-projects/:projectId/time-tracking - Log time entry
router.post(
  '/:projectId/time-tracking',
  projectIdValidation,
  body('description').optional().trim().isLength({ max: 500 }).withMessage('Description must not exceed 500 characters'),
  body('duration_minutes').isInt({ min: 1 }).withMessage('Duration must be at least 1 minute'),
  body('activity_type').optional().isIn(['coding', 'planning', 'learning', 'debugging', 'testing', 'documentation']).withMessage('Invalid activity type'),
  handleValidationErrors,
  soloProjectController.logTimeEntry
);

// ===== PROJECT INFO ROUTES =====

// GET /api/solo-projects/:projectId/info - Get project information
router.get(
  '/:projectId/info',
  projectIdValidation,
  handleValidationErrors,
  soloProjectController.getProjectInfo
);

// PUT /api/solo-projects/:projectId/info - Update project information
router.put(
  '/:projectId/info',
  projectIdValidation,
  body('title').optional().trim().isLength({ min: 1, max: 200 }).withMessage('Project title must be between 1 and 200 characters'),
  body('description').optional().trim().isLength({ max: 2000 }).withMessage('Project description must not exceed 2000 characters'),
  body('tech_stack').optional().isArray().withMessage('Tech stack must be an array'),
  body('repository_url').optional().isURL().withMessage('Repository URL must be valid'),
  body('live_demo_url').optional().isURL().withMessage('Live demo URL must be valid'),
  handleValidationErrors,
  soloProjectController.updateProjectInfo
);

module.exports = router;