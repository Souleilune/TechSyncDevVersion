// routes/comments.js
const express = require('express');
const router = express.Router();
const commentsController = require('../controllers/commentsController');
const authMiddleware = require('../middleware/auth'); // Import the default export

// Apply authentication to all routes
router.use(authMiddleware);

// Get comments for a task
router.get('/task/:taskId', commentsController.getTaskComments);

// Get replies to a comment
router.get('/:commentId/replies', commentsController.getCommentReplies);

// Create a new comment
router.post('/task/:taskId', commentsController.createComment);

// Update a comment
router.put('/:commentId', commentsController.updateComment);

// Delete a comment
router.delete('/:commentId', commentsController.deleteComment);

module.exports = router;