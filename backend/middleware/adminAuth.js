// backend/middleware/adminAuth.js
const supabase = require('../config/supabase');

// Middleware to check if user is admin
const requireAdmin = async (req, res, next) => {
  try {
    // First check if user is authenticated
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // Get user details with role
    const { data: user, error } = await supabase
      .from('users')
      .select('id, role, is_active, is_suspended')
      .eq('id', req.user.id)
      .single();

    if (error || !user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if user is active and not suspended
    if (!user.is_active || user.is_suspended) {
      return res.status(403).json({
        success: false,
        message: 'Account is inactive or suspended'
      });
    }

    // Check if user has admin role
    if (user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    // Add user info to request
    req.admin = user;
    next();
  } catch (error) {
    console.error('Admin auth error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Middleware to check if user is admin or moderator
const requireModerator = async (req, res, next) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const { data: user, error } = await supabase
      .from('users')
      .select('id, role, is_active, is_suspended')
      .eq('id', req.user.id)
      .single();

    if (error || !user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    if (!user.is_active || user.is_suspended) {
      return res.status(403).json({
        success: false,
        message: 'Account is inactive or suspended'
      });
    }

    if (!['admin', 'moderator'].includes(user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Moderator access required'
      });
    }

    req.admin = user;
    next();
  } catch (error) {
    console.error('Moderator auth error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Function to log admin activities
const logAdminActivity = async (adminId, action, resourceType, resourceId = null, details = {}, req = null) => {
  try {
    await supabase
      .from('admin_activity_logs')
      .insert([{
        admin_id: adminId,
        action,
        resource_type: resourceType,
        resource_id: resourceId,
        details,
        ip_address: req?.ip || null,
        user_agent: req?.get('User-Agent') || null
      }]);
  } catch (error) {
    console.error('Failed to log admin activity:', error);
  }
};

module.exports = {
  requireAdmin,
  requireModerator,
  logAdminActivity
};