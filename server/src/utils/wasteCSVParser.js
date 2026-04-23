// server/src/utils/wasteCSVParser.js
const xlsx = require('xlsx');

/**
 * Normalize column names to handle variations
 */
const normalizeColumnName = (name) => {
  if (!name || typeof name !== 'string') return '';
  return name
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/\n/g, ' ')
    .replace(/[._-]/g, ' ')
    .trim();
};

/**
 * Check if a column is a serial number column (to be ignored)
 */
const isSerialNumberColumn = (columnName) => {
  const normalized = normalizeColumnName(columnName);
  const serialPatterns = [
    'sl',
    'serial',
    'serial no',
    'serial number',
    'serialno',
    'serialnumber',
    's no',
    'sno',
    's.no',
    'sr no',
    'srno',
    'sr.no'
  ];
  return serialPatterns.includes(normalized);
};

/**
 * Find column value with flexible matching
 */
const getColumnValue = (row, possibleNames) => {
  for (const name of possibleNames) {
    const normalized = normalizeColumnName(name);
    for (const [key, value] of Object.entries(row)) {
      // Skip serial number columns
      if (isSerialNumberColumn(key)) continue;
      
      if (normalizeColumnName(key) === normalized) {
        const numValue = parseFloat(value);
        return isNaN(numValue) ? 0 : numValue;
      }
    }
  }
  return 0;
};

/**
 * Get month name from row (flexible matching)
 */
const getMonthName = (row) => {
  const validMonths = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  // Possible column names for month
  const monthColumnNames = [
    'name of the month',
    'name of month',
    'month name',
    'month',
    'months',
    'monthname'
  ];
  
  // First, try to find by column name
  for (const [key, value] of Object.entries(row)) {
    // Skip serial number columns
    if (isSerialNumberColumn(key)) continue;
    
    const normalizedKey = normalizeColumnName(key);
    
    // Check if this column is likely a month column
    if (monthColumnNames.includes(normalizedKey)) {
      const monthValue = String(value).trim();
      
      // Check for exact match
      if (validMonths.includes(monthValue)) {
        return monthValue;
      }
      
      // Check for case-insensitive match
      const matchedMonth = validMonths.find(
        m => m.toLowerCase() === monthValue.toLowerCase()
      );
      if (matchedMonth) {
        return matchedMonth;
      }
    }
  }
  
  // If not found by column name, search all values for month names
  for (const [key, value] of Object.entries(row)) {
    // Skip serial number columns
    if (isSerialNumberColumn(key)) continue;
    
    const strValue = String(value).trim();
    
    // Check for exact match
    if (validMonths.includes(strValue)) {
      return strValue;
    }
    
    // Check for case-insensitive match
    const matchedMonth = validMonths.find(
      m => m.toLowerCase() === strValue.toLowerCase()
    );
    if (matchedMonth) {
      return matchedMonth;
    }
  }
  
  return null;
};

/**
 * Detect company type from CSV headers
 */
const detectCompanyType = (headers) => {
  // Filter out serial number columns before detection
  const relevantHeaders = headers.filter(h => !isSerialNumberColumn(h));
  const headerStr = relevantHeaders.join(',').toLowerCase();
  
  console.log('🔍 Detecting company type from headers (excluding serial columns)');
  console.log('📋 Headers:', headerStr);
  
  // Type-1 has "Padding" and "Electric Waste" columns
  if (headerStr.includes('padding') && headerStr.includes('electric')) {
    console.log('✅ Detected: Type-1 w/o Liquid waste');
    return 'Type-1 w/o Liquid waste';
  }
  
  // Type-2 has "Leftover", "Paper Cone", and "ETP" columns
  if (headerStr.includes('leftover') || headerStr.includes('etp') || headerStr.includes('paper cone')) {
    console.log('✅ Detected: Type-2 with Liquid waste');
    return 'Type-2 with Liquid waste';
  }
  
  // Default to Type-2 if unclear
  console.log('⚠️ Unclear type, defaulting to Type-2');
  return 'Type-2 with Liquid waste';
};

/**
 * Parse Excel/CSV file buffer
 */
