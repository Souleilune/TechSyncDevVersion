// backend/routes/auth.js - COMPLETE FILE
const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/auth');

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

// Register validation rules - FIXED TO MATCH FRONTEND
const registerValidation = [
  body('username')
    .notEmpty()
    .withMessage('Username is required')
    .isLength({ min: 3, max: 50 })
    .withMessage('Username must be between 3 and 50 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),
  
  body('email')
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email')
    .isLength({ max: 255 })
    .withMessage('Email must be less than 255 characters')
    .normalizeEmail(),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number'),
  
  body('full_name')
    .notEmpty()
    .withMessage('Full name is required')
    .isLength({ min: 2, max: 255 })
    .withMessage('Full name must be between 2 and 255 characters'),
  
  body('bio')
    .optional({ nullable: true, checkFalsy: true })
    .isLength({ max: 1000 })
    .withMessage('Bio must be less than 1000 characters'),
  
  body('github_username')
    .optional({ nullable: true, checkFalsy: true })
    .isLength({ max: 50 })
    .withMessage('GitHub username must be less than 50 characters')
    .matches(/^[a-zA-Z0-9-_]*$/)
    .withMessage('GitHub username can only contain letters, numbers, hyphens, and underscores'),
  
  body('linkedin_url')
    .optional({ nullable: true, checkFalsy: true })
    .isURL()
    .withMessage('LinkedIn URL must be a valid URL'),
  
  body('years_experience')
    .optional({ nullable: true })
    .isInt({ min: 0, max: 100 })
    .withMessage('Years of experience must be between 0 and 100')
];

// Login validation rules
const loginValidation = [
  body('identifier')
    .notEmpty()
    .withMessage('Username or email is required')
    .isLength({ min: 3, max: 255 })
    .withMessage('Identifier must be between 3 and 255 characters'),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 1 })
    .withMessage('Password cannot be empty')
];

// Update profile validation rules
const updateProfileValidation = [
  body('full_name')
    .optional({ nullable: true, checkFalsy: true })
    .isLength({ min: 1, max: 255 })
    .withMessage('Full name must be between 1 and 255 characters'),
  
  body('bio')
    .optional({ nullable: true, checkFalsy: true })
    .isLength({ max: 1000 })
    .withMessage('Bio must be less than 1000 characters'),
  
  body('github_username')
    .optional({ nullable: true, checkFalsy: true })
    .isLength({ max: 50 })
    .withMessage('GitHub username must be less than 50 characters'),
  
  body('linkedin_url')
    .optional({ nullable: true, checkFalsy: true })
    .isURL()
    .withMessage('LinkedIn URL must be a valid URL'),
  
  body('years_experience')
    .optional({ nullable: true })
    .isInt({ min: 0, max: 100 })
    .withMessage('Years of experience must be between 0 and 100')
];

// Change password validation rules
const changePasswordValidation = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  
  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('New password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('New password must contain at least one lowercase letter, one uppercase letter, and one number')
];

// PASSWORD RESET VALIDATION RULES - ADD THESE
const requestPasswordResetValidation = [
  body('email')
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail()
];

const resetPasswordValidation = [
  body('token')
    .notEmpty()
    .withMessage('Reset token is required'),
  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain uppercase, lowercase, and number')
];

// EXISTING ROUTES
router.post('/register', registerValidation, handleValidationErrors, authController.register);
router.post('/login', loginValidation, handleValidationErrors, authController.login);
router.get('/profile', authMiddleware, authController.getProfile);
router.put('/profile', authMiddleware, updateProfileValidation, handleValidationErrors, authController.updateProfile);
router.put('/change-password', authMiddleware, changePasswordValidation, handleValidationErrors, authController.changePassword);

// PASSWORD RESET ROUTES - ADD THESE TWO ROUTES
router.post(
  '/forgot-password',
  requestPasswordResetValidation,
  handleValidationErrors,
  authController.requestPasswordReset
);

router.post(
  '/reset-password',
  resetPasswordValidation,
  handleValidationErrors,
  authController.resetPassword
);

module.exports = router;