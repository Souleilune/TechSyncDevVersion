// backend/controllers/awardsController.js
const supabase = require('../config/supabase');

// Award definitions with criteria
const AWARD_DEFINITIONS = {
  project_completion: {
    title: '🏆 Project Master',
    description: 'Completed a solo project with 100% progress',
    icon: 'trophy',
    color: '#FFD700',
    criteria: (data) => data.completion_percentage >= 100
  },
  weekly_challenge_master: {
    title: '🌟 Challenge Champion',
    description: 'Completed all weekly challenges for a project',
    icon: 'star',
    color: '#9333EA',
    criteria: (data) => data.all_challenges_completed === true
  },
  speed_demon: {
    title: '⚡ Speed Demon',
    description: 'Completed a project in under 30 days',
    icon: 'zap',
    color: '#EF4444',
    criteria: (data) => data.completion_days <= 30
  },
  perfectionist: {
    title: '💎 Perfectionist',
    description: 'Achieved 100% on all goals and tasks',
    icon: 'gem',
    color: '#10B981',
    criteria: (data) => data.perfect_completion === true
  },
  dedication: {
    title: '🔥 Dedication Award',
    description: 'Logged activity for 30 consecutive days',
    icon: 'flame',
    color: '#F59E0B',
    criteria: (data) => data.streak_days >= 30
  }
};

