// backend/controllers/challengeController.js - COMPLETE FILE WITH AWARDS INTEGRATION
const supabase = require('../config/supabase');
const { runTests } = require('../utils/codeEvaluator');

// Helper function to check weekly challenge awards after submission
const checkWeeklyChallengeAwardAfterSubmission = async (userId, projectId) => {
  try {
    if (!projectId) return { awarded: false };

    console.log('🎯 Checking weekly challenge award after submission');

    // Get project programming language
    const { data: project } = await supabase
      .from('projects')
      .select('id, title, project_languages(programming_language_id)')
      .eq('id', projectId)
      .single();

    const languageId = project?.project_languages?.[0]?.programming_language_id;
    if (!languageId) return { awarded: false };

    // Get all challenges for this language
    const { data: allChallenges } = await supabase
      .from('coding_challenges')
      .select('id')
      .eq('programming_language_id', languageId)
      .eq('is_active', true)
      .is('project_id', null);

    // Get user's passed attempts for this project
    const { data: attempts } = await supabase
      .from('challenge_attempts')
      .select('challenge_id, status')
      .eq('user_id', userId)
      .eq('project_id', projectId)
      .eq('status', 'passed');

    const completedChallengeIds = [...new Set(attempts?.map(a => a.challenge_id) || [])];
    const allChallengeIds = allChallenges?.map(c => c.id) || [];
    const allCompleted = allChallengeIds.length > 0 && 
                        allChallengeIds.every(id => completedChallengeIds.includes(id));

    if (allCompleted) {
      // Check if award already exists
      const { data: existingAward } = await supabase
        .from('user_awards')
        .select('id')
        .eq('user_id', userId)
        .eq('project_id', projectId)
        .eq('award_type', 'weekly_challenge_master')
        .single();

      if (!existingAward) {
        // Create award
        const { data: newAward } = await supabase
          .from('user_awards')
          .insert({
            user_id: userId,
            project_id: projectId,
            award_type: 'weekly_challenge_master',
            award_title: '🌟 Challenge Champion',
            award_description: 'Completed all weekly challenges for a project',
            award_icon: 'star',
            award_color: '#9333EA',
            metadata: {
              total_challenges: allChallengeIds.length,
              completed_challenges: completedChallengeIds.length,
              project_title: project?.title
            }
          })
          .select()
          .single();

        console.log('✅ Challenge Champion award granted!', newAward);
        return { awarded: true, award: newAward };
      }
    }

    return { awarded: false };
  } catch (error) {
    console.error('Error checking weekly challenge award:', error);
    return { awarded: false };
  }
};

// ========================= CHALLENGE CRUD OPERATIONS =========================

// Create new coding challenge
const createChallenge = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      project_id,
      title,
      description,
      difficulty_level,
      time_limit_minutes,
      test_cases,
      starter_code,
      expected_solution,
      programming_language_id
    } = req.body;

    if (!title || !description || !programming_language_id) {
      return res.status(400).json({ success: false, message: 'Title, description, and programming language are required' });
    }

    let parsedTestCases;
    try {
      parsedTestCases = typeof test_cases === 'string' ? JSON.parse(test_cases) : test_cases;
    } catch (error) {
      return res.status(400).json({ success: false, message: 'Invalid test cases format. Must be valid JSON.' });
    }

    const { data: challenge, error: challengeError } = await supabase
      .from('coding_challenges')
      .insert({
        project_id: project_id || null,
        title,
        description,
        difficulty_level: difficulty_level || 'easy',
        time_limit_minutes: time_limit_minutes || 30,
        test_cases: parsedTestCases,
        starter_code: starter_code || '',
        expected_solution: expected_solution || '',
        programming_language_id: parseInt(programming_language_id, 10),
        created_by: userId,
        is_active: true,
        created_at: new Date().toISOString()
      })
      .select(`
        *,
        programming_languages (id, name),
        users:created_by (id, username, full_name)
      `)
      .single();

    if (challengeError) {
      console.error('Error creating challenge:', challengeError);
      return res.status(500).json({ success: false, message: 'Failed to create challenge', error: challengeError.message });
    }

    res.status(201).json({ success: true, message: 'Challenge created successfully', data: { challenge } });
  } catch (error) {
    console.error('Create challenge error:', error);
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
};

