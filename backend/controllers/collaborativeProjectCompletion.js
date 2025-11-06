// backend/controllers/collaborativeProjectCompletion.js
const supabase = require('../config/supabase');

// ===== HELPER FUNCTIONS =====

/**
 * Calculate project completion percentage based on tasks
 */
const calculateProjectCompletion = async (projectId) => {
  try {
    const { data: tasks, error } = await supabase
      .from('project_tasks')
      .select('status')
      .eq('project_id', projectId);

    if (error) throw error;

    const totalTasks = tasks?.length || 0;
    if (totalTasks === 0) return 0;

    const completedTasks = tasks.filter(t => t.status === 'completed').length;
    return Math.round((completedTasks / totalTasks) * 100);
  } catch (error) {
    console.error('Error calculating project completion:', error);
    return 0;
  }
};

/**
 * Check if user has permission to complete project
 * Only owner or leads can mark as complete
 */
const canCompleteProject = async (projectId, userId) => {
  try {
    // Check if user is owner
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('owner_id')
      .eq('id', projectId)
      .single();

    if (projectError) throw projectError;
    
    if (project.owner_id === userId) return true;

    // Check if user is a lead
    const { data: member, error: memberError } = await supabase
      .from('project_members')
      .select('role')
      .eq('project_id', projectId)
      .eq('user_id', userId)
      .eq('status', 'active')
      .single();

    if (memberError) return false;
    
    return member.role === 'lead';
  } catch (error) {
    console.error('Error checking completion permission:', error);
    return false;
  }
};

/**
 * Award achievements to all active project members
 */
const awardProjectCompletionAchievements = async (projectId) => {
  try {
    console.log('🏆 Awarding project completion achievements for project:', projectId);

    // Get project details
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('title, created_at, difficulty_level')
      .eq('id', projectId)
      .single();

    if (projectError) {
      console.error('Error fetching project details:', projectError);
      return;
    }

    // Get all active members (including owner)
    const { data: members, error: membersError } = await supabase
      .from('project_members')
      .select('user_id, role')
      .eq('project_id', projectId)
      .eq('status', 'active');

    if (membersError) {
      console.error('Error fetching project members:', membersError);
      return;
    }

    // Add project owner to members list
    const { data: projectWithOwner, error: ownerError } = await supabase
      .from('projects')
      .select('owner_id')
      .eq('id', projectId)
      .single();

    if (!ownerError && projectWithOwner) {
      // Check if owner is already in members list
      const ownerExists = members.some(m => m.user_id === projectWithOwner.owner_id);
      if (!ownerExists) {
        members.push({ user_id: projectWithOwner.owner_id, role: 'owner' });
      }
    }

    if (!members || members.length === 0) {
      console.log('No members to award');
      return;
    }

    // Calculate project duration
    const projectDuration = Math.ceil(
      (new Date() - new Date(project.created_at)) / (1000 * 60 * 60 * 24)
    );

    // Create awards for each member
    const awardsToCreate = [];

    for (const member of members) {
      // Check if member already has this award
      const { data: existingAward } = await supabase
        .from('user_awards')
        .select('id')
        .eq('user_id', member.user_id)
        .eq('project_id', projectId)
        .eq('award_type', 'project_completion')
        .single();

      if (existingAward) {
        console.log(`User ${member.user_id} already has completion award for this project`);
        continue;
      }

      // Base completion award
      awardsToCreate.push({
        user_id: member.user_id,
        project_id: projectId,
        award_type: 'project_completion',
        award_title: '🏆 Team Achievement',
        award_description: `Completed collaborative project: ${project.title}`,
        award_icon: 'trophy',
        award_color: '#FFD700',
        metadata: {
          project_title: project.title,
          role: member.role,
          completion_date: new Date().toISOString(),
          team_size: members.length,
          difficulty: project.difficulty_level
        }
      });

      // Speed bonus award (completed in under 30 days)
      if (projectDuration <= 30) {
        const { data: speedAward } = await supabase
          .from('user_awards')
          .select('id')
          .eq('user_id', member.user_id)
          .eq('project_id', projectId)
          .eq('award_type', 'speed_demon')
          .single();

        if (!speedAward) {
          awardsToCreate.push({
            user_id: member.user_id,
            project_id: projectId,
            award_type: 'speed_demon',
            award_title: '⚡ Speed Demon',
            award_description: `Completed project in just ${projectDuration} days!`,
            award_icon: 'zap',
            award_color: '#EF4444',
            metadata: {
              project_title: project.title,
              completion_days: projectDuration,
              difficulty: project.difficulty_level
            }
          });
        }
      }

      // Leadership award for owner and leads
      if (member.role === 'owner' || member.role === 'lead') {
        const { data: leaderAward } = await supabase
          .from('user_awards')
          .select('id')
          .eq('user_id', member.user_id)
          .eq('project_id', projectId)
          .eq('award_type', 'dedication')
          .single();

        if (!leaderAward) {
          awardsToCreate.push({
            user_id: member.user_id,
            project_id: projectId,
            award_type: 'dedication',
            award_title: '👑 Team Leader',
            award_description: `Led the team to successfully complete: ${project.title}`,
            award_icon: 'crown',
            award_color: '#F59E0B',
            metadata: {
              project_title: project.title,
              role: member.role,
              team_size: members.length
            }
          });
        }
      }
    }

    // Insert all awards
    if (awardsToCreate.length > 0) {
      const { error: insertError } = await supabase
        .from('user_awards')
        .insert(awardsToCreate);

      if (insertError) {
        console.error('Error inserting awards:', insertError);
      } else {
        console.log(`✅ Successfully created ${awardsToCreate.length} awards!`);
      }
    }

    return awardsToCreate.length;
  } catch (error) {
    console.error('Error awarding achievements:', error);
    return 0;
  }
};

