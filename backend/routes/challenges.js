// backend/routes/challenges.js - FIXED VALIDATION
const express = require('express');
const router = express.Router();
const { body, param, query, validationResult } = require('express-validator');

const {
  createChallenge,
  getChallenges,
  getChallengeById,
  updateChallenge,
  deleteChallenge,
  getChallengesByLanguage,
  getUserAttempts,
  getUserStats,
  getAttemptDetails,
  getNextChallenge
} = require('../controllers/challengeController');

const {
  getProjectChallenge,
  canAttemptChallenge,
  submitChallengeAttempt,
  getFailedAttemptsCount,
  generateComfortingMessage
} = require('../controllers/projectRecruitmentController');

const { authMiddleware } = require('../middleware/auth');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });
  }
  next();
};

const projectChallengeValidation = [
  param('projectId').isUUID().withMessage('Project ID must be a valid UUID')
];

const submitAttemptValidation = [
  param('projectId').isUUID().withMessage('Project ID must be a valid UUID'),
  body('submittedCode').isString().isLength({ min: 10, max: 50000 }).withMessage('Submitted code must be between 10 and 50000 characters'),
  body('startedAt').optional().isISO8601().withMessage('Started at must be a valid ISO 8601 date'),
  body('challengeId').optional().isUUID().withMessage('Challenge ID must be a valid UUID')
];

// FIXED: Changed programming_language to programming_language_id (integer)
const challengeValidation = [
  body('title').isString().isLength({ min: 1, max: 200 }).withMessage('Title must be between 1 and 200 characters'),
  body('description').isString().isLength({ min: 1, max: 5000 }).withMessage('Description must be between 1 and 5000 characters'),
  body('difficulty_level').isIn(['easy', 'medium', 'hard', 'expert']).withMessage('Difficulty must be easy|medium|hard|expert'),
  body('programming_language_id').optional().isInt({ min: 1 }).withMessage('Programming language ID must be a positive integer'), // FIXED
  body('time_limit_minutes').optional().isInt({ min: 1, max: 480 }).withMessage('Time limit must be between 1 and 480 minutes'),
  body('is_active').optional().isBoolean(),
  body('test_cases').optional(),
  body('starter_code').optional().isLength({ max: 10000 }),
  body('expected_solution').optional().isLength({ max: 50000 }),
  body('project_id').optional().isUUID().withMessage('Project ID must be a valid UUID if provided')
];

// ===== SIMPLE CHALLENGE SUBMISSION (for solo weekly challenges) =====
const simpleSubmitValidation = [
  body('challenge_id').isUUID().withMessage('Challenge ID must be a valid UUID'),
  body('submitted_code').isString().isLength({ min: 10, max: 50000 }).withMessage('Submitted code must be between 10 and 50000 characters'),
  body('started_at').optional().isISO8601().withMessage('Started at must be a valid ISO 8601 date')
];

// ===== PROJECT RECRUITMENT ROUTES =====
router.get('/project/:projectId/challenge',
  authMiddleware,
  projectChallengeValidation,
  handleValidationErrors,
  getProjectChallenge
);

router.get('/project/:projectId/can-attempt',
  authMiddleware,
  projectChallengeValidation,
  handleValidationErrors,
  canAttemptChallenge
);

router.post('/project/:projectId/attempt',
  authMiddleware,
  submitAttemptValidation,
  handleValidationErrors,
  submitChallengeAttempt
);

router.get('/project/:projectId/failed-attempts-count',
  authMiddleware,
  projectChallengeValidation,
  handleValidationErrors,
  async (req, res) => {
    try {
      const { projectId } = req.params;
      const userId = req.user.id;

      const { data: attempts, error } = await require('../config/supabase')
        .from('challenge_attempts')
        .select('id, status, score')
        .eq('project_id', projectId)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const failedCount = attempts?.filter(a => a.status === 'failed' || (a.score !== null && a.score < 70)).length || 0;

      const comfortingMessage = failedCount >= 7 ? generateComfortingMessage(failedCount, 'this project') : null;

      res.json({
        success: true,
        data: {
          failedAttemptsCount: failedCount,
          shouldShowAlert: failedCount >= 7,
          comfortingMessage
        }
      });
    } catch (error) {
      console.error('Error getting failed attempts count:', error);
      res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
    }
  }
);

// ===== SIMPLE SUBMISSION (for weekly challenges) =====
router.post('/submit',
  authMiddleware,
  simpleSubmitValidation,
  handleValidationErrors,
  async (req, res) => {
    try {
      const { submitSimpleChallenge } = require('../controllers/challengeController');
      await submitSimpleChallenge(req, res);
    } catch (error) {
      console.error('Simple challenge submit error:', error);
      res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
    }
  }
);

// ===== USER ROUTES =====
router.get('/attempts',
  authMiddleware,
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 })
  ],
  handleValidationErrors,
  getUserAttempts
);

router.get('/stats', authMiddleware, getUserStats);

router.get('/attempts/:attemptId',
  authMiddleware,
  [ param('attemptId').isUUID().withMessage('Attempt ID must be a valid UUID') ],
  handleValidationErrors,
  getAttemptDetails
);

// ===== ADAPTIVE NEXT CHALLENGE =====
router.get('/next',
  authMiddleware,
  [
    query('programming_language_id').optional().isInt({ min: 1 }).withMessage('programming_language_id must be an integer'),
    query('project_id').optional().isUUID().withMessage('project_id must be a valid UUID')
  ],
  handleValidationErrors,
  getNextChallenge
);

// ===== ADMIN/GENERIC CHALLENGE ROUTES =====
router.get('/language/:languageId',
  authMiddleware,
  [ param('languageId').isInt().withMessage('Language ID must be an integer') ],
  handleValidationErrors,
  getChallengesByLanguage
);

router.get('/:id',
  authMiddleware,
  [ param('id').isUUID().withMessage('Challenge ID must be a valid UUID') ],
  handleValidationErrors,
  getChallengeById
);

router.post('/',
  authMiddleware,
  challengeValidation,
  handleValidationErrors,
  createChallenge
);

router.put('/:id',
  authMiddleware,
  [ param('id').isUUID().withMessage('Challenge ID must be a valid UUID'), ...challengeValidation ],
  handleValidationErrors,
  updateChallenge
);

router.delete('/:id',
  authMiddleware,
  [ param('id').isUUID().withMessage('Challenge ID must be a valid UUID') ],
  handleValidationErrors,
  deleteChallenge
);

router.get('/',
  authMiddleware,
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('difficulty_level').optional().isIn(['easy', 'medium', 'hard', 'expert']), // FIXED
    query('programming_language_id').optional().isInt({ min: 1 }), // FIXED
    query('search').optional().isString().isLength({ min: 1, max: 100 })
  ],
  handleValidationErrors,
  getChallenges
);

module.exports = router;