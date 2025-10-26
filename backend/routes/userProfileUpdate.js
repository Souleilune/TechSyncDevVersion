// backend/routes/userProfileUpdate.js
const express = require('express');
const router = express.Router();
const { body, param, validationResult } = require('express-validator');

// Import auth middleware - compatible with different export patterns
const authModule = require('../middleware/auth');
const authMiddleware = authModule.authMiddleware || authModule;

const {
  requestAddLanguage,
  verifyAndAddLanguage,
  removeLanguage,
  addTopic,
  removeTopic,
  updateLanguageProficiency,
  updateTopicInterest
} = require('../controllers/userProfileUpdateController');

// Validation middleware
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation errors',
      errors: errors.array()
    });
  }
  next();
};

// All routes require authentication
router.use(authMiddleware);

// ===== PROGRAMMING LANGUAGES ROUTES =====

// POST /api/profile-update/languages/request - Request to add a new language (returns challenge)
router.post('/languages/request',
  [
    body('language_id')
      .isInt({ min: 1 })
      .withMessage('Language ID must be a positive integer'),
    body('proficiency_level')
      .isIn(['beginner', 'intermediate', 'advanced', 'expert'])
      .withMessage('Proficiency level must be beginner, intermediate, advanced, or expert')
  ],
  handleValidationErrors,
  requestAddLanguage
);

// POST /api/profile-update/languages/verify - Verify challenge and add language
router.post('/languages/verify',
  [
    body('language_id')
      .isInt({ min: 1 })
      .withMessage('Language ID must be a positive integer'),
    body('proficiency_level')
      .isIn(['beginner', 'intermediate', 'advanced', 'expert'])
      .withMessage('Proficiency level must be beginner, intermediate, advanced, or expert'),
    body('challenge_id')
      .isUUID()
      .withMessage('Challenge ID must be a valid UUID'),
    body('attempt_id')
      .isUUID()
      .withMessage('Attempt ID must be a valid UUID'),
    body('years_experience')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Years of experience must be 0 or greater')
  ],
  handleValidationErrors,
  verifyAndAddLanguage
);

// DELETE /api/profile-update/languages/:language_id - Remove a language
router.delete('/languages/:language_id',
  [
    param('language_id')
      .isInt({ min: 1 })
      .withMessage('Language ID must be a positive integer')
  ],
  handleValidationErrors,
  removeLanguage
);

// PUT /api/profile-update/languages/:language_id - Update language proficiency
router.put('/languages/:language_id',
  [
    param('language_id')
      .isInt({ min: 1 })
      .withMessage('Language ID must be a positive integer'),
    body('proficiency_level')
      .isIn(['beginner', 'intermediate', 'advanced', 'expert'])
      .withMessage('Proficiency level must be beginner, intermediate, advanced, or expert'),
    body('years_experience')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Years of experience must be 0 or greater')
  ],
  handleValidationErrors,
  updateLanguageProficiency
);

// ===== TOPICS (AREAS OF INTEREST) ROUTES =====

// POST /api/profile-update/topics - Add a new topic
router.post('/topics',
  [
    body('topic_id')
      .isInt({ min: 1 })
      .withMessage('Topic ID must be a positive integer'),
    body('interest_level')
      .isIn(['low', 'medium', 'high'])
      .withMessage('Interest level must be low, medium, or high'),
    body('experience_level')
      .optional()
      .isIn(['beginner', 'intermediate', 'advanced', 'expert'])
      .withMessage('Experience level must be beginner, intermediate, advanced, or expert')
  ],
  handleValidationErrors,
  addTopic
);

// DELETE /api/profile-update/topics/:topic_id - Remove a topic
router.delete('/topics/:topic_id',
  [
    param('topic_id')
      .isInt({ min: 1 })
      .withMessage('Topic ID must be a positive integer')
  ],
  handleValidationErrors,
  removeTopic
);

// PUT /api/profile-update/topics/:topic_id - Update topic interest level
router.put('/topics/:topic_id',
  [
    param('topic_id')
      .isInt({ min: 1 })
      .withMessage('Topic ID must be a positive integer'),
    body('interest_level')
      .isIn(['low', 'medium', 'high'])
      .withMessage('Interest level must be low, medium, or high'),
    body('experience_level')
      .optional()
      .isIn(['beginner', 'intermediate', 'advanced', 'expert'])
      .withMessage('Experience level must be beginner, intermediate, advanced, or expert')
  ],
  handleValidationErrors,
  updateTopicInterest
);

module.exports = router;