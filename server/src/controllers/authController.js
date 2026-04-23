// server/src/controllers/authController.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Register a new user
 */
exports.register = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;
    console.log('📝 Registration attempt:', { username, email });

    const existingUser = await User.findOne({ $or: [{ email }, { username }] });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email or username already exists'
      });
    }

    const user = await User.create({
      username,
      email,
      password   
    });
    res.status(201).json({
      success: true,
      message: "Registration successful. Please wait for admin approval."
    });
  } catch (error) {
    console.error('❌ Registration error:', error);
    next(error);
  }
};


exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;   

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    console.log('LOGIN ATTEMPT →', { email }); 
    const user = await User.findOne({ email }).select('+password').populate('businessUnit'); 

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    if (!user.isActive) {
      if (user.role === 'pending') {
        return res.status(403).json({ 
          success: false,
          message: 'Account is pending admin approval' 
        });
      }
      if (user.role === 'rejected') {
        return res.status(403).json({ 
          success: false,
          message: 'Account rejected by administrator',
          reason: user.rejectionReason || 'No reason provided'
        });
      }
      return res.status(403).json({ 
        success: false,
        message: 'Account is inactive' 
      });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,              
      { expiresIn: process.env.JWT_EXPIRE || '1d' }
    );

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        isActive: user.isActive,  
        businessUnit: user.businessUnit?.code || null, 
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('LOGIN CRASH:', error.message, error.stack);
    next(error);   
  }
};
/**
 * Get current logged in user
 */
exports.getCurrentUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id)
      .select('username email role isActive createdAt')
      .populate('businessUnit'); 

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,           
        isActive: user.isActive,   
        businessUnit: user.businessUnit?.code || null,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Logout user (client-side token removal)
 */
exports.logout = async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update user profile
 */
exports.updateProfile = async (req, res, next) => {
  try {
    const { username, email } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { username, email },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Change password
 */
exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user.id).select('+password');

    // Check current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    next(error);
  }
};