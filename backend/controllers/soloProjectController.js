// backend/controllers/soloProjectController.js - FIXED VERSION
const supabase = require('../config/supabase');
const awardsController = require('./awardsController');
const { createTimelinePostFromProject } = require('../utils/timelinePostHelper');


const checkAndAwardProgress = async (projectId, userId) => {
  try {
    console.log('🎯 Checking for awards eligibility:', { projectId, userId });

    // Check project completion award
    const completionCheck = await checkProjectCompletionInternal(projectId, userId);
    
    // Check weekly challenge award
    const challengeCheck = await checkWeeklyChallengeInternal(projectId, userId);

    return {
      completion: completionCheck,
      challenges: challengeCheck
    };
  } catch (error) {
    console.error('Error checking awards:', error);
    return null;
  }
};

const checkProjectCompletionInternal = async (projectId, userId) => {
  try {
    console.log('🎯 Checking solo project completion:', { projectId, userId });

    // ✅ STEP 1: Get goals FIRST
    const { data: goals, error: goalsError } = await supabase
      .from('solo_project_goals')
      .select('id, status, progress')
      .eq('project_id', projectId)
      .eq('user_id', userId);

    if (goalsError) {
      console.error('Error fetching goals:', goalsError);
      return { completed: false, awarded: false };
    }

    // ✅ STEP 2: Calculate completion
    const totalGoals = goals?.length || 0;
    const completedGoals = goals?.filter(g => g.status === 'completed').length || 0;
    const completionPercentage = totalGoals > 0 ? (completedGoals / totalGoals) * 100 : 0;

    console.log('📊 Completion stats:', { 
      totalGoals, 
      completedGoals, 
      completionPercentage: completionPercentage.toFixed(2) + '%' 
    });

    // ✅ STEP 3: EARLY RETURN if not 100%
    if (completionPercentage < 100) {
      console.log('⏳ Project not yet complete, skipping auto-publish');
      return { completed: false, awarded: false };
    }

    console.log('🎉 Project is 100% complete! Proceeding with completion workflow...');

    // ✅ STEP 4: Check for existing timeline post
    const { data: existingPost, error: postCheckError } = await supabase
      .from('timeline_posts')
      .select('id')
      .eq('project_id', projectId)
      .eq('user_id', userId)
      .maybeSingle();  // ✅ Use maybeSingle() instead of single()

    if (postCheckError) {
      console.error('Error checking existing timeline post:', postCheckError);
    }

    // ✅ STEP 5: Create timeline post ONLY if doesn't exist
    if (!existingPost) {
      console.log('📝 Creating timeline post for completed project...');
      const timelinePost = await createTimelinePostFromProject(projectId, userId, 'solo');
      
      if (timelinePost) {
        console.log('✅ Timeline post created successfully:', timelinePost.id);
      } else {
        console.warn('⚠️ Failed to create timeline post');
      }
    } else {
      console.log('ℹ️ Timeline post already exists, skipping creation:', existingPost.id);
    }

    // ✅ STEP 6: Update project status
    const { error: updateError } = await supabase
      .from('projects')
      .update({ 
        status: 'completed',
        updated_at: new Date().toISOString()
      })
      .eq('id', projectId);

    if (updateError) {
      console.error('Error updating project status:', updateError);
    } else {
      console.log('✅ Project status updated to completed');
    }

    // ✅ STEP 7: Check for existing award
    const { data: existingAward, error: awardCheckError } = await supabase
      .from('user_awards')
      .select('id')
      .eq('user_id', userId)
      .eq('project_id', projectId)
      .eq('award_type', 'project_completion')
      .maybeSingle();  // ✅ Use maybeSingle()

    if (awardCheckError) {
      console.error('Error checking existing award:', awardCheckError);
    }

    // ✅ STEP 8: Create award ONLY if doesn't exist
    if (!existingAward) {
      console.log('🏆 Creating project completion award...');
      
      const { data: project } = await supabase
        .from('projects')
        .select('title')
        .eq('id', projectId)
        .single();

      const { data: newAward, error: awardError } = await supabase
        .from('user_awards')
        .insert({
          user_id: userId,
          project_id: projectId,
          award_type: 'project_completion',
          award_title: '🏆 Project Master',
          award_description: 'Completed a solo project with 100% progress',
          award_icon: 'trophy',
          award_color: '#FFD700',
          metadata: {
            completion_percentage: completionPercentage,
            total_goals: totalGoals,
            completed_goals: completedGoals,
            project_title: project?.title
          }
        })
        .select()
        .single();

      if (awardError) {
        console.error('Error creating award:', awardError);
      } else {
        console.log('✅ Project completion award granted:', newAward.id);
      }

      return { completed: true, awarded: true, award: newAward };
    } else {
      console.log('ℹ️ Award already exists, skipping creation:', existingAward.id);
      return { completed: true, awarded: false };
    }

  } catch (error) {
    console.error('💥 Error in checkProjectCompletionInternal:', error);
    return { completed: false, awarded: false };
  }
};

