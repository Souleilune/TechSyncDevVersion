// backend/routes/notifications.js - FIXED VERSION
const express = require('express');
const router = express.Router();
const notificationsController = require('../controllers/notificationsController');
const authMiddleware = require('../middleware/auth'); // Import the default export

// Apply authentication to all routes
router.use(authMiddleware);

// Get comment notifications
router.get('/comments', notificationsController.getCommentNotifications);

// Mark notifications as read
router.put('/read', notificationsController.markNotificationsRead);

// Get unread count
router.get('/unread-count', notificationsController.getUnreadCount);

module.exports = router;