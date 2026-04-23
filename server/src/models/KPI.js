// server/src/models/KPI.js
const mongoose = require('mongoose');

const KPISchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a KPI name'],
    trim: true
  },
  formula: {
    type: String,
    required: [true, 'Please provide a formula'],
    trim: true
  },
  result: {
    type: Number,
    required: [true, 'Result is required']
  },
  date: {
    type: String,
    default: () => new Date().toLocaleDateString()
  },
  fileIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'File'
  }],
  customValues: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    default: {}
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  description: {
    type: String,
    trim: true
  },
  category: {
    type: String,
    enum: ['emissions', 'energy', 'water', 'waste', 'custom'],
    default: 'custom'
  },
  tags: [{
    type: String,
    trim: true
  }],
  isFavorite: {
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

// Index for faster queries
KPISchema.index({ userId: 1, createdAt: -1 });
KPISchema.index({ userId: 1, category: 1 });
KPISchema.index({ userId: 1, isFavorite: 1 });

// Update updatedAt before saving
KPISchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Update updatedAt before updating
KPISchema.pre('findOneAndUpdate', function(next) {
  this.set({ updatedAt: Date.now() });
  next();
});

module.exports = mongoose.model('KPI', KPISchema);