// server/src/routes/files.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const File = require('../models/File'); 

const {
  getFiles,
  getFileById,
  getFileContent,
  createFolder,
  uploadFile,
  updateFileContent,
  deleteFile,
  getFilesByFolder
} = require('../controllers/fileController');

const {
  protect,
  requireUploadPermission,
  requireDeletePermission
} = require('../middleware/auth');

const { applyBuScope, enforceBuOwnership } = require('../middleware/scope');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /csv|xlsx|xls/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype) || file.mimetype.includes('spreadsheet');

    if (extname || mimetype) {
      return cb(null, true);
    }
    cb(new Error('Only CSV, XLSX and XLS files are allowed!'));
  }
});

router.use(protect);

router.get('/', applyBuScope, getFiles);
router.get('/folder/:folderId', applyBuScope, getFilesByFolder);

router.post('/folder', requireUploadPermission, applyBuScope, enforceBuOwnership, createFolder);
router.post('/upload', requireUploadPermission, upload.single('file'), applyBuScope, enforceBuOwnership, uploadFile);


router.get('/:id/download', applyBuScope, async (req, res) => {
  try {
    console.log('⬇️ [Download] File ID:', req.params.id);
    
    const file = await File.findOne({
      _id: req.params.id,
      ...req.buFilter  
    });

    if (!file) {
      console.log('❌ [Download] File not found or access denied');
      return res.status(404).json({
        success: false,
        message: 'File not found or you do not have access to this file'
      });
    }

    console.log('✅ [Download] File found:', file.originalName, 'BU:', file.businessUnit);

    const filePath = file.path; 

    if (!fs.existsSync(filePath)) {
      console.log('❌ [Download] File not found on disk:', filePath);
      return res.status(404).json({
        success: false,
        message: 'File not found on server'
      });
    }

    
    console.log('📤 [Download] Sending file:', filePath);
    res.download(filePath, file.originalName || file.name || 'download');
  } catch (error) {
    console.error('❌ [Download] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to download file',
      error: error.message
    });
  }
});

router.get('/:fileId/content', applyBuScope, getFileContent);

router.route('/:id')
  .get(applyBuScope, getFileById)
  .put(requireUploadPermission, applyBuScope, enforceBuOwnership, updateFileContent)
  .delete(requireDeletePermission, applyBuScope, enforceBuOwnership, deleteFile);

module.exports = router;