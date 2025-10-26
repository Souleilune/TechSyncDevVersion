const express = require('express');
const router = express.Router();
const { query } = require('express-validator');

// Import controllers
const {
  getProgrammingLanguages,
  getTopics,
  searchProgrammingLanguages,
  searchTopics
} = require('../controllers/suggestionsController');

// Validation middleware
const { validationResult } = require('express-validator');

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

// Search validation
const searchValidation = [
  query('q')
    .optional()
    .isLength({ min: 1, max: 50 })
    .withMessage('Search query must be between 1 and 50 characters')
];

// Routes (all public - no authentication required)

// GET /api/suggestions/programming-languages - Get all programming languages
router.get('/programming-languages', getProgrammingLanguages);

// GET /api/suggestions/topics - Get all topics  
router.get('/topics', getTopics);

// GET /api/suggestions/programming-languages/search?q=javascript - Search programming languages
router.get('/programming-languages/search', searchValidation, handleValidationErrors, searchProgrammingLanguages);

// GET /api/suggestions/topics/search?q=web - Search topics
router.get('/topics/search', searchValidation, handleValidationErrors, searchTopics);

module.exports = router;