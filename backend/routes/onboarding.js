// backend/routes/onboarding.js
const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');

const {
  getProgrammingLanguages,
  getTopics,
  saveUserLanguages,
  saveUserTopics,
  completeOnboarding,
  getUserOnboardingData
} = require('../controllers/onboardingController');

const authMiddleware = require('../middleware/auth');

// Error handling middleware
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

// PUBLIC ROUTES (no authentication required)

// Get all programming languages
router.get('/programming-languages', getProgrammingLanguages);

// Get all topics
router.get('/topics', getTopics);

// PROTECTED ROUTES (require authentication)
router.use(authMiddleware);

// Save user's programming languages
router.post('/languages', [
  body('languages')
    .isArray({ min: 1 })
    .withMessage('Languages must be a non-empty array'),
  body('languages.*.language_id')
    .isInt({ min: 1 })
    .withMessage('Language ID must be a positive integer'),
  body('languages.*.proficiency_level')
    .isIn(['beginner', 'intermediate', 'advanced', 'expert'])
    .withMessage('Proficiency level must be beginner, intermediate, advanced, or expert'),
  body('languages.*.years_experience')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Years of experience must be 0 or greater')
], handleValidationErrors, saveUserLanguages);

// Save user's topics of interest
router.post('/topics', [
  body('topics')
    .isArray({ min: 1 })
    .withMessage('Topics must be a non-empty array'),
  body('topics.*.topic_id')
    .isInt({ min: 1 })
    .withMessage('Topic ID must be a positive integer'),
  body('topics.*.interest_level')
    .isIn(['low', 'medium', 'high'])
    .withMessage('Interest level must be low, medium, or high'),
  body('topics.*.experience_level')
    .isIn(['beginner', 'intermediate', 'advanced', 'expert'])
    .withMessage('Experience level must be beginner, intermediate, advanced, or expert')
], handleValidationErrors, saveUserTopics);

// Complete onboarding process
router.post('/complete', completeOnboarding);

// Get user's current onboarding data
router.get('/user-data', getUserOnboardingData);

module.exports = router;