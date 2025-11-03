// backend/services/SkillMatchingService.js
// ENHANCED VERSION - Including code evaluation methods
const supabase = require('../config/supabase');

class SkillMatchingService {
  constructor() {
    this.weights = {
      topicCoverage: 0.30,
      languageProficiency: 0.35,
      difficultyAlignment: 0.20,
      interestAffinity: 0.10,
      popularityBoost: 0.025,
      recencyBoost: 0.025,
      topic_match: 0.4,
      experience_match: 0.3,
      language_match: 0.3
    };

    this.primaryBoost = 1.5;
    this.recommendationThreshold = 60;
    this.minPassingScore = 60;
    this.displayThreshold = 50;
    this.maxAttempts = 8;
    
    this.projectCache = null;
    this.projectCacheTime = 0;
    this.cacheDuration = 60000;
  }

  // ============== CODE EVALUATION METHODS ==============
  
  /**
   * Evaluate code quality and return a score (0-100)
   * Heuristic-based evaluation used when Judge0 is not available
   */
  evaluateCode(code) {
    const src = String(code || '').trim();
    
    if (!src || src.length < 10) {
      return 0;
    }

    let score = 0;
    const details = this.analyzeCodeQuality(src);

    // Base score for code length (20 points max)
    if (src.length > 20) score += 20;
    if (src.length > 100) score += 5;
    if (src.length > 200) score += 5;

    // Function definition (30 points)
    if (details.hasFunction) score += 30;

    // Logic/control flow (25 points)
    if (details.hasLogic) score += 25;

    // Return statement (15 points)
    if (details.hasReturn) score += 15;

    // Comments (5 points)
    if (details.hasComments) score += 5;

    // Variables (5 points)
    if (details.hasVariables) score += 5;

    // Bonus for advanced patterns (10 points max)
    if (details.hasErrorHandling) score += 3;
    if (details.hasAsync) score += 3;
    if (details.hasClassOrOOP) score += 4;

    return Math.min(100, Math.max(0, score));
  }

