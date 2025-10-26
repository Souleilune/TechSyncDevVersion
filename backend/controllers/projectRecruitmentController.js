// backend/controllers/projectRecruitmentController.js - COMPLETE FIXED VERSION
'use strict';
// @ts-nocheck

const supabase = require('../config/supabase');
const { runTests } = require('../utils/codeEvaluator');
const { updateSkillRatings } = require('./challengeController');

/* ============================== Helper Functions ============================== */

// Count user's failed attempts for a specific project
const getFailedAttemptsCount = async (userId, projectId) => {
  try {
    const { data: failedAttempts, error } = await supabase
      .from('challenge_attempts')
      .select('id')
      .eq('user_id', userId)
      .eq('project_id', projectId)
      .eq('status', 'failed');

    if (error) {
      console.error('Error counting failed attempts:', error);
      return 0;
    }
    return failedAttempts ? failedAttempts.length : 0;
  } catch (error) {
    console.error('Error in getFailedAttemptsCount:', error);
    return 0;
  }
};

// Comforting message based on attempt count
const generateComfortingMessage = (attemptCount, projectTitle) => {
  const messages = [
    {
      threshold: 15,
      message: `You've made ${attemptCount} attempts at "${projectTitle}" - that shows incredible persistence! Sometimes it helps to step back and approach the problem from a different angle. Consider reaching out to the community for tips, or exploring similar but simpler projects to build your confidence. You've got this!`
    },
    {
      threshold: 10,
      message: `We notice you've been persistently trying to join "${projectTitle}". Your determination is admirable! However, you might want to take a short break, review some coding tutorials, or try some easier projects first. Remember, every expert was once a beginner!`
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
    TypeScript: '// Your TypeScript solution here\nfunction solution(): any {\n    // TODO: Implement your solution\n    return null;\n}'
  };
  return starterCodes[languageName] || `// Your ${languageName} solution here\n// TODO: Implement your solution`;
}

// Check if code matches expected language
function checkLanguageMatch(code, langName) {
  const s = code.toLowerCase();
  const lang = (langName || '').toLowerCase();
  switch (lang) {
    case 'javascript':
    case 'typescript':
      return s.includes('function ') || s.includes('=>') || s.includes('console.log');
    case 'python':
      return s.includes('def ') || s.includes('import ') || s.includes('print(');
    case 'java':
      return s.includes('public class') || s.includes('static void main') || s.includes('system.out.println');
    case 'c++':
    case 'cpp':
      return s.includes('#include') || s.includes('using namespace') || s.includes('int main(');
    case 'c#':
    case 'csharp':
      return s.includes('using system') || s.includes('public class') || s.includes('console.writeline');
    case 'go':
      return s.includes('package main') || s.includes('func main(');
    case 'rust':
      return s.includes('fn main(');
    default:
      return hasAnyProgrammingLanguageFeatures(s);
  }
}

function hasAnyProgrammingLanguageFeatures(code) {
  const s = code.toLowerCase();
  return [
    'function ', 'def ', 'class ', '=>',
    'if(', 'for(', 'while(', 'switch(',
    'return ', '#include', 'import '
  ].some(t => s.includes(t));
}

// Heuristic code evaluation
function evaluateCodeSubmission(code, project) {
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

  // Language match
  if (primaryLangName) {
    details.languageMatch = checkLanguageMatch(trimmed, primaryLangName);
    if (details.languageMatch) score += 20;
  } else if (hasAnyProgrammingLanguageFeatures(trimmed)) {
    score += 15;
  }

  // Function/method clues
  const functionClues = ['function ', 'def ', '=>', 'class ', 'static void main', 'fn '];
  details.hasFunction = functionClues.some(t => lower.includes(t));
  if (details.hasFunction) score += 25;

  // Logic structures
  const logicClues = ['if(', 'for(', 'while(', 'switch(', 'elif:', 'else:', 'return '];
  details.hasLogic = logicClues.some(t => lower.includes(t));
  if (details.hasLogic) score += 20;

  // Comments
  const hasComments =
    src.includes('//') ||
    (src.includes('/*') && src.includes('*/')) ||
    src.includes('#') ||
    (src.includes('"""') && src.split('"""').length >= 3) ||
    (src.includes("'''") && src.split("'''").length >= 3);
  details.hasComments = hasComments;
  if (details.hasComments) score += 10;

  // Complexity indicators
  let complexity = 0;
  if (src.includes('{') && src.includes('}')) complexity++;
  if (src.includes('[') && src.includes(']')) complexity++;
  const opChars = ['=', '+', '-', '*', '/', '%'];
  if (opChars.some(ch => src.includes(ch))) complexity++;
  if (src.includes('&&') || src.includes('||') || lower.includes(' and ') || lower.includes(' or ')) complexity++;
  details.complexity = complexity;
  score += Math.min(details.complexity * 3, 15);

  // Structure: lines & indentation
  const lines = src.split('\n');
  const nonEmpty = lines.filter(l => l.trim().length > 0);
  const indented = lines.filter(l => /^\s+/.test(l));
  details.properStructure = nonEmpty.length >= 3 && (indented.length / Math.max(1, nonEmpty.length)) > 0.3;
  if (details.properStructure) score += 10;

  // Cap for very short code
  if (trimmed.length < 50 && score > 40) score = Math.min(score, 40);

  feedback = generateDetailedFeedback(score, details, primaryLangName || null);

  return {
    score: Math.max(0, Math.min(100, score)),
    feedback,
    details
  };
}

function generateDetailedFeedback(score, details, primaryLanguage) {
  let fb = '';
  if (score >= 80) {
    fb = 'Excellent work! Your solution demonstrates strong programming skills with proper structure and logic.';
  } else if (score >= 70) {
    fb = 'Good job! Your solution meets the requirements and shows solid programming understanding.';
  } else if (score >= 50) {
    fb = 'Your solution shows some programming knowledge but needs improvement. ';
    const suggestions = [];
    if (!details.hasFunction) suggestions.push('define proper functions or methods');
    if (!details.hasLogic) suggestions.push('add conditional logic and control structures');
    if (primaryLanguage && !details.languageMatch) suggestions.push(`use ${primaryLanguage} syntax and features`);
    if (!details.properStructure) suggestions.push('improve code formatting and structure');
    if (suggestions.length > 0) fb += 'Try to: ' + suggestions.slice(0, 2).join(', ') + '.';
  } else if (score >= 25) {
    fb = 'Your solution needs significant improvement. Write a complete, functional solution that addresses the problem requirements.';
  } else {
    fb = 'Your solution appears incomplete or incorrect. Review the challenge requirements and implement a proper solution.';
  }
  return fb;
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

    // Get existing challenge for this project
    const { data: existingChallenge } = await supabase
      .from('coding_challenges')
      .select(`
        *,
        programming_languages(id, name)
      `)
      .eq('project_id', projectId)
      .eq('is_active', true)
      .single();

    let selectedChallenge = existingChallenge;
    const projPrimaryLang = project.project_languages?.find(pl => pl.is_primary);

    // Create temporary challenge if none exists
    if (!selectedChallenge) {
      const langForTemp = projPrimaryLang?.programming_languages || { id: 2, name: 'JavaScript' };
      selectedChallenge = {
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
    }

    return res.json({
      success: true,
      challenge: selectedChallenge,
      project: {
        id: project.id,
        title: project.title,
        description: project.description,
        primaryLanguage: projPrimaryLang?.programming_languages?.name || 'Unknown',
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
    const { data: membership, error: membershipError } = await supabase
      .from('project_members')
      .select('*')
      .eq('project_id', projectId)
      .eq('user_id', userId)
      .single();

    if (membershipError && membershipError.code !== 'PGRST116') {
      return res.status(500).json({ success: false, message: 'Error checking membership status' });
    }

    if (membership) {
      return res.json({ success: true, canAttempt: false, reason: 'You are already a member of this project' });
    }

    // Failed attempts
    const failedAttemptsCount = await getFailedAttemptsCount(userId, projectId);

    // Project info
    const { data: project } = await supabase
      .from('projects')
      .select(`
        title, 
        current_members, 
        maximum_members,
        project_languages(
          language_id,
          is_primary,
          programming_languages(id, name)
        )
      `)
      .eq('id', projectId)
      .single();

    const projectTitle = project?.title || 'this project';

    // Get challenge info for alertData
    const { data: challengeData } = await supabase
      .from('coding_challenges')
      .select('id, difficulty_level')
      .eq('project_id', projectId)
      .single();

    // ALWAYS get language ID from project, not challenge (to avoid Judge0 ID confusion)
    const plId = project?.project_languages?.find(pl => pl.is_primary)?.programming_languages?.id ||
                 project?.project_languages?.[0]?.programming_languages?.id ||
                 2; // Default to JavaScript (id: 2)

    // Helper to create complete alertData
    const createAlertData = (shouldShow, failedCount, message) => {
      if (!shouldShow) return null;
      return {
        shouldShow: true,
        attemptCount: failedCount,
        message: message,
        challengeId: challengeData?.id,
        programmingLanguageId: plId,
        difficultyLevel: challengeData?.difficulty_level || 'beginner'
      };
    };

    // Rate limit: 1/hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { data: recentAttempts, error: attemptError } = await supabase
      .from('challenge_attempts')
      .select('started_at')
      .eq('project_id', projectId)
      .eq('user_id', userId)
      .gte('started_at', oneHourAgo)
      .order('started_at', { ascending: false })
      .limit(1);

    if (attemptError) {
      return res.status(500).json({ success: false, message: 'Error checking recent attempts' });
    }

    const shouldShowAlert = failedAttemptsCount >= 7;
    const comfortingMessage = shouldShowAlert ? generateComfortingMessage(failedAttemptsCount, projectTitle) : null;

    if (recentAttempts && recentAttempts.length > 0) {
      const lastAttempt = new Date(recentAttempts[0].started_at);
      const nextAttemptTime = new Date(lastAttempt.getTime() + 60 * 60 * 1000);
      return res.json({
        success: true,
        canAttempt: false,
        reason: 'You can only attempt once per hour',
        nextAttemptAt: nextAttemptTime.toISOString(),
        alertData: createAlertData(shouldShowAlert, failedAttemptsCount, comfortingMessage)
      });
    }

    // Capacity
    if (project && project.current_members >= project.maximum_members) {
      return res.json({
        success: true,
        canAttempt: false,
        reason: 'Project has reached maximum capacity',
        alertData: createAlertData(shouldShowAlert, failedAttemptsCount, comfortingMessage)
      });
    }

    return res.json({
      success: true,
      canAttempt: true,
      reason: 'You can attempt this challenge',
      alertData: createAlertData(shouldShowAlert, failedAttemptsCount, comfortingMessage)
    });
  } catch (error) {
    console.error('Error in canAttemptChallenge:', error);
    return res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
};

// POST /api/challenges/project/:projectId/attempt
const submitChallengeAttempt = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { submittedCode, startedAt, challengeId } = req.body;
    const userId = req.user.id;

    // Validate submission
    if (!submittedCode || submittedCode.trim().length < 10) {
      return res.status(200).json({
        success: true,
        data: {
          attempt: null,
          score: 0,
          passed: false,
          projectJoined: false,
          feedback: 'Your solution is too short. Please provide a more complete solution.',
          status: 'failed'
        }
      });
    }

    // Already a member?
    const { data: membership } = await supabase
      .from('project_members')
      .select('*')
      .eq('project_id', projectId)
      .eq('user_id', userId)
      .single();

    if (membership) {
      return res.status(200).json({
        success: true,
        data: {
          attempt: null,
          score: 0,
          passed: false,
          projectJoined: false,
          feedback: 'You are already a member of this project.',
          status: 'already_member'
        }
      });
    }

    // Load project
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .single();

    if (projectError || !project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    const { data: projectLanguages, error: projectLangError } = await supabase
      .from('project_languages')
      .select(`
        language_id,
        is_primary,
        programming_languages ( id, name )
      `)
      .eq('project_id', projectId);

    if (projectLangError) {
      console.error('Project languages query error:', projectLangError);
      return res.status(500).json({
        success: false,
        message: 'Error fetching project languages',
        error: projectLangError.message
      });
    }

    project.project_languages = projectLanguages || [];

    // Load challenge if provided
    let challenge = null;
    if (challengeId && !String(challengeId).startsWith('temp_')) {
      const { data: ch, error: chErr } = await supabase
        .from('coding_challenges')
        .select(`
          id, title, description, difficulty_level, time_limit_minutes,
          test_cases, expected_solution, programming_language_id,
          programming_languages ( id, name )
        `)
        .eq('id', challengeId)
        .single();
      if (!chErr && ch) challenge = ch;
    }

    // Decide language name for Judge0
    const primaryLanguageName =
      project.project_languages.find(pl => pl.is_primary)?.programming_languages?.name ||
      project.project_languages[0]?.programming_languages?.name ||
      challenge?.programming_languages?.name ||
      'JavaScript';

    // Heuristic evaluation (baseline)
    const heuristicEval = evaluateCodeSubmission(submittedCode, project);

    // Defaults from heuristics
    let finalScore = heuristicEval.score;
    let passed = heuristicEval.score >= 70;
    let evaluation = { ...heuristicEval, testSummary: null, testResults: null, judgeUsed: false };

    // If we have test cases, try Judge0
    if (challenge?.test_cases && Array.isArray(challenge.test_cases) && challenge.test_cases.length > 0) {
      try {
        const totalTimeLimit = challenge?.time_limit_minutes ? challenge.time_limit_minutes * 60 : 300;
        const testResults = await runTests(
          submittedCode,
          challenge.test_cases,
          challenge.programming_language_id || 63,
          totalTimeLimit
        );

        evaluation.judgeUsed = true;
        evaluation.testResults = testResults;
        evaluation.testSummary = {
          totalTests: testResults.totalTests,
          passedTests: testResults.passedCount,
          failedTests: testResults.failedCount,
          allPassed: testResults.allPassed
        };

        // Boost score if tests passed
        if (testResults.allPassed) {
          finalScore = Math.max(finalScore, 85);
        } else if (testResults.passedCount > 0) {
          finalScore = Math.max(finalScore, 40 + (testResults.passedCount / testResults.totalTests) * 40);
        }

        passed = finalScore >= 60;
      } catch (err) {
        console.error('Judge0 evaluation error:', err);
      }
    }

    const feedback = evaluation.feedback || heuristicEval.feedback;

    // Create attempt record
    const { data: attempt, error: attemptError } = await supabase
      .from('challenge_attempts')
      .insert({
        user_id: userId,
        challenge_id: challenge?.id,
        project_id: projectId,
        submitted_code: submittedCode,
        score: finalScore,
        status: passed ? 'passed' : 'failed',
        feedback,
        started_at: startedAt || new Date().toISOString(),
        submitted_at: new Date().toISOString()
      })
      .select()
      .single();

    if (attemptError) {
      console.error('Error creating attempt:', attemptError);
    }

    // If passed, add to project
    let projectJoined = false;
    let membershipData = null;

    if (passed) {
      const { data: newMember, error: memberError } = await supabase
        .from('project_members')
        .insert({
          project_id: projectId,
          user_id: userId,
          joined_at: new Date().toISOString(),
          role: 'member',
          status: 'active'
        })
        .select()
        .single();

      if (!memberError) {
        projectJoined = true;
        membershipData = newMember;
        try {
          await supabase.rpc('increment_project_member_count', { project_uuid: projectId });
        } catch (updateError) {
          console.error('Error updating member count:', updateError);
        }
      } else {
        console.error('Error adding member:', memberError);
      }
    }

    // Update adaptive ratings (non-blocking)
    try {
      if (challengeId && !String(challengeId).startsWith('temp_')) {
        const plId = project.project_languages?.find(pl => pl.is_primary)?.language_id ||
                     project.project_languages?.[0]?.language_id ||
                     null;

        if (plId) {
          await updateSkillRatings({
            userId,
            challengeId,
            programming_language_id: plId,
            pass: passed
          });
        }
      }
    } catch (e) {
      console.warn('Rating update failed (non-blocking):', e.message);
    }

    // Alert data on fail - ALWAYS use project language ID, not challenge's Judge0 ID
    let alertData = null;
    if (!passed) {
      const failedAttemptsCount = await getFailedAttemptsCount(userId, projectId);
      if (failedAttemptsCount >= 7) {
        const title = project.title || 'this project';
        
        // ALWAYS get language ID from project (YOUR database IDs), never from challenge
        const plId = project.project_languages?.find(pl => pl.is_primary)?.language_id ||
                     project.project_languages?.[0]?.language_id ||
                     2; // Default to JavaScript (id: 2)
        
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

/* ============================== Exports ============================== */
module.exports = {
  getProjectChallenge,
  canAttemptChallenge,
  submitChallengeAttempt,
  getFailedAttemptsCount,
  generateComfortingMessage
};