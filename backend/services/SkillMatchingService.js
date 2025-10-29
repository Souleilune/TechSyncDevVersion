// backend/services/SkillMatchingService.js
// UPDATED VERSION - Added missing code evaluation methods for skill assessment testing
const supabase = require('../config/supabase');

class SkillMatchingService {
  constructor() {
    this.weights = {
      topicCoverage: 0.28,
      languageProficiency: 0.32,
      difficultyAlignment: 0.18,
      interestAffinity: 0.12,
      popularityBoost: 0.05,
      recencyBoost: 0.05,
      topic_match: 0.4,
      experience_match: 0.3,
      language_match: 0.3
    };

    this.primaryBoost = 1.5;
    this.threshold = 45; // Lowered from 55
    this.minPassingScore = 70;
    this.maxAttempts = 8;
    
    // OPTIMIZATION: Add caching
    this.projectCache = null;
    this.projectCacheTime = 0;
    this.cacheDuration = 60000; // 1 minute cache
  }

  // ============== CODE EVALUATION METHODS (for skill assessment testing) ==============
  
  /**
   * Evaluate code quality and return a score (0-100)
   * This method is used by the test scripts to evaluate submitted code
   */
  evaluateCode(submittedCode) {
    if (!submittedCode || typeof submittedCode !== 'string') {
      return 0;
    }

    const code = submittedCode.trim();
    if (code.length === 0) {
      return 0;
    }

    let score = 0;
    
    // Basic code quality metrics
    const codeLength = code.length;
    const hasFunction = /function\s+\w+|const\s+\w+\s*=|def\s+\w+|class\s+\w+|func\s+\w+|fn\s+\w+|public\s+\w+|private\s+\w+/i.test(code);
    const hasLogic = /if\s*\(|for\s*\(|while\s*\(|switch\s*\(|forEach|map|filter|reduce|match|case/i.test(code);
    const hasReturn = /return\s+|yield\s+|res\.json|echo\s+|print\s+|println/i.test(code);
    const hasComments = /\/\/|\/\*|\*\/|#|"""|'''|<!--/g.test(code);
    const hasVariables = /const\s+\w+|let\s+\w+|var\s+\w+|:\w+\s+=/i.test(code);
    
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
    
    return score;
  }

  /**
   * Generate feedback based on score
   * This method is used by the test scripts to generate feedback
   */
  generateFeedback(score) {
    if (typeof score !== 'number' || isNaN(score)) {
      return 'Unable to evaluate code quality.';
    }

    if (score >= 90) {
      return '🎉 Excellent work! Your code demonstrates exceptional programming skills and best practices.';
    } else if (score >= 80) {
      return '🌟 Great job! Your code shows strong understanding and good structure.';
    } else if (score >= 70) {
      return '👍 Good effort! Your code demonstrates solid programming fundamentals.';
    } else if (score >= 60) {
      return '💪 Nice try! Your solution shows promise. Consider adding more structure and logic.';
    } else if (score >= 40) {
      return '📚 Keep practicing! Try including functions, control flow, and proper code structure.';
    } else {
      return '🌱 Good start! Focus on creating complete functions with logic and return values.';
    }
  }

  /**
   * Assess coding skill for a user
   * This method is used by the test scripts to assess user skill
   */
  async assessCodingSkill(userId, projectId, submittedCode, challengeId) {
    try {
      // Evaluate the code
      const score = this.evaluateCode(submittedCode);
      const feedback = this.generateFeedback(score);
      const passed = score >= this.minPassingScore;
      
      // Create attempt record
      const { data: attempt, error: attemptError } = await supabase
        .from('challenge_attempts')
        .insert({
          user_id: userId,
          challenge_id: challengeId,
          project_id: projectId,
          submitted_code: submittedCode,
          score: score,
          status: passed ? 'passed' : 'completed',
          feedback: feedback,
          started_at: new Date().toISOString(),
          submitted_at: new Date().toISOString()
        })
        .select()
        .single();

      if (attemptError) {
        console.error('Error creating challenge attempt:', attemptError);
        return {
          success: false,
          message: 'Failed to record challenge attempt',
          error: attemptError.message
        };
      }

      return {
        success: true,
        score: score,
        feedback: feedback,
        passed: passed,
        canJoinProject: passed,
        attemptId: attempt.id
      };
    } catch (error) {
      console.error('Error assessing coding skill:', error);
      return {
        success: false,
        message: 'Failed to assess coding skill',
        error: error.message
      };
    }
  }

  /**
   * Get challenge by ID
   * This method is used by the test scripts to retrieve challenge data
   */
  async getChallengeById(challengeId) {
    try {
      const { data: challenge, error } = await supabase
        .from('coding_challenges')
        .select('*')
        .eq('id', challengeId)
        .single();

      if (error || !challenge) {
        return null;
      }

      return challenge;
    } catch (error) {
      console.error('Error getting challenge:', error);
      return null;
    }
  }

  // ============== PUBLIC API ==============
  async recommendProjects(userId, options = {}) {
    try {
      const limit = options.limit || 10;
      
      // OPTIMIZATION: Parallel data fetching
      const [user, availableProjects] = await Promise.all([
        this.getUserProfile(userId),
        this.getAvailableProjects(userId)
      ]);

      const scored = [];
      for (const project of availableProjects) {
        const features = this.computeFeatures(user, project);
        const score = this.aggregateScore(features);

        if (process.env.DEBUG_RECS === '1') {
          console.log({
            project: project.title,
            topic: Number(features.topic.score || 0).toFixed(1),
            lang: Number(features.lang.score || 0).toFixed(1),
            diff: Number(features.diff || 0).toFixed(1),
            total: Number(score || 0).toFixed(1)
          });
        }

        if (score >= this.threshold) {
          const matchFactors = this.buildMatchFactors(user, project, features);
          scored.push({
            projectId: project.id,
            score: Math.round(score),
            matchFactors,
            rawFeatures: features
          });
        }
      }

      scored.sort((a, b) => b.score - a.score);
      const diverse = options.diversify ? this.diversityReRank(scored.slice(0, limit * 2), 0.25) : scored;
      const final = diverse.slice(0, limit);

      this.storeRecommendations(userId, final);

      return final.map(r => ({
        projectId: r.projectId,
        score: r.score,
        matchFactors: r.matchFactors
      }));
    } catch (error) {
      console.error('Error recommending projects:', error);
      return [];
    }
  }

  async getUserProfile(userId) {
    const { data: user, error } = await supabase
      .from('users')
      .select(`
        id, full_name, years_experience,
        user_topics ( interest_level, experience_level, topics(name) ),
        user_programming_languages ( proficiency_level, programming_languages(name) )
      `)
      .eq('id', userId)
      .single();

    if (error || !user) throw new Error('User not found');

    return {
      ...user,
      topics: user.user_topics || [],
      programming_languages: user.user_programming_languages || []
    };
  }

  async getAvailableProjects(userId) {
    const now = Date.now();
    if (this.projectCache && (now - this.projectCacheTime < this.cacheDuration)) {
      return this.projectCache;
    }

    const { data: projects, error } = await supabase
      .from('projects')
      .select(`
        id, title, description, status, required_experience_level, visibility,
        created_at, likes_count, views_count,
        project_topics ( is_primary, topics(name) ),
        project_languages ( is_primary, required_level, programming_languages(name) )
      `)
      .eq('status', 'active')
      .eq('visibility', 'public')
      .not('owner_id', 'eq', userId);

    if (error) {
      console.error('Error fetching projects:', error);
      return [];
    }

    this.projectCache = (projects || []).map(project => ({
      ...project,
      languages: project.project_languages?.map(pl => pl.programming_languages?.name).filter(Boolean) || [],
      topics: project.project_topics?.map(pt => pt.topics?.name).filter(Boolean) || []
    }));
    this.projectCacheTime = now;

    return this.projectCache;
  }

  // ============== LEGACY METHODS (kept for compatibility) ==============
  async calculateMatchScore(user, project) {
    try {
      const topicScore = this.calculateTopicMatch(user.topics, project.project_topics);
      const experienceScore = this.calculateExperienceMatch(user.years_experience, project.required_experience_level);
      const languageScore = this.calculateLanguageMatch(user.programming_languages, project.project_languages);

      const weightedScore =
        topicScore * this.weights.topic_match +
        experienceScore * this.weights.experience_match +
        languageScore * this.weights.language_match;

      return Math.round(weightedScore);
    } catch (error) {
      console.error('Error calculating match score:', error);
      return 0;
    }
  }

  calculateTopicMatch(userTopics, projectTopics) {
    if (!userTopics?.length || !projectTopics?.length) return 0;
    const userTopicNames = userTopics.map(t => t.topics?.name).filter(Boolean);
    const projectTopicNames = projectTopics.map(t => t.topics?.name).filter(Boolean);
    const matches = userTopicNames.filter(topic => projectTopicNames.includes(topic));
    return (matches.length / projectTopicNames.length) * 100;
  }

  calculateExperienceMatch(userExperience, requiredExperience) {
    if (!userExperience || !requiredExperience) return 50;
    const experienceLevels = { beginner: 1, intermediate: 2, advanced: 3, expert: 4 };
    const userLevelName = this.yearsToLevelName(userExperience);
    const userLevel = experienceLevels[userLevelName] || 1;
    const requiredLevel = experienceLevels[String(requiredExperience).toLowerCase()] || 1;
    return userLevel >= requiredLevel ? 100 : Math.max(0, 100 - ((requiredLevel - userLevel) * 25));
  }

  calculateLanguageMatch(userLanguages, projectLanguages) {
    if (!userLanguages?.length || !projectLanguages?.length) return 0;
    const userLangNames = userLanguages.map(l => l.programming_languages?.name).filter(Boolean);
    const projectLangNames = projectLanguages.map(l => l.programming_languages?.name).filter(Boolean);
    const matches = userLangNames.filter(lang => projectLangNames.includes(lang));
    return (matches.length / projectLangNames.length) * 100;
  }

  async getMatchFactors(user, project) {
    const features = this.computeFeatures(user, project);
    return this.buildMatchFactors(user, project, features);
  }

  getTopicMatches(userTopics, projectTopics) {
    const matches = [];
    for (const projectTopic of projectTopics || []) {
      const topicName = projectTopic.topics?.name;
      const userTopic = userTopics.find(ut => ut.topics?.name === topicName);
      if (userTopic) {
        matches.push({
          name: topicName,
          userInterest: userTopic.interest_level,
          userExperience: userTopic.experience_level,
          isPrimary: projectTopic.is_primary
        });
      }
    }
    return matches;
  }

  getLanguageMatches(userLanguages, projectLanguages) {
    const matches = [];
    for (const projectLang of projectLanguages || []) {
      const langName = projectLang.programming_languages?.name;
      const userLang = userLanguages.find(ul => ul.programming_languages?.name === langName);
      if (userLang) {
        matches.push({
          name: langName,
          userProficiency: userLang.proficiency_level,
          requiredLevel: projectLang.required_level,
          isPrimary: projectLang.is_primary
        });
      }
    }
    return matches;
  }

  // ============== SCORING METHODS ==============
  levelToNum(levelName) {
    const map = { beginner: 1, intermediate: 2, advanced: 3, expert: 4 };
    return map[String(levelName).toLowerCase()] || 2;
  }

  yearsToLevelName(years) {
    const y = Number(years);
    if (Number.isNaN(y)) {
      const asLower = String(years).toLowerCase();
      if (['beginner', 'intermediate', 'advanced', 'expert'].includes(asLower)) return asLower;
      return 'intermediate';
    }
    if (y < 1) return 'beginner';
    if (y < 3) return 'intermediate';
    if (y < 5) return 'advanced';
    return 'expert';
  }

  clamp01(v) {
    return Math.max(0, Math.min(1, v));
  }

  normalizeLevel01(level) {
    if (typeof level === 'number') return this.clamp01(level);
    const map = { beginner: 0.25, intermediate: 0.5, advanced: 0.75, expert: 1.0 };
    return map[String(level).toLowerCase()] ?? 0.4;
  }

  normalizeRequiredLevel(level) {
    const map = { beginner: 0.25, intermediate: 0.5, advanced: 0.75, expert: 1.0 };
    return map[String(level || 'intermediate').toLowerCase()] ?? 0.5;
  }

  topicCoverageScore(userTopics, projectTopics) {
    const matches = [];
    const gaps = [];
    let sum = 0;
    let totalWeight = 0;
    let covered = 0;

    for (const pt of projectTopics || []) {
      const name = pt.topics?.name;
      if (!name) continue;
      const weight = pt.is_primary ? this.primaryBoost : 1.0;
      totalWeight += weight;

      const userTopic = userTopics.find(ut => ut.topics?.name === name);
      if (userTopic) {
        const interest = this.normalizeLevel01(userTopic.interest_level);
        const experience = this.normalizeLevel01(userTopic.experience_level);
        const avg = (interest + experience) / 2;
        sum += avg * 100 * weight;
        covered += weight;
        matches.push({
          name,
          interest: userTopic.interest_level,
          experience: userTopic.experience_level,
          score: avg * 100,
          is_primary: !!pt.is_primary
        });
      } else {
        gaps.push({ name, is_primary: !!pt.is_primary, status: 'missing' });
      }
    }

    const coverage = totalWeight ? (covered / totalWeight) : 0;
    const baseScore = totalWeight ? (sum / totalWeight) * 100 : 0;
    const score = (0.85 * baseScore) + (0.15 * coverage * 100);
    return { score, matches, gaps, coverage };
  }

  languageProficiencyScore(userLanguages, projectLanguages) {
    const matches = [];
    const gaps = [];
    let sum = 0;
    let totalWeight = 0;
    let covered = 0;

    for (const pl of projectLanguages || []) {
      const name = pl.programming_languages?.name;
      if (!name) continue;
      const weight = pl.is_primary ? this.primaryBoost : 1.0;
      totalWeight += weight;
      const req = this.normalizeRequiredLevel(pl.required_level);

      const userLang = userLanguages.find(ul => ul.programming_languages?.name === name);
      if (userLang) {
        const prof = this.normalizeLevel01(userLang.proficiency_level);
        covered += weight;
        const contribution = Math.min(prof / req, 1.0);
        sum += contribution * 100 * weight;

        if (prof >= req) {
          matches.push({ name, userProficiency: prof, required: req, is_primary: !!pl.is_primary, status: 'meets' });
        } else {
          gaps.push({ name, userProficiency: prof, required: req, is_primary: !!pl.is_primary, status: 'below' });
        }
      } else {
        gaps.push({ name, userProficiency: 0, required: req, is_primary: !!pl.is_primary, status: 'missing' });
      }
    }

    const coverage = totalWeight ? (covered / totalWeight) : 0;
    const baseScore = totalWeight ? (sum / totalWeight) * 100 : 0;
    const score = (0.85 * baseScore) + (0.15 * coverage * 100);
    return { score, matches, gaps, coverage };
  }

  difficultyAlignmentScore(userYears, requiredLevelName) {
    const userLevel = this.levelToNum(this.yearsToLevelName(userYears));
    const reqLevel = this.levelToNum(this.yearsToLevelName(requiredLevelName));
    if (userLevel >= reqLevel) return 100;
    return Math.max(0, 100 - (reqLevel - userLevel) * 22);
  }

  computeFeatures(user, project) {
    const topic = this.topicCoverageScore(user.topics, project.project_topics || []);
    const lang = this.languageProficiencyScore(user.programming_languages, project.project_languages || []);
    const diff = this.difficultyAlignmentScore(user.years_experience, project.required_experience_level);
    return { topic, lang, diff };
  }

  aggregateScore(f) {
    let score =
      this.weights.topicCoverage * (f.topic?.score || 0) +
      this.weights.languageProficiency * (f.lang?.score || 0) +
      this.weights.difficultyAlignment * (f.diff || 0);
    return Math.max(0, Math.min(100, score));
  }

  toNum(v) {
    const n = Number(v);
    if (!Number.isNaN(n)) return n;
    const map = { beginner: 1, intermediate: 2, advanced: 3, expert: 4 };
    return map[String(v).toLowerCase()] || 0;
  }

  buildMatchFactors(user, project, f) {
    const topTopicMatches = [...(f.topic.matches || [])]
      .sort((a, b) => (Number(b.is_primary) - Number(a.is_primary)) || (this.toNum(b.experience) - this.toNum(a.experience)))
      .slice(0, 3);

    const topLangMatches = [...(f.lang.matches || [])]
      .filter(m => m.status === 'meets')
      .sort((a, b) => (Number(b.is_primary) - Number(a.is_primary)))
      .slice(0, 3);

    const langGaps = [...(f.lang.gaps || [])]
      .sort((a, b) => (Number(b.is_primary) - Number(a.is_primary)))
      .slice(0, 3);

    const topicGaps = [...(f.topic.gaps || [])]
      .sort((a, b) => Number(b.is_primary) - Number(a.is_primary))
      .slice(0, 3);

    return {
      overallScore: Number(f.topic.score || 0) * 0.4 + Number(f.lang.score || 0) * 0.4 + Number(f.diff || 0) * 0.2,
      topicScore: f.topic.score,
      topicCoverage: (f.topic.coverage * 100).toFixed(1),
      topTopicMatches,
      topicGaps,
      languageScore: f.lang.score,
      languageCoverage: (f.lang.coverage * 100).toFixed(1),
      topLanguageMatches: topLangMatches,
      languageGaps: langGaps,
      experienceAlignment: f.diff,
      strengths: this.buildStrengths(topLangMatches, topTopicMatches),
      improvements: this.suggestImprovements([...langGaps, ...topicGaps])
    };
  }

  buildStrengths(langMatches, topicMatches) {
    const bits = [];
    if (langMatches.length) {
      const primary = langMatches.find(l => l.is_primary) || langMatches[0];
      if (primary) bits.push(`Strong fit in ${primary.name}`);
    }
    if (topicMatches.length) {
      const primary = topicMatches.find(t => t.is_primary) || topicMatches[0];
      if (primary) bits.push(`Good coverage on ${primary.name}`);
    }
    return bits;
  }

  suggestImprovements(gaps) {
    if (!gaps?.length) return [];
    return gaps.map(g => {
      if (g.required != null) {
        const need = Math.ceil((g.required * 5) - (g.userProficiency * 5));
        if (g.status === 'missing') {
          return `Add basics of ${g.name} (target ~${Math.max(2, Math.ceil(g.required * 5))}/5)`;
        }
        return `Level up ${g.name} by ~${Math.max(1, need)} step(s) to meet project needs`;
      }
      return `Explore topic ${g.name}`;
    }).slice(0, 3);
  }

  diversityReRank(items, lambda = 0.25) {
    if (items.length <= 1) return items;
    
    const selected = [];
    const remaining = [...items];
    const sim = (a, b) => {
      const setA = new Set([...(a.technologies || [])]);
      const setB = new Set([...(b.technologies || [])]);
      const inter = [...setA].filter(x => setB.has(x)).length;
      const uni = new Set([...setA, ...setB]).size || 1;
      return inter / uni;
    };

    while (remaining.length) {
      let bestIdx = 0;
      let bestScore = -Infinity;
      for (let i = 0; i < remaining.length; i++) {
        const cand = remaining[i];
        const relevance = cand.score;
        const diversity = selected.length ? Math.max(...selected.map(s => sim(cand, s))) : 0;
        const mmr = (1 - lambda) * relevance - lambda * (diversity * 100);
        if (mmr > bestScore) {
          bestScore = mmr;
          bestIdx = i;
        }
      }
      selected.push(remaining.splice(bestIdx, 1)[0]);
    }
    return selected;
  }

  async storeRecommendations(userId, recommendations) {
    // Fire and forget - don't block
    try {
      const records = recommendations.map(rec => ({
        user_id: userId,
        project_id: rec.projectId,
        score: rec.score,
        match_factors: rec.matchFactors,
        created_at: new Date().toISOString()
      }));

      await supabase.from('recommendations').upsert(records, {
        onConflict: 'user_id,project_id'
      });
    } catch (error) {
      // Silently fail
      console.error('Failed to store recommendations:', error);
    }
  }

  // Clear cache manually if needed
  clearCache() {
    this.projectCache = null;
    this.projectCacheTime = 0;
  }
}

module.exports = new SkillMatchingService();