// Internal function for checking weekly challenges (called automatically)
const checkWeeklyChallengeInternal = async (projectId, userId) => {
  try {
    // Get project programming language
    const { data: project } = await supabase
      .from('projects')
      .select('id, title, project_languages(programming_language_id)')
      .eq('id', projectId)
      .single();

    const languageId = project?.project_languages?.[0]?.programming_language_id;
    if (!languageId) return { awarded: false, reason: 'No language set' };

    // Get all challenges for this language
    const { data: allChallenges } = await supabase
      .from('coding_challenges')
      .select('id')
      .eq('programming_language_id', languageId)
      .eq('is_active', true)
      .is('project_id', null);

    // Get user's passed attempts
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

        console.log('✅ Weekly challenge award granted!');
        return { awarded: true, award: newAward };
      }
    }

    return { awarded: false, progress: { completed: completedChallengeIds.length, total: allChallengeIds.length } };
  } catch (error) {
    console.error('Error checking weekly challenges:', error);
    return { awarded: false, error: error.message };
  }
};

// Helper function to verify solo project ownership
const verifySoloProjectAccess = async (projectId, userId) => {
  try {
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('owner_id, maximum_members, current_members')
      .eq('id', projectId)
      .single();

    if (projectError) {
      return { 
        success: false, 
        message: 'Project not found',
        error: projectError
      };
    }

    // Verify it's a solo project (1 member max) and user is the owner
    if (project.maximum_members !== 1 || project.owner_id !== userId) {
      return { 
        success: false, 
        message: 'Access denied. This is not your solo project.',
        statusCode: 403
      };
    }

    return { success: true, project };
  } catch (error) {
    console.error('Error verifying solo project access:', error);
    return { 
      success: false, 
      message: 'Error verifying project access',
      error
    };
  }
};

// ===== DASHBOARD CONTROLLERS =====

const getDashboardData = async (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.user.id;

    console.log('📊 Getting dashboard data for solo project:', projectId);

    // Verify access first
    const accessCheck = await verifySoloProjectAccess(projectId, userId);
    if (!accessCheck.success) {
      return res.status(accessCheck.statusCode || 404).json({
        success: false,
        message: accessCheck.message
      });
    }

    // FIXED: Fetch complete project data with programming languages and topics
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select(`
        *,
        users!owner_id (
          id,
          username,
          full_name,
          email,
          avatar_url
        )
      `)
      .eq('id', projectId)
      .single();

    if (projectError) {
      console.error('Error fetching complete project data:', projectError);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch project data'
      });
    }

    // FIXED: Fetch project languages separately (Supabase join limitation)
    const { data: projectLanguages, error: languagesError } = await supabase
      .from('project_languages')
      .select(`
        id,
        is_primary,
        required_level,
        programming_languages (
          id,
          name,
          description
        )
      `)
      .eq('project_id', projectId);

    if (languagesError) {
      console.error('Error fetching project languages:', languagesError);
    }

    // FIXED: Fetch project topics separately  
    const { data: projectTopics, error: topicsError } = await supabase
      .from('project_topics')
      .select(`
        id,
        is_primary,
        topics (
          id,
          name,
          description
        )
      `)
      .eq('project_id', projectId);

    if (topicsError) {
      console.error('Error fetching project topics:', topicsError);
    }

    // FIXED: Add programming languages and topics to project data
    project.programming_languages = projectLanguages || [];
    project.topics = projectTopics || [];

    // FIXED: Get the primary programming language for the challenge system
    const primaryLanguage = projectLanguages?.find(pl => pl.is_primary);
    if (primaryLanguage) {
      project.programming_language_id = primaryLanguage.programming_languages.id;
      project.programming_language = primaryLanguage.programming_languages;
    } else if (projectLanguages?.length > 0) {
      // Fallback to first language if no primary is set
      project.programming_language_id = projectLanguages[0].programming_languages.id;
      project.programming_language = projectLanguages[0].programming_languages;
    }

    console.log('🔧 Project language info:', {
      languageId: project.programming_language_id,
      languageName: project.programming_language?.name,
      totalLanguages: projectLanguages?.length || 0
    });

    // Fetch project tasks for statistics
    const { data: allItems, error: itemsError } = await supabase
      .from('solo_project_goals')
      .select('*')
      .eq('project_id', projectId);

    if (itemsError) {
      console.error('Error fetching items:', itemsError);
    }

    console.log('📊 Raw items from database:', allItems); // Debug log

    // ✅ Separate tasks from goals based on estimated_hours field
    const allTasks = (allItems || []).filter(item => 
      item.estimated_hours !== null && item.estimated_hours > 0
    );
    const allGoals = (allItems || []).filter(item => 
      !item.estimated_hours || item.estimated_hours === null || item.estimated_hours === 0
    );

    console.log('✅ Tasks found:', allTasks.length); // Debug log
    console.log('✅ Goals found:', allGoals.length); // Debug log

    // Calculate task statistics
    const completed = allTasks.filter(task => task.status === 'completed');
    const inProgress = allTasks.filter(task => task.status === 'in_progress' || task.status === 'active');
    const completionRate = allTasks.length > 0 ?
      Math.round((completed.length / allTasks.length) * 100) : 0;

    // Calculate goal statistics
    const completedGoals = allGoals.filter(goal => goal.status === 'completed');
    const activeGoals = allGoals.filter(goal => goal.status === 'active' || goal.status === 'in_progress');

    // Get today's time tracking (mock for now - will be implemented with real tracking)
    // ✅ REAL: Calculate actual time spent today
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Fetch time tracking entries for today
      const { data: todayTimeEntries } = await supabase
        .from('solo_project_time_tracking')
        .select('duration_minutes')
        .eq('project_id', projectId)
        .gte('logged_at', today.toISOString());

      // Calculate total hours for today
      const totalMinutesToday = (todayTimeEntries || []).reduce(
        (sum, entry) => sum + (entry.duration_minutes || 0), 
        0
      );
      const timeSpentToday = Math.round((totalMinutesToday / 60) * 10) / 10; // Round to 1 decimal

      // ✅ REAL: Calculate streak days based on activity
      const { data: recentActivities } = await supabase
        .from('user_activity')
        .select('created_at')
        .eq('project_id', projectId)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(100);

      // Calculate consecutive days with activity
      let streakDays = 0;
      if (recentActivities && recentActivities.length > 0) {
        const activityDates = recentActivities.map(a => {
          const date = new Date(a.created_at);
          date.setHours(0, 0, 0, 0);
          return date.getTime();
        });
        
        // Remove duplicates and sort
        const uniqueDates = [...new Set(activityDates)].sort((a, b) => b - a);
        
        // Count consecutive days
        const todayTime = today.getTime();
        let currentDate = todayTime;
        
        for (let i = 0; i < uniqueDates.length; i++) {
          if (uniqueDates[i] === currentDate) {
            streakDays++;
            currentDate -= 24 * 60 * 60 * 1000; // Go back 1 day
          } else if (uniqueDates[i] < currentDate) {
            break; // Streak broken
          }
        }
        
        // If no activity today, start from yesterday
        if (uniqueDates[0] < todayTime && streakDays === 0) {
          currentDate = todayTime - 24 * 60 * 60 * 1000;
          for (let i = 0; i < uniqueDates.length; i++) {
            if (uniqueDates[i] === currentDate) {
              streakDays++;
              currentDate -= 24 * 60 * 60 * 1000;
            } else if (uniqueDates[i] < currentDate) {
              break;
            }
          }
        }
      }

      console.log('⏱️ Time spent today:', timeSpentToday, 'hours');
      console.log('🔥 Current streak:', streakDays, 'days');

    const dashboardData = {
      project, // FIXED: Now includes programming languages and topics
      stats: {
        // Existing task stats
        totalTasks: allTasks.length,
        completedTasks: completed.length,
        inProgressTasks: inProgress.length,
        completionRate,
        
        // Existing goal stats
        totalGoals: allGoals.length,
        completedGoals: completedGoals.length,
        activeGoals: activeGoals.length,
        
        // NEW: Unified stats for the enhanced dashboard
        totalItems: allTasks.length + allGoals.length,  // ← ADD: Combined total
        completedItems: completed.length + completedGoals.length,  // ← ADD: Combined completed
        activeItems: inProgress.length + activeGoals.length,  // ← ADD: Combined active
        combinedCompletionRate: (allTasks.length + allGoals.length) > 0 ?  // ← ADD: Combined completion rate
          Math.round(((completed.length + completedGoals.length) / (allTasks.length + allGoals.length)) * 100) : 0,
        
        // Existing time tracking
        timeSpentToday,
        streakDays
      },
      
      // NEW: Add the actual tasks and goals data for the dashboard to use
      tasks: allTasks.slice(0, 10), // ← ADD: Recent tasks for dashboard display
      goals: allGoals.slice(0, 10)  // ← ADD: Recent goals for dashboard display
    };

    

    console.log('✅ Dashboard data retrieved successfully with programming languages');

    res.json({
      success: true,
      data: dashboardData
    });

  } catch (error) {
    console.error('💥 Get dashboard data error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard data'
    });
  }
};

