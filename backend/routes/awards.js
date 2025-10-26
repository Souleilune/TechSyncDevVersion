// backend/routes/awards.js
const express = require('express');
const router = express.Router();
const { param, query, validationResult } = require('express-validator');
const { authMiddleware } = require('../middleware/auth');

const {
  checkProjectCompletionAward,
  checkWeeklyChallengeAward,
  getUserAwards,
  getProjectAwards,
  getAwardStatistics
} = require('../controllers/awardsController');

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

const projectIdValidation = [
  param('projectId')
    .isUUID()
    .withMessage('Project ID must be a valid UUID')
];

// All routes require authentication
router.use(authMiddleware);

// GET /api/awards - Get all awards for the authenticated user
router.get(
  '/',
  query('projectId').optional().isUUID().withMessage('Project ID must be a valid UUID'),
  handleValidationErrors,
  getUserAwards
);

// GET /api/awards/statistics - Get award statistics for profile
router.get(
  '/statistics',
  getAwardStatistics
);

// GET /api/awards/project/:projectId - Get awards for a specific project
router.get(
  '/project/:projectId',
  projectIdValidation,
  handleValidationErrors,
  getProjectAwards
);

// POST /api/awards/check/completion/:projectId - Check and award project completion
router.post(
  '/check/completion/:projectId',
  projectIdValidation,
  handleValidationErrors,
  checkProjectCompletionAward
);

// POST /api/awards/check/challenges/:projectId - Check and award weekly challenge completion
router.post(
  '/check/challenges/:projectId',
  projectIdValidation,
  handleValidationErrors,
  checkWeeklyChallengeAward
);

module.exports = router;