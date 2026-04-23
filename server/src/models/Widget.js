// server/src/models/Widget.js
const mongoose = require('mongoose');

const WidgetSchema = new mongoose.Schema({
  i: {
    type: String,
    required: [true, 'Widget ID is required'],
    trim: true
  },
  title: {
    type: String,
    required: [true, 'Widget title is required'],
    trim: true
  },
  value: {
    type: mongoose.Schema.Types.Mixed, // Can be number or string
    default: 0
  },
  unit: {
    type: String,
    default: 't CO₂e',
    trim: true
  },
  color: {
    type: String,
    default: '#10B981',
    match: [/^#[0-9A-F]{6}$/i, 'Please provide a valid hex color']
  },
  x: {
    type: Number,
    required: [true, 'X position is required'],
    default: 0
  },
  y: {
    type: Number,
    required: [true, 'Y position is required'],
    default: 0
  },
  w: {
    type: Number,
    required: [true, 'Width is required'],
    default: 3,
    min: 1,
    max: 12
  },
  h: {
    type: Number,
    required: [true, 'Height is required'],
    default: 2,
    min: 1
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  isDefault: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Compound index for user and widget ID
WidgetSchema.index({ userId: 1, i: 1 }, { unique: true });

// Index for position queries
WidgetSchema.index({ userId: 1, y: 1, x: 1 });

// Update updatedAt before saving
WidgetSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Update updatedAt before updating
WidgetSchema.pre('findOneAndUpdate', function(next) {
  this.set({ updatedAt: Date.now() });
  next();
});

module.exports = mongoose.model('Widget', WidgetSchema);