const getRecentActivity = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { limit = 10 } = req.query;
    const userId = req.user.id;

    console.log('📋 Getting recent activity for solo project:', projectId);

    // Verify access
    const accessCheck = await verifySoloProjectAccess(projectId, userId);
    if (!accessCheck.success) {
      return res.status(accessCheck.statusCode || 404).json({
        success: false,
        message: accessCheck.message
      });
    }

    // Fetch recent activity from the user_activity table
    const { data: activities, error: activitiesError } = await supabase
      .from('user_activity')
      .select('*')
      .eq('project_id', projectId)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(parseInt(limit));

    if (activitiesError) {
      console.error('Error fetching activities:', activitiesError);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch recent activity'
      });
    }

    console.log('✅ Recent activity retrieved successfully');

    res.json({
      success: true,
      data: { activities: activities || [] }
    });

  } catch (error) {
    console.error('💥 Get recent activity error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch recent activity'
    });
  }
};

const logActivity = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { action, target, type, metadata } = req.body;
    const userId = req.user.id;

    console.log('📝 Logging activity for solo project:', projectId);

    // Verify access
    const accessCheck = await verifySoloProjectAccess(projectId, userId);
    if (!accessCheck.success) {
      return res.status(accessCheck.statusCode || 404).json({
        success: false,
        message: accessCheck.message
      });
    }

    // Log activity
    const { data: activity, error: activityError } = await supabase
      .from('user_activity')
      .insert({
        user_id: userId,
        project_id: projectId,
        activity_type: type,
        activity_data: {
          action,
          target,
          metadata: metadata || {}
        }
      })
      .select()
      .single();

    if (activityError) {
      console.error('Error logging activity:', activityError);
      return res.status(500).json({
        success: false,
        message: 'Failed to log activity'
      });
    }

    console.log('✅ Activity logged successfully:', activity.id);

    // ✅ AUTO-LOG TIME ENTRY with REALISTIC estimates
    let estimatedMinutes = 2; // Default: 2 minutes for quick actions

    // More realistic time estimates based on actual user behavior
    if (action === 'created' && target.includes('task')) {
      estimatedMinutes = 3; // Creating a task: 2-3 minutes
    } else if (action === 'created' && target.includes('goal')) {
      estimatedMinutes = 5; // Creating a goal (more thoughtful): 4-6 minutes
    } else if (action === 'updated' && target.includes('task')) {
      estimatedMinutes = 2; // Quick update: 1-2 minutes
    } else if (action === 'updated' && target.includes('progress')) {
      estimatedMinutes = 1; // Just clicking progress: <1 minute
    } else if (action === 'completed' || (metadata && metadata.progress === 100)) {
      estimatedMinutes = 5; // Completing something: testing + marking: 3-5 minutes
    } else if (action === 'deleted') {
      estimatedMinutes = 1; // Deleting is quick: <1 minute
    } else if (action === 'navigated to') {
      estimatedMinutes = 0; // Don't log time for just navigating
    } else {
      estimatedMinutes = 2; // General actions: ~2 minutes
    }

    // Only log if estimated time > 0
    if (estimatedMinutes > 0) {
      // Determine activity type based on the action
      let activityType = 'planning';
      if (type.includes('task') || action.includes('completed')) {
        activityType = 'coding';
      } else if (action.includes('note')) {
        activityType = 'documentation';
      }

      // Log the time entry
      const { error: timeError } = await supabase
        .from('solo_project_time_tracking')
        .insert({
          project_id: projectId,
          description: `${action} ${target}`,
          duration_minutes: estimatedMinutes,
          activity_type: activityType,
          logged_at: new Date().toISOString()
        });

      if (timeError) {
        console.warn('⚠️ Could not log time entry:', timeError);
        // Don't fail the request if time logging fails
      } else {
        console.log(`⏱️ Time entry logged: ${estimatedMinutes} minutes (${activityType})`);
      }
    }

    res.json({
      success: true,
      data: { activity },
      message: 'Activity logged successfully'
    });

  } catch (error) {
    console.error('💥 Log activity error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to log activity'
    });
  }
};