// Get all challenges with filters
const getChallenges = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      difficulty_level,
      programming_language_id,
      created_by,
      project_id,
      search
    } = req.query;

    const offset = (page - 1) * limit;

    let query = supabase
      .from('coding_challenges')
      .select(`
        *,
        programming_languages (id, name, description),
        users:created_by (id, username, full_name)
      `, { count: 'exact' })
      .eq('is_active', true)
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false });

    if (difficulty_level) {
      query = query.eq('difficulty_level', difficulty_level);
    }

    if (programming_language_id) {
      query = query.eq('programming_language_id', parseInt(programming_language_id, 10));
    }

    if (created_by) {
      query = query.eq('created_by', created_by);
    }

    if (project_id) {
      query = query.eq('project_id', project_id);
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
    }

    const { data: challenges, error, count } = await query;

    if (error) {
      return res.status(500).json({ success: false, message: 'Failed to fetch challenges', error: error.message });
    }

    res.json({
      success: true,
      data: {
        challenges,
        pagination: {
          page: parseInt(page, 10),
          limit: parseInt(limit, 10),
          total: count,
          totalPages: Math.ceil(count / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get challenges error:', error);
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
};

// Get challenge by ID
const getChallengeById = async (req, res) => {
  try {
    const { id } = req.params;

    const { data: challenge, error } = await supabase
      .from('coding_challenges')
      .select(`
        *,
        programming_languages (id, name, description),
        users:created_by (id, username, full_name, avatar_url),
        projects (id, title, description)
      `)
      .eq('id', id)
      .eq('is_active', true)
      .single();

    if (error || !challenge) {
      return res.status(404).json({ success: false, message: 'Challenge not found' });
    }

    res.json({ success: true, data: { challenge } });
  } catch (error) {
    console.error('Get challenge by ID error:', error);
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
};

// Update challenge
const updateChallenge = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;
    const updateData = req.body;

    // Fetch existing challenge
    const { data: existingChallenge, error: findError } = await supabase
      .from('coding_challenges')
      .select('id, created_by, title')
      .eq('id', id)
      .single();

    if (findError || !existingChallenge) {
      return res.status(404).json({ 
        success: false, 
        message: 'Challenge not found' 
      });
    }

    // FIXED: Allow admins/moderators to update any challenge
    const isAdmin = userRole === 'admin' || userRole === 'moderator';
    const isOwner = existingChallenge.created_by === userId;

    if (!isAdmin && !isOwner) {
      return res.status(403).json({ 
        success: false, 
        message: 'You can only update your own challenges' 
      });
    }

    // Parse test_cases if it's a string
    if (updateData.test_cases) {
      try {
        updateData.test_cases = typeof updateData.test_cases === 'string'
          ? JSON.parse(updateData.test_cases)
          : updateData.test_cases;
      } catch (error) {
        return res.status(400).json({ 
          success: false, 
          message: 'Invalid test cases format' 
        });
      }
    }

    // FIXED: Remove updated_at from update (column doesn't exist in DB)
    const { data: challenge, error: updateError } = await supabase
      .from('coding_challenges')
      .update(updateData)  // ✅ Just updateData, no updated_at
      .eq('id', id)
      .select(`
        *,
        programming_languages (id, name),
        users:created_by (id, username, full_name)
      `)
      .single();

    if (updateError) {
      console.error('Database update error:', updateError);
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to update challenge', 
        error: updateError.message 
      });
    }

    res.json({ 
      success: true, 
      message: 'Challenge updated successfully', 
      data: { challenge } 
    });
  } catch (error) {
    console.error('Update challenge error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error', 
      error: error.message 
    });
  }
};

