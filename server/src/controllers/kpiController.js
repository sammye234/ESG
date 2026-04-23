// server/src/controllers/kpiController.js
const KPI = require('../models/KPI');
const File = require('../models/File');

/**
 * Get all KPIs for the current user
 */
exports.getKPIs = async (req, res, next) => {
  try {
    const kpis = await KPI.find({ userId: req.user.id })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: kpis.length,
      kpis
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get a single KPI by ID
 */
exports.getKPIById = async (req, res, next) => {
  try {
    const kpi = await KPI.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!kpi) {
      return res.status(404).json({
        success: false,
        message: 'KPI not found'
      });
    }

    res.status(200).json({
      success: true,
      kpi
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new KPI
 */
exports.createKPI = async (req, res, next) => {
  try {
    const { name, formula, result, date, fileIds, customValues } = req.body;

    const kpi = await KPI.create({
      name,
      formula,
      result,
      date: date || new Date().toLocaleDateString(),
      fileIds: fileIds || [],
      customValues: customValues || {},
      userId: req.user.id
    });

    res.status(201).json({
      success: true,
      message: 'KPI created successfully',
      kpi
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update KPI
 */
exports.updateKPI = async (req, res, next) => {
  try {
    const { name, formula, result, fileIds, customValues } = req.body;

    const kpi = await KPI.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { name, formula, result, fileIds, customValues },
      { new: true, runValidators: true }
    );

    if (!kpi) {
      return res.status(404).json({
        success: false,
        message: 'KPI not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'KPI updated successfully',
      kpi
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete KPI
 */
exports.deleteKPI = async (req, res, next) => {
  try {
    const kpi = await KPI.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!kpi) {
      return res.status(404).json({
        success: false,
        message: 'KPI not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'KPI deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Calculate KPI from formula
 */
exports.calculateKPI = async (req, res, next) => {
  try {
    const { formula, fileIds, customValues } = req.body;

    if (!formula) {
      return res.status(400).json({
        success: false,
        message: 'Formula is required'
      });
    }

    // Get files data
    const files = await File.find({
      _id: { $in: fileIds },
      userId: req.user.id
    });

    // Parse and calculate formula
    const result = parseFormula(formula, files, customValues || {});

    res.status(200).json({
      success: true,
      result
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Helper function to parse and evaluate formula
 */
function parseFormula(formulaStr, selectedFiles, customValues) {
  try {
    let processedFormula = formulaStr;
    
    // Replace functions (SUM, AVG, etc.)
    const functionRegex = /(SUM|AVG|COUNT|MIN|MAX|STD|MEAN|MEDIAN|MODE)\(([^)]+)\)/gi;
    
    processedFormula = processedFormula.replace(functionRegex, (match, func, args) => {
      const values = extractValues(args, selectedFiles);
      return calculateFunction(func.toUpperCase(), values);
    });

    // Replace cell references (File1:A1)
    const cellRegex = /([^+\-*/()]+):([A-Z]+)(\d+)/gi;
    processedFormula = processedFormula.replace(cellRegex, (match, fileName, col, row) => {
      return getCellValue(fileName.trim(), col, parseInt(row), selectedFiles);
    });

    // Replace custom values
    Object.keys(customValues).forEach(key => {
      const regex = new RegExp(`\\b${key}\\b`, 'g');
      processedFormula = processedFormula.replace(regex, customValues[key]);
    });

    // Evaluate the final expression
    // eslint-disable-next-line no-eval
    const result = eval(processedFormula);
    return result;
  } catch (error) {
    throw new Error(`Formula error: ${error.message}`);
  }
}

function extractValues(rangeStr, selectedFiles) {
  const parts = rangeStr.split(':');
  if (parts.length < 3) return [];

  const fileName = parts[0].trim();
  const startCol = parts[1];
  const startRow = parseInt(parts[2]) || 1;
  const endCol = parts[3] || startCol;
  const endRow = parseInt(parts[4]) || startRow;

  const file = selectedFiles.find(f => f.name.includes(fileName));
  if (!file || !file.data) return [];

  const values = [];
  const startColIndex = startCol.charCodeAt(0) - 65;
  const endColIndex = endCol.charCodeAt(0) - 65;

  for (let row = startRow - 1; row < endRow; row++) {
    for (let col = startColIndex; col <= endColIndex; col++) {
      if (file.data[row] && file.data[row][col]) {
        const val = parseFloat(file.data[row][col]);
        if (!isNaN(val)) values.push(val);
      }
    }
  }

  return values;
}

function getCellValue(fileName, col, row, selectedFiles) {
  const file = selectedFiles.find(f => f.name.includes(fileName));
  if (!file || !file.data) return 0;

  const colIndex = col.charCodeAt(0) - 65;
  const rowIndex = row - 1;

  if (file.data[rowIndex] && file.data[rowIndex][colIndex]) {
    const val = parseFloat(file.data[rowIndex][colIndex]);
    return isNaN(val) ? 0 : val;
  }

  return 0;
}

function calculateFunction(func, values) {
  if (values.length === 0) return 0;

  switch (func) {
    case 'SUM':
      return values.reduce((a, b) => a + b, 0);
    case 'AVG':
    case 'MEAN':
      return values.reduce((a, b) => a + b, 0) / values.length;
    case 'COUNT':
      return values.length;
    case 'MIN':
      return Math.min(...values);
    case 'MAX':
      return Math.max(...values);
    case 'STD':
      const mean = values.reduce((a, b) => a + b, 0) / values.length;
      const variance = values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length;
      return Math.sqrt(variance);
    case 'MEDIAN':
      const sorted = [...values].sort((a, b) => a - b);
      const mid = Math.floor(sorted.length / 2);
      return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
    case 'MODE':
      const freq = {};
      values.forEach(v => freq[v] = (freq[v] || 0) + 1);
      return parseFloat(Object.keys(freq).reduce((a, b) => freq[a] > freq[b] ? a : b));
    default:
      return 0;
  }
}