// ===== GOALS CONTROLLERS =====

const getGoals = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { status, category, type, sort_by = 'created_at', sort_order = 'desc' } = req.query; // ← ADD type filter
    const userId = req.user.id;

    console.log('🎯 Getting goals for solo project:', projectId);

    // Verify access (keep your existing verification code)
    const accessCheck = await verifySoloProjectAccess(projectId, userId);
    if (!accessCheck.success) {
      return res.status(accessCheck.statusCode || 404).json({
        success: false,
        message: accessCheck.message
      });
    }

    // Build query (keep your existing query building)
    let query = supabase
      .from('solo_project_goals')
      .select('*')
      .eq('project_id', projectId)
      .order(sort_by, { ascending: sort_order === 'asc' });

    if (status) query = query.eq('status', status);
    if (category) query = query.eq('category', category);
    
    // ADD: Filter by type (task vs goal)
    if (type === 'task') {
      query = query.not('estimated_hours', 'is', null);
    } else if (type === 'goal') {
      query = query.is('estimated_hours', null);
    }

    const { data: goals, error: goalsError } = await query;

    if (goalsError) {
      console.error('Error fetching goals:', goalsError);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch goals'
      });
    }

    // ADD: Enhance goals with computed properties for unified display
    const enhancedGoals = (goals || []).map(goal => ({
      ...goal,
      type: goal.estimated_hours ? 'task' : 'goal', // ← ADD type detection
      progress: goal.status === 'completed' ? 100 : 0, // ← ADD progress
      is_overdue: goal.target_date && new Date(goal.target_date) < new Date() && goal.status !== 'completed' // ← ADD overdue check
    }));

    console.log('✅ Goals retrieved successfully');

    res.json({
      success: true,
      data: { goals: enhancedGoals } // ← Return enhanced goals
    });

  } catch (error) {
    console.error('💥 Get goals error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch goals'
    });
  }
};

const createGoal = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { title, description, priority, category, target_date, estimated_hours } = req.body; // ← ADD estimated_hours
    const userId = req.user.id;

    console.log('🎯 Creating goal for solo project:', projectId);

    // Verify access (keep your existing verification code)
    const accessCheck = await verifySoloProjectAccess(projectId, userId);
    if (!accessCheck.success) {
      return res.status(accessCheck.statusCode || 404).json({
        success: false,
        message: accessCheck.message
      });
    }

    // ENHANCED: Create goal with optional task-like fields
    const goalData = {
      project_id: projectId,
      user_id: userId,  // ← IMPORTANT: Add this if it was missing
      title,
      description,
      priority: priority || 'medium',
      category: category || 'general',
      target_date,
      status: 'active'
    };

    // ADD: Support for task-like goals
    if (estimated_hours && parseInt(estimated_hours) > 0) {
      goalData.estimated_hours = parseInt(estimated_hours);
    }

    const { data: goal, error: goalError } = await supabase
      .from('solo_project_goals')
      .insert(goalData)
      .select()
      .single();

    if (goalError) {
      console.error('Error creating goal:', goalError);
      return res.status(500).json({
        success: false,
        message: 'Failed to create goal'
      });
    }

    console.log('✅ Goal created successfully:', goal.id);

    res.json({
      success: true,
      data: { goal },
      message: 'Goal created successfully'
    });

  } catch (error) {
    console.error('💥 Create goal error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create goal'
    });
  }
};

