// backend/routes/challenges.js
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
  getNextChallenge              // NEW
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

const challengeValidation = [
  body('title').isString().isLength({ min: 1, max: 200 }).withMessage('Title must be between 1 and 200 characters'),
  body('description').isString().isLength({ min: 1, max: 5000 }).withMessage('Description must be between 1 and 5000 characters'),
  body('difficulty_level').isIn(['easy', 'medium', 'hard', 'expert']).withMessage('Difficulty must be easy|medium|hard|expert'),
  body('programming_language').optional().isString().isLength({ min: 1, max: 50 }),
  body('time_limit_minutes').optional().isInt({ min: 1, max: 480 }),
  body('is_active').optional().isBoolean(),
  body('test_cases').optional(),
  body('starter_code').optional().isLength({ max: 10000 }),
  body('expected_solution').optional().isLength({ max: 50000 })
];

// ===== SIMPLE CHALLENGE SUBMISSION (for solo weekly challenges) =====
const simpleSubmitValidation = [
  body('challenge_id').isUUID().withMessage('Challenge ID must be a valid UUID'),
  body('submitted_code').isString().isLength({ min: 10, max: 50000 }).withMessage('Submitted code must be between 10 and 50000 characters'),
  body('notes').optional().isString().withMessage('Notes must be a string'),
  body('language').optional().isString().withMessage('Language must be a string'),
  body('project_id').optional().isUUID().withMessage('Project ID must be a valid UUID'),
  body('attempt_type').optional().isString().withMessage('Attempt type must be a string')
];

// POST /api/challenges/submit - Simple challenge submission (bypasses project capacity checks)
router.post('/submit',
  authMiddleware,
  simpleSubmitValidation,
  handleValidationErrors,
  async (req, res) => {
    try {
      const { challenge_id, submitted_code, notes, language, project_id, attempt_type } = req.body;
      const userId = req.user.id;

      console.log('📝 Simple challenge submission:', {
        challenge_id,
        userId,
        project_id,
        attempt_type,
        code_length: submitted_code?.length
      });

      // Validate submission
      if (!submitted_code || submitted_code.trim().length < 10) {
        return res.status(400).json({
          success: false,
          message: 'Code submission is too short. Please provide a more complete solution.'
        });
      }

      // Get challenge details
      const { data: challenge, error: challengeError } = await supabase
        .from('coding_challenges')
        .select(`
          id, title, description, difficulty_level, time_limit_minutes,
          test_cases, expected_solution, programming_language_id,
          programming_languages (id, name)
        `)
        .eq('id', challenge_id)
        .single();

      if (challengeError || !challenge) {
        return res.status(404).json({
          success: false,
          message: 'Challenge not found'
        });
      }

      // Create challenge attempt record
      const { data: attempt, error: attemptError } = await supabase
        .from('challenge_attempts')
        .insert({
          challenge_id,
          user_id: userId,
          project_id: project_id || null,
          submitted_code,
          status: 'pending',
          started_at: new Date().toISOString(),
          submitted_at: new Date().toISOString(),
          solve_time_minutes: 0, // Could be calculated if needed
          inactivity_minutes: 0,
          feedback: notes || null
        })
        .select()
        .single();

      if (attemptError) {
        console.error('Error creating challenge attempt:', attemptError);
        return res.status(500).json({
          success: false,
          message: 'Failed to create challenge attempt',
          error: attemptError.message
        });
      }

      // Basic evaluation (you can enhance this later)
      let score = 50; // Base score
      let status = 'pending';
      let feedback = 'Your submission has been received and is being evaluated.';

      // Simple heuristic scoring based on code length and content
      const codeLines = submitted_code.split('\n').filter(line => line.trim().length > 0);
      if (codeLines.length >= 5) score += 10;
      if (submitted_code.includes('function') || submitted_code.includes('def') || submitted_code.includes('class')) score += 10;
      if (submitted_code.includes('return')) score += 10;
      if (submitted_code.length > 100) score += 10;
      
      // Cap the score at 100
      score = Math.min(score, 100);

      // Update the attempt with evaluation results
      const { data: updatedAttempt, error: updateError } = await supabase
        .from('challenge_attempts')
        .update({
          score,
          status: score >= 60 ? 'passed' : 'failed',
          reviewed_at: new Date().toISOString(),
          feedback: score >= 60 
            ? 'Good work! Your solution shows understanding of the problem.' 
            : 'Your solution needs improvement. Consider reviewing the requirements and trying again.'
        })
        .eq('id', attempt.id)
        .select()
        .single();

      if (updateError) {
        console.error('Error updating challenge attempt:', updateError);
      }

      const finalAttempt = updatedAttempt || attempt;

      console.log('✅ Challenge attempt created successfully:', {
        attemptId: finalAttempt.id,
        score: finalAttempt.score,
        status: finalAttempt.status
      });

      res.json({
        success: true,
        data: {
          attempt: finalAttempt
        },
        message: 'Challenge submitted successfully'
      });

    } catch (error) {
      console.error('Simple challenge submission error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to submit challenge',
        error: error.message
      });
    }
  }
);

// Debug middleware (optional)
router.use((req, res, next) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  }
  next();
});

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
      const failedCount = await getFailedAttemptsCount(userId, projectId);
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

// ===== ADAPTIVE NEXT CHALLENGE (NEW) =====
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
    query('difficulty').optional().isIn(['easy', 'medium', 'hard', 'expert']),
    query('language').optional().isString().isLength({ min: 1, max: 50 })
  ],
  handleValidationErrors,
  getChallenges
);

module.exports = router;