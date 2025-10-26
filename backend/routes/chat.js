// backend/routes/chat.js
const express = require('express');
const router = express.Router();
const { body, param, query, validationResult } = require('express-validator');
const authMiddleware = require('../middleware/auth');
const {
  getProjectChatRooms,
  createChatRoom,
  getRoomMessages,
  sendMessage,
  editMessage,
  deleteMessage
} = require('../controllers/chatController');

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

// UUID validation
const uuidValidation = (field) => [
  param(field)
    .isUUID()
    .withMessage(`Invalid ${field} format`)
];

// All chat routes require authentication
router.use(authMiddleware);

// GET /api/chat/projects/:projectId/rooms - Get all chat rooms for a project
router.get(
  '/projects/:projectId/rooms',
  uuidValidation('projectId'),
  handleValidationErrors,
  getProjectChatRooms
);

// POST /api/chat/projects/:projectId/rooms - Create a new chat room
router.post(
  '/projects/:projectId/rooms',
  [
    ...uuidValidation('projectId'),
    body('name')
      .trim()
      .isLength({ min: 1, max: 50 })
      .withMessage('Room name must be between 1 and 50 characters'),
    body('description')
      .optional()
      .trim()
      .isLength({ max: 200 })
      .withMessage('Description must not exceed 200 characters'),
    body('room_type')
      .optional()
      .isIn(['general', 'development', 'announcements', 'random'])
      .withMessage('Invalid room type')
  ],
  handleValidationErrors,
  createChatRoom
);

// GET /api/chat/projects/:projectId/rooms/:roomId/messages - Get messages for a room
router.get(
  '/projects/:projectId/rooms/:roomId/messages',
  [
    ...uuidValidation('projectId'),
    ...uuidValidation('roomId'),
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100')
  ],
  handleValidationErrors,
  getRoomMessages
);

// POST /api/chat/projects/:projectId/rooms/:roomId/messages - Send a message
router.post(
  '/projects/:projectId/rooms/:roomId/messages',
  [
    ...uuidValidation('projectId'),
    ...uuidValidation('roomId'),
    body('content')
      .trim()
      .isLength({ min: 1, max: 2000 })
      .withMessage('Message content must be between 1 and 2000 characters'),
    body('message_type')
      .optional()
      .isIn(['text', 'file', 'code', 'system'])
      .withMessage('Invalid message type'),
    body('reply_to_message_id')
      .optional()
      .isUUID()
      .withMessage('Invalid reply message ID format')
  ],
  handleValidationErrors,
  sendMessage
);

// PUT /api/chat/messages/:messageId - Edit a message
router.put(
  '/messages/:messageId',
  [
    ...uuidValidation('messageId'),
    body('content')
      .trim()
      .isLength({ min: 1, max: 2000 })
      .withMessage('Message content must be between 1 and 2000 characters')
  ],
  handleValidationErrors,
  editMessage
);

// DELETE /api/chat/messages/:messageId - Delete a message
router.delete(
  '/messages/:messageId',
  uuidValidation('messageId'),
  handleValidationErrors,
  deleteMessage
);

module.exports = router;