// client/src/utils/formulaParser.js

/**
 * Extract values from a range
 */
const extractValues = (rangeStr, selectedFiles) => {
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
};

/**
 * Get a single cell value
 */
const getCellValue = (fileName, col, row, selectedFiles) => {
  const file = selectedFiles.find(f => f.name.includes(fileName));
  if (!file || !file.data) return 0;

  const colIndex = col.charCodeAt(0) - 65;
  const rowIndex = row - 1;

  if (file.data[rowIndex] && file.data[rowIndex][colIndex]) {
    const val = parseFloat(file.data[rowIndex][colIndex]);
    return isNaN(val) ? 0 : val;
  }

  return 0;
};

/**
 * Calculate statistical functions
 */
const calculateFunction = (func, values) => {
  if (values.length === 0) return 0;

  switch (func.toUpperCase()) {
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
};

/**
 * Parse and evaluate a formula (YOUR ORIGINAL - backward compatible)
 * @param {string} formulaStr - Formula string
 * @param {Array} selectedFiles - Array of file objects
 * @param {Object} customValues - Custom variable values
 * @returns {number} - Calculated result
 */
export const parseFormula = (formulaStr, selectedFiles, customValues = {}) => {
  try {
    let processedFormula = formulaStr;
    
    const functionRegex = /(SUM|AVG|COUNT|MIN|MAX|STD|MEAN|MEDIAN|MODE)\(([^)]+)\)/gi;
    
    processedFormula = processedFormula.replace(functionRegex, (match, func, args) => {
      const values = extractValues(args, selectedFiles);
      return calculateFunction(func.toUpperCase(), values);
    });

    const cellRegex = /([^+\-*/()]+):([A-Z]+)(\d+)/gi;
    processedFormula = processedFormula.replace(cellRegex, (match, fileName, col, row) => {
      return getCellValue(fileName.trim(), col, parseInt(row), selectedFiles);
    });

    Object.keys(customValues).forEach(key => {
      const regex = new RegExp(`\\b${key}\\b`, 'g');
      processedFormula = processedFormula.replace(regex, customValues[key]);
    });

    // eslint-disable-next-line no-eval
    const result = eval(processedFormula);
    return result;
  } catch (error) {
    throw new Error(`Formula error: ${error.message}`);
  }
};

/**
 * Parse formula with detailed breakdown (ENHANCED VERSION)
 * @param {string} formulaStr - Formula string
 * @param {Array} selectedFiles - Array of file objects
 * @param {Object} customValues - Custom variable values
 * @returns {Object} - Result with breakdown
 */
export const parseFormulaDetailed = (formulaStr, selectedFiles, customValues = {}) => {
  try {
    let processedFormula = formulaStr;
    const steps = [];
    
    // Step 1: Replace functions
    const functionRegex = /(SUM|AVG|COUNT|MIN|MAX|STD|MEAN|MEDIAN|MODE)\(([^)]+)\)/gi;
    
    processedFormula = processedFormula.replace(functionRegex, (match, func, args) => {
      const values = extractValues(args, selectedFiles);
      const result = calculateFunction(func, values);
      
      steps.push({
        type: 'function',
        original: match,
        function: func,
        values: values.length,
        result
      });
      
      return result;
    });

    // Step 2: Replace cell references
    const cellRegex = /([^+\-*/()]+):([A-Z]+)(\d+)/gi;
    processedFormula = processedFormula.replace(cellRegex, (match, fileName, col, row) => {
      const value = getCellValue(fileName.trim(), col, parseInt(row), selectedFiles);
      
      steps.push({
        type: 'cell',
        original: match,
        fileName: fileName.trim(),
        cell: `${col}${row}`,
        value
      });
      
      return value;
    });

    // Step 3: Replace custom values
    Object.keys(customValues).forEach(key => {
      const regex = new RegExp(`\\b${key}\\b`, 'g');
      processedFormula = processedFormula.replace(regex, customValues[key]);
      
      steps.push({
        type: 'variable',
        name: key,
        value: customValues[key]
      });
    });

    // Step 4: Evaluate
    // eslint-disable-next-line no-eval
    const result = eval(processedFormula);

    return {
      success: true,
      result,
      formula: formulaStr,
      processedFormula,
      steps
    };
  } catch (error) {
    return {
      success: false,
      error: `Formula error: ${error.message}`,
      formula: formulaStr
    };
  }
};

/**
 * Validate formula syntax
 */
export const validateFormula = (formulaStr) => {
  const errors = [];
  
  if (!formulaStr || formulaStr.trim() === '') {
    errors.push('Formula is empty');
    return { valid: false, errors };
  }

  // Check balanced parentheses
  let openParens = 0;
  for (let char of formulaStr) {
    if (char === '(') openParens++;
    if (char === ')') openParens--;
    if (openParens < 0) {
      errors.push('Unbalanced parentheses');
      break;
    }
  }
  if (openParens > 0) {
    errors.push('Unbalanced parentheses');
  }

  // Check valid functions
  const functionRegex = /([A-Z]+)\(/g;
  let match;
  const validFunctions = ['SUM', 'AVG', 'COUNT', 'MIN', 'MAX', 'STD', 'MEAN', 'MEDIAN', 'MODE'];
  
  while ((match = functionRegex.exec(formulaStr)) !== null) {
    if (!validFunctions.includes(match[1])) {
      errors.push(`Invalid function: ${match[1]}`);
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
};

/**
 * Get formula suggestions
 */
export const getFormulaSuggestions = (files) => {
  const suggestions = [];
  
  if (files.length > 0) {
    const fileName = files[0].name.replace('.csv', '');
    
    suggestions.push({
      formula: `SUM(${fileName}:A1:A10)`,
      description: 'Sum values from A1 to A10'
    });
    
    suggestions.push({
      formula: `AVG(${fileName}:B2:B5)`,
      description: 'Average values from B2 to B5'
    });
    
    suggestions.push({
      formula: `${fileName}:C3 + ${fileName}:D4`,
      description: 'Add two cell values'
    });
  }

  suggestions.push({
    formula: 'SUM(File1:A1:A10) * 1.63',
    description: 'Multiply sum by constant'
  });

  return suggestions;
};

/**
 * Extract file references from formula
 */
export const extractFileReferences = (formulaStr) => {
  const fileRefs = new Set();
  const regex = /([^+\-*/()]+):([A-Z]+\d+)/gi;
  let match;
  
  while ((match = regex.exec(formulaStr)) !== null) {
    fileRefs.add(match[1].trim());
  }
  
  return Array.from(fileRefs);
};

const formulaParserExports = {
  parseFormula,
  parseFormulaDetailed,
  validateFormula,
  getFormulaSuggestions,
  extractFileReferences
};

export default formulaParserExports;