// server/src/utils/csvProcessor.js
const Papa = require('papaparse');
const fs = require('fs').promises;

/**
 * Parse CSV file from file path
 */
exports.parseCSVFile = async (filePath) => {
  try {
    const fileContent = await fs.readFile(filePath, 'utf8');
    return exports.parseCSVString(fileContent);
  } catch (error) {
    throw new Error(`Error reading CSV file: ${error.message}`);
  }
};

/**
 * Parse CSV string
 */
exports.parseCSVString = (csvString) => {
  return new Promise((resolve, reject) => {
    Papa.parse(csvString, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length > 0) {
          reject(new Error(`CSV parsing errors: ${JSON.stringify(results.errors)}`));
        } else {
          resolve({
            data: results.data,
            meta: results.meta,
            headers: results.meta.fields || [],
            rowCount: results.data.length
          });
        }
      },
      error: (error) => {
        reject(new Error(`CSV parsing error: ${error.message}`));
      }
    });
  });
};

/**
 * Convert array of objects to CSV string
 */
exports.arrayToCSV = (data) => {
  if (!data || data.length === 0) {
    return '';
  }
  
  return Papa.unparse(data, {
    header: true,
    skipEmptyLines: true
  });
};

/**
 * Validate CSV structure
 */
exports.validateCSV = (data, requiredColumns = []) => {
  if (!Array.isArray(data) || data.length === 0) {
    return {
      valid: false,
      error: 'CSV file is empty or invalid'
    };
  }

  const headers = Object.keys(data[0]);
  
  // Check for required columns
  const missingColumns = requiredColumns.filter(col => !headers.includes(col));
  
  if (missingColumns.length > 0) {
    return {
      valid: false,
      error: `Missing required columns: ${missingColumns.join(', ')}`
    };
  }

  return {
    valid: true,
    headers,
    rowCount: data.length
  };
};

/**
 * Clean CSV data (remove empty rows, trim whitespace)
 */
exports.cleanCSVData = (data) => {
  return data
    .filter(row => {
      // Remove rows where all values are empty
      return Object.values(row).some(val => 
        val !== null && val !== undefined && String(val).trim() !== ''
      );
    })
    .map(row => {
      // Trim whitespace from string values
      const cleaned = {};
      for (const [key, value] of Object.entries(row)) {
        cleaned[key.trim()] = typeof value === 'string' ? value.trim() : value;
      }
      return cleaned;
    });
};

/**
 * Extract column statistics
 */
exports.getColumnStats = (data, columnName) => {
  const values = data
    .map(row => parseFloat(row[columnName]))
    .filter(val => !isNaN(val));

  if (values.length === 0) {
    return null;
  }

  const sum = values.reduce((a, b) => a + b, 0);
  const avg = sum / values.length;
  const sorted = values.sort((a, b) => a - b);
  const median = sorted.length % 2 === 0
    ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
    : sorted[Math.floor(sorted.length / 2)];

  return {
    count: values.length,
    sum: sum.toFixed(2),
    average: avg.toFixed(2),
    min: Math.min(...values).toFixed(2),
    max: Math.max(...values).toFixed(2),
    median: median.toFixed(2)
  };
};