// server/src/routes/upload.js
const express = require('express');
const router = express.Router();
const { uploadFile } = require('../controllers/fileController');
const { protect } = require('../middleware/auth');
const multer = require('multer');

// Setup multer for memory storage (since controller handles parsing)
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 }
});

// POST /api/upload
router.post('/', protect, upload.single('file'), (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded' });
  }
  next();
}, uploadFile);

module.exports = router;