// backend/routes/timeline.js
const express = require('express');
const router = express.Router();
const { param, body, query, validationResult } = require('express-validator');
const authMiddleware = require('../middleware/auth');
const {
  getTimelineFeed,
  reactToPost,
  getPostComments,
  addComment,
  updateComment,
  deleteComment,
  getPost
} = require('../controllers/timelineController');

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
const postIdValidation = [
  param('postId')
    .isUUID()
    .withMessage('Post ID must be a valid UUID')
];

const commentIdValidation = [
  param('commentId')
    .isUUID()
    .withMessage('Comment ID must be a valid UUID')
];

const reactionValidation = [
  body('reactionType')
    .isIn(['sync', 'love'])
    .withMessage('Reaction type must be "sync" or "love"')
];

const commentContentValidation = [
  body('content')
    .trim()
    .isLength({ min: 1, max: 2000 })
    .withMessage('Comment content must be between 1 and 2000 characters'),
  body('parentCommentId')
    .optional({ nullable: true, checkFalsy: true })
    .isUUID()
    .withMessage('Parent comment ID must be a valid UUID')
];

const feedQueryValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Limit must be between 1 and 50'),
  query('filter')
    .optional()
    .isIn(['all', 'friends', 'solo', 'group'])
    .withMessage('Filter must be one of: all, friends, solo, group')
];

// All routes require authentication
router.use(authMiddleware);

/**
 * GET /api/timeline/feed
 * Get timeline feed for "For You" tab
 * Query params: page, limit, filter (all|friends|solo|group)
 */
router.get(
  '/feed',
  feedQueryValidation,
  handleValidationErrors,
  getTimelineFeed
);

/**
 * GET /api/timeline/posts/:postId
 * Get a single timeline post with full details
 */
router.get(
  '/posts/:postId',
  postIdValidation,
  handleValidationErrors,
  getPost
);

/**
 * POST /api/timeline/posts/:postId/react
 * Add or toggle reaction on a timeline post
 * Body: { reactionType: 'sync' | 'love' }
 */
router.post(
  '/posts/:postId/react',
  postIdValidation,
  reactionValidation,
  handleValidationErrors,
  reactToPost
);

/**
 * GET /api/timeline/posts/:postId/comments
 * Get comments for a timeline post
 * Query params: page, limit
 */
router.get(
  '/posts/:postId/comments',
  postIdValidation,
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  handleValidationErrors,
  getPostComments
);

/**
 * POST /api/timeline/posts/:postId/comments
 * Add a comment to a timeline post
 * Body: { content: string, parentCommentId?: uuid }
 */
router.post(
  '/posts/:postId/comments',
  postIdValidation,
  commentContentValidation,
  handleValidationErrors,
  addComment
);

/**
 * PUT /api/timeline/comments/:commentId
 * Update a comment
 * Body: { content: string }
 */
router.put(
  '/comments/:commentId',
  commentIdValidation,
  body('content')
    .trim()
    .isLength({ min: 1, max: 2000 })
    .withMessage('Comment content must be between 1 and 2000 characters'),
  handleValidationErrors,
  updateComment
);

/**
 * DELETE /api/timeline/comments/:commentId
 * Delete a comment
 */
router.delete(
  '/comments/:commentId',
  commentIdValidation,
  handleValidationErrors,
  deleteComment
);

// Error handling middleware
router.use((error, req, res, next) => {
  console.error('Timeline router error:', error);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? error.message : undefined
  });
});

module.exports = router;