// shared/types.js

/**
 * Type definitions for TypeScript-like documentation
 * Can be used with JSDoc for better IDE support
 */

/**
 * @typedef {Object} User
 * @property {string} id - User ID
 * @property {string} username - Username
 * @property {string} email - Email address
 * @property {string} role - User role (user/admin)
 * @property {Date} createdAt - Creation date
 * @property {Date} updatedAt - Last update date
 */

/**
 * @typedef {Object} File
 * @property {string} id - File ID
 * @property {string} name - File name
 * @property {string} type - File type (file/folder)
 * @property {string|null} parentId - Parent folder ID
 * @property {string} userId - Owner user ID
 * @property {Array<Array>} data - CSV data (array of arrays)
 * @property {Array<string>} children - Child file IDs
 * @property {string} filePath - Physical file path
 * @property {number} fileSize - File size in bytes
 * @property {string} mimeType - MIME type
 * @property {Date} createdAt - Creation date
 * @property {Date} updatedAt - Last update date
 */

/**
 * @typedef {Object} Widget
 * @property {string} id - Widget database ID
 * @property {string} i - Widget identifier for grid
 * @property {string} title - Widget title
 * @property {number|string} value - Widget value
 * @property {string} unit - Unit of measurement
 * @property {string} color - Hex color code
 * @property {number} x - Grid X position
 * @property {number} y - Grid Y position
 * @property {number} w - Grid width
 * @property {number} h - Grid height
 * @property {string} userId - Owner user ID
 * @property {Date} createdAt - Creation date
 * @property {Date} updatedAt - Last update date
 */

/**
 * @typedef {Object} KPI
 * @property {string} id - KPI ID
 * @property {string} name - KPI name
 * @property {string} formula - Calculation formula
 * @property {number} result - Calculated result
 * @property {string} date - Date string
 * @property {Array<string>} fileIds - Associated file IDs
 * @property {Object} customValues - Custom variable values
 * @property {string} userId - Owner user ID
 * @property {Date} createdAt - Creation date
 * @property {Date} updatedAt - Last update date
 */

/**
 * @typedef {Object} EmissionData
 * @property {number} scope1 - Scope 1 emissions
 * @property {number} scope2 - Scope 2 emissions
 * @property {number} scope3 - Scope 3 emissions
 * @property {number} total - Total emissions
 */

/**
 * @typedef {Object} WaterData
 * @property {number} ground - Ground water
 * @property {number} rainwater - Rainwater
 * @property {number} recycled - Recycled water
 * @property {number} factoryProduction - Factory production usage
 * @property {number} domesticUse - Domestic use
 * @property {number} utilityUse - Utility use
 * @property {number} processLoss - Process loss
 * @property {number} effluent - Effluent discharge
 */

/**
 * @typedef {Object} MaterialEF
 * @property {string} material - Material name
 * @property {number} percentage - Percentage in mix
 * @property {number} ef - Emission factor
 * @property {number} contribution - Contribution to total
 */

/**
 * @typedef {Object} ChartData
 * @property {string} name - Data point name
 * @property {number} value - Data point value
 * @property {string} [color] - Optional color
 */

/**
 * @typedef {Object} APIResponse
 * @property {boolean} success - Success status
 * @property {string} [message] - Response message
 * @property {any} [data] - Response data
 * @property {string} [error] - Error message
 */

/**
 * @typedef {Object} PaginationParams
 * @property {number} page - Page number
 * @property {number} limit - Items per page
 * @property {string} [sortBy] - Sort field
 * @property {string} [sortOrder] - Sort order (asc/desc)
 */

/**
 * @typedef {Object} AuthTokens
 * @property {string} token - Access token
 * @property {string} [refreshToken] - Refresh token
 */

/**
 * @typedef {Object} LoginCredentials
 * @property {string} email - User email
 * @property {string} password - User password
 */

/**
 * @typedef {Object} RegisterData
 * @property {string} username - Username
 * @property {string} email - Email address
 * @property {string} password - Password
 */

/**
 * @typedef {Object} GridLayout
 * @property {string} i - Widget ID
 * @property {number} x - X position
 * @property {number} y - Y position
 * @property {number} w - Width
 * @property {number} h - Height
 */

// Export empty object for CommonJS compatibility
module.exports = {};