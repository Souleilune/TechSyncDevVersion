// backend/middleware/auth.js - FIXED VERSION WITH ROLE
const jwt = require('jsonwebtoken');
const supabase = require('../config/supabase');

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access token is missing or invalid'
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token is required'
      });
    }

    // Verify JWT token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (jwtError) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }

    // Get user from database to ensure they still exist - FIXED: Added 'role' field
    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, username, full_name, role, is_active')  // ✅ ADDED ROLE
      .eq('id', decoded.userId || decoded.id)
      .single();

    if (error || !user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    if (!user.is_active) {
      return res.status(401).json({
        success: false,
        message: 'Account has been deactivated'
      });
    }

    // Attach user to request object - FIXED: Added role field
    req.user = {
      id: user.id,
      email: user.email,
      username: user.username,
      fullName: user.full_name,
      role: user.role || 'user'  // ✅ ADDED ROLE WITH DEFAULT
    };

    console.log(`Authenticated user: ${user.username} (${user.id}) - Role: ${req.user.role}`);
    
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Authentication error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Optional middleware - doesn't fail if no token provided - FIXED: Added role field
const optionalAuthMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      req.user = null;
      return next();
    }

    const token = authHeader.substring(7);

    if (!token) {
      req.user = null;
      return next();
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // FIXED: Added 'role' field to select
      const { data: user, error } = await supabase
        .from('users')
        .select('id, email, username, full_name, role, is_active')  // ✅ ADDED ROLE
        .eq('id', decoded.userId || decoded.id)
        .single();

      if (error || !user || !user.is_active) {
        req.user = null;
      } else {
        // FIXED: Added role field to user object
        req.user = {
          id: user.id,
          email: user.email,
          username: user.username,
          fullName: user.full_name,
          role: user.role || 'user'  // ✅ ADDED ROLE WITH DEFAULT
        };
      }
    } catch (jwtError) {
      req.user = null;
    }

    next();
  } catch (error) {
    console.error('Optional auth middleware error:', error);
    req.user = null;
    next();
  }
};

module.exports = {
  authMiddleware,
  optionalAuthMiddleware
};

// For backward compatibility, export authMiddleware as default
module.exports = authMiddleware;
module.exports.authMiddleware = authMiddleware;
module.exports.optionalAuthMiddleware = optionalAuthMiddleware;