const updateGoal = async (req, res) => {
  try {
    const { projectId, goalId } = req.params;
    const updateData = req.body;
    const userId = req.user.id;

    console.log('🎯 Updating goal for solo project:', projectId);

    // Verify access
    const accessCheck = await verifySoloProjectAccess(projectId, userId);
    if (!accessCheck.success) {
      return res.status(accessCheck.statusCode || 404).json({
        success: false,
        message: accessCheck.message
      });
    }

    // Validate goal belongs to project
    const { data: existingGoal, error: checkError } = await supabase
      .from('solo_project_goals')
      .select('id')
      .eq('id', goalId)
      .eq('project_id', projectId)
      .single();

    if (checkError || !existingGoal) {
      return res.status(404).json({
        success: false,
        message: 'Goal not found'
      });
    }

    // Update goal
    const { data: goal, error: updateError } = await supabase
      .from('solo_project_goals')
      .update({
        ...updateData,
        updated_at: new Date().toISOString()
      })
      .eq('id', goalId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating goal:', updateError);
      return res.status(500).json({
        success: false,
        message: 'Failed to update goal'
      });
    }

    console.log('✅ Goal updated successfully:', goal.id);

    // ✅ NEW: Check if project is now complete and award/publish if needed
    if (updateData.status === 'completed') {
      console.log('🎯 Goal marked as completed, checking for project completion...');
      await checkAndAwardProgress(projectId, userId);
    }

    res.json({
      success: true,
      data: { goal },
      message: 'Goal updated successfully'
    });

  } catch (error) {
    console.error('💥 Update goal error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update goal'
    });
  }
};

const deleteGoal = async (req, res) => {
  try {
    const { projectId, goalId } = req.params;
    const userId = req.user.id;

    console.log('🗑️ Deleting goal for solo project:', projectId);

    // Verify access
    const accessCheck = await verifySoloProjectAccess(projectId, userId);
    if (!accessCheck.success) {
      return res.status(accessCheck.statusCode || 404).json({
        success: false,
        message: accessCheck.message
      });
    }

    // Validate goal belongs to project and get goal data
    const { data: existingGoal, error: checkError } = await supabase
      .from('solo_project_goals')
      .select('id, title')
      .eq('id', goalId)
      .eq('project_id', projectId)
      .single();

    if (checkError || !existingGoal) {
      return res.status(404).json({
        success: false,
        message: 'Goal not found'
      });
    }

    // Delete goal
    const { error: deleteError } = await supabase
      .from('solo_project_goals')
      .delete()
      .eq('id', goalId);

    if (deleteError) {
      console.error('Error deleting goal:', deleteError);
      return res.status(500).json({
        success: false,
        message: 'Failed to delete goal'
      });
    }

    console.log('✅ Goal deleted successfully:', existingGoal.title);

    res.json({
      success: true,
      message: `Goal "${existingGoal.title}" deleted successfully`
    });

  } catch (error) {
    console.error('💥 Delete goal error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete goal'
    });
  }
};

// ===== NOTES CONTROLLERS =====

const getNotes = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { category, search, sort_by = 'created_at', sort_order = 'desc' } = req.query;
    const userId = req.user.id;

    console.log('📝 Getting notes for solo project:', projectId);

    // Verify access
    const accessCheck = await verifySoloProjectAccess(projectId, userId);
    if (!accessCheck.success) {
      return res.status(accessCheck.statusCode || 404).json({
        success: false,
        message: accessCheck.message
      });
    }

    // Build query
    let query = supabase
      .from('solo_project_notes')
      .select('*')
      .eq('project_id', projectId)
      .order(sort_by, { ascending: sort_order === 'asc' });

    if (category) query = query.eq('category', category);
    if (search) query = query.or(`title.ilike.%${search}%,content.ilike.%${search}%`);

    const { data: notes, error: notesError } = await query;

    if (notesError) {
      console.error('Error fetching notes:', notesError);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch notes'
      });
    }

    console.log('✅ Notes retrieved successfully');

    res.json({
      success: true,
      data: { notes: notes || [] }
    });

  } catch (error) {
    console.error('💥 Get notes error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notes'
    });
  }
};

const getNote = async (req, res) => {
  try {
    const { projectId, noteId } = req.params;
    const userId = req.user.id;

    console.log('📝 Getting note for solo project:', projectId);

    // Verify access
    const accessCheck = await verifySoloProjectAccess(projectId, userId);
    if (!accessCheck.success) {
      return res.status(accessCheck.statusCode || 404).json({
        success: false,
        message: accessCheck.message
      });
    }

    // Fetch note
    const { data: note, error: noteError } = await supabase
      .from('solo_project_notes')
      .select('*')
      .eq('id', noteId)
      .eq('project_id', projectId)
      .single();

    if (noteError || !note) {
      return res.status(404).json({
        success: false,
        message: 'Note not found'
      });
    }

    console.log('✅ Note retrieved successfully');

    res.json({
      success: true,
      data: { note }
    });

  } catch (error) {
    console.error('💥 Get note error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch note'
    });
  }
};