const parseWasteFile = (fileBuffer, fileType) => {
  try {
    let workbook;
    
    if (fileType === 'csv') {
      const csvData = fileBuffer.toString('utf8');
      workbook = xlsx.read(csvData, { type: 'string' });
    } else {
      workbook = xlsx.read(fileBuffer, { type: 'buffer' });
    }
    
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    
    // Convert to JSON
    const jsonData = xlsx.utils.sheet_to_json(sheet);
    
    if (!jsonData || jsonData.length === 0) {
      throw new Error('No data found in file');
    }
    
    console.log('📊 Total rows in file:', jsonData.length);
    console.log('📋 First row sample:', JSON.stringify(jsonData[0], null, 2));
    
    // Get headers
    const headers = Object.keys(jsonData[0]);
    console.log('📝 All column headers:', headers);
    
    // Detect company type
    const companyType = detectCompanyType(headers);
    
    // Parse data
    const parsedData = [];
    const skippedRows = [];
    
    for (let i = 0; i < jsonData.length; i++) {
      const row = jsonData[i];
      
      try {
        let parsedRow;
        if (companyType === 'Type-2 with Liquid waste') {
          parsedRow = parseType2Row(row);
        } else {
          parsedRow = parseType1Row(row);
        }
        
        if (parsedRow) {
          parsedData.push(parsedRow);
          console.log(`✅ Row ${i + 1}: Parsed ${parsedRow.month}`);
        } else {
          skippedRows.push(i + 1);
          console.log(`⚠️ Row ${i + 1}: Skipped (no valid month or no data)`);
        }
      } catch (err) {
        skippedRows.push(i + 1);
        console.error(`❌ Row ${i + 1}: Error - ${err.message}`);
      }
    }
    
    console.log('✅ Successfully parsed rows:', parsedData.length);
    if (skippedRows.length > 0) {
      console.log('⚠️ Skipped rows:', skippedRows.join(', '));
    }
    
    return {
      companyType,
      data: parsedData,
      rowCount: parsedData.length
    };
    
  } catch (error) {
    console.error('❌ Parse file error:', error);
    throw new Error(`Failed to parse file: ${error.message}`);
  }
};

/**
 * Parse Type-2 (SESL) format row
 */
const parseType2Row = (row) => {
  const monthName = getMonthName(row);
  if (!monthName) {
    console.log('⚠️ Skipping row - no valid month name');
    return null;
  }
  
  const currentYear = new Date().getFullYear();
  
  const parsedRow = {
    month: monthName,
    year: currentYear,
    companyType: 'Type-2 with Liquid waste',
    recycleWaste: {
      preConsumer: {
        jhute: getColumnValue(row, [
          'jhute(kg)', 'jhute', 'jhute (kg)',
          'jute(kg)', 'jute', 'jute (kg)'
        ]),
        leftover: getColumnValue(row, ['leftover(kg)', 'leftover', 'leftover (kg)']),
        padding: 0
      },
      packaging: {
        polyPlastic: getColumnValue(row, [
          'poly and plastic (kg)',
          'poly and plastic(kg)',
          'poly/plastic(kg)',
          'poly plastic(kg)',
          'poly plastic (kg)',
          'polyplastic(kg)',
          'plastic(kg)',
          'plastic'
        ]),
        carton: getColumnValue(row, [
          'carton, paper and paper cone(kg)',
          'carton paper and paper cone(kg)',
          'carton, paper and paper cone(kg)',
          'carton paper and paper cone(kg)',
          'carton(kg)',
          'carton(kg)',
          'carton',
          'carton'
        ]),
        paper: 0,
        paperCone: 0
      }
    },
    hazardousWaste: {
      solid: {
        medicalWaste: getColumnValue(row, ['medical waste(kg)', 'medical waste', 'medical waste (kg)']),
        metal: getColumnValue(row, ['metal(kg)', 'metal', 'metal (kg)']),
        electricWaste: 0,
        emptyChemicalDrum: getColumnValue(row, [
          'empty chemical drum(kg)',
          'empty chemical drum',
          'empty chemical drum (kg)',
          'chemical drum(kg)'
        ])
      },
      liquid: {
        etpInlet: getColumnValue(row, [
          'etp inlet water(m3)',
          'etp inlet water',
          'etp inlet water (m3)',
          'etp inlet(m3)',
          'etp inlet'
        ]),
        etpOutlet: getColumnValue(row, [
          'etp outlet water(m3)',
          'etp outlet water',
          'etp outlet water (m3)',
          'etp outlet(m3)',
          'etp outlet'
        ])
      }
    },
    bioSolidWaste: {
      sludge: getColumnValue(row, ['sludge(kg)', 'sludge', 'sludge (kg)']),
      foodWaste: getColumnValue(row, ['food waste(kg)', 'food waste', 'food waste (kg)'])
    }
  };
  
  // Check if row has any data (not all zeros)
  const hasData = 
    parsedRow.recycleWaste.preConsumer.jhute > 0 ||
    parsedRow.recycleWaste.preConsumer.leftover > 0 ||
    parsedRow.recycleWaste.packaging.polyPlastic > 0 ||
    parsedRow.recycleWaste.packaging.carton > 0 ||
    parsedRow.hazardousWaste.solid.medicalWaste > 0 ||
    parsedRow.hazardousWaste.solid.metal > 0 ||
    parsedRow.hazardousWaste.solid.emptyChemicalDrum > 0 ||
    parsedRow.hazardousWaste.liquid.etpInlet > 0 ||
    parsedRow.hazardousWaste.liquid.etpOutlet > 0 ||
    parsedRow.bioSolidWaste.sludge > 0 ||
    parsedRow.bioSolidWaste.foodWaste > 0;
  
  if (!hasData) {
    console.log(`⚠️ Skipping ${monthName} - all values are zero or empty`);
    return null;
  }
  
  console.log(`✅ Parsed Type-2 row: ${monthName}`);
  return parsedRow;
};

