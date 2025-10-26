// backend/controllers/projectMemberController.js - FULLY FIXED VERSION
const supabase = require('../config/supabase');

// Get all members of a project
const getProjectMembers = async (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.user.id;

    console.log('📋 Getting project members for project:', projectId);

    // Verify user has access to this project
    const { data: userAccess, error: accessError } = await supabase
      .from('project_members')
      .select('id')
      .eq('project_id', projectId)
      .eq('user_id', userId)
      .neq('status', 'removed')
      .single();

    // Also check if user is the project owner
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('owner_id')
      .eq('id', projectId)
      .single();

    if (projectError || !project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    if (!userAccess && project.owner_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You are not a member of this project.'
      });
    }

    // Get project owner details
    const { data: owner, error: ownerError } = await supabase
      .from('users')
      .select(`
        id,
        username,
        full_name,
        email,
        avatar_url,
        years_experience,
        github_username
      `)
      .eq('id', project.owner_id)
      .single();

    if (ownerError) {
      console.error('Error fetching project owner:', ownerError);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch project owner'
      });
    }

    // Get all active members with user details (excluding the owner)
    const { data: members, error } = await supabase
      .from('project_members')
      .select(`
        *,
        users:user_id (
          id,
          username,
          full_name,
          email,
          avatar_url,
          years_experience,
          github_username
        )
      `)
      .eq('project_id', projectId)
      .neq('status', 'removed')
      .neq('user_id', project.owner_id) // Exclude owner from members list
      .order('joined_at', { ascending: true });

    if (error) {
      console.error('Error fetching members:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch project members'
      });
    }

    console.log('✅ Found project owner:', owner?.full_name || owner?.username);
    console.log('✅ Found', members?.length || 0, 'additional members');

    // Return both owner and members in the expected structure
    res.json({
      success: true,
      data: {
        owner: owner,
        members: members || []
      }
    });

  } catch (error) {
    console.error('💥 Get project members error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Update a member's role
const updateMemberRole = async (req, res) => {
  try {
    const { projectId, memberId } = req.params;
    const { role } = req.body;
    const userId = req.user.id;

    console.log('🔄 Updating member role:', memberId, 'to role:', role);

    // Validate role
    const validRoles = ['member', 'moderator', 'lead'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role. Must be one of: member, moderator, lead'
      });
    }

    // Verify project exists
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('owner_id')
      .eq('id', projectId)
      .single();

    if (projectError || !project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Check permissions - only owner or leads can update roles
    const isOwner = project.owner_id === userId;
    let canUpdate = isOwner;

    if (!isOwner) {
      const { data: userMembership } = await supabase
        .from('project_members')
        .select('role')
        .eq('project_id', projectId)
        .eq('user_id', userId)
        .neq('status', 'removed')
        .single();

      canUpdate = userMembership?.role === 'lead';
    }

    if (!canUpdate) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only project owners or leads can update member roles.'
      });
    }

    // Verify target member exists and is not the owner
    const { data: targetMember, error: memberError } = await supabase
      .from('project_members')
      .select('user_id, status')
      .eq('id', memberId)
      .eq('project_id', projectId)
      .single();

    if (memberError || !targetMember) {
      return res.status(404).json({
        success: false,
        message: 'Member not found'
      });
    }

    if (targetMember.status === 'removed') {
      return res.status(400).json({
        success: false,
        message: 'Cannot update role of removed member'
      });
    }

    if (targetMember.user_id === project.owner_id) {
      return res.status(400).json({
        success: false,
        message: 'Cannot change the role of the project owner'
      });
    }

    // Update the member's role
    const { data: updatedMember, error: updateError } = await supabase
      .from('project_members')
      .update({ role })
      .eq('id', memberId)
      .eq('project_id', projectId)
      .select(`
        *,
        users:user_id (
          id,
          username,
          full_name,
          email,
          avatar_url,
          years_experience,
          github_username
        )
      `)
      .single();

    if (updateError) {
      console.error('Error updating member role:', updateError);
      return res.status(500).json({
        success: false,
        message: 'Failed to update member role'
      });
    }

    console.log('✅ Member role updated successfully');

    res.json({
      success: true,
      message: 'Member role updated successfully',
      data: { member: updatedMember }
    });

  } catch (error) {
    console.error('💥 Update member role error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Remove a member from a project
const removeMember = async (req, res) => {
  try {
    const { projectId, memberId } = req.params;
    const userId = req.user.id;

    console.log('🗑️ Removing member:', memberId, 'from project:', projectId);

    // Verify project exists
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('owner_id')
      .eq('id', projectId)
      .single();

    if (projectError || !project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Get member details
    const { data: member, error: memberError } = await supabase
      .from('project_members')
      .select('user_id, status')
      .eq('id', memberId)
      .eq('project_id', projectId)
      .single();

    if (memberError || !member) {
      return res.status(404).json({
        success: false,
        message: 'Member not found'
      });
    }

    if (member.status === 'removed') {
      return res.status(400).json({
        success: false,
        message: 'Member has already been removed'
      });
    }

    // Check permissions - owner can remove anyone, members can only remove themselves
    const isOwner = project.owner_id === userId;
    const isSelfRemoval = member.user_id === userId;

    if (!isOwner && !isSelfRemoval) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only remove yourself or be removed by the project owner.'
      });
    }

    // Cannot remove the project owner
    if (member.user_id === project.owner_id) {
      return res.status(400).json({
        success: false,
        message: 'Cannot remove the project owner'
      });
    }

    // Remove the member by updating status to 'removed'
    const { error: removeError } = await supabase
      .from('project_members')
      .update({ status: 'removed' })
      .eq('id', memberId)
      .eq('project_id', projectId);

    if (removeError) {
      console.error('Error removing member:', removeError);
      return res.status(500).json({
        success: false,
        message: 'Failed to remove member'
      });
    }

    // Update project current_members count
    const { data: currentMembers } = await supabase
      .from('project_members')
      .select('id')
      .eq('project_id', projectId)
      .neq('status', 'removed');

    const memberCount = (currentMembers?.length || 0) + 1; // +1 for owner

    await supabase
      .from('projects')
      .update({ current_members: memberCount })
      .eq('id', projectId);

    console.log('✅ Member removed successfully');

    res.json({
      success: true,
      message: 'Member removed successfully'
    });

  } catch (error) {
    console.error('💥 Remove member error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Leave a project (for current user)
const leaveProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.user.id;

    console.log('🚪 User leaving project:', projectId);

    // Verify project exists
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('owner_id')
      .eq('id', projectId)
      .single();

    if (projectError || !project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Project owner cannot leave their own project
    if (project.owner_id === userId) {
      return res.status(400).json({
        success: false,
        message: 'Project owners cannot leave their own project. You must transfer ownership or delete the project.'
      });
    }

    // Find user's membership
    const { data: membership, error: membershipError } = await supabase
      .from('project_members')
      .select('id, status')
      .eq('project_id', projectId)
      .eq('user_id', userId)
      .neq('status', 'removed')
      .single();

    if (membershipError || !membership) {
      return res.status(404).json({
        success: false,
        message: 'You are not a member of this project'
      });
    }

    // Update membership status to removed
    const { error: leaveError } = await supabase
      .from('project_members')
      .update({ status: 'removed' })
      .eq('id', membership.id);

    if (leaveError) {
      console.error('Error leaving project:', leaveError);
      return res.status(500).json({
        success: false,
        message: 'Failed to leave project'
      });
    }

    // Update project current_members count
    const { data: currentMembers } = await supabase
      .from('project_members')
      .select('id')
      .eq('project_id', projectId)
      .neq('status', 'removed');

    const memberCount = (currentMembers?.length || 0) + 1; // +1 for owner

    await supabase
      .from('projects')
      .update({ current_members: memberCount })
      .eq('id', projectId);

    console.log('✅ User left project successfully');

    res.json({
      success: true,
      message: 'Successfully left the project'
    });

  } catch (error) {
    console.error('💥 Leave project error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

module.exports = {
  getProjectMembers,
  updateMemberRole,
  removeMember,
  leaveProject
};