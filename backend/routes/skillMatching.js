// backend/routes/skillMatching.js
const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const skillMatching = require('../services/SkillMatchingService');

// Support both default and named export for auth middleware
const authModule = require('../middleware/auth');
const authMiddleware = authModule.authMiddleware || authModule;

const DEBUG = process.env.NODE_ENV !== 'production';

// ----- helpers -----
const ALLOWED_ACTIONS = new Set(['viewed', 'applied', 'joined', 'ignored']);
const isUuid = (v) =>
  typeof v === 'string' &&
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v);

function normalizeAction(input) {
  const a = String(input || '').toLowerCase().trim();
  return ALLOWED_ACTIONS.has(a) ? a : 'viewed';
}
function normalizeScore(s) {
  if (s == null) return null;
  const n = parseInt(s, 10);
  return Number.isFinite(n) ? Math.min(5, Math.max(1, n)) : null;
}
function log(...args) {
  if (DEBUG) console.log('[skill-matching]', ...args);
}

// ----- enhanced recommendations -----
router.get('/recommendations/:userId/enhanced', authMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;
    const limit = parseInt(req.query.limit || '10', 10);

    if (String(req.user.id) !== String(userId)) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }
    const recs = await skillMatching.recommendProjects(userId, { limit });
    return res.json({
      success: true,
      data: {
        recommendations: recs,
        meta: {
          total: recs.length,
          algorithm_version: '2.0-enhanced',
          generated_at: new Date().toISOString()
        }
      }
    });
  } catch (e) {
    console.error('Enhanced recs error:', e);
    res.status(500).json({ success: false, message: 'Failed to generate recommendations' });
  }
});

// ----- legacy (array) -----
router.get('/recommendations/:userId', authMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;
    const limit = parseInt(req.query.limit || '10', 10);

    if (String(req.user.id) !== String(userId)) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }
    const recs = await skillMatching.recommendProjects(userId, { limit });
    return res.json(recs);
  } catch (e) {
    console.error('Legacy recs error:', e);
    res.status(500).json({ success: false, message: 'Failed to generate recommendations' });
  }
});

// ----- feedback handler (tolerant) -----
async function insertFeedbackSafe(row) {
  // First try with given recommendation_id (may be null)
  let { error } = await supabase.from('recommendation_feedback').insert([row]);
  if (!error) return { ok: true };

  // If FK violation, retry with recommendation_id = null
  if (String(error.code) === '23503') {
    const retry = { ...row, recommendation_id: null };
    const { error: e2 } = await supabase.from('recommendation_feedback').insert([retry]);
    if (!e2) return { ok: true };
    return { ok: false, error: e2 };
  }

  // If table missing, treat as success (non-blocking UX)
  if (String(error.code) === '42P01') {
    log('recommendation_feedback table missing; returning success anyway');
    return { ok: true, warn: error };
  }

  return { ok: false, error };
}

async function handleFeedback(req, res) {
  try {
    const userId = req.user.id;

    // Accept multiple shapes
    // Shape A: { recommendation_id, action_taken, feedback_score, project_id? }
    // Shape B: { recommendationId, action, score, projectId } (from UI)
    const {
      recommendation_id,
      action_taken,
      feedback_score,
      project_id
    } = req.body;

    const recIdAlt = req.body.recommendationId;
    const actionAlt = req.body.action;
    const scoreAlt = req.body.score;
    const projIdAlt = req.body.projectId;

    // Validate/normalize
    const recIdRaw = recommendation_id || recIdAlt || null;
    const recId = isUuid(recIdRaw) ? recIdRaw : null; // null if not a proper UUID
    const projId = project_id || projIdAlt || null;
    const action = normalizeAction(action_taken || actionAlt || 'viewed');
    const score = normalizeScore(feedback_score ?? scoreAlt ?? null);

    const row = {
      user_id: userId,
      recommendation_id: recId,    // may be null
      project_id: projId || null,  // may be null
      action_taken: action,
      feedback_score: score
      // created_at: default now()
    };

    const result = await insertFeedbackSafe(row);
    if (!result.ok) {
      console.error('Feedback insert error:', result.error);
      return res.status(500).json({ success: false, message: 'Failed to store feedback' });
    }

    return res.json({ success: true, message: 'Feedback stored' });
  } catch (e) {
    console.error('Feedback error:', e);
    return res.status(500).json({ success: false, message: 'Failed to store feedback' });
  }
}

// POST /api/skill-matching/feedback
router.post('/feedback', authMiddleware, handleFeedback);

// POST /api/skill-matching/recommendations/feedback (alias)
router.post('/recommendations/feedback', authMiddleware, handleFeedback);

module.exports = router;