const createNote = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { title, content, category } = req.body;
    const userId = req.user.id;

    console.log('📝 Creating note for solo project:', projectId);

    // Verify access
    const accessCheck = await verifySoloProjectAccess(projectId, userId);
    if (!accessCheck.success) {
      return res.status(accessCheck.statusCode || 404).json({
        success: false,
        message: accessCheck.message
      });
    }

    // Create note - FIXED: Include user_id in the insert
    const { data: note, error: noteError } = await supabase
      .from('solo_project_notes')
      .insert({
        project_id: projectId,
        user_id: userId,  // ✅ ADDED: This was missing and causing the error
        title,
        content,
        category: category || 'general'
      })
      .select()
      .single();

    if (noteError) {
      console.error('Error creating note:', noteError);
      return res.status(500).json({
        success: false,
        message: 'Failed to create note'
      });
    }

    console.log('✅ Note created successfully:', note.id);

    res.json({
      success: true,
      data: { note },
      message: 'Note created successfully'
    });

  } catch (error) {
    console.error('💥 Create note error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create note'
    });
  }
};

const updateNote = async (req, res) => {
  try {
    const { projectId, noteId } = req.params;
    const updateData = req.body;
    const userId = req.user.id;

    console.log('📝 Updating note for solo project:', projectId);

    // Verify access
    const accessCheck = await verifySoloProjectAccess(projectId, userId);
    if (!accessCheck.success) {
      return res.status(accessCheck.statusCode || 404).json({
        success: false,
        message: accessCheck.message
      });
    }

    // Validate note belongs to project
    const { data: existingNote, error: checkError } = await supabase
      .from('solo_project_notes')
      .select('id')
      .eq('id', noteId)
      .eq('project_id', projectId)
      .single();

    if (checkError || !existingNote) {
      return res.status(404).json({
        success: false,
        message: 'Note not found'
      });
    }

    // Update note
    const { data: note, error: updateError } = await supabase
      .from('solo_project_notes')
      .update({
        ...updateData,
        updated_at: new Date().toISOString()
      })
      .eq('id', noteId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating note:', updateError);
      return res.status(500).json({
        success: false,
        message: 'Failed to update note'
      });
    }

    console.log('✅ Note updated successfully:', note.id);

    res.json({
      success: true,
      data: { note },
      message: 'Note updated successfully'
    });

  } catch (error) {
    console.error('💥 Update note error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update note'
    });
  }
};

const deleteNote = async (req, res) => {
  try {
    const { projectId, noteId } = req.params;
    const userId = req.user.id;

    console.log('🗑️ Deleting note for solo project:', projectId);

    // Verify access
    const accessCheck = await verifySoloProjectAccess(projectId, userId);
    if (!accessCheck.success) {
      return res.status(accessCheck.statusCode || 404).json({
        success: false,
        message: accessCheck.message
      });
    }

    // Validate note belongs to project and get note data
    const { data: existingNote, error: checkError } = await supabase
      .from('solo_project_notes')
      .select('id, title')
      .eq('id', noteId)
      .eq('project_id', projectId)
      .single();

    if (checkError || !existingNote) {
      return res.status(404).json({
        success: false,
        message: 'Note not found'
      });
    }

    // Delete note
    const { error: deleteError } = await supabase
      .from('solo_project_notes')
      .delete()
      .eq('id', noteId);

    if (deleteError) {
      console.error('Error deleting note:', deleteError);
      return res.status(500).json({
        success: false,
        message: 'Failed to delete note'
      });
    }

    console.log('✅ Note deleted successfully:', existingNote.title);

    res.json({
      success: true,
      message: `Note "${existingNote.title}" deleted successfully`
    });

  } catch (error) {
    console.error('💥 Delete note error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete note'
    });
  }
};

// ===== TIME TRACKING CONTROLLERS =====

const getTimeTracking = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { date_from, date_to } = req.query;
    const userId = req.user.id;

    console.log('⏱️ Getting time tracking for solo project:', projectId);

    // Verify access
    const accessCheck = await verifySoloProjectAccess(projectId, userId);
    if (!accessCheck.success) {
      return res.status(accessCheck.statusCode || 404).json({
        success: false,
        message: accessCheck.message
      });
    }

    // Build query for time entries
    let query = supabase
      .from('solo_project_time_tracking')
      .select('*')
      .eq('project_id', projectId)
      .order('logged_at', { ascending: false });

    if (date_from) query = query.gte('logged_at', date_from);
    if (date_to) query = query.lte('logged_at', date_to);

    const { data: timeEntries, error: timeError } = await query;

    if (timeError) {
      console.error('Error fetching time entries:', timeError);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch time tracking data'
      });
    }

    // Calculate summary statistics
    const entries = timeEntries || [];
    const totalMinutes = entries.reduce((sum, entry) => sum + (entry.duration_minutes || 0), 0);
    const totalHours = Math.round((totalMinutes / 60) * 100) / 100;

    // Group by activity type
    const byActivityType = entries.reduce((acc, entry) => {
      const type = entry.activity_type || 'coding';
      if (!acc[type]) acc[type] = 0;
      acc[type] += entry.duration_minutes || 0;
      return acc;
    }, {});

    console.log('✅ Time tracking data retrieved successfully');

    res.json({
      success: true,
      data: {
        entries,
        summary: {
          totalMinutes,
          totalHours,
          entriesCount: entries.length,
          byActivityType
        }
      }
    });

  } catch (error) {
    console.error('💥 Get time tracking error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch time tracking data'
    });
  }
};

