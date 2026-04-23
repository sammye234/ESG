//server/src/routes/auth.js
const express = require('express');
const router = express.Router();
const User = require('../models/User'); 
const { 
  register, 
  login, 
  getCurrentUser, 
  logout,
  updateProfile,
  changePassword
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { validateRegistration, validateLogin } = require('../middleware/validator');

router.post('/register', validateRegistration, register);
router.post('/login', validateLogin, login);


router.get('/me', protect, getCurrentUser);
router.post('/logout', protect, logout);
router.put('/profile', protect, updateProfile);
router.put('/password', protect, changePassword);

//  TEMPORARY 
// router.post('/update-admin-password', async (req, res) => {
//   try {
//     const admin = await User.findOne({ email: 'admin@example.com' });
    
//     if (!admin) {
//       return res.status(404).json({ success: false, message: 'Admin not found' });
//     }

//     // Update password (will be auto-hashed by pre-save hook)
//     admin.password = 'Admin@123';
//     await admin.save();

//     console.log('✅ Admin password updated!');

//     res.json({ 
//       success: true,
//       message: 'Password updated successfully',
//       credentials: {
//         email: 'admin@example.com',
//         password: 'Admin@123'
//       }
//     });
//   } catch (error) {
//     console.error('❌ Error:', error);
//     res.status(500).json({ success: false, error: error.message });
//   }
// });

router.get('/check-access', protect, async (req, res) => {
  try {
    const User = require('../models/User');
    const BusinessUnit = require('../models/BusinessUnit');
    
    const user = await User.findById(req.user.id).populate('businessUnit');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    
    let accessibleBUs = [];
    if (user.role === 'hq_admin' || user.role === 'hq_manager') {
      accessibleBUs = ['HQ', 'GTL', '4AL', 'SESL'];
    } else if (user.role === 'bu_manager' || user.role === 'bu_user') {
      if (user.businessUnit) {
        const bu = await BusinessUnit.findById(user.businessUnit);
        accessibleBUs = bu ? [bu.code] : [];
      }
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        role: user.role,
        isActive: user.isActive,
        businessUnit: user.businessUnit ? {
          id: user.businessUnit._id,
          code: user.businessUnit.code,
          name: user.businessUnit.name
        } : null,
        accessibleBUs,
        permissions: {
          canViewAllBUs: ['hq_admin', 'hq_manager'].includes(user.role),
          canUploadData: ['hq_admin', 'hq_manager', 'bu_manager', 'bu_user'].includes(user.role),
          canDeleteData: ['hq_admin', 'hq_manager', 'bu_manager'].includes(user.role),
          canManageUsers: user.role === 'hq_admin'
        },
        approvedAt: user.approvedAt,
        approvedBy: user.approvedBy
      }
    });
  } catch (err) {
    console.error('Check access error:', err);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to check access',
      message: err.message 
    });
  }
});

module.exports = router;