/**
 * Parse Type-1 (4A) format row
 */
const parseType1Row = (row) => {
  const monthName = getMonthName(row);
  if (!monthName) {
    console.log('⚠️ Skipping row - no valid month name');
    return null;
  }
  
  const currentYear = new Date().getFullYear();
  
  const parsedRow = {
    month: monthName,
    year: currentYear,
    companyType: 'Type-1 w/o Liquid waste',
    recycleWaste: {
      preConsumer: {
        jhute: getColumnValue(row, [
          'jhute(kg)', 'jhute', 'jhute (kg)',
          'jute(kg)', 'jute', 'jute (kg)'
        ]),
        leftover: 0,
        padding: getColumnValue(row, ['padding (kg)', 'padding(kg)', 'padding'])
      },
      packaging: {
        polyPlastic: getColumnValue(row, [
          'poly/plastic(kg)',
          'poly plastic(kg)',
          'poly/plastic (kg)',
          'poly plastic (kg)',
          'polyplastic(kg)',
          'poly and plastic(kg)',
          'plastic(kg)',
          'plastic'
        ]),
        carton: getColumnValue(row, [
          'carton(kg)', 'carton', 'carton (kg)',
          'carton(kg)', 'carton', 'carton (kg)'
        ]),
        paper: getColumnValue(row, ['paper(kg)', 'paper', 'paper (kg)']),
        paperCone: 0
      }
    },
    hazardousWaste: {
      solid: {
        medicalWaste: getColumnValue(row, ['medical waste(kg)', 'medical waste', 'medical waste (kg)']),
        metal: getColumnValue(row, ['metal(kg)', 'metal', 'metal (kg)']),
        electricWaste: getColumnValue(row, [
          'electric waste(kg)',
          'electric waste',
          'electric waste (kg)',
          'electrical waste(kg)',
          'e-waste(kg)',
          'e waste(kg)',
          'e-waste',
          'e waste',
          'ewaste(kg)',
          'ewaste'
        ]),
        emptyChemicalDrum: getColumnValue(row, [
          'empty chemical drum(kg)',
          'empty chemical drum',
          'empty chemical drum (kg)',
          'chemical drum(kg)'
        ])
      },
      liquid: {
        etpInlet: 0,
        etpOutlet: 0
      }
    },
    bioSolidWaste: {
      sludge: 0,
      foodWaste: getColumnValue(row, ['food waste(kg)', 'food waste', 'food waste (kg)'])
    }
  };
  
  // Check if row has any data (not all zeros)
  const hasData = 
    parsedRow.recycleWaste.preConsumer.jhute > 0 ||
    parsedRow.recycleWaste.preConsumer.padding > 0 ||
    parsedRow.recycleWaste.packaging.polyPlastic > 0 ||
    parsedRow.recycleWaste.packaging.carton > 0 ||
    parsedRow.recycleWaste.packaging.paper > 0 ||
    parsedRow.hazardousWaste.solid.medicalWaste > 0 ||
    parsedRow.hazardousWaste.solid.metal > 0 ||
    parsedRow.hazardousWaste.solid.electricWaste > 0 ||
    parsedRow.hazardousWaste.solid.emptyChemicalDrum > 0 ||
    parsedRow.bioSolidWaste.foodWaste > 0;
  
  if (!hasData) {
    console.log(`⚠️ Skipping ${monthName} - all values are zero or empty`);
    return null;
  }
  
  console.log(`✅ Parsed Type-1 row: ${monthName}`);
  return parsedRow;
};

/**
 * Validate parsed waste data
 */
const validateWasteData = (data) => {
  const errors = [];
  
  if (!data.month) {
    errors.push('Month name is required');
  }
  
  if (!data.year || data.year < 2020 || data.year > 2100) {
    errors.push('Valid year is required');
  }
  
  // Check if at least some waste data exists
  const hasData = 
    data.recycleWaste?.preConsumer?.jhute > 0 ||
    data.recycleWaste?.preConsumer?.leftover > 0 ||
    data.recycleWaste?.preConsumer?.padding > 0 ||
    data.recycleWaste?.packaging?.polyPlastic > 0 ||
    data.recycleWaste?.packaging?.carton > 0 ||
    data.recycleWaste?.packaging?.paper > 0 ||
    data.hazardousWaste?.solid?.medicalWaste > 0 ||
    data.hazardousWaste?.solid?.metal > 0 ||
    data.hazardousWaste?.solid?.electricWaste > 0 ||
    data.hazardousWaste?.liquid?.etpInlet > 0 ||
    data.bioSolidWaste?.sludge > 0 ||
    data.bioSolidWaste?.foodWaste > 0;
  
  if (!hasData) {
    errors.push('No valid waste data found in row');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Extract year from filename
 */
const extractYearFromFilename = (filename) => {
  const yearMatch = filename.match(/20\d{2}/);
  return yearMatch ? parseInt(yearMatch[0]) : new Date().getFullYear();
};

module.exports = {
  parseWasteFile,
  detectCompanyType,
  validateWasteData,
  extractYearFromFilename
};