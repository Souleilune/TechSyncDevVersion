// backend/controllers/adminController.js
const supabase = require('../config/supabase');
const { logAdminActivity } = require('../middleware/adminAuth');

// Get admin dashboard stats
const getDashboardStats = async (req, res) => {
  try {
    const adminId = req.admin.id;

    // Get total counts for different resources
    const [
      { count: totalUsers },
      { count: totalProjects },
      { count: totalChallenges },
      { count: activeProjects },
      { count: suspendedUsers },
      { count: recentRegistrations }
    ] = await Promise.all([
      supabase.from('users').select('id', { count: 'exact', head: true }),
      supabase.from('projects').select('id', { count: 'exact', head: true }),
      supabase.from('coding_challenges').select('id', { count: 'exact', head: true }),
      supabase.from('projects').select('id', { count: 'exact', head: true }).eq('status', 'active'),
      supabase.from('users').select('id', { count: 'exact', head: true }).eq('is_suspended', true),
      supabase.from('users').select('id', { count: 'exact', head: true })
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
    ]);

    // Get recent activity
    const { data: recentActivity } = await supabase
      .from('admin_activity_logs')
      .select(`
        *,
        users!admin_id (username, full_name)
      `)
      .order('created_at', { ascending: false })
      .limit(10);

    // Log admin access
    await logAdminActivity(adminId, 'VIEW_DASHBOARD', 'system', null, {}, req);

    res.json({
      success: true,
      data: {
        stats: {
          totalUsers,
          totalProjects,
          totalChallenges,
          activeProjects,
          suspendedUsers,
          recentRegistrations
        },
        recentActivity: recentActivity || []
      }
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard stats'
    });
  }
};

// Get all users with filtering and pagination
const getUsers = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search,
      role,
      status,
      suspended
    } = req.query;

    const offset = (page - 1) * limit;

    let query = supabase
      .from('users')
      .select(`
        id, username, email, full_name, role, 
        is_active, is_suspended, years_experience,
        created_at, last_login_at, suspension_reason
      `)
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false });

    // Apply filters
    if (search) {
      query = query.or(`username.ilike.%${search}%,email.ilike.%${search}%,full_name.ilike.%${search}%`);
    }

    if (role) {
      query = query.eq('role', role);
    }

    if (status === 'active') {
      query = query.eq('is_active', true);
    } else if (status === 'inactive') {
      query = query.eq('is_active', false);
    }

    if (suspended === 'true') {
      query = query.eq('is_suspended', true);
    } else if (suspended === 'false') {
      query = query.eq('is_suspended', false);
    }

    const { data: users, error } = await query;

    if (error) {
      throw error;
    }

    // Log admin access
    await logAdminActivity(req.admin.id, 'VIEW_USERS', 'user', null, { filters: req.query }, req);

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: users.length
        }
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users'
    });
  }
};

// Update user status/role
const updateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role, is_active, is_suspended, suspension_reason, suspension_duration } = req.body;
    const adminId = req.admin.id;

    // Prevent admin from suspending themselves
    if (userId === adminId && (is_active === false || is_suspended === true)) {
      return res.status(400).json({
        success: false,
        message: 'You cannot suspend or deactivate your own account'
      });
    }

    const updateData = {};
    if (role !== undefined) updateData.role = role;
    if (is_active !== undefined) updateData.is_active = is_active;
    if (is_suspended !== undefined) {
      updateData.is_suspended = is_suspended;
      if (is_suspended && suspension_duration) {
        updateData.suspended_until = new Date(Date.now() + suspension_duration * 60 * 1000).toISOString();
      } else if (!is_suspended) {
        updateData.suspended_until = null;
        updateData.suspension_reason = null;
      }
    }
    if (suspension_reason) updateData.suspension_reason = suspension_reason;

    const { data: updatedUser, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', userId)
      .select('id, username, role, is_active, is_suspended')
      .single();

    if (error) {
      throw error;
    }

    // Log admin activity
    await logAdminActivity(adminId, 'UPDATE_USER', 'user', userId, updateData, req);

    res.json({
      success: true,
      message: 'User updated successfully',
      data: { user: updatedUser }
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user'
    });
  }
};

