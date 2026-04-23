// client/src/config.js

const config = {
  // API Configuration (from your original)
  API_BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  ENVIRONMENT: process.env.REACT_APP_ENV || 'development',
  
  // Legacy support (keep your naming convention)
  apiUrl: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  
  // Authentication
  tokenKey: 'esg_auth_token',
  
  // File Upload
  maxFileSize: 10 * 1024 * 1024, // 10MB
  allowedFileTypes: ['.csv', 'text/csv', 'application/vnd.ms-excel'],
  
  // Widget Configuration
  defaultWidgets: [
    { 
      i: 'scope1', 
      x: 0, 
      y: 0, 
      w: 3, 
      h: 2, 
      title: 'Scope 1 Emissions', 
      value: 0, 
      unit: 't CO₂e', 
      //color: '#EF4444' 
      color: '#0077b6'
    },
    { 
      i: 'scope2', 
      x: 3, 
      y: 0, 
      w: 3, 
      h: 2, 
      title: 'Scope 2 Emissions', 
      value: 0, 
      unit: 't CO₂e', 
      //color: '#3B82F6' 
      
      color: '#caf0f8'
    },
    { 
      i: 'scope3', 
      x: 6, 
      y: 0, 
      w: 3, 
      h: 2, 
      title: 'Scope 3 Emissions', 
      value: 0, 
      unit: 't CO₂e', 
      //color: '#10B981' 
      color: '#90e0ef'
    },
    { 
      i: 'total', 
      x: 9, 
      y: 0, 
      w: 3, 
      h: 2, 
      title: 'Total Emissions', 
      value: 0, 
      unit: 't CO₂e', 
      //color: '#8B5CF6' 
      color: ' #00b4d8'
    }
  ],
   /* { 
      i: 'carbon-scope1', 
      x: 0, 
      y: 2, 
      w: 3, 
      h: 2, 
      title: 'Carbon Scope 1', 
      value: 0, 
      unit: 't CO₂e', 
      color: '#DC2626' 
    },
    { 
      i: 'carbon-scope2', 
      x: 3, 
      y: 2, 
      w: 3, 
      h: 2, 
      title: 'Carbon Scope 2', 
      value: 0, 
      unit: 't CO₂e', 
      color: '#2563EB' 
    },
    { 
      i: 'carbon-scope3', 
      x: 6, 
      y: 2, 
      w: 3, 
      h: 2, 
      title: 'Carbon Scope 3', 
      value: 0, 
      unit: 't CO₂e', 
      color: '#059669' 
    },  
    { 
      i: 'carbon-total', 
      x: 9, 
      y: 2, 
      w: 3, 
      h: 2, 
      title: 'Total Carbon', 
      value: 0, 
      unit: 't CO₂e', 
      color: '#7C3AED' 
    }
  ], */
  
  // Grid Layout
  gridLayout: {
    cols: 12,
    rowHeight: 100,
    isDraggable: true,
    isResizable: true
  },
  
  // Color Palette for Widgets
  widgetColors: [
    '#10B981', '#3B82F6', '#F59E0B', '#EF4444', 
    '#8B5CF6', '#EC4899', '#14B8A6', '#F97316',
    '#06B6D4', '#84CC16', '#F43F5E', '#A855F7',
    '#22C55E', '#6366F1', '#EAB308', '#DC2626',
    '#0EA5E9', '#65A30D', '#DB2777', '#7C3AED',
    '#10B981', '#F59E0B', '#3B82F6', '#8B5CF6'
  ],
  
  // Emission Calculation Settings
  emission: {
    defaultUnit: 't CO₂e',
    precision: 4,
    conversionFactor: 1000
  },
  
  // Features
  features: {
    //enableDebugMode: process.env.NODE_ENV === 'development',
    enableDebugMode: false,
    enableMaterialCalculator: true,
    enableKPICalculator: true,
    enableFileManagement: true,
    enableCharts: true
  }
};

export default config;