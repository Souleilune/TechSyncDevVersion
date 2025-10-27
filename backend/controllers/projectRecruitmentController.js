// backend/controllers/projectRecruitmentController.js - FIXED WITH JUDGE0 INTEGRATION
const supabase = require('../config/supabase');
const { updateSkillRatings } = require('./challengeController');
const { runTests } = require('../utils/codeEvaluator'); // ADD THIS IMPORT

/* ============================== Helper Functions ============================== */

// Get failed attempts count for a user on a specific project
const getFailedAttemptsCount = async (userId, projectId) => {
  try {
    const { data, error } = await supabase
      .from('challenge_attempts')
      .select('id, status')
      .eq('user_id', userId)
      .eq('project_id', projectId)
      .eq('status', 'failed');

    if (error) {
      console.error('Error fetching failed attempts:', error);
      return 0;
    }

    return data ? data.length : 0;
  } catch (error) {
    console.error('Error in getFailedAttemptsCount:', error);
    return 0;
  }
};

// Generate comforting message based on attempt count
const generateComfortingMessage = (attemptCount, projectTitle) => {
  const messages = [
    {
      threshold: 10,
      message: `You've tried ${attemptCount} times to join "${projectTitle}". It's completely okay to take a break and come back stronger! Consider exploring beginner-friendly resources or trying a different project that matches your current skill level. Remember, every expert was once a beginner!`
    },
    {
      threshold: 7,
      message: `It seems like you're having a hard time entering the "${projectTitle}" project and answering the challenge. Don't worry, coding challenges can be tricky! Consider reviewing the requirements again, or perhaps this project might be more advanced than your current skill level. Keep practicing and you'll get there!`
    }
  ];

  for (const msg of messages) {
    if (attemptCount >= msg.threshold) {
      return msg.message;
    }
  }
  return 'Keep trying! You can do this!';
};

// Get starter code for a programming language
function getStarterCodeForLanguage(languageName) {
  const starterCodes = {
    JavaScript: '// Your JavaScript solution here\nfunction solution() {\n    // TODO: Implement your solution\n    return null;\n}',
    Python: '# Your Python solution here\ndef solution():\n    # TODO: Implement your solution\n    pass',
    Java: '// Your Java solution here\npublic class Solution {\n    public static void main(String[] args) {\n        // TODO: Implement your solution\n    }\n}',
    'C++': '// Your C++ solution here\n#include <iostream>\nusing namespace std;\n\nint main() {\n    // TODO: Implement your solution\n    return 0;\n}',
    'C#': '// Your C# solution here\nusing System;\n\nclass Program {\n    static void Main() {\n        // TODO: Implement your solution\n    }\n}',
    Go: '// Your Go solution here\npackage main\n\nimport "fmt"\n\nfunc main() {\n    // TODO: Implement your solution\n}',
    Rust: '// Your Rust solution here\nfn main() {\n    // TODO: Implement your solution\n}',
    TypeScript: '// Your TypeScript solution here\nfunction solution(): any {\n    // TODO: Implement your solution\n    return null;\n}',
    C: '// Your C solution here\n#include <stdio.h>\n\nint main() {\n    // TODO: Implement your solution\n    return 0;\n}',
    PHP: '<?php\n// Your PHP solution here\nfunction solution() {\n    // TODO: Implement your solution\n}\n?>',
    Ruby: '# Your Ruby solution here\ndef solution\n    # TODO: Implement your solution\nend',
    Swift: '// Your Swift solution here\nfunc solution() {\n    // TODO: Implement your solution\n}',
    Kotlin: '// Your Kotlin solution here\nfun solution() {\n    // TODO: Implement your solution\n}'
  };
  return starterCodes[languageName] || `// Your ${languageName} solution here\n// TODO: Implement your solution`;
}

