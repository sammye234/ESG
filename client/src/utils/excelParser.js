// client/src/utils/excelParser.js

import * as XLSX from 'xlsx';

export const parseExcelFile = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });

        // Get all sheet names
        const sheetNames = workbook.SheetNames;
        console.log('📑 Excel sheets found:', sheetNames);

        // Parse all sheets
        const sheets = {};
        sheetNames.forEach(sheetName => {
          const worksheet = workbook.Sheets[sheetName];
          sheets[sheetName] = XLSX.utils.sheet_to_json(worksheet);
        });

        resolve({
          success: true,
          sheets: sheets,
          sheetNames: sheetNames
        });
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = (error) => reject(error);
    reader.readAsArrayBuffer(file);
  });
};