/**
 * Create notifications for all team members
 */
const notifyTeamMembers = async (projectId, title, message, type = 'project_completed') => {
  try {
    // Get all active members
    const { data: members, error: membersError } = await supabase
      .from('project_members')
      .select('user_id')
      .eq('project_id', projectId)
      .eq('status', 'active');

    if (membersError || !members) return;

    // Get project owner
    const { data: project } = await supabase
      .from('projects')
      .select('owner_id')
      .eq('id', projectId)
      .single();

    const userIds = new Set(members.map(m => m.user_id));
    if (project) userIds.add(project.owner_id);

    // Create notifications
    const notifications = Array.from(userIds).map(userId => ({
      user_id: userId,
      project_id: projectId,
      notification_type: type,
      title: title,
      message: message,
      created_at: new Date().toISOString()
    }));

    await supabase.from('notifications').insert(notifications);
  } catch (error) {
    console.error('Error notifying team members:', error);
  }
};

// ===== MAIN CONTROLLERS =====

/**
 * GET /api/projects/:projectId/completion-status
 * Get project completion status and eligibility
 */
const getCompletionStatus = async (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.user.id;

    // Verify project exists
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('id, title, status, owner_id, maximum_members, created_at')
      .eq('id', projectId)
      .single();

    if (projectError || !project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Check if it's a solo project
    if (project.maximum_members === 1) {
      return res.status(400).json({
        success: false,
        message: 'This endpoint is for collaborative projects only'
      });
    }

    // Calculate completion percentage
    const completionPercentage = await calculateProjectCompletion(projectId);

    // Check if user can complete project
    const canComplete = await canCompleteProject(projectId, userId);

    // Get voting status if exists
    const { data: votes, error: votesError } = await supabase
      .from('project_completion_votes')
      .select('*')
      .eq('project_id', projectId);

    const voteStatus = {
      total_votes: votes?.length || 0,
      votes_for: votes?.filter(v => v.vote === 'approve').length || 0,
      votes_against: votes?.filter(v => v.vote === 'reject').length || 0,
      user_voted: votes?.some(v => v.user_id === userId) || false,
      user_vote: votes?.find(v => v.user_id === userId)?.vote || null
    };

    // Get total active members for voting threshold
    const { data: members } = await supabase
      .from('project_members')
      .select('user_id')
      .eq('project_id', projectId)
      .eq('status', 'active');

    const totalMembers = (members?.length || 0) + 1; // +1 for owner
    const votingThreshold = Math.ceil(totalMembers * 0.6); // 60% approval needed

    res.json({
      success: true,
      data: {
        project_id: projectId,
        project_title: project.title,
        current_status: project.status,
        completion_percentage: completionPercentage,
        is_eligible_for_completion: completionPercentage >= 80,
        can_mark_complete: canComplete,
        voting: {
          ...voteStatus,
          total_members: totalMembers,
          votes_needed: votingThreshold,
          voting_active: voteStatus.total_votes > 0,
          can_approve: voteStatus.votes_for >= votingThreshold
        }
      }
    });
  } catch (error) {
    console.error('Error getting completion status:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

/**
 * POST /api/projects/:projectId/complete
 * Mark project as complete (owner/lead only)
 */
const markProjectComplete = async (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.user.id;
    const { skip_validation } = req.body; // Optional: skip completion percentage check

    console.log('🎯 Marking project as complete:', projectId);
    await supabase
      .from('projects')
      .update({ status: 'completed' })
      .eq('id', projectId);

    // ⬇️ CREATE TIMELINE POSTS FOR ALL TEAM MEMBERS
    await createTimelinePostsForTeam(projectId);


    // Verify project exists and not already completed
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('id, title, status, owner_id, maximum_members')
      .eq('id', projectId)
      .single();

    if (projectError || !project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Check if it's a solo project
    if (project.maximum_members === 1) {
      return res.status(400).json({
        success: false,
        message: 'Use solo project completion endpoint for solo projects'
      });
    }

    if (project.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Project is already completed'
      });
    }

    // Check permissions
    const hasPermission = await canCompleteProject(projectId, userId);
    if (!hasPermission) {
      return res.status(403).json({
        success: false,
        message: 'Only project owners or leads can mark projects as complete'
      });
    }

    // Check completion percentage unless skipped
    if (!skip_validation) {
      const completionPercentage = await calculateProjectCompletion(projectId);
      if (completionPercentage < 80) {
        return res.status(400).json({
          success: false,
          message: `Project must be at least 80% complete. Current: ${completionPercentage}%`,
          completion_percentage: completionPercentage
        });
      }
    }

    // Update project status
    const { error: updateError } = await supabase
      .from('projects')
      .update({
        status: 'completed',
        updated_at: new Date().toISOString()
      })
      .eq('id', projectId);

    if (updateError) {
      console.error('Error updating project status:', updateError);
      return res.status(500).json({
        success: false,
        message: 'Failed to mark project as complete'
      });
    }

    // Award achievements to all team members
    const awardsCreated = await awardProjectCompletionAchievements(projectId);

    // Notify all team members
    await notifyTeamMembers(
      projectId,
      '🎉 Project Completed!',
      `Congratulations! The project "${project.title}" has been marked as complete.`,
      'project_completed'
    );

    console.log('✅ Project marked as complete successfully');

    res.json({
      success: true,
      message: 'Project marked as complete successfully!',
      data: {
        project_id: projectId,
        status: 'completed',
        awards_created: awardsCreated
      }
    });
  } catch (error) {
    console.error('Error marking project complete:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

/**
 * POST /api/projects/:projectId/check-auto-complete
 * Check if project should auto-complete and do so if eligible
 */
const checkAutoComplete = async (req, res) => {
  try {
    const { projectId } = req.params;

    console.log('🤖 Checking auto-complete for project:', projectId);

    // Verify project exists
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('id, title, status, maximum_members')
      .eq('id', projectId)
      .single();

    if (projectError || !project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Skip if already completed
    if (project.status === 'completed') {
      return res.json({
        success: true,
        auto_completed: false,
        message: 'Project already completed'
      });
    }

    // Skip if solo project
    if (project.maximum_members === 1) {
      return res.json({
        success: true,
        auto_completed: false,
        message: 'Solo projects have their own completion logic'
      });
    }

    // Calculate completion
    const completionPercentage = await calculateProjectCompletion(projectId);

    // Auto-complete if 100% done
    if (completionPercentage >= 100) {
      // Update project status
      const { error: updateError } = await supabase
        .from('projects')
        .update({
          status: 'completed',
          updated_at: new Date().toISOString()
        })
        .eq('id', projectId);

      if (updateError) {
        throw updateError;
      }

      // Award achievements
      const awardsCreated = await awardProjectCompletionAchievements(projectId);

      // Notify team
      await notifyTeamMembers(
        projectId,
        '🎉 Project Auto-Completed!',
        `Great work! All tasks are complete. The project "${project.title}" has been automatically marked as completed.`,
        'project_completed'
      );

      console.log('✅ Project auto-completed successfully');

      return res.json({
        success: true,
        auto_completed: true,
        message: 'Project automatically completed!',
        data: {
          project_id: projectId,
          completion_percentage: 100,
          awards_created: awardsCreated
        }
      });
    }

    res.json({
      success: true,
      auto_completed: false,
      message: 'Project not yet eligible for auto-completion',
      data: {
        completion_percentage: completionPercentage,
        required_percentage: 100
      }
    });
  } catch (error) {
    console.error('Error checking auto-complete:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

/**
 * POST /api/projects/:projectId/completion-vote
 * Vote on project completion (all members can vote)
 */
const voteOnCompletion = async (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.user.id;
    const { vote } = req.body; // 'approve' or 'reject'

    console.log('🗳️ User voting on project completion:', { projectId, userId, vote });

    // Validate vote
    if (!['approve', 'reject'].includes(vote)) {
      return res.status(400).json({
        success: false,
        message: 'Vote must be either "approve" or "reject"'
      });
    }

    // Verify project exists
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('id, title, status, owner_id, maximum_members')
      .eq('id', projectId)
      .single();

    if (projectError || !project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Check if user is a member or owner
    const isOwner = project.owner_id === userId;
    const { data: member } = await supabase
      .from('project_members')
      .select('status')
      .eq('project_id', projectId)
      .eq('user_id', userId)
      .eq('status', 'active')
      .single();

    if (!isOwner && !member) {
      return res.status(403).json({
        success: false,
        message: 'Only project members can vote'
      });
    }

    // Check if user already voted
    const { data: existingVote } = await supabase
      .from('project_completion_votes')
      .select('id')
      .eq('project_id', projectId)
      .eq('user_id', userId)
      .single();

    if (existingVote) {
      // Update existing vote
      const { error: updateError } = await supabase
        .from('project_completion_votes')
        .update({
          vote: vote,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingVote.id);

      if (updateError) {
        throw updateError;
      }

      console.log('✅ Vote updated');
    } else {
      // Create new vote
      const { error: insertError } = await supabase
        .from('project_completion_votes')
        .insert({
          project_id: projectId,
          user_id: userId,
          vote: vote
        });

      if (insertError) {
        throw insertError;
      }

      console.log('✅ Vote recorded');
    }

    // Get updated vote counts
    const { data: allVotes } = await supabase
      .from('project_completion_votes')
      .select('vote')
      .eq('project_id', projectId);

    const votesFor = allVotes?.filter(v => v.vote === 'approve').length || 0;
    const votesAgainst = allVotes?.filter(v => v.vote === 'reject').length || 0;

    // Get total members
    const { data: members } = await supabase
      .from('project_members')
      .select('user_id')
      .eq('project_id', projectId)
      .eq('status', 'active');

    const totalMembers = (members?.length || 0) + 1; // +1 for owner
    const votingThreshold = Math.ceil(totalMembers * 0.6); // 60% approval

    // Check if voting passed
    let autoCompleted = false;
    if (votesFor >= votingThreshold && project.status !== 'completed') {
      // Auto-complete the project
      const { error: completeError } = await supabase
        .from('projects')
        .update({
          status: 'completed',
          updated_at: new Date().toISOString()
        })
        .eq('id', projectId);

      if (!completeError) {
        autoCompleted = true;
        await awardProjectCompletionAchievements(projectId);
        await notifyTeamMembers(
          projectId,
          '🎉 Project Completed by Team Vote!',
          `The team has voted to complete "${project.title}". Congratulations!`,
          'project_completed'
        );
        console.log('✅ Project auto-completed after reaching voting threshold');
      }
    }

    res.json({
      success: true,
      message: autoCompleted ? 'Vote recorded and project completed!' : 'Vote recorded successfully',
      data: {
        vote: vote,
        total_votes: allVotes?.length || 0,
        votes_for: votesFor,
        votes_against: votesAgainst,
        total_members: totalMembers,
        votes_needed: votingThreshold,
        voting_passed: votesFor >= votingThreshold,
        auto_completed: autoCompleted
      }
    });
  } catch (error) {
    console.error('Error recording vote:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

/**
 * GET /api/projects/:projectId/completion-votes
 * Get all votes for project completion
 */
const getCompletionVotes = async (req, res) => {
  try {
    const { projectId } = req.params;

    const { data: votes, error } = await supabase
      .from('project_completion_votes')
      .select(`
        *,
        users:user_id (
          id,
          username,
          full_name,
          avatar_url
        )
      `)
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json({
      success: true,
      data: {
        votes: votes || [],
        total: votes?.length || 0,
        votes_for: votes?.filter(v => v.vote === 'approve').length || 0,
        votes_against: votes?.filter(v => v.vote === 'reject').length || 0
      }
    });
  } catch (error) {
    console.error('Error fetching votes:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

module.exports = {
  getCompletionStatus,
  markProjectComplete,
  checkAutoComplete,
  voteOnCompletion,
  getCompletionVotes,
  // Export helper functions for use in other controllers
  calculateProjectCompletion,
  awardProjectCompletionAchievements
};