// Delete challenge (soft delete)
const deleteChallenge = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    const { data: existingChallenge, error: findError } = await supabase
      .from('coding_challenges')
      .select('id, created_by, title')
      .eq('id', id)
      .single();

    if (findError || !existingChallenge) {
      return res.status(404).json({ 
        success: false, 
        message: 'Challenge not found' 
      });
    }

    // FIXED: Allow admins/moderators to delete any challenge
    const isAdmin = userRole === 'admin' || userRole === 'moderator';
    const isOwner = existingChallenge.created_by === userId;

    if (!isAdmin && !isOwner) {
      return res.status(403).json({ 
        success: false, 
        message: 'You can only delete your own challenges' 
      });
    }

    // FIXED: Soft delete without updated_at
    const { error: deleteError } = await supabase
      .from('coding_challenges')
      .update({ is_active: false })  // ✅ No updated_at
      .eq('id', id);

    if (deleteError) {
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to delete challenge', 
        error: deleteError.message 
      });
    }

    res.json({ 
      success: true, 
      message: `Challenge "${existingChallenge.title}" deleted successfully` 
    });
  } catch (error) {
    console.error('Delete challenge error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error', 
      error: error.message 
    });
  }
};
// Get challenges by programming language
const getChallengesByLanguage = async (req, res) => {
  try {
    const { languageId } = req.params;
    const { difficulty_level, project_id } = req.query;

    let query = supabase
      .from('coding_challenges')
      .select(`
        *,
        programming_languages (id, name)
      `)
      .eq('programming_language_id', languageId)
      .eq('is_active', true);

    if (difficulty_level) query = query.eq('difficulty_level', difficulty_level);

    if (project_id) {
      query = query.or(`project_id.is.null,project_id.eq.${project_id}`);
    } else {
      query = query.is('project_id', null);
    }

    const { data: challenges, error } = await query;

    if (error) {
      return res.status(500).json({ success: false, message: 'Failed to fetch challenges', error: error.message });
    }

    res.json({ success: true, data: { challenges } });
  } catch (error) {
    console.error('Get challenges by language error:', error);
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
};

// ========================= USER ATTEMPT OPERATIONS =========================

// Get user's challenge attempts
const getUserAttempts = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const { data: attempts, error, count } = await supabase
      .from('challenge_attempts')
      .select(`
        *,
        coding_challenges (id, title, difficulty_level, programming_language_id),
        projects (id, title)
      `, { count: 'exact' })
      .eq('user_id', userId)
      .order('submitted_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      return res.status(500).json({ success: false, message: 'Failed to fetch attempts', error: error.message });
    }

    res.json({
      success: true,
      data: {
        attempts,
        pagination: {
          page: parseInt(page, 10),
          limit: parseInt(limit, 10),
          total: count,
          totalPages: Math.ceil(count / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get user attempts error:', error);
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
};

// Get user statistics
const getUserStats = async (req, res) => {
  try {
    const userId = req.user.id;

    const { data: attempts, error } = await supabase
      .from('challenge_attempts')
      .select('status, score, difficulty_level:coding_challenges(difficulty_level)')
      .eq('user_id', userId);

    if (error) {
      return res.status(500).json({ success: false, message: 'Failed to fetch statistics', error: error.message });
    }

    const stats = {
      total_attempts: attempts.length,
      passed: attempts.filter(a => a.status === 'passed').length,
      failed: attempts.filter(a => a.status === 'failed').length,
      pending: attempts.filter(a => a.status === 'pending').length,
      average_score: attempts.length > 0
        ? Math.round(attempts.reduce((sum, a) => sum + (a.score || 0), 0) / attempts.length)
        : 0
    };

    res.json({ success: true, data: stats });
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
};

// Get specific attempt details
const getAttemptDetails = async (req, res) => {
  try {
    const { attemptId } = req.params;
    const userId = req.user.id;

    const { data: attempt, error } = await supabase
      .from('challenge_attempts')
      .select(`
        *,
        coding_challenges (*,  programming_languages (id, name)),
        projects (id, title)
      `)
      .eq('id', attemptId)
      .eq('user_id', userId)
      .single();

    if (error || !attempt) {
      return res.status(404).json({ success: false, message: 'Attempt not found' });
    }

    res.json({ success: true, data: { attempt } });
  } catch (error) {
    console.error('Get attempt details error:', error);
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
};

// ========================= SIMPLE CHALLENGE SUBMISSION (FOR SOLO WEEKLY CHALLENGES) =========================

// Submit simple challenge (for solo projects weekly challenges)
const submitSimpleChallenge = async (req, res) => {
  try {
    const { challenge_id, submitted_code, notes, language, project_id } = req.body;
    const userId = req.user.id;

    console.log('📝 Simple challenge submission (NO Judge0):', {
      challenge_id,
      userId,
      project_id: project_id || 'none',
      code_length: submitted_code?.length,
      type: 'SIMPLE_PRACTICE'
    });

    // ===== Validation =====
    if (!challenge_id) {
      return res.status(400).json({
        success: false,
        message: 'Challenge ID is required'
      });
    }

    if (!submitted_code || submitted_code.trim().length < 10) {
      return res.status(400).json({
        success: false,
        message: 'Code submission is too short. Please provide a more complete solution (minimum 10 characters).'
      });
    }

    // ===== Get Challenge Details =====
    const { data: challenge, error: challengeError } = await supabase
      .from('coding_challenges')
      .select(`
        id, 
        title, 
        description, 
        difficulty_level, 
        time_limit_minutes,
        test_cases, 
        expected_solution, 
        programming_language_id,
        programming_languages (id, name)
      `)
      .eq('id', challenge_id)
      .single();

    if (challengeError || !challenge) {
      console.error('Challenge not found:', challengeError);
      return res.status(404).json({
        success: false,
        message: 'Challenge not found'
      });
    }

    // ===== SIMPLE SCORING SYSTEM (NO Judge0 execution) =====
    let score = 0;
    let status = 'completed';
    let feedback = '';
    
    // Basic code quality metrics
    const codeLength = submitted_code.trim().length;
    const hasFunction = /function\s+\w+|const\s+\w+\s*=|def\s+\w+|class\s+\w+|func\s+\w+|fn\s+\w+|public\s+\w+|private\s+\w+/i.test(submitted_code);
    const hasLogic = /if\s*\(|for\s*\(|while\s*\(|switch\s*\(|forEach|map|filter|reduce|match|case/i.test(submitted_code);
    const hasReturn = /return\s+|yield\s+|res\.json|echo\s+|print\s+|println/i.test(submitted_code);
    const hasComments = /\/\/|\/\*|\*\/|#|"""|'''|<!--/g.test(submitted_code);
    const hasVariables = /const\s+\w+|let\s+\w+|var\s+\w+|:\w+\s+=/i.test(submitted_code);
    
    // Calculate quality score (0-100)
    if (codeLength > 20) score += 20;
    if (hasFunction) score += 30;
    if (hasLogic) score += 25;
    if (hasReturn) score += 15;
    if (hasComments) score += 5;
    if (hasVariables) score += 5;
    if (codeLength > 100) score += 5;
    if (codeLength > 200) score += 5;
    
    score = Math.min(100, score);
    
    // Determine pass status (for skill rating)
    const passed = score >= 70;
    status = passed ? 'passed' : 'completed';
    
    // Generate feedback
    if (score >= 90) {
      feedback = '🎉 Excellent work! Your code demonstrates exceptional programming skills and best practices.';
    } else if (score >= 80) {
      feedback = '🌟 Great job! Your code shows strong understanding and good structure.';
    } else if (score >= 70) {
      feedback = '👍 Good effort! Your code demonstrates solid programming fundamentals.';
    } else if (score >= 60) {
      feedback = '💪 Nice try! Your solution shows promise. Consider adding more structure and logic.';
    } else if (score >= 40) {
      feedback = '📚 Keep practicing! Try including functions, control flow, and proper code structure.';
    } else {
      feedback = '🌱 Good start! Focus on creating complete functions with logic and return values.';
    }

    if (challenge.difficulty_level === 'hard' || challenge.difficulty_level === 'expert') {
      feedback += ' This is a challenging problem - great effort tackling it!';
    }

    // ===== Create Challenge Attempt Record =====
    // FIXED: Using only the fields that exist in your schema
    const { data: attempt, error: attemptError } = await supabase
      .from('challenge_attempts')
      .insert({
        challenge_id,
        user_id: userId,
        project_id: project_id || null,
        submitted_code,
        status, // 'passed' or 'completed'
        score,
        feedback,
        results: null, // Using 'results' instead of 'test_results'
        started_at: new Date().toISOString(),
        submitted_at: new Date().toISOString(),
        reviewed_at: new Date().toISOString(),
        solve_time_minutes: 0
        // REMOVED: completed_at (doesn't exist in schema)
        // REMOVED: notes field (doesn't exist in schema)
        // REMOVED: test_results (your schema uses 'results' instead)
      })
      .select()
      .single();

    if (attemptError) {
      console.error('Error creating simple challenge attempt:', attemptError);
      return res.status(500).json({
        success: false,
        message: 'Failed to record challenge attempt',
        error: attemptError.message
      });
    }

    console.log('✅ Simple challenge attempt created:', {
      attempt_id: attempt.id,
      score,
      status,
      passed
    });

    // ===== Update Skill Ratings (ELO System) =====
    try {
      if (challenge.programming_language_id) {
        console.log('📊 Updating skill ratings:', {
          userId,
          programmingLanguageId: challenge.programming_language_id,
          challengeId: challenge_id,
          passed
        });

        await updateSkillRatings(
          userId, 
          challenge.programming_language_id, 
          challenge_id, 
          passed
        );

        console.log('✅ Skill ratings updated successfully');
      } else {
        console.warn('⚠️ No programming_language_id found, skipping skill rating update');
      }
    } catch (ratingError) {
      console.error('❌ Error updating skill ratings:', ratingError);
      // Non-blocking - don't fail the request
    }

    // ===== Check for Weekly Challenge Award =====
    let awardResult = { awarded: false };
    
    if (project_id) {
      try {
        awardResult = await checkWeeklyChallengeAwardAfterSubmission(userId, project_id);
        
        if (awardResult.awarded) {
          console.log('🎉 User earned Challenge Champion award!', {
            userId,
            projectId: project_id,
            awardId: awardResult.award?.id
          });
        }
      } catch (awardError) {
        console.warn('Award check failed (non-blocking):', awardError.message);
      }
    }

    // ===== Return Success Response =====
    return res.json({
      success: true,
      message: 'Challenge completed successfully!',
      data: {
        attempt: {
          id: attempt.id,
          challenge_id: attempt.challenge_id,
          score: attempt.score,
          status: attempt.status,
          feedback: attempt.feedback,
          submitted_at: attempt.submitted_at
        },
        score,
        feedback,
        status,
        passed,
        challengeType: 'simple',
        challenge: {
          id: challenge.id,
          title: challenge.title,
          difficulty_level: challenge.difficulty_level,
          programming_language_id: challenge.programming_language_id
        },
        award: awardResult.awarded ? awardResult.award : null,
        awardMessage: awardResult.awarded ? 
          'Congratulations! You earned the Challenge Champion award!' : null,
        skillRatingUpdated: !!challenge.programming_language_id
      }
    });

  } catch (error) {
    console.error('Submit simple challenge error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error while submitting challenge',
      error: error.message
    });
  }
};

// ========================= ADAPTIVE CHALLENGE SELECTION =========================

// Get next challenge (adaptive difficulty)
const getNextChallenge = async (req, res) => {
  try {
    const userId = req.user.id;
    const { programming_language_id, project_id } = req.query;

    // Get user's skill rating
    const { data: userSkill } = await supabase
      .from('user_skill_ratings')
      .select('rating, attempts')
      .eq('user_id', userId)
      .eq('programming_language_id', programming_language_id)
      .single();

    const userRating = userSkill?.rating || 1200;

    // Get challenges near user's skill level
    let query = supabase
      .from('coding_challenges')
      .select(`
        *,
        programming_languages (id, name),
        challenge_ratings (rating)
      `)
      .eq('is_active', true)
      .eq('programming_language_id', programming_language_id);

    if (project_id) {
      query = query.or(`project_id.is.null,project_id.eq.${project_id}`);
    } else {
      query = query.is('project_id', null);
    }

    const { data: challenges, error } = await query;

    if (error || !challenges || challenges.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No challenges available'
      });
    }

    // Find best match based on rating
    const bestChallenge = challenges.sort((a, b) => {
      const ratingA = a.challenge_ratings?.[0]?.rating || mapDifficultyToElo(a.difficulty_level);
      const ratingB = b.challenge_ratings?.[0]?.rating || mapDifficultyToElo(b.difficulty_level);
      return Math.abs(ratingA - userRating) - Math.abs(ratingB - userRating);
    })[0];

    res.json({
      success: true,
      data: { challenge: bestChallenge, userRating }
    });

  } catch (error) {
    console.error('Get next challenge error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// ========================= SKILL RATING SYSTEM =========================

// Map difficulty to initial ELO rating
const mapDifficultyToElo = (difficulty) => {
  const map = { easy: 1000, medium: 1200, hard: 1400, expert: 1600 };
  return map[difficulty?.toLowerCase()] || 1200;
};

// Update skill ratings using ELO system
const updateSkillRatings = async (userId, programming_language_id, challengeId, pass) => {
  const Kbase = 32;

  const { data: u } = await supabase
    .from('user_skill_ratings').select('rating, attempts')
    .eq('user_id', userId).eq('programming_language_id', programming_language_id).single();

  const userRating = u?.rating || 1200;
  const userAttempts = u?.attempts || 0;

  const { data: c } = await supabase
    .from('challenge_ratings').select('rating, attempts, pass_count')
    .eq('challenge_id', challengeId).single();

  let chRating = c?.rating;
  if (chRating == null) {
    const { data: chRow } = await supabase.from('coding_challenges').select('difficulty_level').eq('id', challengeId).single();
    chRating = mapDifficultyToElo(chRow?.difficulty_level);
  }
  const chAttempts = c?.attempts ?? 0;
  const chPass = c?.pass_count ?? 0;

  const expectedUser = 1 / (1 + Math.pow(10, (chRating - userRating) / 400));
  const S = pass ? 1 : 0;

  const Kuser = Math.max(16, Kbase - Math.floor(userAttempts / 5));
  const Kch = Math.max(12, Kbase - Math.floor(chAttempts / 10));

  const newUser = Math.round(userRating + Kuser * (S - expectedUser));
  const newCh = Math.round(chRating + Kch * ((1 - S) - (1 - expectedUser)));

  await supabase.from('user_skill_ratings').upsert({
    user_id: userId,
    programming_language_id,
    rating: newUser,
    attempts: userAttempts + 1,
    last_updated: new Date().toISOString()
  });

  await supabase.from('challenge_ratings').upsert({
    challenge_id: challengeId,
    rating: newCh,
    attempts: chAttempts + 1,
    pass_count: chPass + (pass ? 1 : 0),
    last_updated: new Date().toISOString()
  });
};

// ========================= EXPORTS =========================
module.exports = {
  createChallenge,
  getChallenges,
  getChallengeById,
  updateChallenge,
  deleteChallenge,
  getChallengesByLanguage,
  getUserAttempts,
  getUserStats,
  getAttemptDetails,
  submitSimpleChallenge,
  getNextChallenge,
  updateSkillRatings,
  checkWeeklyChallengeAwardAfterSubmission
};