// Check and award project completion
const checkProjectCompletionAward = async (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.user.id;

    console.log('🏆 Checking project completion award for:', { projectId, userId });

    // Get project data
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .eq('owner_id', userId)
      .single();

    if (projectError || !project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Calculate completion percentage from goals
    const { data: goals, error: goalsError } = await supabase
      .from('solo_project_goals')
      .select('status, progress')
      .eq('project_id', projectId)
      .eq('user_id', userId);

    if (goalsError) {
      console.error('Error fetching goals:', goalsError);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch project goals'
      });
    }

    const totalGoals = goals.length;
    const completedGoals = goals.filter(g => g.status === 'completed').length;
    const completionPercentage = totalGoals > 0 ? (completedGoals / totalGoals) * 100 : 0;

    console.log('📊 Completion stats:', { totalGoals, completedGoals, completionPercentage });

    // Check if award should be given
    if (completionPercentage >= 100) {
      // Check if award already exists
      const { data: existingAward, error: checkError } = await supabase
        .from('user_awards')
        .select('id')
        .eq('user_id', userId)
        .eq('project_id', projectId)
        .eq('award_type', 'project_completion')
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        console.error('Error checking existing award:', checkError);
      }

      if (!existingAward) {
        // Create new award
        const awardDef = AWARD_DEFINITIONS.project_completion;
        const { data: newAward, error: awardError } = await supabase
          .from('user_awards')
          .insert({
            user_id: userId,
            project_id: projectId,
            award_type: 'project_completion',
            award_title: awardDef.title,
            award_description: awardDef.description,
            award_icon: awardDef.icon,
            award_color: awardDef.color,
            metadata: {
              completion_percentage: completionPercentage,
              total_goals: totalGoals,
              completed_goals: completedGoals,
              project_title: project.title
            }
          })
          .select()
          .single();

        if (awardError) {
          console.error('Error creating award:', awardError);
          return res.status(500).json({
            success: false,
            message: 'Failed to create award'
          });
        }

        console.log('✅ Award created:', newAward);

        return res.json({
          success: true,
          awarded: true,
          award: newAward,
          message: 'Congratulations! You earned the Project Master award!'
        });
      } else {
        return res.json({
          success: true,
          awarded: false,
          message: 'Award already earned'
        });
      }
    }

    res.json({
      success: true,
      awarded: false,
      completion_percentage: completionPercentage,
      message: 'Project not yet at 100% completion'
    });

  } catch (error) {
    console.error('💥 Check project completion award error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Check and award weekly challenge completion
const checkWeeklyChallengeAward = async (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.user.id;

    console.log('🌟 Checking weekly challenge award for:', { projectId, userId });

    // Get project programming language
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('id, title, project_languages(programming_language_id, programming_languages(id, name))')
      .eq('id', projectId)
      .eq('owner_id', userId)
      .single();

    if (projectError || !project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    const languageId = project.project_languages?.[0]?.programming_language_id;
    if (!languageId) {
      return res.json({
        success: true,
        awarded: false,
        message: 'No programming language set for project'
      });
    }

    // Get all available challenges for this language
    const { data: allChallenges, error: challengesError } = await supabase
      .from('coding_challenges')
      .select('id')
      .eq('programming_language_id', languageId)
      .eq('is_active', true)
      .is('project_id', null);

    if (challengesError) {
      console.error('Error fetching challenges:', challengesError);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch challenges'
      });
    }

    // Get user's passed attempts for this project
    const { data: attempts, error: attemptsError } = await supabase
      .from('challenge_attempts')
      .select('challenge_id, status')
      .eq('user_id', userId)
      .eq('project_id', projectId)
      .eq('status', 'passed');

    if (attemptsError) {
      console.error('Error fetching attempts:', attemptsError);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch challenge attempts'
      });
    }

    const completedChallengeIds = [...new Set(attempts.map(a => a.challenge_id))];
    const allChallengeIds = allChallenges.map(c => c.id);
    const allCompleted = allChallengeIds.length > 0 && 
                        allChallengeIds.every(id => completedChallengeIds.includes(id));

    console.log('📊 Challenge stats:', {
      total: allChallengeIds.length,
      completed: completedChallengeIds.length,
      allCompleted
    });

    if (allCompleted) {
      // Check if award already exists
      const { data: existingAward, error: checkError } = await supabase
        .from('user_awards')
        .select('id')
        .eq('user_id', userId)
        .eq('project_id', projectId)
        .eq('award_type', 'weekly_challenge_master')
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        console.error('Error checking existing award:', checkError);
      }

      if (!existingAward) {
        const awardDef = AWARD_DEFINITIONS.weekly_challenge_master;
        const { data: newAward, error: awardError } = await supabase
          .from('user_awards')
          .insert({
            user_id: userId,
            project_id: projectId,
            award_type: 'weekly_challenge_master',
            award_title: awardDef.title,
            award_description: awardDef.description,
            award_icon: awardDef.icon,
            award_color: awardDef.color,
            metadata: {
              total_challenges: allChallengeIds.length,
              completed_challenges: completedChallengeIds.length,
              project_title: project.title,
              language: project.project_languages?.[0]?.programming_languages?.name
            }
          })
          .select()
          .single();

        if (awardError) {
          console.error('Error creating award:', awardError);
          return res.status(500).json({
            success: false,
            message: 'Failed to create award'
          });
        }

        console.log('✅ Challenge Master award created:', newAward);

        return res.json({
          success: true,
          awarded: true,
          award: newAward,
          message: 'Congratulations! You earned the Challenge Champion award!'
        });
      }
    }

    res.json({
      success: true,
      awarded: false,
      progress: {
        completed: completedChallengeIds.length,
        total: allChallengeIds.length
      },
      message: 'Keep completing challenges to earn the award!'
    });

  } catch (error) {
    console.error('💥 Check weekly challenge award error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get all awards for a user
const getUserAwards = async (req, res) => {
  try {
    const userId = req.user.id;
    const { projectId } = req.query;

    console.log('🏅 Fetching awards for user:', userId);

    let query = supabase
      .from('user_awards')
      .select(`
        *,
        projects(id, title)
      `)
      .eq('user_id', userId)
      .order('earned_at', { ascending: false });

    if (projectId) {
      query = query.eq('project_id', projectId);
    }

    const { data: awards, error } = await query;

    if (error) {
      console.error('Error fetching awards:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch awards'
      });
    }

    res.json({
      success: true,
      data: awards
    });

  } catch (error) {
    console.error('💥 Get user awards error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get awards for a specific project
const getProjectAwards = async (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.user.id;

    console.log('🏅 Fetching awards for project:', projectId);

    const { data: awards, error } = await supabase
      .from('user_awards')
      .select('*')
      .eq('project_id', projectId)
      .eq('user_id', userId)
      .order('earned_at', { ascending: false });

    if (error) {
      console.error('Error fetching project awards:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch project awards'
      });
    }

    res.json({
      success: true,
      data: awards
    });

  } catch (error) {
    console.error('💥 Get project awards error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get award statistics for profile
const getAwardStatistics = async (req, res) => {
  try {
    const userId = req.user.id;

    console.log('📊 Fetching award statistics for user:', userId);

    const { data: awards, error } = await supabase
      .from('user_awards')
      .select('award_type, earned_at')
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching award statistics:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch award statistics'
      });
    }

    // Calculate statistics
    const stats = {
      total_awards: awards.length,
      by_type: {},
      recent_awards: awards.slice(0, 5)
    };

    awards.forEach(award => {
      stats.by_type[award.award_type] = (stats.by_type[award.award_type] || 0) + 1;
    });

    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('💥 Get award statistics error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

module.exports = {
  checkProjectCompletionAward,
  checkWeeklyChallengeAward,
  getUserAwards,
  getProjectAwards,
  getAwardStatistics
};