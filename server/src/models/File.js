// server/src/models/File.js
const mongoose = require('mongoose');

const FileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  businessUnit: {
    type: String,
    enum: ['HQ', 'GTL', '4AL', 'SESL', null],
    default: null,
    index: true  
  },
  
  name: {
    type: String,
    required: [true, 'Please provide a file name'],
    trim: true
  },
  originalName: {
    type: String,
    trim: true
  },
  type: {
    type: String,
    enum: ['file', 'folder', 'csv', 'xlsx', 'xls'],
    required: [true, 'Please specify file type']
  },
  parentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'File',
    default: null
  },
  path: {
    type: String
  },
  size: {
    type: Number,
    default: 0
  },
  mimeType: {
    type: String
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
    default: []
  },
  // support multiple sheets
  sheets: [{
    name: String,
    data: mongoose.Schema.Types.Mixed,
    headers: [String],
    rows: Number,
    columns: Number
  }],
  metadata: {
    rows: Number,
    columns: Number,
    headers: [String],
    sheets: [String], // Sheet names
    totalSheets: Number, // Total number of sheets
    uploadedAt: Date
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

FileSchema.index({ userId: 1,businessUnit:1, parentId: 1 });
FileSchema.index({ userId: 1, type: 1 });
FileSchema.index({ businessUnit: 1, type: 1, createdAt: -1 });


FileSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

FileSchema.pre('findOneAndUpdate', function(next) {
  this.set({ updatedAt: Date.now() });
  next();
});

FileSchema.virtual('isFolder').get(function() {
  return this.type === 'folder';
});

FileSchema.virtual('isFile').get(function() {
  return ['file', 'csv', 'xlsx', 'xls'].includes(this.type);
});

// virtual to check if file has multiple sheets
FileSchema.virtual('hasMultipleSheets').get(function() {
  return this.sheets && this.sheets.length > 1;
});

FileSchema.set('toJSON', { virtuals: true });
FileSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('File', FileSchema);