// FALLBACK: Heuristic evaluation (used only if Judge0 fails or no test cases)
function evaluateCodeSubmissionHeuristic(code, project) {
  const src = String(code || '');
  const trimmed = src.trim();

  let score = 0;
  let feedback = '';
  const details = {
    hasFunction: false,
    hasLogic: false,
    hasComments: false,
    properStructure: false,
    languageMatch: false,
    complexity: 0
  };

  if (trimmed.length < 20) {
    return {
      score: 0,
      feedback: 'Your solution is too short. Please provide a more complete implementation.',
      details
    };
  }

  const lower = trimmed.toLowerCase();
  const isPlaceholder =
    lower.includes('todo') ||
    lower.includes('placeholder') ||
    lower.includes('your code here') ||
    lower.includes('implement') ||
    lower.includes('hello world');

  if (isPlaceholder && trimmed.length < 100) {
    return {
      score: 15,
      feedback: 'Your solution appears to contain placeholder code. Please implement a proper solution.',
      details
    };
  }

  // Language context
  const projLangs = project?.project_languages || [];
  const primaryLangName = (projLangs.find(pl => pl.is_primary)?.programming_languages?.name || '').toLowerCase();

  // Basic scoring
  const functionClues = ['function ', 'def ', '=>', 'class ', 'static void main', 'fn '];
  details.hasFunction = functionClues.some(t => lower.includes(t));
  if (details.hasFunction) score += 25;

  const logicClues = ['if(', 'for(', 'while(', 'switch(', 'elif:', 'else:', 'return '];
  details.hasLogic = logicClues.some(t => lower.includes(t));
  if (details.hasLogic) score += 20;

  const hasComments =
    src.includes('//') ||
    (src.includes('/*') && src.includes('*/')) ||
    src.includes('#');
  details.hasComments = hasComments;
  if (details.hasComments) score += 10;

  let complexity = 0;
  if (src.includes('{') && src.includes('}')) complexity++;
  if (src.includes('[') && src.includes(']')) complexity++;
  details.complexity = complexity;
  score += Math.min(details.complexity * 3, 15);

  const lines = src.split('\n');
  const nonEmpty = lines.filter(l => l.trim().length > 0);
  const indented = lines.filter(l => /^\s+/.test(l));
  details.properStructure = nonEmpty.length >= 3 && (indented.length / Math.max(1, nonEmpty.length)) > 0.3;
  if (details.properStructure) score += 10;

  if (trimmed.length > 50) score += 20;

  feedback = score >= 70 
    ? 'Good job! Your solution meets the basic requirements.' 
    : 'Your solution needs improvement. Make sure to include functions, logic, and proper structure.';

  return {
    score: Math.max(0, Math.min(100, score)),
    feedback,
    details
  };
}

/* ============================== Route Handlers ============================== */

