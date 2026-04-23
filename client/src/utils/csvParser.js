// client/src/utils/csvParser.js
import Papa from 'papaparse';

/**
 * Parse CSV file to JSON
 * @param {File} file - CSV file to parse
 * @returns {Promise<Object>} - Parsed data with headers and rows
 */
export const parseCSVFile = (file) => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: (results) => {
        resolve({
          data: results.data,
          headers: results.meta.fields,
          errors: results.errors
        });
      },
      error: (error) => {
        reject(new Error(`CSV parsing failed: ${error.message}`));
      }
    });
  });
};

/**
 * Parse CSV text/string to JSON
 * @param {string} csvText - CSV content as string
 * @returns {Promise<Object>} - Parsed data
 */
export const parseCSVText = (csvText) => {
  return new Promise((resolve, reject) => {
    Papa.parse(csvText, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: (results) => {
        resolve({
          data: results.data,
          headers: results.meta.fields,
          errors: results.errors
        });
      },
      error: (error) => {
        reject(new Error(`CSV parsing failed: ${error.message}`));
      }
    });
  });
};

/**
 * Convert JSON data to CSV format
 * @param {Array} data - Array of objects to convert
 * @returns {string} - CSV formatted string
 */
export const jsonToCSV = (data) => {
  if (!data || data.length === 0) {
    return '';
  }
  
  return Papa.unparse(data, {
    header: true,
    skipEmptyLines: true
  });
};

/**
 * Download CSV file
 * @param {Array} data - Data to download
 * @param {string} filename - Name of the file
 */
export const downloadCSV = (data, filename = 'export.csv') => {
  const csv = jsonToCSV(data);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

/**
 * Validate CSV structure
 * @param {Array} data - Parsed CSV data
 * @param {Array} requiredHeaders - Array of required header names
 * @returns {Object} - Validation result
 */
export const validateCSV = (data, requiredHeaders = []) => {
  const errors = [];
  
  if (!data || data.length === 0) {
    errors.push('CSV file is empty');
  }
  
  if (requiredHeaders.length > 0) {
    const headers = Object.keys(data[0] || {});
    const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
    
    if (missingHeaders.length > 0) {
      errors.push(`Missing required headers: ${missingHeaders.join(', ')}`);
    }
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
};

/**
 * Extract numeric columns from CSV data
 * @param {Array} data - CSV data
 * @returns {Array} - Array of column names that contain numeric values
 */
export const getNumericColumns = (data) => {
  if (!data || data.length === 0) return [];
  
  const headers = Object.keys(data[0]);
  const numericHeaders = [];
  
  headers.forEach(header => {
    const hasNumeric = data.some(row => {
      const value = row[header];
      return typeof value === 'number' || !isNaN(parseFloat(value));
    });
    
    if (hasNumeric) {
      numericHeaders.push(header);
    }
  });
  
  return numericHeaders;
};

/**
 * Get column statistics
 * @param {Array} data - CSV data
 * @param {string} columnName - Name of the column
 * @returns {Object} - Statistics (sum, avg, min, max, count)
 */
export const getColumnStats = (data, columnName) => {
  const values = data
    .map(row => parseFloat(row[columnName]))
    .filter(val => !isNaN(val));
  
  if (values.length === 0) {
    return null;
  }
  
  const sum = values.reduce((a, b) => a + b, 0);
  const avg = sum / values.length;
  const min = Math.min(...values);
  const max = Math.max(...values);
  
  return {
    sum,
    avg,
    min,
    max,
    count: values.length
  };
};

/**
 * Filter CSV data by condition
 * @param {Array} data - CSV data
 * @param {Function} condition - Filter function
 * @returns {Array} - Filtered data
 */
export const filterData = (data, condition) => {
  return data.filter(condition);
};

/**
 * Group CSV data by column
 * @param {Array} data - CSV data
 * @param {string} columnName - Column to group by
 * @returns {Object} - Grouped data
 */
export const groupBy = (data, columnName) => {
  return data.reduce((acc, row) => {
    const key = row[columnName];
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(row);
    return acc;
  }, {});
};

export default {
  parseCSVFile,
  parseCSVText,
  jsonToCSV,
  downloadCSV,
  validateCSV,
  getNumericColumns,
  getColumnStats,
  filterData,
  groupBy
};