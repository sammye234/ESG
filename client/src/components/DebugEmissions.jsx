// client/src/components/DebugEmissions.jsx
// temporary component to debug emissions calculation issues with uploaded CSVs

import React from 'react';

const DebugEmissions = ({ csvData }) => {
  if (!csvData || csvData.length === 0) {
    return (
      <div style={{ 
        padding: '20px', 
        background: '#fff3cd', 
        border: '2px solid #ffc107',
        margin: '20px',
        borderRadius: '8px'
      }}>
        <h3>🔍 Debug: No CSV Data</h3>
        <p>csvData is empty or null</p>
      </div>
    );
  }

  const firstRow = csvData[0];
  const columnNames = Object.keys(firstRow);

  // Try to find columns
  const findColumn = (names) => {
    for (const name of names) {
      const found = columnNames.find(col => 
        col.toLowerCase().replace(/[\s\-_()[\]]/g, '') === 
        name.toLowerCase().replace(/[\s\-_()[\]]/g, '')
      );
      if (found) return { name: found, value: firstRow[found] };
    }
    return null;
  };

  const solar = findColumn(['Solar (KWh)', 'Solar', 'solar']);
  const reb = findColumn(['REB (KWh)', 'REB', 'reb']);
  const diesel = findColumn(['Diesel (Ltr)', 'Diesel', 'diesel']);
  const production = findColumn(['Production (Pcs)', 'Production', 'production']);

  return (
    <div style={{ 
      padding: '20px', 
      background: '#d1ecf1', 
      border: '2px solid #0c5460',
      margin: '20px',
      borderRadius: '8px',
      fontFamily: 'monospace'
    }}>
      <h3>🔍 Debug: CSV Data Analysis</h3>
      
      <div style={{ marginBottom: '20px' }}>
        <strong>Total Rows:</strong> {csvData.length}
      </div>

      <div style={{ marginBottom: '20px' }}>
        <strong>First Row (January) Data:</strong>
        <pre style={{ background: '#f8f9fa', padding: '10px', overflow: 'auto' }}>
          {JSON.stringify(firstRow, null, 2)}
        </pre>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <strong>Column Detection Results:</strong>
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
          <thead>
            <tr style={{ background: '#6c757d', color: 'white' }}>
              <th style={{ padding: '8px', textAlign: 'left' }}>Looking For</th>
              <th style={{ padding: '8px', textAlign: 'left' }}>Found Column</th>
              <th style={{ padding: '8px', textAlign: 'right' }}>Value</th>
              <th style={{ padding: '8px', textAlign: 'center' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ background: solar ? '#d4edda' : '#f8d7da' }}>
              <td style={{ padding: '8px' }}>Solar (KWh)</td>
              <td style={{ padding: '8px' }}>{solar?.name || 'NOT FOUND'}</td>
              <td style={{ padding: '8px', textAlign: 'right' }}>{solar?.value || 'N/A'}</td>
              <td style={{ padding: '8px', textAlign: 'center' }}>{solar ? '✅' : '❌'}</td>
            </tr>
            <tr style={{ background: reb ? '#d4edda' : '#f8d7da' }}>
              <td style={{ padding: '8px' }}>REB (KWh)</td>
              <td style={{ padding: '8px' }}>{reb?.name || 'NOT FOUND'}</td>
              <td style={{ padding: '8px', textAlign: 'right' }}>{reb?.value || 'N/A'}</td>
              <td style={{ padding: '8px', textAlign: 'center' }}>{reb ? '✅' : '❌'}</td>
            </tr>
            <tr style={{ background: diesel ? '#d4edda' : '#f8d7da' }}>
              <td style={{ padding: '8px' }}>Diesel (Ltr)</td>
              <td style={{ padding: '8px' }}>{diesel?.name || 'NOT FOUND'}</td>
              <td style={{ padding: '8px', textAlign: 'right' }}>{diesel?.value || 'N/A'}</td>
              <td style={{ padding: '8px', textAlign: 'center' }}>{diesel ? '✅' : '❌'}</td>
            </tr>
            <tr style={{ background: production ? '#d4edda' : '#f8d7da' }}>
              <td style={{ padding: '8px' }}>Production (Pcs)</td>
              <td style={{ padding: '8px' }}>{production?.name || 'NOT FOUND'}</td>
              <td style={{ padding: '8px', textAlign: 'right' }}>{production?.value || 'N/A'}</td>
              <td style={{ padding: '8px', textAlign: 'center' }}>{production ? '✅' : '❌'}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <strong>All Column Names Found in CSV:</strong>
        <ul style={{ background: '#f8f9fa', padding: '10px', maxHeight: '200px', overflow: 'auto' }}>
          {columnNames.map((col, i) => (
            <li key={i}>
              "{col}" 
              <span style={{ color: '#6c757d', marginLeft: '10px' }}>
                (normalized: "{col.toLowerCase().replace(/[\s\-_()[\]]/g, '')}")
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div style={{ 
        background: solar && reb && diesel && production ? '#d4edda' : '#f8d7da',
        padding: '15px',
        borderRadius: '5px',
        marginTop: '20px'
      }}>
        <strong>
          {solar && reb && diesel && production 
            ? '✅ ALL REQUIRED COLUMNS FOUND - Calculation should work!'
            : '❌ MISSING COLUMNS - Calculation will fail!'}
        </strong>
      </div>
    </div>
  );
};

export default DebugEmissions;