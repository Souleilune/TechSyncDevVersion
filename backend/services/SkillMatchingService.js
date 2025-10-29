// backend/services/SkillMatchingService.js
// UPDATED VERSION - Fixed threshold confusion and improved balance
const supabase = require('../config/supabase');

class SkillMatchingService {
  constructor() {
    // SCORING WEIGHTS
    // These determine how much each factor contributes to the final match score
    this.weights = {
      topicCoverage: 0.30,          // 30% - Increased from 28%
      languageProficiency: 0.35,     // 35% - Increased from 32%
      difficultyAlignment: 0.20,     // 20% - Increased from 18%
      interestAffinity: 0.10,        // 10% - Decreased from 12%
      popularityBoost: 0.025,        // 2.5% - Decreased from 5%
      recencyBoost: 0.025,           // 2.5% - Decreased from 5%
      
      // Legacy weights (kept for backward compatibility)
      topic_match: 0.4,
      experience_match: 0.3,
      language_match: 0.3
    };

    // THRESHOLD SETTINGS
    // ⚠️ IMPORTANT: These thresholds serve different purposes!
    
    // 1. RECOMMENDATION THRESHOLD (recommendationThreshold)
    //    - Minimum score for a project to appear in recommendations
    //    - Lower = more permissive (more recommendations, potentially lower quality)
    //    - Higher = more strict (fewer recommendations, higher quality)
    //    - RECOMMENDATION: Set to 55-65 for balanced results
    this.recommendationThreshold = 60;  // ✅ Changed from 40 to 60
    
    // 2. CODING CHALLENGE THRESHOLD (minPassingScore)
    //    - Minimum score to pass the coding challenge and join a project
    //    - This is SEPARATE from the recommendation score
    //    - User must score 60%+ on the actual coding test
    this.minPassingScore = 60;  // ✅ Changed from 70 to 60
    
    // 3. DISPLAY THRESHOLD (for frontend filtering)
    //    - Used in UI to show only "good matches"
    //    - Should align with recommendationThreshold
    this.displayThreshold = 60;  // ✅ Added for clarity
    
    // Legacy threshold (for backward compatibility)
    this.threshold = this.recommendationThreshold;

    // OTHER SETTINGS
    this.primaryBoost = 1.8;     // ✅ Increased from 1.5 (primary skills more important)
    this.maxAttempts = 8;         // Maximum coding challenge attempts before rejection
    
    // OPTIMIZATION: Add caching
    this.projectCache = null;
    this.projectCacheTime = 0;
    this.cacheDuration = 60000; // 1 minute cache
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
            total: Number(score || 0).toFixed(1),
            threshold: this.recommendationThreshold
          });
        }

        // ✅ Use recommendationThreshold instead of threshold
        if (score >= this.recommendationThreshold) {
          const matchFactors = this.buildMatchFactors(user, project, features);
          scored.push({
            projectId: project.id,
            score: Math.round(score),
            title: project.title,
            description: project.description,
            difficulty_level: project.difficulty_level,
            current_members: project.current_members,
            maximum_members: project.maximum_members,
            technologies: project.languages || [],
            matchFactors,
            recommendationId: `rec_${userId}_${project.id}_${Date.now()}`
          });
        }
      }

      const reranked = this.diversityReRank(scored, 0.25);

      // OPTIMIZATION: Don't wait for storage (fire and forget)
      this.storeRecommendations(userId, reranked).catch(err => 
        console.error('Failed to store recommendations:', err)
      );
      
      return reranked.slice(0, limit);
    } catch (error) {
      console.error('Error in recommendProjects:', error);
      throw error;
    }
  }

  // ============== OPTIMIZED DATA LOADERS ==============
  async getUserProfile(userId) {
    try {
      const { data: user, error: userError } = await supabase
        .from('users')
        .select(`
          id, username, email, full_name, years_experience,
          user_programming_languages:user_programming_languages (
            id,
            proficiency_level,
            years_experience,
            programming_languages (id, name, description)
          ),
          user_topics:user_topics (
            id,
            interest_level,
            experience_level,
            topics (id, name, description, category)
          )
        `)
        .eq('id', userId)
        .single();

      if (userError || !user) throw new Error('User not found');

      return {
        ...user,
        programming_languages: user.user_programming_languages || [],
        topics: user.user_topics || []
      };
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    }
  }

  async getAvailableProjects(userId) {
    try {
      // OPTIMIZATION: Use cache if available and fresh
      const now = Date.now();
      if (this.projectCache && (now - this.projectCacheTime) < this.cacheDuration) {
        return this.filterProjectsForUser(this.projectCache, userId);
      }

      const { data: projects, error } = await supabase
        .from('projects')
        .select(`
          id, title, description, difficulty_level, required_experience_level,
          current_members, maximum_members, status, owner_id,
          project_languages (
            programming_languages (id, name),
            required_level,
            is_primary
          ),
          project_topics (
            topics (id, name, category),
            is_primary
          )
        `)
        .eq('status', 'recruiting');

      if (error) throw error;

      // Store in cache
      this.projectCache = projects || [];
      this.projectCacheTime = now;

      return this.filterProjectsForUser(this.projectCache, userId);
    } catch (error) {
      console.error('Error getting available projects:', error);
      throw error;
    }
  }

  async filterProjectsForUser(projects, userId) {
    const { data: userMemberships, error: membershipError } = await supabase
      .from('project_members')
      .select('project_id')
      .eq('user_id', userId)
      .eq('status', 'active');

    if (membershipError) {
      console.error('Error fetching user memberships:', membershipError);
    }

    const userProjectIds = new Set(userMemberships?.map(m => m.project_id) || []);
    const availableProjects = projects.filter(project =>
      project.current_members < project.maximum_members &&
      project.owner_id !== userId &&
      !userProjectIds.has(project.id)
    );

    return availableProjects.map(project => ({
      ...project,
      languages: project.project_languages?.map(pl => pl.programming_languages?.name).filter(Boolean) || [],
      topics: project.project_topics?.map(pt => pt.topics?.name).filter(Boolean) || []
    }));
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

  normalizeProficiency(level, years) {
    let base = 0.4;
    if (level != null) {
      if (typeof level === 'number') {
        base = this.clamp01(level);
      } else {
        const map = { beginner: 0.25, intermediate: 0.5, advanced: 0.75, expert: 1.0 };
        base = map[String(level).toLowerCase()] ?? 0.4;
      }
    }
    const y = Number(years) || 0;
    const yearsAdj = this.clamp01(y >= 6 ? 1 : y / 6);
    return 0.7 * base + 0.3 * yearsAdj;
  }

  topicCoverageScore(userTopics, projectTopics) {
    if (!userTopics?.length || !projectTopics?.length) return { score: 0, matches: [], missing: [] };

    let totalWeight = 0;
    let sum = 0;
    const matches = [];
    const missing = [];

    for (const pt of projectTopics) {
      const name = pt.topics?.name;
      if (!name) continue;

      const weight = pt.is_primary ? this.primaryBoost : 1;
      totalWeight += weight;

      const ut = userTopics.find(t => t.topics?.name === name);
      if (ut) {
        const exp = this.normalizeLevel01(ut.experience_level);
        const interest = this.normalizeLevel01(ut.interest_level);
        const v = (0.6 * exp + 0.4 * interest) * weight;
        sum += v;
        matches.push({ name, is_primary: !!pt.is_primary, interest: ut.interest_level, experience: ut.experience_level });
      } else {
        missing.push({ name, is_primary: !!pt.is_primary });
      }
    }

    const score = totalWeight ? (sum / totalWeight) * 100 : 0;
    return { score, matches, missing };
  }

  languageProficiencyScore(userLangs, projectLangs) {
    if (!userLangs?.length || !projectLangs?.length) return { score: 0, matches: [], gaps: [], coverage: 0 };

    let totalWeight = 0;
    let sum = 0;
    let covered = 0;
    const matches = [];
    const gaps = [];

    for (const pl of projectLangs) {
      const name = pl.programming_languages?.name;
      if (!name) continue;

      const weight = pl.is_primary ? this.primaryBoost : 1;
      totalWeight += weight;

      const req = this.normalizeRequiredLevel(pl.required_level);
      const ul = userLangs.find(ul => ul.programming_languages?.name === name);

      if (ul) {
        covered += weight;
        const prof = this.normalizeProficiency(ul.proficiency_level, ul.years_experience);
        const gap = Math.max(0, req - prof);
        const s = Math.max(0, 1 - gap);
        sum += s * weight;
        if (gap <= 0) {
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
    
    // ✅ IMPROVED: Less harsh penalty for being below required level
    if (userLevel >= reqLevel) return 100;
    
    // Reduced penalty from 22 to 18 per level difference
    return Math.max(0, 100 - (reqLevel - userLevel) * 18);
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
      .sort((a, b) => (Number(b.is_primary) - Number(a.is_primary)) || (b.userProficiency - a.userProficiency))
      .slice(0, 3);

    const criticalGaps = [...(f.lang.gaps || []), ...(f.topic.missing || [])]
      .sort((a, b) => (Number(b.is_primary) - Number(a.is_primary)))
      .slice(0, 3);

    return {
      topicMatches: this.getTopicMatches(user.topics, project.project_topics || []),
      languageMatches: this.getLanguageMatches(user.programming_languages, project.project_languages || []),
      experienceMatch: {
        userExperience: user.years_experience,
        requiredExperience: project.required_experience_level,
        isMatch: this.calculateExperienceMatch(user.years_experience, project.required_experience_level) >= 75
      },
      topicCoverage: {
        score: Math.round(f.topic.score || 0),
        matches: topTopicMatches,
        missing: f.topic.missing || []
      },
      languageFit: {
        score: Math.round(f.lang.score || 0),
        coverage: Number(((f.lang.coverage || 0) * 100).toFixed(0)),
        topMatches: topLangMatches,
        gaps: criticalGaps
      },
      difficultyAlignment: {
        score: Math.round(f.diff || 0),
        userExperience: user.years_experience,
        requiredExperience: project.required_experience_level
      },
      highlights: this.summarizeHighlights(topLangMatches, topTopicMatches),
      suggestions: this.suggestImprovements(criticalGaps)
    };
  }

  summarizeHighlights(langMatches, topicMatches) {
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
      console.error('Failed to store recommendations:', error);
    }
  }

  clearCache() {
    this.projectCache = null;
    this.projectCacheTime = 0;
  }

  // ✅ NEW: Get current thresholds (for debugging/testing)
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