// Delete user permanently (Admin only)
const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const adminId = req.admin.id;

    // Prevent admin from deleting themselves
    if (userId === adminId) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete your own account'
      });
    }

    // First, get user details for validation and logging
    const { data: userToDelete, error: fetchError } = await supabase
      .from('users')
      .select('id, username, email, role, is_active')
      .eq('id', userId)
      .single();

    if (fetchError || !userToDelete) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prevent deletion of other admins (unless super admin feature is implemented)
    if (userToDelete.role === 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Cannot delete admin users'
      });
    }

    // Safety check: Only allow deletion of inactive users
    if (userToDelete.is_active) {
      return res.status(400).json({
        success: false,
        message: 'User must be deactivated before deletion. Please deactivate the user first.'
      });
    }

    console.log(`Admin ${adminId} attempting to delete user: ${userToDelete.username} (${userId})`);

    // Delete user-related data in the correct order to handle foreign key constraints
    
    // 1. Delete comment notifications
    await supabase
      .from('comment_notifications')
      .delete()
      .eq('user_id', userId);

    // 2. Delete task comments authored by user
    await supabase
      .from('task_comments')
      .delete()
      .eq('user_id', userId);

    // 3. Delete task submissions
    await supabase
      .from('task_submissions')
      .delete()
      .eq('user_id', userId);

    // 4. Delete task assignments
    await supabase
      .from('project_tasks')
      .delete()
      .eq('assigned_to', userId);

    // 5. Delete file permissions
    await supabase
      .from('file_permissions')
      .delete()
      .eq('user_id', userId);

    // 6. Delete project files uploaded by user
    await supabase
      .from('project_files')
      .delete()
      .eq('uploaded_by', userId);

    // 7. Delete chat messages
    await supabase
      .from('chat_messages')
      .delete()
      .eq('sender_id', userId);

    // 8. Delete learning recommendations
    await supabase
      .from('learning_recommendations')
      .delete()
      .eq('user_id', userId);

    // 9. Delete project recommendations
    await supabase
      .from('project_recommendations')
      .delete()
      .eq('user_id', userId);

    // 10. Delete recommendation feedback
    await supabase
      .from('recommendation_feedback')
      .delete()
      .eq('user_id', userId);

    // 11. Delete user activity
    await supabase
      .from('user_activity')
      .delete()
      .eq('user_id', userId);

    // 12. Delete notifications
    await supabase
      .from('notifications')
      .delete()
      .eq('user_id', userId);

    // 13. Delete project members
    await supabase
      .from('project_members')
      .delete()
      .eq('user_id', userId);

    // 14. Delete user programming languages
    await supabase
      .from('user_programming_languages')
      .delete()
      .eq('user_id', userId);

    // 15. Delete user topics
    await supabase
      .from('user_topics')
      .delete()
      .eq('user_id', userId);

    // 16. Delete challenge attempts
    await supabase
      .from('challenge_attempts')
      .delete()
      .eq('user_id', userId);

    // 17. Handle projects owned by the user
    // Option 1: Delete projects owned by user (if no other members)
    // Option 2: Transfer ownership to another admin (safer approach)
    const { data: ownedProjects } = await supabase
      .from('projects')
      .select(`
        id, title, description,
        project_members!inner(user_id, role)
      `)
      .eq('owner_id', userId);

    if (ownedProjects && ownedProjects.length > 0) {
      for (const project of ownedProjects) {
        // Check if project has other members who can take ownership
        const otherMembers = project.project_members.filter(member => 
          member.user_id !== userId && (member.role === 'admin' || member.role === 'moderator')
        );

        if (otherMembers.length > 0) {
          // Transfer ownership to first available admin/moderator
          await supabase
            .from('projects')
            .update({ owner_id: otherMembers[0].user_id })
            .eq('id', project.id);
        } else {
          // No suitable members to transfer to - mark project as orphaned or delete
          // For safety, we'll mark it as cancelled rather than delete
          await supabase
            .from('projects')
            .update({ 
              status: 'cancelled',
              owner_id: adminId, // Transfer to deleting admin
              description: (project.description || '') + '\n\n[Project ownership transferred due to user deletion]'
            })
            .eq('id', project.id);
        }
      }
    }

    // 18. Finally, delete the user account
    const { error: deleteError } = await supabase
      .from('users')
      .delete()
      .eq('id', userId);

    if (deleteError) {
      console.error('Error deleting user:', deleteError);
      return res.status(500).json({
        success: false,
        message: 'Failed to delete user account',
        error: deleteError.message
      });
    }

    // Log admin activity
    await logAdminActivity(
      adminId, 
      'DELETE_USER', 
      'user', 
      userId, 
      { 
        deletedUser: {
          username: userToDelete.username,
          email: userToDelete.email,
          role: userToDelete.role
        }
      }, 
      req
    );

    console.log(`✅ User ${userToDelete.username} (${userId}) successfully deleted by admin ${adminId}`);

    res.json({
      success: true,
      message: `User ${userToDelete.username} has been permanently deleted`
    });

  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete user',
      error: error.message
    });
  }
};

