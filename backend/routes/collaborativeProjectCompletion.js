// backend/routes/collaborativeProjectCompletion.js
const express = require('express');
const { param, body, validationResult } = require('express-validator');
const {
  getCompletionStatus,
  markProjectComplete,
  checkAutoComplete,
  voteOnCompletion,
  getCompletionVotes
} = require('../controllers/collaborativeProjectCompletion');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

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

// Validation rules
const projectIdValidation = [
  param('projectId')
    .isUUID()
    .withMessage('Project ID must be a valid UUID')
];

const voteValidation = [
  body('vote')
    .isIn(['approve', 'reject'])
    .withMessage('Vote must be either "approve" or "reject"')
];

const completeValidation = [
  body('skip_validation')
    .optional()
    .isBoolean()
    .withMessage('skip_validation must be a boolean')
];

// All routes require authentication
router.use(authMiddleware);

/**
 * GET /api/projects/:projectId/completion-status
 * Get project completion status, percentage, and voting info
 * Available to: All project members
 */
router.get(
  '/:projectId/completion-status',
  projectIdValidation,
  handleValidationErrors,
  getCompletionStatus
);

/**
 * POST /api/projects/:projectId/complete
 * Manually mark project as complete
 * Available to: Project owner and leads only
 * Body: { skip_validation: boolean (optional) }
 */
router.post(
  '/:projectId/complete',
  projectIdValidation,
  completeValidation,
  handleValidationErrors,
  markProjectComplete
);

/**
 * POST /api/projects/:projectId/check-auto-complete
 * Check and trigger auto-completion if all tasks are done
 * Available to: All authenticated users (typically called after task updates)
 */
router.post(
  '/:projectId/check-auto-complete',
  projectIdValidation,
  handleValidationErrors,
  checkAutoComplete
);

/**
 * POST /api/projects/:projectId/completion-vote
 * Vote on project completion (approve/reject)
 * Available to: All active project members
 * Body: { vote: 'approve' | 'reject' }
 */
router.post(
  '/:projectId/completion-vote',
  projectIdValidation,
  voteValidation,
  handleValidationErrors,
  voteOnCompletion
);

/**
 * GET /api/projects/:projectId/completion-votes
 * Get all votes for project completion
 * Available to: All project members
 */
router.get(
  '/:projectId/completion-votes',
  projectIdValidation,
  handleValidationErrors,
  getCompletionVotes
);

// Error handling middleware
router.use((error, req, res, next) => {
  console.error('Collaborative project completion router error:', error);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

module.exports = router;