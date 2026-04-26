const File = require('../models/File');
const Papa = require('papaparse');
const XLSX = require('xlsx');
const fs = require('fs').promises;
const path = require('path');

async function uploadFile(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const userId = req.user.id;
    let { folderId, businessUnit } = req.body;
    const fileExtension = path.extname(req.file.originalname).toLowerCase();

    if (['bu_manager', 'bu_user'].includes(req.user.role)) {
      businessUnit = req.user.businessUnit;
      if (!businessUnit) {
        return res.status(403).json({ success: false, message: 'No business unit assigned to your account' });
      }
    } else {
      if (!['HQ', 'GTL', '4AL', 'SESL'].includes(businessUnit)) {
        return res.status(400).json({ success: false, message: 'Valid businessUnit required (HQ, GTL, 4AL, SESL)' });
      }
    }

    let parsedData = [];
    let headers = [];
    let allSheets = [];
    let fileType = 'general';

    if (fileExtension === '.csv') {
      const fileContent = await fs.readFile(req.file.path, 'utf8');
      const parsed = Papa.parse(fileContent, { header: true, dynamicTyping: true, skipEmptyLines: true });
      parsedData = parsed.data;
      headers = parsed.meta.fields || [];
      fileType = detectFileType(headers);
    } else if (['.xlsx', '.xls'].includes(fileExtension)) {
      const workbook = XLSX.readFile(req.file.path);
      allSheets = workbook.SheetNames.map(sheetName => {
        const worksheet = workbook.Sheets[sheetName];
        const sheetData = XLSX.utils.sheet_to_json(worksheet, { defval: '' });
        const sheetHeaders = sheetData.length > 0 ? Object.keys(sheetData[0]) : [];
        return { name: sheetName, data: sheetData, headers: sheetHeaders, rows: sheetData.length, columns: sheetHeaders.length };
      });
      if (allSheets.length > 0) {
        parsedData = allSheets[0].data;
        headers = allSheets[0].headers;
      }
      fileType = detectFileType(allSheets.flatMap(s => s.headers));
    } else {
      return res.status(400).json({ success: false, message: 'Only CSV, XLSX, XLS allowed' });
    }

    const fileRecord = await File.create({
      userId,
      name: req.file.filename,
      originalName: req.file.originalname,
      path: req.file.path,
      size: req.file.size,
      type: fileExtension.substring(1),
      mimeType: req.file.mimetype,
      parentId: folderId || null,
      businessUnit,
      data: parsedData,
      sheets: allSheets.length > 0 ? allSheets : undefined,
      metadata: {
        rows: parsedData.length,
        columns: headers.length,
        headers,
        sheets: allSheets.length > 0 ? allSheets.map(s => s.name) : undefined,
        totalSheets: allSheets.length || 1,
        uploadedAt: new Date().toISOString(),
        type: fileType
      }
    });

    res.status(201).json({
      success: true,
      message: 'File uploaded and parsed successfully',
      file: { ...fileRecord.toObject(), id: fileRecord._id.toString() }
    });
  } catch (error) {
    console.error('Upload error:', error);
    if (req.file?.path) await fs.unlink(req.file.path).catch(() => {});
    res.status(500).json({ success: false, message: 'Failed to upload file', error: error.message });
  }
}

