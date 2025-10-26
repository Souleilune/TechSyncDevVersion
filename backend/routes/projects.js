// backend/routes/projects.js - SIMPLIFIED VERSION (NO DIRECT JOIN ENDPOINT)
const express = require('express');
const { body, query, param } = require('express-validator');
const {
  createProject,
  getProjects,
  getProjectById,
  getUserProjects,
  deleteProject,
  updateProject
} = require('../controllers/projectController');
const authMiddleware = require('../middleware/auth');
const { handleValidationErrors } = require('../middleware/validation');

const router = express.Router();

// Validation rules for creating projects
const createProjectValidation = [
  body('title')
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage('Title must be between 3 and 200 characters'),
  
  body('description')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Description must be between 10 and 1000 characters'),
  
  body('detailed_description')
    .optional()
    .trim()
    .isLength({ max: 5000 })
    .withMessage('Detailed description must not exceed 5000 characters'),
  
  body('required_experience_level')
    .optional()
    .isIn(['beginner', 'intermediate', 'advanced', 'expert'])
    .withMessage('Invalid experience level'),
  
  body('maximum_members')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Maximum members must be between 1 and 50'),
  
  body('estimated_duration_weeks')
    .optional()
    .isInt({ min: 1, max: 104 })
    .withMessage('Duration must be between 1 and 104 weeks'),
  
  body('difficulty_level')
    .optional()
    .isIn(['easy', 'medium', 'hard', 'expert'])
    .withMessage('Invalid difficulty level'),
  
  body('github_repo_url')
    .optional()
    .isURL()
    .withMessage('GitHub repository URL must be valid'),
  
  body('deadline')
    .optional()
    .isISO8601()
    .withMessage('Deadline must be a valid date'),
  
  body('programming_languages')
    .optional()
    .isArray()
    .withMessage('Programming languages must be an array'),
  
  body('programming_languages.*')
    .isString()
    .isLength({ min: 1, max: 50 })
    .withMessage('Each programming language must be a valid string'),
  
  body('topics')
    .optional()
    .isArray()
    .withMessage('Topics must be an array'),
  
  body('topics.*')
    .isString()
    .isLength({ min: 1, max: 100 })
    .withMessage('Each topic must be a valid string')
];

// Validation rules for getting projects
const getProjectsValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Limit must be between 1 and 50'),
  
  query('status')
    .optional()
    .isIn(['recruiting', 'active', 'completed', 'paused', 'cancelled'])
    .withMessage('Invalid project status'),
  
  query('difficulty_level')
    .optional()
    .isIn(['easy', 'medium', 'hard', 'expert'])
    .withMessage('Invalid difficulty level'),
  
  query('required_experience_level')
    .optional()
    .isIn(['beginner', 'intermediate', 'advanced', 'expert'])
    .withMessage('Invalid experience level'),
  
  query('search')
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage('Search term must be between 1 and 100 characters')
];

// Project ID validation
const projectIdValidation = [
  param('id')
    .isUUID()
    .withMessage('Invalid project ID format')
];

// Update project validation
const updateProjectValidation = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage('Title must be between 3 and 200 characters'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Description must be between 10 and 1000 characters'),
  
  body('status')
    .optional()
    .isIn(['recruiting', 'active', 'completed', 'paused', 'cancelled'])
    .withMessage('Invalid project status'),
  
  body('maximum_members')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Maximum members must be between 1 and 50')
];

// Routes

// GET /api/projects - Get all projects (public, with filters)
router.get('/', getProjectsValidation, handleValidationErrors, getProjects);

// GET /api/projects/:id - Get specific project by ID (public)
router.get('/:id', projectIdValidation, handleValidationErrors, getProjectById);

// Protected routes (require authentication)
router.use(authMiddleware);

// POST /api/projects - Create new project
router.post('/', createProjectValidation, handleValidationErrors, createProject);

// GET /api/projects/user/my - Get current user's projects
router.get('/user/my', getUserProjects);

// PUT /api/projects/:id - Update project (only by owner)
router.put('/:id', 
  projectIdValidation,
  updateProjectValidation,
  handleValidationErrors,
  updateProject
);

// DELETE /api/projects/:id - Delete project (only by owner)
router.delete('/:id', projectIdValidation, handleValidationErrors, deleteProject);

// NOTE: Project joining is handled through the challenge system
// Users must complete a coding challenge to join projects
// See /api/challenges/project/:projectId/attempt endpoint

// Error handling middleware for this router
router.use((error, req, res, next) => {
  console.error('Projects router error:', error);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

module.exports = router;