  /**
   * Analyze code quality metrics
   */
  analyzeCodeQuality(code) {
    const src = String(code || '');
    
    return {
      hasFunction: /function\s+\w+|const\s+\w+\s*=|def\s+\w+|class\s+\w+|func\s+\w+|fn\s+\w+|public\s+\w+|private\s+\w+|sub\s+\w+|proc\s+\w+/i.test(src),
      hasLogic: /if\s*\(|for\s*\(|while\s*\(|switch\s*\(|forEach|map|filter|reduce|match|case|when|loop|do\s+|until|unless/i.test(src),
      hasReturn: /return\s+|yield\s+|res\.json|echo\s+|print\s+|println|puts\s+|console\.log/i.test(src),
      hasComments: /\/\/|\/\*|\*\/|#|"""|'''|<!--/g.test(src),
      hasVariables: /const\s+\w+|let\s+\w+|var\s+\w+|:\w+\s+=|my\s+\w+|\$\w+\s*=|dim\s+\w+/i.test(src),
      hasErrorHandling: /try\s*{|catch\s*\(|except\s*:|rescue\s+|error\s*=>|throw\s+|raise\s+/i.test(src),
      hasAsync: /async\s+|await\s+|promise|\.then\(|callback|future|task\s*</i.test(src),
      hasClassOrOOP: /class\s+\w+|extends\s+\w+|implements\s+\w+|interface\s+\w+|new\s+\w+\(|this\.|self\./i.test(src),
      codeLength: src.length,
      lineCount: src.split('\n').length,
      hasProperIndentation: src.includes('  ') || src.includes('\t')
    };
  }

  /**
   * Generate feedback based on score
   */
  generateFeedback(score) {
    if (score >= 90) {
      return '🎉 Excellent work! Your code demonstrates exceptional programming skills with clear structure, logic, and best practices.';
    } else if (score >= 80) {
      return '🌟 Great job! Your code shows strong understanding with good structure and solid implementation.';
    } else if (score >= 70) {
      return '👍 Good effort! Your code demonstrates solid programming fundamentals. Consider adding more robust error handling or comments.';
    } else if (score >= 60) {
      return '💪 Nice try! Your solution shows promise. Try adding more structure, control flow, and proper variable management.';
    } else if (score >= 40) {
      return '📚 Keep practicing! Focus on creating complete functions with clear logic and return values. Add comments to explain your approach.';
    } else {
      return '🌱 Good start! Remember to include functions, variables, control flow (if/for/while), and return statements. Every expert was once a beginner!';
    }
  }

  /**
   * Get challenge by ID from database
   */
  async getChallengeById(challengeId) {
    try {
      const { data, error } = await supabase
        .from('coding_challenges')
        .select('*')
        .eq('id', challengeId)
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching challenge:', error);
      return null;
    }
  }

  // ============== PROJECT RECOMMENDATION METHODS ==============
  
  async recommendProjects(userId, options = {}) {
    try {
      const limit = options.limit || 10;
      
      const [user, availableProjects] = await Promise.all([
        this.getUserProfile(userId),
        this.getAvailableProjects(userId)
      ]);

      const scored = [];
      for (const project of availableProjects) {
        const features = this.computeFeatures(user, project);
        const score = this.aggregateScore(features);

        if (score >= this.recommendationThreshold) {
          const matchFactors = this.buildMatchFactors(user, project, features);
          scored.push({
            projectId: project.id,
            score: Math.round(score),
            matchFactors,
            project
          });
        }
      }

      scored.sort((a, b) => b.score - a.score);
      const topN = scored.slice(0, limit);
      const diverse = this.diversityReRank(topN, 0.25);

      return diverse;
    } catch (error) {
      console.error('Error in recommendProjects:', error);
      return [];
    }
  }

  async getUserProfile(userId) {
    const { data, error } = await supabase
      .from('users')
      .select(`
        id, years_experience,
        user_topics (interest_level, experience_level, topics (name)),
        user_programming_languages (proficiency_level, years_experience, programming_languages (name))
      `)
      .eq('id', userId)
      .single();

    if (error) throw new Error('User not found');
    return {
      id: data.id,
      years_experience: data.years_experience || 0,
      topics: data.user_topics || [],
      programming_languages: data.user_programming_languages || []
    };
  }

  async getAvailableProjects(userId) {
    const now = Date.now();
    if (this.projectCache && (now - this.projectCacheTime) < this.cacheDuration) {
      return this.filterUserProjects(this.projectCache, userId);
    }

    const { data, error } = await supabase
      .from('projects')
      .select(`
        *,
        project_topics (is_primary, topics (name)),
        project_languages (is_primary, required_level, programming_languages (name)),
        project_members!inner (user_id, role)
      `)
      .eq('status', 'recruiting');

    if (error) throw new Error('Failed to fetch projects');

    this.projectCache = data || [];
    this.projectCacheTime = now;

    return this.filterUserProjects(this.projectCache, userId);
  }

  filterUserProjects(projects, userId) {
    return projects.filter(p => 
      !p.project_members?.some(m => m.user_id === userId)
    );
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

  buildMatchFactors(user, project, features) {
    const langMatches = this.getLanguageMatches(user.programming_languages, project.project_languages || []);
    const topicMatches = this.getTopicMatches(user.topics, project.project_topics || []);

    return {
      topicCoverage: features.topic?.score || 0,
      topicMatches,
      languageProficiency: features.lang?.score || 0,
      languageMatches: langMatches,
      difficultyAlignment: features.diff || 0,
      strengthsHighlight: this.strengthsHighlight(langMatches, topicMatches),
      improvementSuggestions: this.suggestImprovements(features.lang?.gaps || [])
    };
  }

  // ============== SCORING METHODS ==============
  
  topicCoverageScore(userTopics, projectTopics) {
    if (!projectTopics?.length) return { score: 50, matches: [], gaps: [], coverage: 0 };

    let sum = 0;
    let totalWeight = 0;
    let covered = 0;
    const matches = [];
    const gaps = [];

    for (const pt of projectTopics) {
      const name = pt.topics?.name;
      if (!name) continue;

      const weight = pt.is_primary ? this.primaryBoost : 1.0;
      totalWeight += weight;

      const ut = userTopics.find(ut => ut.topics?.name === name);
      if (ut) {
        const exp = this.normalizeLevel01(ut.experience_level);
        const interest = this.normalizeLevel01(ut.interest_level);
        const avg = (exp + interest) / 2;
        const contrib = avg * 100 * weight;
        sum += contrib;
        covered += weight;
        matches.push({
          name,
          userExperience: exp,
          userInterest: interest,
          is_primary: !!pt.is_primary,
          contribution: contrib
        });
      } else {
        gaps.push({ name, is_primary: !!pt.is_primary, status: 'missing' });
      }
    }

    const coverage = totalWeight ? (covered / totalWeight) : 0;
    const baseScore = totalWeight ? (sum / totalWeight) : 0;
    const score = (0.85 * baseScore) + (0.15 * coverage * 100);

    return { score, matches, gaps, coverage };
  }

  languageProficiencyScore(userLanguages, projectLanguages) {
    if (!projectLanguages?.length) return { score: 50, matches: [], gaps: [], coverage: 0 };

    let sum = 0;
    let totalWeight = 0;
    let covered = 0;
    const matches = [];
    const gaps = [];

    for (const pl of projectLanguages) {
      const name = pl.programming_languages?.name;
      if (!name) continue;

      const weight = pl.is_primary ? this.primaryBoost : 1.0;
      totalWeight += weight;
      const req = this.normalizeRequiredLevel(pl.required_level);

      const ul = userLanguages.find(ul => ul.programming_languages?.name === name);
      if (ul) {
        const prof = this.normalizeLevel01(ul.proficiency_level);
        const contrib = (prof >= req ? 100 : (prof / req) * 70) * weight;
        sum += contrib;
        covered += weight;
        matches.push({
          name,
          userProficiency: prof,
          required: req,
          is_primary: !!pl.is_primary,
          contribution: contrib
        });

        if (prof < req) {
          gaps.push({ name, userProficiency: prof, required: req, is_primary: !!pl.is_primary, status: 'below' });
        }
      } else {
        gaps.push({ name, userProficiency: 0, required: req, is_primary: !!pl.is_primary, status: 'missing' });
      }
    }

    const coverage = totalWeight ? (covered / totalWeight) : 0;
    const baseScore = totalWeight ? (sum / totalWeight) : 0;
    const score = (0.85 * baseScore) + (0.15 * coverage * 100);
    return { score, matches, gaps, coverage };
  }

  difficultyAlignmentScore(userYears, requiredLevelName) {
    const userLevel = this.levelToNum(this.yearsToLevelName(userYears));
    const reqLevel = this.levelToNum(this.yearsToLevelName(requiredLevelName));
    
    if (userLevel >= reqLevel) return 100;
    return Math.max(0, 100 - (reqLevel - userLevel) * 18);
  }

  // ============== HELPER METHODS ==============
  
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

  strengthsHighlight(langMatches, topicMatches) {
    const bits = [];
    if (langMatches.length) {
      const primary = langMatches.find(l => l.isPrimary) || langMatches[0];
      if (primary) bits.push(`Strong fit in ${primary.name}`);
    }
    if (topicMatches.length) {
      const primary = topicMatches.find(t => t.isPrimary) || topicMatches[0];
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
      const setA = new Set([...(a.project?.project_languages?.map(pl => pl.programming_languages?.name) || [])]);
      const setB = new Set([...(b.project?.project_languages?.map(pl => pl.programming_languages?.name) || [])]);
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

  // ============== LEGACY METHODS ==============
  
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

  clearCache() {
    this.projectCache = null;
    this.projectCacheTime = 0;
  }

  getThresholds() {
    return {
      recommendationThreshold: this.recommendationThreshold,
      minPassingScore: this.minPassingScore,
      displayThreshold: this.displayThreshold,
      primaryBoost: this.primaryBoost,
      weights: this.weights
    };
  }
}

module.exports = new SkillMatchingService();