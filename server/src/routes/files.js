const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Papa = require('papaparse');
const XLSX = require('xlsx');
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
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /csv|xlsx|xls/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype) || file.mimetype.includes('spreadsheet');
    if (extname || mimetype) return cb(null, true);
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
    const file = await File.findOne({ _id: req.params.id, ...req.buFilter });

    if (!file) {
      return res.status(404).json({ success: false, message: 'File not found or access denied' });
    }

    const isCSV = file.type === 'csv' || file.mimeType?.includes('csv') || file.originalName?.endsWith('.csv');

    if (isCSV) {
      const csv = Papa.unparse(file.data || []);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${file.originalName || 'download.csv'}"`);
      return res.send(csv);
    } else {
      const wb = XLSX.utils.book_new();
      const sheets = file.sheets?.length > 0 ? file.sheets : [{ name: 'Sheet1', data: file.data || [] }];
      sheets.forEach(sheet => {
        const ws = XLSX.utils.json_to_sheet(sheet.data || []);
        XLSX.utils.book_append_sheet(wb, ws, sheet.name || 'Sheet1');
      });
      const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="${file.originalName || 'download.xlsx'}"`);
      return res.send(buffer);
    }
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ success: false, message: 'Failed to download file', error: error.message });
  }
});

router.get('/:fileId/content', applyBuScope, getFileContent);

router.route('/:id')
  .get(applyBuScope, getFileById)
  .put(requireUploadPermission, applyBuScope, enforceBuOwnership, updateFileContent)
  .delete(requireDeletePermission, applyBuScope, enforceBuOwnership, deleteFile);

module.exports = router;