async function createFolder(req, res) {
  try {
    const { folderName, parentId, businessUnit } = req.body;
    const userId = req.user.id;

    if (!folderName) return res.status(400).json({ success: false, message: 'Folder name required' });

    let assignedBU;
    if (['bu_manager', 'bu_user'].includes(req.user.role)) {
      assignedBU = req.user.businessUnit;
      if (!assignedBU) return res.status(403).json({ success: false, message: 'No BU assigned' });
    } else {
      if (!['HQ', 'GTL', '4AL', 'SESL'].includes(businessUnit)) {
        return res.status(400).json({ success: false, message: 'Valid businessUnit required' });
      }
      assignedBU = businessUnit;
    }

    let folderPath = folderName;
    if (parentId) {
      const parent = await File.findOne({ _id: parentId, userId, businessUnit: assignedBU, ...req.buFilter });
      if (!parent) return res.status(404).json({ success: false, message: 'Parent folder not found or wrong BU' });
      folderPath = `${parent.path}/${folderName}`;
    }

    const folder = await File.create({
      name: folderName, type: 'folder', userId,
      parentId: parentId || null, path: folderPath, size: 0, businessUnit: assignedBU
    });

    res.status(201).json({ success: true, message: 'Folder created', folder: { ...folder.toObject(), id: folder._id.toString() } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

async function getFiles(req, res) {
  try {
    const { folderId } = req.query;
    let query = { parentId: folderId || null, ...req.buFilter };

    if (req.user.role === 'bu_manager' || req.user.role === 'bu_user') {
      query.userId = req.user.id;
    }

    const files = await File.find(query)
      .sort({ type: -1, name: 1 })
      .select('name originalName type size mimeType createdAt updatedAt parentId path businessUnit userId metadata sheets')
      .lean();

    res.json({
      success: true,
      count: files.length,
      files: files.map(f => ({ ...f, id: f._id.toString() }))
    });
  } catch (error) {
    console.error('getFiles error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
}

async function getFileById(req, res) {
  try {
    const file = await File.findOne({ _id: req.params.id, ...req.buFilter });

    if (!file) return res.status(404).json({ success: false, message: 'File not found or access denied' });

    res.json({
      success: true,
      data: {
        _id: file._id,
        name: file.name,
        originalName: file.originalName,
        type: file.type,
        size: file.size,
        businessUnit: file.businessUnit,
        data: file.data || [],
        sheets: file.sheets || [],
        metadata: file.metadata || {},
        createdAt: file.createdAt,
        updatedAt: file.updatedAt
      },
      id: file._id.toString()
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

async function downloadFile(req, res) {
  try {
    const file = await File.findOne({ _id: req.params.id, ...req.buFilter });

    if (!file) return res.status(404).json({ success: false, message: 'File not found' });

    const isCSV = file.type === 'csv' || file.mimeType?.includes('csv') || file.originalName?.endsWith('.csv');

    if (isCSV) {
      const csv = Papa.unparse(file.data || []);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${file.originalName || 'download.csv'}"`);
      return res.send(csv);
    } else {
      const wb = XLSX.utils.book_new();
      const sheetsToExport = file.sheets?.length > 0 ? file.sheets : [{ name: 'Sheet1', data: file.data || [] }];

      sheetsToExport.forEach(sheet => {
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
    res.status(500).json({ success: false, message: error.message });
  }
}

async function getFileContent(req, res) {
  try {
    const file = await File.findOne({ _id: req.params.fileId, userId: req.user.id, ...req.buFilter }).lean();
    if (!file) return res.status(404).json({ success: false, message: 'File not found' });
    res.json({ success: true, data: file.data || [], headers: file.metadata?.headers || [], fileName: file.name });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

async function deleteFile(req, res) {
  try {
    const fileId = req.params.id;
    const file = await File.findOne({ _id: fileId, userId: req.user.id, ...req.buFilter });
    if (!file) return res.status(404).json({ success: false, message: 'File not found' });

    await File.findByIdAndDelete(fileId);

    try {
      const stats = await fs.stat(file.path);
      if (stats.isDirectory()) {
        await fs.rm(file.path, { recursive: true, force: true });
      } else {
        await fs.unlink(file.path);
      }
    } catch (e) {
      console.log('Physical file already gone:', e.message);
    }

    if (file.type === 'folder') await File.deleteMany({ parentId: fileId });

    res.json({ success: true, message: 'Deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

async function updateFileContent(req, res) {
  try {
    const { content, data, headers } = req.body;
    const file = await File.findOne({ _id: req.params.id, userId: req.user.id, ...req.buFilter });
    if (!file) return res.status(404).json({ success: false, message: 'File not found' });

    if (data) {
      file.data = data;
      if (headers) {
        file.metadata = file.metadata || {};
        file.metadata.headers = headers;
        file.metadata.rows = data.length;
        file.metadata.columns = headers.length;
      }
    }

    if (content) {
      await fs.writeFile(file.path, content, 'utf-8');
      const stats = await fs.stat(file.path);
      file.size = stats.size;
    }

    file.updatedAt = new Date();
    await file.save();

    res.json({ success: true, message: 'File updated', file: { ...file.toObject(), id: file._id.toString() } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

async function getFilesByFolder(req, res) {
  try {
    const files = await File.find({ userId: req.user.id, parentId: req.params.folderId, ...req.buFilter })
      .sort({ createdAt: -1 }).lean();
    res.json({ success: true, count: files.length, files: files.map(f => ({ ...f, id: f._id.toString() })) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

function detectFileType(headers) {
  if (!headers || headers.length === 0) return 'general';
  if (headers.some(h => /waste|jhute|padding|leftover|poly|cartoon|paper|cone|pattern/i.test(h))) return 'waste';
  if (headers.some(h => /water|etp|inlet|outlet|sludge/i.test(h))) return 'water';
  if (headers.some(h => /energy|electricity|fuel|kwh/i.test(h))) return 'energy';
  if (headers.some(h => /emission|scope|ghg|co2|carbon/i.test(h))) return 'emissions';
  if (headers.length > 15) return 'combined';
  return 'general';
}

module.exports = { uploadFile, createFolder, getFiles, getFileById, getFileContent, downloadFile, deleteFile, updateFileContent, getFilesByFolder };