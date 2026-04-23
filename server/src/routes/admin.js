// server/src/routes/admin.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const AuditLog = require('../models/AuditLog'); 
const { protect, requireAdmin } = require('../middleware/auth');

router.use(protect, requireAdmin);

const logAdminAction = async (req, action, targetUserId, extraDetails = {}) => {
  try {
    await AuditLog.create({
      action,
      performedBy: req.user.id,
      targetUser: targetUserId,
      details: extraDetails,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent') || 'unknown'
    });
  } catch (err) {
    console.error('❌ Audit logging failed:', err.message);
  }
};
router.get('/stats', async (req, res) => {
  try {
    const [totalUsers, pendingCount, recentUsers] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'pending', isActive: false }),
      User.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select('username email role businessUnit createdAt')
    ]);

    res.json({
      success: true,
      stats: {
        totalUsers,
        pendingApprovals: pendingCount,
        recentRegistrations: recentUsers,
        lastUpdated: new Date().toISOString()
      }
    });
  } catch (err) {
    console.error('❌ Stats error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});
router.get('/users', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      role,
      businessUnit,
      search,
      status, 
    } = req.query;

    const query = {};

    if (role) query.role = role;
    if (businessUnit) query.businessUnit = businessUnit;
    if (status === 'active') query.isActive = true;
    if (status === 'pending') query.role = 'pending';
    if (status === 'rejected') query.role = 'rejected';
    if (search) {
      query.$or = [
        { email: { $regex: search.trim(), $options: 'i' } },
        { username: { $regex: search.trim(), $options: 'i' } }
      ];
    }

    const users = await User.find(query)
      .select('username email role businessUnit isActive createdAt rejectionReason')
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      data: users,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / limit),
        limit: Number(limit)
      }
    });
  } catch (err) {
    console.error('❌ Users list error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});
router.get('/pending', async (req, res) => {
  try {
    console.log('📋 [Admin] Fetching pending users...');
    
    const pending = await User.find({
      role: 'pending',
      isActive: false
    })
      .select('username email createdAt')
      .sort({ createdAt: -1 })
      .limit(20)
      .lean(); 

    const count = await User.countDocuments({ role: 'pending', isActive: false });

    console.log(`✅ [Admin] Found ${count} pending users`);

    res.json({
      success: true,
      count,
      users: pending
    });
  } catch (err) {
    console.error('❌ [Admin] Pending users error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch pending users',
      error: err.message 
    });
  }
});
router.put('/users/:id/approve', async (req, res) => {
  try {
    const { role, businessUnit } = req.body;
    
    console.log('✅ [Admin] Approving user:', req.params.id, { role, businessUnit });

    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    
    if (user.isActive) {
      return res.status(400).json({ 
        success: false, 
        message: 'User is already active' 
      });
    }

    const validRoles = ['hq_admin', 'hq_manager', 'bu_manager', 'bu_user'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid role. Must be one of: ' + validRoles.join(', ')
      });
    }
    if (['bu_manager', 'bu_user'].includes(role)) {
      if (!businessUnit) {
        return res.status(400).json({ 
          success: false, 
          message: 'Business Unit is required for BU roles' 
        });
      }
      
      const validBUs = ['GTL', '4AL', 'SESL'];
      if (!validBUs.includes(businessUnit)) {
        return res.status(400).json({ 
          success: false, 
          message: `Invalid Business Unit. Must be one of: ${validBUs.join(', ')}` 
        });
      }
      
      user.businessUnit = businessUnit;
    } else {
      user.businessUnit = 'HQ';
    }

    user.role = role;
    user.isActive = true;
    
    await user.save();
    await logAdminAction(req, 'user_approved', user._id, {
      assignedRole: role,
      assignedBusinessUnit: user.businessUnit
    });

    console.log(`✅ [Admin] User approved: ${user.email} as ${role} (${user.businessUnit})`);

    res.json({
      success: true,
      message: `User approved as ${role}`,
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        role: user.role,
        businessUnit: user.businessUnit,
        isActive: user.isActive
      }
    });
  } catch (err) {
    console.error('❌ [Admin] Approve error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to approve user',
      error: err.message 
    });
  }
});

router.put('/users/:id/reject', async (req, res) => {
  try {
    const { reason } = req.body;

    console.log('❌ [Admin] Rejecting user:', req.params.id, { reason });

    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    user.role = 'rejected';
    user.rejectionReason = reason?.trim() || 'No reason provided';
    user.isActive = false;

    await user.save();

    await logAdminAction(req, 'user_rejected', user._id, {
      reason: user.rejectionReason
    });

    console.log(`✅ [Admin] User rejected: ${user.email}`);

    res.json({
      success: true,
      message: 'User rejected successfully',
      rejectionReason: user.rejectionReason
    });
  } catch (err) {
    console.error('❌ [Admin] Reject error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to reject user',
      error: err.message 
    });
  }
});

router.put('/users/:id', async (req, res) => {
  try {
    const { role, businessUnit } = req.body;

    console.log('📝 [Admin] Updating user:', req.params.id, { role, businessUnit });

    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    const oldRole = user.role;
    const oldBU = user.businessUnit;

    if (role) {
      const validRoles = ['hq_admin', 'hq_manager', 'bu_manager', 'bu_user'];
      if (!validRoles.includes(role)) {
        return res.status(400).json({ 
          success: false, 
          message: 'Invalid role' 
        });
      }
      user.role = role;
    }
    if (businessUnit !== undefined) {
      if (['hq_admin', 'hq_manager'].includes(user.role)) {
        user.businessUnit = 'HQ';
      } else {
        const validBUs = ['GTL', '4AL', 'SESL'];
        if (!validBUs.includes(businessUnit)) {
          return res.status(400).json({ 
            success: false, 
            message: 'Invalid Business Unit' 
          });
        }
        user.businessUnit = businessUnit;
      }
    }

    await user.save();

    await logAdminAction(req, 'user_role_changed', user._id, {
      oldRole,
      newRole: user.role,
      oldBusinessUnit: oldBU,
      newBusinessUnit: user.businessUnit
    });

    console.log(`✅ [Admin] User updated: ${user.email}`);

    res.json({
      success: true,
      message: 'User updated successfully',
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        role: user.role,
        businessUnit: user.businessUnit,
        isActive: user.isActive
      }
    });
  } catch (err) {
    console.error('❌ [Admin] Update error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update user',
      error: err.message 
    });
  }
});

router.get('/audit-logs', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      action,
      fromDate,
      toDate,
      targetUserId
    } = req.query;

    const query = {};

    if (action) query.action = action;
    if (targetUserId) query.targetUser = targetUserId;

    if (fromDate || toDate) {
      query.createdAt = {};
      if (fromDate) query.createdAt.$gte = new Date(fromDate);
      if (toDate) query.createdAt.$lte = new Date(toDate + 'T23:59:59.999Z');
    }

    const logs = await AuditLog.find(query)
      .populate('performedBy', 'username email')
      .populate('targetUser', 'username email')
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const total = await AuditLog.countDocuments(query);

    res.json({
      success: true,
      data: logs,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / limit),
        limit: Number(limit)
      }
    });
  } catch (err) {
    console.error('❌ [Admin] Audit logs error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch audit logs',
      error: err.message 
    });
  }
});

module.exports = router;