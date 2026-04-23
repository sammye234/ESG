// client/src/utils/fileParser.js

import Papa from 'papaparse';
import * as XLSX from 'xlsx';

/**
 * Universal file parser - handles both CSV and Excel
 */
export const parseFile = (file) => {
  return new Promise((resolve, reject) => {
    const fileName = file.name.toLowerCase();
    
    if (fileName.endsWith('.csv')) {
      parseCSV(file).then(resolve).catch(reject);
    } else if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
      parseExcel(file).then(resolve).catch(reject);
    } else {
      reject(new Error('Unsupported file type. Please upload CSV or Excel files.'));
    }
  });
};

/**
 * Parse CSV file
 */
const parseCSV = (file) => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: (results) => {
        console.log('📄 CSV parsed:', results.data.length, 'rows');
        resolve({
          success: true,
          type: 'csv',
          fileName: file.name,
          sheets: { 'Sheet1': results.data },
          sheetNames: ['Sheet1'],
          defaultSheet: results.data,
          metadata: {
            rows: results.data.length,
            columns: results.meta.fields || []
          }
        });
      },
      error: (error) => {
        console.error('❌ CSV parse error:', error);
        reject(error);
      }
    });
  });
};

/**
 * Parse Excel file with multiple sheets
 */
const parseExcel = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });

        const sheetNames = workbook.SheetNames;
        console.log('📊 Excel sheets found:', sheetNames);
        
        const sheets = {};
        const metadata = {};
        
        sheetNames.forEach(sheetName => {
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, {
            raw: false,
            defval: ''
          });
          
          sheets[sheetName] = jsonData;
          metadata[sheetName] = {
            rows: jsonData.length,
            columns: jsonData.length > 0 ? Object.keys(jsonData[0]) : []
          };
          
          console.log(`  📄 ${sheetName}:`, jsonData.length, 'rows');
        });

        resolve({
          success: true,
          type: 'excel',
          fileName: file.name,
          sheets: sheets,
          sheetNames: sheetNames,
          defaultSheet: sheets[sheetNames[0]],
          metadata: metadata
        });
      } catch (error) {
        console.error('❌ Excel parse error:', error);
        reject(error);
      }
    };

    reader.onerror = (error) => {
      console.error('❌ File read error:', error);
      reject(error);
    };
    
    reader.readAsArrayBuffer(file);
  });
};

/**
 * Smart sheet detection for common data types
 */
export const detectSheetTypes = (parsedData) => {
  const result = {
    emissions: null,
    production: null,
    intensity: null
  };

  if (!parsedData || !parsedData.sheets) return result;

  Object.keys(parsedData.sheets).forEach(sheetName => {
    const data = parsedData.sheets[sheetName];
    if (!data || data.length === 0) return;

    const columns = Object.keys(data[0]).map(k => k.toLowerCase());
    const name = sheetName.toLowerCase();

    console.log(`🔍 Analyzing sheet "${sheetName}":`, columns);

    // Detect emissions sheet
    if (columns.some(col => 
      col.includes('emission') || 
      col.includes('scope') || 
      col.includes('ghg') ||
      col.includes('co2')
    ) || name.includes('emission') || name.includes('ghg')) {
      result.emissions = sheetName;
      console.log('  ✅ Detected as: EMISSIONS');
    }

    // Detect production sheet
    if (columns.some(col => 
      col.includes('production') || 
      col.includes('pcs') || 
      col.includes('kg') ||
      col.includes('weight') ||
      col.includes('quantity')
    ) || name.includes('production') || name.includes('output')) {
      result.production = sheetName;
      console.log('  ✅ Detected as: PRODUCTION');
    }

    // Detect intensity sheet (pre-calculated)
    if (columns.some(col => 
      col.includes('intensity')
    ) || name.includes('intensity')) {
      result.intensity = sheetName;
      console.log('  ✅ Detected as: INTENSITY (pre-calculated)');
    }
  });

  console.log('🎯 Final detection:', result);
  return result;
};

/**
 * Find a column by various possible names
 */
export const findColumn = (row, possibleNames) => {
  if (!row) return null;
  
  const keys = Object.keys(row);
  for (const possibleName of possibleNames) {
    const found = keys.find(key => 
      key.toLowerCase().replace(/[^a-z0-9]/g, '') === 
      possibleName.toLowerCase().replace(/[^a-z0-9]/g, '')
    );
    if (found) return row[found];
  }
  return null;
};

/**
 * Get production value with priority: kg > pcs > usd
 */
export const getProductionValue = (row) => {
  // Priority 1: Weight in Kg
  const kg = findColumn(row, ['weight(kg)', 'production_kg', 'weight_kg', 'weightkg', 'kg']);
  if (kg !== null && kg !== '' && !isNaN(parseFloat(kg))) {
    return { value: parseFloat(kg), unit: 'kg' };
  }

  // Priority 2: Pieces
  const pcs = findColumn(row, ['pcs', 'production_pcs', 'pieces', 'quantity', 'units']);
  if (pcs !== null && pcs !== '' && !isNaN(parseFloat(pcs))) {
    return { value: parseFloat(pcs), unit: 'pcs' };
  }

  // Priority 3: USD
  const usd = findColumn(row, ['usd', 'revenue', 'sales_usd', 'sales', 'value']);
  if (usd !== null && usd !== '' && !isNaN(parseFloat(usd))) {
    return { value: parseFloat(usd), unit: 'USD' };
  }

  return { value: 0, unit: 'N/A' };
};

export default parseFile;