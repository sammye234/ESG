// server/src/middleware/auth.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const config = require('../config/config');

// Main authentication middleware
const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Not authorized - no token provided'
    });
  }

  try {
    const decoded = jwt.verify(token, config.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'User not found'
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        error: 'Account is inactive or pending approval'
      });
    }

    req.user = {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      businessUnit: user.businessUnit,
      organization: user.organization,
      canAccessBU: (bu) => user.canAccessBU(bu),
      getAccessibleBUs: () => user.getAccessibleBUs()
    };

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: 'Token has expired'
      });
    }
    return res.status(401).json({
      success: false,
      error: 'Invalid token'
    });
  }
};

// Only HQ_ADMIN can manage users
const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'hq_admin') {
    return res.status(403).json({
      success: false,
      error: 'Admin (HQ_ADMIN) access required'
    });
  }
  next();
};

// HQ level access (hq_admin + hq_manager)
const requireHQ = (req, res, next) => {
  if (!req.user || !['hq_admin', 'hq_manager'].includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      error: 'HQ level access required'
    });
  }
  next();
};

// Upload permission - all active users except pending/rejected
const requireUploadPermission = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required'
    });
  }

  const allowedRoles = ['hq_admin', 'hq_manager', 'bu_manager', 'bu_user'];
  
  if (!allowedRoles.includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      error: 'You do not have permission to upload files'
    });
  }

  next();
};

// Delete permission - typically managers and admins
const requireDeletePermission = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required'
    });
  }

  const allowedRoles = ['hq_admin', 'hq_manager', 'bu_manager'];
  
  if (!allowedRoles.includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      error: 'You do not have permission to delete files'
    });
  }

  next();
};

module.exports = {
  protect,
  requireAdmin,
  requireHQ,
  requireUploadPermission,
  requireDeletePermission
};