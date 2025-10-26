// backend/controllers/projectRecruitmentController.js - FIXED VERSION
const supabase = require('../config/supabase');
const { updateSkillRatings } = require('./challengeController');

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
    case 'c':
      return s.includes('#include') || s.includes('int main(');
    case 'php':
      return s.includes('<?php') || s.includes('function ') || s.includes('echo');
    case 'ruby':
      return s.includes('def ') || s.includes('end') || s.includes('puts');
    case 'swift':
      return s.includes('func ') || s.includes('let ') || s.includes('var ');
    case 'kotlin':
      return s.includes('fun ') || s.includes('val ') || s.includes('var ');
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

    // Get primary language for the project
    const projPrimaryLang = project.project_languages?.find(pl => pl.is_primary);
    const primaryLanguageId = projPrimaryLang?.language_id || project.project_languages?.[0]?.language_id;
    const primaryLanguageName = projPrimaryLang?.programming_languages?.name || project.project_languages?.[0]?.programming_languages?.name || 'JavaScript';

    console.log('🔍 Project language info:', {
      projectId,
      primaryLanguageId,
      primaryLanguageName,
      allProjectLanguages: project.project_languages
    });

    // FIXED: First check for project-specific challenge
    const { data: projectSpecificChallenge } = await supabase
      .from('coding_challenges')
      .select(`
        *,
        programming_languages(id, name)
      `)
      .eq('project_id', projectId)
      .eq('is_active', true)
      .single();

    // If project has a specific challenge, use it
    if (projectSpecificChallenge) {
      console.log('✅ Found project-specific challenge:', projectSpecificChallenge.id);
      return res.json({
        success: true,
        challenge: projectSpecificChallenge,
        project: {
          id: project.id,
          title: project.title,
          description: project.description,
          primaryLanguage: primaryLanguageName,
          availableSpots: project.maximum_members - project.current_members
        }
      });
    }

    // FIXED: If no project-specific challenge, fetch a REAL challenge from the database
    // that matches the project's programming language
    if (primaryLanguageId) {
      console.log('🔎 Looking for generic challenge with language ID:', primaryLanguageId);
      
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
        // Pick a random challenge from the matching ones (or pick by difficulty)
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

    // FALLBACK: Only create temporary challenge if no real challenges exist
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

    // Evaluate code submission
    const evaluation = evaluateCodeSubmission(submittedCode, project);
    const finalScore = evaluation.score;
    const feedback = evaluation.feedback;
    const passed = finalScore >= 70;

    // Get the challenge details if available
    let challenge = null;
    if (challengeId && !challengeId.startsWith('temp_')) {
      const { data: challengeData } = await supabase
        .from('coding_challenges')
        .select('*')
        .eq('id', challengeId)
        .single();
      challenge = challengeData;
    }

    // Create attempt record
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
        completed_at: new Date().toISOString(),
        feedback: feedback
      })
      .select()
      .single();

    if (attemptError) {
      console.error('Error creating attempt:', attemptError);
      return res.status(500).json({ success: false, message: 'Failed to record attempt' });
    }

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
      }
    }

    // Update skill ratings (non-blocking)
    try {
      if (challengeId && !challengeId.startsWith('temp_')) {
        const plId = project.project_languages?.find(pl => pl.is_primary)?.language_id ||
                     project.project_languages?.[0]?.language_id ||
                     null;

        if (plId) {
          // FIXED: Call with correct parameter order (userId, programming_language_id, challengeId, pass)
          await updateSkillRatings(userId, plId, challengeId, passed);
        }
      }
    } catch (e) {
      console.warn('Rating update failed (non-blocking):', e.message);
    }

    // Alert data on fail - ALWAYS use project language ID, not challenge's ID
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