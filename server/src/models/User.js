// server/src/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Please provide a username'],
    unique: true,
    trim: true,
    minlength: 3,
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 8,
    select: false,
  },
  role: {
    type: String,
    enum: ['pending', 'rejected', 'bu_user', 'bu_manager', 'hq_manager', 'hq_admin'],
    default: 'pending',
  },
  isActive: {
    type: Boolean,
    default: false,
  },

  businessUnit: {
    type: String,
    enum: ['HQ', 'GTL', '4AL', 'SESL', null],
    default: null,
  },
  organization: {
    type: String,
    default: null,
  },
  rejectionReason: {
    type: String,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.canAccessBU = function(bu) {
  if (this.role === 'hq_admin' || this.role === 'hq_manager') {
    return true; // HQ can access all BUs
  }
  return this.businessUnit === bu;
};

userSchema.methods.getAccessibleBUs = function() {
  if (this.role === 'hq_admin' || this.role === 'hq_manager') {
    return ['HQ', 'GTL', '4AL', 'SESL'];
  }
  return this.businessUnit ? [this.businessUnit] : [];
};

userSchema.virtual('permissions').get(function() {
  const isHQ = this.role === 'hq_admin' || this.role === 'hq_manager';
  const isManager = this.role.includes('manager') || this.role === 'hq_admin';
  
  return {
    canViewAllBUs: isHQ,
    canUploadData: this.isActive && this.role !== 'pending',
    canDeleteData: isManager,
    canManageUsers: this.role === 'hq_admin'
  };
});

userSchema.set('toJSON', { virtuals: true });
userSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('User', userSchema);