const logTimeEntry = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { description, duration_minutes, activity_type } = req.body;
    const userId = req.user.id;

    console.log('⏱️ Logging time entry for solo project:', projectId);

    // Verify access
    const accessCheck = await verifySoloProjectAccess(projectId, userId);
    if (!accessCheck.success) {
      return res.status(accessCheck.statusCode || 404).json({
        success: false,
        message: accessCheck.message
      });
    }

    // Log time entry
    const { data: timeEntry, error: timeError } = await supabase
      .from('solo_project_time_tracking')
      .insert({
        project_id: projectId,
        description,
        duration_minutes: parseInt(duration_minutes),
        activity_type
      })
      .select()
      .single();

    if (timeError) {
      console.error('Error logging time entry:', timeError);
      return res.status(500).json({
        success: false,
        message: 'Failed to log time entry'
      });
    }

    console.log('✅ Time entry logged successfully:', timeEntry.id);

    res.json({
      success: true,
      data: { timeEntry },
      message: 'Time entry logged successfully'
    });

  } catch (error) {
    console.error('💥 Log time entry error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to log time entry'
    });
  }
};

// ===== PROJECT INFO CONTROLLERS =====

const getProjectInfo = async (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.user.id;

    console.log('📋 Getting project info for solo project:', projectId);

    // Verify access
    const accessCheck = await verifySoloProjectAccess(projectId, userId);
    if (!accessCheck.success) {
      return res.status(accessCheck.statusCode || 404).json({
        success: false,
        message: accessCheck.message
      });
    }

    // FIXED: Fetch complete project information with programming languages and topics
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select(`
        *,
        users!owner_id (
          id,
          username,
          full_name,
          email,
          avatar_url
        )
      `)
      .eq('id', projectId)
      .single();

    if (projectError) {
      console.error('Error fetching project info:', projectError);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch project information'
      });
    }

    // FIXED: Fetch project languages separately
    const { data: projectLanguages, error: languagesError } = await supabase
      .from('project_languages')
      .select(`
        id,
        is_primary,
        required_level,
        programming_languages (
          id,
          name,
          description
        )
      `)
      .eq('project_id', projectId);

    if (languagesError) {
      console.error('Error fetching project languages:', languagesError);
    }

    // FIXED: Fetch project topics separately  
    const { data: projectTopics, error: topicsError } = await supabase
      .from('project_topics')
      .select(`
        id,
        is_primary,
        topics (
          id,
          name,
          description
        )
      `)
      .eq('project_id', projectId);

    if (topicsError) {
      console.error('Error fetching project topics:', topicsError);
    }

    // FIXED: Add programming languages and topics to project data
    project.programming_languages = projectLanguages || [];
    project.topics = projectTopics || [];

    // FIXED: Get the primary programming language
    const primaryLanguage = projectLanguages?.find(pl => pl.is_primary);
    if (primaryLanguage) {
      project.programming_language_id = primaryLanguage.programming_languages.id;
      project.programming_language = primaryLanguage.programming_languages;
    } else if (projectLanguages?.length > 0) {
      project.programming_language_id = projectLanguages[0].programming_languages.id;
      project.programming_language = projectLanguages[0].programming_languages;
    }

    console.log('✅ Project info retrieved successfully');

    res.json({
      success: true,
      data: { project }
    });

  } catch (error) {
    console.error('💥 Get project info error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch project information'
    });
  }
};

const updateProjectInfo = async (req, res) => {
  try {
    const { projectId } = req.params;
    const updateData = req.body;
    const userId = req.user.id;

    console.log('✏️ Updating project info for solo project:', projectId);

    // Verify access
    const accessCheck = await verifySoloProjectAccess(projectId, userId);
    if (!accessCheck.success) {
      return res.status(accessCheck.statusCode || 404).json({
        success: false,
        message: accessCheck.message
      });
    }

    // Update project
    const { data: project, error: updateError } = await supabase
      .from('projects')
      .update({
        ...updateData,
        updated_at: new Date().toISOString()
      })
      .eq('id', projectId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating project info:', updateError);
      return res.status(500).json({
        success: false,
        message: 'Failed to update project information'
      });
    }

    console.log('✅ Project info updated successfully');

    res.json({
      success: true,
      data: { project },
      message: 'Project information updated successfully'
    });

  } catch (error) {
    console.error('💥 Update project info error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update project information'
    });
  }
};

