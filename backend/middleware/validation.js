const { body, validationResult } = require('express-validator');

// Handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(error => ({
        field: error.param,
        message: error.msg,
        value: error.value
      }))
    });
  }
  next();
};

// Common validation rules
const commonValidations = {
  email: body('email')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail()
    .isLength({ max: 255 })
    .withMessage('Email must be less than 255 characters'),

  password: body('password')
    .isLength({ min: 8, max: 128 })
    .withMessage('Password must be between 8 and 128 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number'),

  username: body('username')
    .isLength({ min: 3, max: 50 })
    .withMessage('Username must be between 3 and 50 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores')
    .custom(value => {
      // Prevent reserved usernames
      const reserved = ['admin', 'root', 'user', 'test', 'api', 'www'];
      if (reserved.includes(value.toLowerCase())) {
        throw new Error('Username is reserved');
      }
      return true;
    }),

  fullName: body('full_name')
    .isLength({ min: 2, max: 100 })
    .withMessage('Full name must be between 2 and 100 characters')
    .trim()
    .matches(/^[a-zA-Z\s\-'\.]+$/)
    .withMessage('Full name can only contain letters, spaces, hyphens, apostrophes, and periods'),

  bio: body('bio')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Bio must be less than 500 characters')
    .trim(),

  yearsExperience: body('years_experience')
    .optional()
    .isInt({ min: 0, max: 50 })
    .withMessage('Years of experience must be between 0 and 50')
    .toInt(),

  githubUsername: body('github_username')
    .optional()
    .isLength({ min: 1, max: 39 })
    .withMessage('GitHub username must be between 1 and 39 characters')
    .matches(/^[a-zA-Z0-9](?:[a-zA-Z0-9]|-(?=[a-zA-Z0-9]))*$/)
    .withMessage('Invalid GitHub username format'),

  linkedinUrl: body('linkedin_url')
    .optional()
    .isURL({ protocols: ['https'] })
    .withMessage('LinkedIn URL must be a valid HTTPS URL')
    .custom(value => {
      if (value && !value.includes('linkedin.com')) {
        throw new Error('Must be a LinkedIn URL');
      }
      return true;
    })
};

// Specific validation schemas
const validationSchemas = {
  register: [
    commonValidations.username,
    commonValidations.email,
    commonValidations.password,
    commonValidations.fullName,
    commonValidations.bio,
    commonValidations.yearsExperience,
    commonValidations.githubUsername,
    commonValidations.linkedinUrl
  ],

  login: [
    body('identifier')
      .notEmpty()
      .withMessage('Username or email is required')
      .isLength({ min: 3, max: 255 })
      .withMessage('Identifier must be between atleast 3 and 255 characters'),
    body('password')
      .notEmpty()
      .withMessage('Password is required')
  ],

  updateProfile: [
    commonValidations.fullName,
    commonValidations.bio,
    commonValidations.yearsExperience,
    commonValidations.githubUsername,
    commonValidations.linkedinUrl
  ],

  changePassword: [
    body('currentPassword')
      .notEmpty()
      .withMessage('Current password is required'),
    commonValidations.password.custom((value, { req }) => {
      if (value === req.body.currentPassword) {
        throw new Error('New password must be different from current password');
      }
      return true;
    })
  ]
};

module.exports = {
  handleValidationErrors,
  validationSchemas,
  commonValidations
};
