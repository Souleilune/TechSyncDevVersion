// backend/routes/friends.js
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const {
  sendFriendRequest,
  getFriends,
  acceptFriendRequest,
  rejectFriendRequest,
  removeFriend,
  getFriendProfile,
  getPublicProfile  // NEW: Import the public profile function
} = require('../controllers/friendsController');

// Apply authentication middleware to all routes
router.use(authMiddleware);

// GET /api/friends - Get user's friends and friend requests
router.get('/', getFriends);

// GET /api/friends/:userId/profile - Get friend's profile with achievements and awards (requires friendship)
router.get('/:userId/profile', getFriendProfile);

// GET /api/friends/:userId/public-profile - Get any user's public profile (no friendship required)
router.get('/:userId/public-profile', getPublicProfile);

// POST /api/friends/request - Send friend request
router.post('/request', sendFriendRequest);

// PUT /api/friends/:friendshipId/accept - Accept friend request
router.put('/:friendshipId/accept', acceptFriendRequest);

// DELETE /api/friends/:friendshipId/reject - Reject friend request
router.delete('/:friendshipId/reject', rejectFriendRequest);

// DELETE /api/friends/:friendshipId - Remove friend
router.delete('/:friendshipId', removeFriend);

module.exports = router;