// GET /api/challenges/project/:projectId/challenge
const getProjectChallenge = async (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.user.id;

    // Check membership
    const { data: membership } = await supabase
      .from('project_members')
      .select('*')
      .eq('project_id', projectId)
      .eq('user_id', userId)
      .single();

    if (membership) {
      return res.status(400).json({
        success: false,
        message: 'You are already a member of this project'
      });
    }

    // Get project with languages
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select(`
        *,
        project_languages(
          language_id,
          is_primary,
          required_level,
          programming_languages(id, name)
        )
      `)
      .eq('id', projectId)
      .single();

    if (projectError || !project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    // Get primary language for the project
    const projPrimaryLang = project.project_languages?.find(pl => pl.is_primary);
    const primaryLanguageId = projPrimaryLang?.language_id || project.project_languages?.[0]?.language_id;
    const primaryLanguageName = projPrimaryLang?.programming_languages?.name || project.project_languages?.[0]?.programming_languages?.name || 'JavaScript';

    console.log('🔍 Looking for challenges for language:', primaryLanguageName, 'ID:', primaryLanguageId);

    // Try to find a real challenge matching the project's language
    if (primaryLanguageId) {
      const { data: languageMatchingChallenges, error: challengeError } = await supabase
        .from('coding_challenges')
        .select(`
          *,
          programming_languages(id, name)
        `)
        .eq('programming_language_id', primaryLanguageId)
        .eq('is_active', true)
        .is('project_id', null) // Generic challenges have no project_id
        .order('difficulty_level', { ascending: true })
        .limit(5);

      if (challengeError) {
        console.error('Error fetching language-matching challenges:', challengeError);
      }

      if (languageMatchingChallenges && languageMatchingChallenges.length > 0) {
        // Pick a random challenge from the matching ones
        const selectedChallenge = languageMatchingChallenges[Math.floor(Math.random() * languageMatchingChallenges.length)];
        
        console.log('✅ Found generic challenge matching language:', {
          challengeId: selectedChallenge.id,
          challengeTitle: selectedChallenge.title,
          languageId: selectedChallenge.programming_language_id,
          languageName: selectedChallenge.programming_languages?.name
        });

        return res.json({
          success: true,
          challenge: selectedChallenge,
          project: {
            id: project.id,
            title: project.title,
            description: project.description,
            primaryLanguage: primaryLanguageName,
            availableSpots: project.maximum_members - project.current_members
          }
        });
      } else {
        console.log('⚠️ No matching challenges found for language ID:', primaryLanguageId);
      }
    }

    // FALLBACK: Create temporary challenge if no real challenges exist
    console.log('⚠️ Creating temporary fallback challenge');
    const langForTemp = projPrimaryLang?.programming_languages || { id: 2, name: 'JavaScript' };
    const selectedChallenge = {
      id: `temp_${projectId}_${Date.now()}`,
      project_id: projectId,
      title: `Join ${project.title}`,
      description: `Please complete this coding challenge to demonstrate your skills.\n\nTask: Write a function that demonstrates your ${langForTemp.name} programming skills.`,
      difficulty_level: 'medium',
      time_limit_minutes: 60,
      starter_code: getStarterCodeForLanguage(langForTemp.name),
      test_cases: null,
      programming_language_id: langForTemp.id,
      programming_languages: langForTemp,
      isTemporary: true
    };

    return res.json({
      success: true,
      challenge: selectedChallenge,
      project: {
        id: project.id,
        title: project.title,
        description: project.description,
        primaryLanguage: primaryLanguageName,
        availableSpots: project.maximum_members - project.current_members
      }
    });
  } catch (error) {
    console.error('Error in getProjectChallenge:', error);
    return res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
};

// GET /api/challenges/project/:projectId/can-attempt
const canAttemptChallenge = async (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.user.id;

    // Already a member?
    const { data: membership } = await supabase
      .from('project_members')
      .select('*')
      .eq('project_id', projectId)
      .eq('user_id', userId)
      .single();

    if (membership) {
      return res.json({
        canAttempt: false,
        reason: 'already_member',
        message: 'You are already a member of this project'
      });
    }

    // Check failed attempts
    const failedAttemptsCount = await getFailedAttemptsCount(userId, projectId);

    // Check if we should show alert
    let alertData = null;
    if (failedAttemptsCount >= 7) {
      const { data: project } = await supabase
        .from('projects')
        .select('title, project_languages(language_id, is_primary)')
        .eq('id', projectId)
        .single();

      const title = project?.title || 'this project';
      const plId = project?.project_languages?.find(pl => pl.is_primary)?.language_id ||
                   project?.project_languages?.[0]?.language_id ||
                   2;

      alertData = {
        shouldShow: true,
        attemptCount: failedAttemptsCount,
        message: generateComfortingMessage(failedAttemptsCount, title),
        programmingLanguageId: plId
      };
    }

    return res.json({
      canAttempt: true,
      failedAttempts: failedAttemptsCount,
      alertData
    });
  } catch (error) {
    console.error('Error in canAttemptChallenge:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// POST /api/challenges/project/:projectId/attempt
const submitChallengeAttempt = async (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.user.id;
    const { submittedCode, startedAt, challengeId } = req.body;

    console.log('🎯 Starting challenge submission:', {
      projectId,
      userId,
      challengeId,
      codeLength: submittedCode?.length
    });

    // Get project with languages
    const { data: project } = await supabase
      .from('projects')
      .select(`
        *,
        project_languages(
          language_id,
          is_primary,
          programming_languages(id, name)
        )
      `)
      .eq('id', projectId)
      .single();

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    // Get the challenge details if available
    let challenge = null;
    let useJudge0 = false;
    let evaluation = null;

    if (challengeId && !challengeId.startsWith('temp_')) {
      const { data: challengeData } = await supabase
        .from('coding_challenges')
        .select('*')
        .eq('id', challengeId)
        .single();
      
      challenge = challengeData;

      // Check if challenge has test cases for Judge0 evaluation
      if (challenge && challenge.test_cases) {
        useJudge0 = true;
        console.log('✅ Challenge has test cases, using Judge0 evaluation');
      }
    }

    let finalScore = 0;
    let feedback = '';
    let passed = false;
    let testResults = null;

    // USE JUDGE0 IF TEST CASES ARE AVAILABLE
    if (useJudge0 && challenge) {
      try {
        console.log('🔧 Running Judge0 code execution...');
        
        const languageName = challenge.programming_languages?.name || 
                           project.project_languages?.find(pl => pl.is_primary)?.programming_languages?.name ||
                           'JavaScript';

        const judge0Result = await runTests({
          sourceCode: submittedCode,
          languageName: languageName,
          testCases: challenge.test_cases,
          challengeId: challenge.id,
          timeLimitMs: (challenge.time_limit_minutes || 5) * 60 * 1000,
          memoryLimitMb: 256
        });

        console.log('✅ Judge0 execution complete:', {
          passedCount: judge0Result.passedCount,
          totalCount: judge0Result.totalCount,
          allPassed: judge0Result.allPassed
        });

        // Calculate score based on test results
        finalScore = judge0Result.totalCount > 0 
          ? Math.round((judge0Result.passedCount / judge0Result.totalCount) * 100)
          : 0;

        passed = judge0Result.allPassed && finalScore >= 70;

        // Generate feedback based on test results
        if (passed) {
          feedback = `🎉 Excellent work! All ${judge0Result.totalCount} test cases passed!`;
        } else if (judge0Result.passedCount > 0) {
          feedback = `Good effort! You passed ${judge0Result.passedCount} out of ${judge0Result.totalCount} test cases. Keep working on the remaining cases.`;
        } else {
          feedback = `None of the test cases passed. Review the requirements and try again.`;
        }

        testResults = judge0Result.tests;

        evaluation = {
          score: finalScore,
          feedback: feedback,
          testResults: testResults,
          passedCount: judge0Result.passedCount,
          totalCount: judge0Result.totalCount,
          executionTimeMs: judge0Result.totalTimeMs,
          memoryUsageKb: judge0Result.peakMemoryKb,
          usedJudge0: true
        };

        console.log('✅ Judge0 evaluation complete:', {
          score: finalScore,
          passed: passed,
          passedTests: judge0Result.passedCount,
          totalTests: judge0Result.totalCount
        });

      } catch (judge0Error) {
        console.error('❌ Judge0 execution failed:', judge0Error);
        console.log('⚠️ Falling back to heuristic evaluation');
        
        // Fallback to heuristic evaluation
        const heuristicResult = evaluateCodeSubmissionHeuristic(submittedCode, project);
        finalScore = heuristicResult.score;
        feedback = heuristicResult.feedback + ' (Note: Could not execute code, used basic evaluation)';
        passed = finalScore >= 70;
        
        evaluation = {
          score: finalScore,
          feedback: feedback,
          details: heuristicResult.details,
          usedJudge0: false,
          judge0Error: judge0Error.message
        };
      }
    } else {
      // No test cases available - use heuristic evaluation
      console.log('⚠️ No test cases available, using heuristic evaluation');
      
      const heuristicResult = evaluateCodeSubmissionHeuristic(submittedCode, project);
      finalScore = heuristicResult.score;
      feedback = heuristicResult.feedback;
      passed = finalScore >= 70;
      
      evaluation = {
        score: finalScore,
        feedback: feedback,
        details: heuristicResult.details,
        usedJudge0: false
      };
    }

    // Create attempt record - FIXED: using submitted_at instead of completed_at
    const { data: attempt, error: attemptError } = await supabase
      .from('challenge_attempts')
      .insert({
        user_id: userId,
        challenge_id: challengeId && !challengeId.startsWith('temp_') ? challengeId : null,
        project_id: projectId,
        submitted_code: submittedCode,
        score: finalScore,
        status: passed ? 'passed' : 'failed',
        started_at: startedAt || new Date().toISOString(),
        submitted_at: new Date().toISOString(), // ✅ FIXED: use submitted_at instead of completed_at
        feedback: feedback,
        test_cases_passed: evaluation.passedCount || 0,
        total_test_cases: evaluation.totalCount || 0,
        execution_time_ms: evaluation.executionTimeMs || 0,
        memory_usage_mb: evaluation.memoryUsageKb ? Math.round(evaluation.memoryUsageKb / 1024) : 0,
        results: testResults ? { tests: testResults } : null
      })
      .select()
      .single();

    if (attemptError) {
      console.error('Error creating attempt:', attemptError);
      return res.status(500).json({ success: false, message: 'Failed to record attempt' });
    }

    console.log('✅ Attempt record created:', {
      attemptId: attempt.id,
      score: finalScore,
      passed: passed,
      status: attempt.status
    });

    // If passed, add user to project
    let projectJoined = false;
    let membershipData = null;

    if (passed) {
      const { data: newMember, error: memberError } = await supabase
        .from('project_members')
        .insert({
          project_id: projectId,
          user_id: userId,
          role: 'member',
          joined_at: new Date().toISOString()
        })
        .select()
        .single();

      if (!memberError && newMember) {
        projectJoined = true;
        membershipData = newMember;

        // Update project member count
        const { error: updateError } = await supabase
          .from('projects')
          .update({
            current_members: (project.current_members || 0) + 1
          })
          .eq('id', projectId);

        if (updateError) {
          console.error('Error updating project member count:', updateError);
        }

        console.log('🎉 User successfully joined project!');
      }
    }

    // Update skill ratings (non-blocking)
    try {
      if (challengeId && !challengeId.startsWith('temp_')) {
        const plId = project.project_languages?.find(pl => pl.is_primary)?.language_id ||
                     project.project_languages?.[0]?.language_id ||
                     null;

        if (plId) {
          await updateSkillRatings(userId, plId, challengeId, passed);
          console.log('✅ Skill ratings updated');
        }
      }
    } catch (e) {
      console.warn('Rating update failed (non-blocking):', e.message);
    }

    // Alert data on fail
    let alertData = null;
    if (!passed) {
      const failedAttemptsCount = await getFailedAttemptsCount(userId, projectId);
      if (failedAttemptsCount >= 7) {
        const title = project.title || 'this project';
        
        const plId = project.project_languages?.find(pl => pl.is_primary)?.language_id ||
                     project.project_languages?.[0]?.language_id ||
                     2;

        alertData = {
          shouldShow: true,
          attemptCount: failedAttemptsCount,
          message: generateComfortingMessage(failedAttemptsCount, title),
          challengeId: challenge?.id,
          programmingLanguageId: plId,
          difficultyLevel: challenge?.difficulty_level || 'beginner'
        };
        
        console.log('Alert data created:', alertData);
      }
    }

    return res.json({
      success: true,
      data: {
        attempt,
        score: finalScore,
        passed,
        projectJoined,
        feedback,
        membership: membershipData,
        status: passed ? 'passed' : 'failed',
        evaluation,
        alertData
      }
    });
  } catch (error) {
    console.error('Error in submitChallengeAttempt:', error);
    return res.status(200).json({
      success: true,
      data: {
        attempt: null,
        score: 0,
        passed: false,
        projectJoined: false,
        feedback: 'There was an issue evaluating your solution. Please check your code and try again.',
        status: 'error'
      }
    });
  }
};

// GET /api/challenges/project/:projectId/failed-attempts-count
const getFailedAttemptsCountHandler = async (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.user.id;

    const count = await getFailedAttemptsCount(userId, projectId);

    res.json({
      success: true,
      count
    });
  } catch (error) {
    console.error('Error in getFailedAttemptsCountHandler:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

/* ============================== Exports ============================== */
module.exports = {
  getProjectChallenge,
  canAttemptChallenge,
  submitChallengeAttempt,
  getFailedAttemptsCount: getFailedAttemptsCountHandler,
  generateComfortingMessage
};