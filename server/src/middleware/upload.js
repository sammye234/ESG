// server/src/middleware/upload.js
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const config = require('../config/config');

// Get upload directory with multiple fallbacks
const uploadDir = config.UPLOAD_DIR || config.UPLOAD_PATH || './uploads';

console.log('📁 Upload directory:', uploadDir);

// Create uploads directory if it doesn't exist
if (!fs.existsSync(uploadDir)) {
  try {
    fs.mkdirSync(uploadDir, { recursive: true });
    console.log('✅ Created upload directory:', uploadDir);
  } catch (error) {
    console.error('❌ Failed to create upload directory:', error.message);
  }
}

// Configure storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter - only allow CSV files
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['.csv', '.txt'];
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (allowedTypes.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Only CSV files are allowed'), false);
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit
  },
  fileFilter: fileFilter
});

// Middleware for single file upload
const uploadSingle = upload.single('file');

// Middleware for multiple files
const uploadMultiple = upload.array('files', 10); // Max 10 files

// Error handling middleware for multer
const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File size too large. Maximum 50MB allowed.' });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({ error: 'Too many files. Maximum 10 files allowed.' });
    }
    return res.status(400).json({ error: err.message });
  } else if (err) {
    return res.status(400).json({ error: err.message });
  }
  next();
};

module.exports = {
  uploadSingle,
  uploadMultiple,
  handleUploadError
};