const getTimelinePost = async (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.user.id;

    console.log('📰 Getting timeline post for project:', projectId);
    console.log('📰 User ID:', userId);

    const accessCheck = await verifySoloProjectAccess(projectId, userId);
    if (!accessCheck.success) {
      return res.status(accessCheck.statusCode || 404).json({
        success: false,
        message: accessCheck.message
      });
    }

    // ✅ FIX: Query for ANY timeline post matching this project_id and user_id
    // Don't filter by post_type since both 'solo_completion' and 'solo_project_start' are valid
    const { data: timelinePost, error } = await supabase
      .from('timeline_posts')
      .select('*')
      .eq('project_id', projectId)
      .eq('user_id', userId)
      .order('created_at', { ascending: false }) // ✅ Get the most recent one
      .limit(1)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching timeline post:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch timeline post'
      });
    }

    console.log('📊 Timeline post found:', timelinePost ? 'YES' : 'NO');
    if (timelinePost) {
      console.log('   Post type:', timelinePost.post_type);
      console.log('   Post ID:', timelinePost.id);
      console.log('   Completion:', timelinePost.completion_percentage + '%');
    }

    res.json({
      success: true,
      data: {
        isPublished: !!timelinePost,
        timelinePost: timelinePost || null
      }
    });

  } catch (error) {
    console.error('💥 Get timeline post error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch timeline post'
    });
  }
};

const publishToTimeline = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { custom_description } = req.body;
    const userId = req.user.id;

    console.log('📤 Publishing project to timeline:', projectId);

    const accessCheck = await verifySoloProjectAccess(projectId, userId);
    if (!accessCheck.success) {
      return res.status(accessCheck.statusCode || 404).json({
        success: false,
        message: accessCheck.message
      });
    }

    // ✅ FIX: Check if ANY post exists (not using maybeSingle)
    const { data: existingPosts } = await supabase
      .from('timeline_posts')
      .select('id')
      .eq('project_id', projectId)
      .eq('user_id', userId)
      .limit(1);

    if (existingPosts && existingPosts.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Project is already published to timeline'
      });
    }

    // Use the helper function to create timeline post
    const { createTimelinePostFromProject } = require('../utils/timelinePostHelper');
    const timelinePost = await createTimelinePostFromProject(projectId, userId, 'solo');

    if (!timelinePost) {
      console.error('Failed to create timeline post');
      return res.status(500).json({
        success: false,
        message: 'Failed to publish to timeline'
      });
    }

    // Update description if custom description provided
    if (custom_description) {
      const { data: updatedPost, error: updateError } = await supabase
        .from('timeline_posts')
        .update({ description: custom_description })
        .eq('id', timelinePost.id)
        .select()
        .single();

      if (updateError) {
        console.warn('Could not update custom description:', updateError);
      } else {
        return res.status(201).json({
          success: true,
          data: { timelinePost: updatedPost },
          message: 'Project published to timeline successfully'
        });
      }
    }

    res.status(201).json({
      success: true,
      data: { timelinePost },
      message: 'Project published to timeline successfully'
    });

  } catch (error) {
    console.error('💥 Publish to timeline error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to publish to timeline'
    });
  }
};

const updateTimelinePost = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { description, visibility } = req.body;
    const userId = req.user.id;

    console.log('✏️ Updating timeline post for project:', projectId);

    const accessCheck = await verifySoloProjectAccess(projectId, userId);
    if (!accessCheck.success) {
      return res.status(accessCheck.statusCode || 404).json({
        success: false,
        message: accessCheck.message
      });
    }

    const updateData = {
      updated_at: new Date().toISOString()
    };

    if (github_url !== undefined) updateData.github_repo_url = github_url;
    if (live_demo_url !== undefined) updateData.live_demo_url = live_demo_url;
    if (description !== undefined) updateData.description = description;
    if (visibility !== undefined) updateData.visibility = visibility;

    const { data: timelinePost, error } = await supabase
      .from('timeline_posts')
      .update(updateData)
      .eq('project_id', projectId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating timeline post:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to update timeline post'
      });
    }

    if (!timelinePost) {
      return res.status(404).json({
        success: false,
        message: 'Timeline post not found'
      });
    }

    res.json({
      success: true,
      data: { timelinePost },
      message: 'Timeline post updated successfully'
    });

  } catch (error) {
    console.error('💥 Update timeline post error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update timeline post'
    });
  }
};

const deleteTimelinePost = async (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.user.id;

    console.log('🗑️ Deleting timeline post for project:', projectId);

    const accessCheck = await verifySoloProjectAccess(projectId, userId);
    if (!accessCheck.success) {
      return res.status(accessCheck.statusCode || 404).json({
        success: false,
        message: accessCheck.message
      });
    }

    const { error } = await supabase
      .from('timeline_posts')
      .delete()
      .eq('project_id', projectId)
      .eq('user_id', userId);

    if (error) {
      console.error('Error deleting timeline post:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to delete timeline post'
      });
    }

    res.json({
      success: true,
      message: 'Timeline post deleted successfully'
    });

  } catch (error) {
    console.error('💥 Delete timeline post error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete timeline post'
    });
  }
};

module.exports = {
  // Dashboard
  getDashboardData,
  getRecentActivity,
  logActivity,
  
  // Goals
  getGoals,
  createGoal,
  updateGoal,
  deleteGoal,
  
  // Notes
  getNotes,
  getNote,
  createNote,
  updateNote,
  deleteNote,
  
  // Time Tracking
  getTimeTracking,
  logTimeEntry,
  
  // Project Info
  getProjectInfo,
  updateProjectInfo,
  checkAndAwardProgress,
  checkProjectCompletionInternal,
  checkWeeklyChallengeInternal,

  getTimelinePost,
  publishToTimeline,
  updateTimelinePost,
  deleteTimelinePost,
};