// Get all projects for admin management
const getProjects = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search,
      status,
      difficulty
    } = req.query;

    const offset = (page - 1) * limit;

    let query = supabase
      .from('projects')
      .select(`
        *,
        users:owner_id (id, username, full_name),
        project_members (id)
      `)
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false });

    // Apply filters
    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
    }

    if (status) {
      query = query.eq('status', status);
    }

    if (difficulty) {
      query = query.eq('difficulty', difficulty);
    }

    const { data: projects, error } = await query;

    if (error) {
      throw error;
    }

    // Log admin access
    await logAdminActivity(req.admin.id, 'VIEW_PROJECTS', 'project', null, { filters: req.query }, req);

    res.json({
      success: true,
      data: {
        projects,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: projects.length
        }
      }
    });
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch projects'
    });
  }
};

// Get all challenges for admin management
const getChallenges = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search,
      difficulty,
      language,
      is_active
    } = req.query;

    const offset = (page - 1) * limit;

    let query = supabase
      .from('coding_challenges')
      .select(`
        *,
        programming_languages (name),
        users:created_by (username, full_name),
        challenge_attempts (id)
      `)
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false });

    // Apply filters
    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
    }

    if (difficulty) {
      query = query.eq('difficulty', difficulty);
    }

    if (language) {
      query = query.eq('language_id', parseInt(language));
    }

    if (is_active === 'true') {
      query = query.eq('is_active', true);
    } else if (is_active === 'false') {
      query = query.eq('is_active', false);
    }

    const { data: challenges, error } = await query;

    if (error) {
      throw error;
    }

    // Log admin access
    await logAdminActivity(req.admin.id, 'VIEW_CHALLENGES', 'challenge', null, { filters: req.query }, req);

    res.json({
      success: true,
      data: {
        challenges,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: challenges.length
        }
      }
    });
  } catch (error) {
    console.error('Get challenges error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch challenges'
    });
  }
};

// Get system settings
const getSystemSettings = async (req, res) => {
  try {
    const { data: settings, error } = await supabase
      .from('system_settings')
      .select('*')
      .order('key');

    if (error) {
      throw error;
    }

    // Convert to key-value object
    const settingsObj = {};
    settings.forEach(setting => {
      settingsObj[setting.key] = setting.value;
    });

    // Log admin access
    await logAdminActivity(req.admin.id, 'VIEW_SETTINGS', 'system', null, {}, req);

    res.json({
      success: true,
      data: { settings: settingsObj }
    });
  } catch (error) {
    console.error('Get system settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch system settings'
    });
  }
};

// Update system settings
const updateSystemSettings = async (req, res) => {
  try {
    const { settings } = req.body;
    const adminId = req.admin.id;

    if (!settings || typeof settings !== 'object') {
      return res.status(400).json({
        success: false,
        message: 'Invalid settings data'
      });
    }

    // Update each setting
    const updates = Object.entries(settings).map(([key, value]) =>
      supabase
        .from('system_settings')
        .upsert({
          key,
          value: value.toString()
        })
    );

    await Promise.all(updates);

    // Log admin activity
    await logAdminActivity(adminId, 'UPDATE_SETTINGS', 'system', null, { settings }, req);

    res.json({
      success: true,
      message: 'Settings updated successfully'
    });
  } catch (error) {
    console.error('Update system settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update settings'
    });
  }
};

// Get admin activity logs
const getActivityLogs = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 50,
      admin_id,
      action,
      resource_type,
      date_from,
      date_to
    } = req.query;

    const offset = (page - 1) * limit;

    let query = supabase
      .from('admin_activity_logs')
      .select(`
        *,
        users!admin_id (username, full_name)
      `)
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false });

    // Apply filters
    if (admin_id) {
      query = query.eq('admin_id', admin_id);
    }

    if (action) {
      query = query.eq('action', action);
    }

    if (resource_type) {
      query = query.eq('resource_type', resource_type);
    }

    if (date_from) {
      query = query.gte('created_at', date_from);
    }

    if (date_to) {
      query = query.lte('created_at', date_to);
    }

    const { data: logs, error } = await query;

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      data: {
        logs,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: logs.length
        }
      }
    });
  } catch (error) {
    console.error('Get activity logs error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch activity logs'
    });
  }
};

module.exports = {
  getDashboardStats,
  getUsers,
  updateUser,
  deleteUser,
  getProjects,
  getChallenges,
  getSystemSettings,
  updateSystemSettings,
  getActivityLogs
};