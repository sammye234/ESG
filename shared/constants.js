// shared/constants.js

// API Base URLs
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Authentication
export const TOKEN_KEY = 'esg_auth_token';
export const REFRESH_TOKEN_KEY = 'esg_refresh_token';

// File Upload
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const ALLOWED_FILE_TYPES = ['.csv', 'text/csv', 'application/vnd.ms-excel'];

// Widget Grid Configuration
export const GRID_COLS = 12;
export const GRID_ROW_HEIGHT = 100;

// Emission Scopes
export const EMISSION_SCOPES = {
  SCOPE_1: 'scope1',
  SCOPE_2: 'scope2',
  SCOPE_3: 'scope3'
};

// Widget Colors
export const WIDGET_COLORS = [
  '#10B981', '#3B82F6', '#F59E0B', '#EF4444', 
  '#8B5CF6', '#EC4899', '#14B8A6', '#F97316',
  '#06B6D4', '#84CC16', '#F43F5E', '#A855F7',
  '#22C55E', '#6366F1', '#EAB308', '#DC2626',
  '#0EA5E9', '#65A30D', '#DB2777', '#7C3AED'
];

// KPI Formula Functions
export const KPI_FUNCTIONS = [
  'SUM', 'AVG', 'COUNT', 'MIN', 'MAX', 
  'STD', 'MEAN', 'MEDIAN', 'MODE'
];

// File Types
export const FILE_TYPES = {
  FILE: 'file',
  FOLDER: 'folder'
};

// User Roles
export const USER_ROLES = {
  USER: 'user',
  ADMIN: 'admin'
};

// Chart Types
export const CHART_TYPES = {
  BAR: 'bar',
  LINE: 'line',
  PIE: 'pie',
  SANKEY: 'sankey'
};

// Emission Units
export const EMISSION_UNITS = {
  TONNES: 't CO₂e',
  KG: 'kg CO₂e',
  G: 'g CO₂e'
};

// Status Messages
export const STATUS_MESSAGES = {
  SUCCESS: 'Operation completed successfully',
  ERROR: 'An error occurred',
  LOADING: 'Loading...',
  NO_DATA: 'No data available'
};

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100
};

// Date Formats
export const DATE_FORMATS = {
  DISPLAY: 'MM/DD/YYYY',
  API: 'YYYY-MM-DD',
  FULL: 'MMMM DD, YYYY HH:mm:ss'
};

module.exports = {
  API_BASE_URL,
  TOKEN_KEY,
  REFRESH_TOKEN_KEY,
  MAX_FILE_SIZE,
  ALLOWED_FILE_TYPES,
  GRID_COLS,
  GRID_ROW_HEIGHT,
  EMISSION_SCOPES,
  WIDGET_COLORS,
  KPI_FUNCTIONS,
  FILE_TYPES,
  USER_ROLES,
  CHART_TYPES,
  EMISSION_UNITS,
  STATUS_MESSAGES,
  PAGINATION,
  DATE_FORMATS
};