// backend/utils/timelinePostHelper.js
const supabase = require('../config/supabase');

/**
 * Create a timeline post when a project is completed
 * This should be called from project completion endpoints
 */
const createTimelinePostFromProject = async (projectId, userId, projectType = 'group') => {
  try {
    console.log('📝 Creating timeline post for completed project:', projectId);

    // Get project details
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select(`
        id,
        title,
        description,
        status,
        owner_id,
        maximum_members,
        created_at,
        updated_at
      `)
      .eq('id', projectId)
      .single();

    if (projectError || !project) {
      console.error('Project not found for timeline post creation:', projectError);
      return null;
    }

    // Calculate project duration
    const startDate = new Date(project.created_at);
    const endDate = new Date();
    const durationDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));

    // Get tech stack from project_languages
    const { data: projectLanguages } = await supabase
      .from('project_languages')
      .select(`
        programming_languages (
          name
        )
      `)
      .eq('project_id', projectId);

    const techStack = projectLanguages?.map(pl => pl.programming_languages.name) || [];

    // Count team members for group projects
    let teamSize = 1;
    if (project.maximum_members > 1) {
      const { count } = await supabase
        .from('project_members')
        .select('id', { count: 'exact', head: true })
        .eq('project_id', projectId)
        .eq('status', 'active');

      teamSize = (count || 0) + 1; // +1 for owner
    }

    // Get task completion stats
    const { data: tasks } = await supabase
      .from('project_tasks')
      .select('id, status')
      .eq('project_id', projectId);

    const totalTasks = tasks?.length || 0;
    const completedTasks = tasks?.filter(t => t.status === 'completed').length || 0;
    const completionPercentage = totalTasks > 0 
      ? ((completedTasks / totalTasks) * 100).toFixed(2) 
      : 0;

    // Determine post type based on project type
    const postType = projectType === 'solo' ? 'solo_completion' : 'group_completion';

    // Create timeline post
    const { data: post, error: postError } = await supabase
      .from('timeline_posts')
      .insert({
        project_id: projectId,
        user_id: userId,
        post_type: postType,
        title: `🎉 Completed: ${project.title}`,
        description: project.description,
        project_title: project.title,
        project_type: projectType,
        tech_stack: techStack,
        total_tasks: totalTasks,
        completed_tasks: completedTasks,
        completion_percentage: parseFloat(completionPercentage),
        duration_days: durationDays,
        team_size: teamSize,
        visibility: 'public'
      })
      .select()
      .single();

    if (postError) {
      console.error('Error creating timeline post:', postError);
      return null;
    }

    console.log('✅ Timeline post created successfully:', post.id);
    return post;

  } catch (error) {
    console.error('Error in createTimelinePostFromProject:', error);
    return null;
  }
};

/**
 * Create timeline posts for all team members in a group project
 */
const createTimelinePostsForTeam = async (projectId) => {
  try {
    console.log('👥 Creating timeline posts for all team members:', projectId);

    // Get project owner
    const { data: project } = await supabase
      .from('projects')
      .select('owner_id, maximum_members')
      .eq('id', projectId)
      .single();

    if (!project) {
      return;
    }

    const projectType = project.maximum_members === 1 ? 'solo' : 'group';

    // Create post for owner
    await createTimelinePostFromProject(projectId, project.owner_id, projectType);

    // Create posts for all active team members if it's a group project
    if (project.maximum_members > 1) {
      const { data: members } = await supabase
        .from('project_members')
        .select('user_id')
        .eq('project_id', projectId)
        .eq('status', 'active');

      if (members && members.length > 0) {
        await Promise.all(
          members.map(member => 
            createTimelinePostFromProject(projectId, member.user_id, projectType)
          )
        );
      }
    }

    console.log('✅ Timeline posts created for all team members');

  } catch (error) {
    console.error('Error creating timeline posts for team:', error);
  }
};

/**
 * Update timeline post with additional information (like GitHub repo, live demo)
 */
const updateTimelinePost = async (projectId, userId, updates) => {
  try {
    const { data: post, error } = await supabase
      .from('timeline_posts')
      .update(updates)
      .eq('project_id', projectId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating timeline post:', error);
      return null;
    }

    return post;

  } catch (error) {
    console.error('Error in updateTimelinePost:', error);
    return null;
  }
};

/**
 * Delete timeline post(s) for a project
 */
const deleteTimelinePostsForProject = async (projectId) => {
  try {
    const { error } = await supabase
      .from('timeline_posts')
      .delete()
      .eq('project_id', projectId);

    if (error) {
      console.error('Error deleting timeline posts:', error);
      return false;
    }

    console.log('✅ Timeline posts deleted for project:', projectId);
    return true;

  } catch (error) {
    console.error('Error in deleteTimelinePostsForProject:', error);
    return false;
  }
};

module.exports = {
  createTimelinePostFromProject,
  createTimelinePostsForTeam,
  updateTimelinePost,
  deleteTimelinePostsForProject
};