// server/src/middleware/wasteValidator.js
const { body, param, query, validationResult } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array().map(err => ({
        field: err.param,
        message: err.msg
      }))
    });
  }
  next();
};

const validateFileUpload = [
  (req, res, next) => {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const allowedTypes = [
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];
    
    if (!allowedTypes.includes(req.file.mimetype)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid file type. Only CSV and Excel files are allowed'
      });
    }
    
    const maxSize = 10 * 1024 * 1024;
    if (req.file.size > maxSize) {
      return res.status(400).json({
        success: false,
        message: 'File too large. Maximum size is 10MB'
      });
    }
    
    next();
  }
];

const validateWasteData = [
  body('companyType')
    .isIn(['Type-1 w/o Liquid waste', 'Type-2 with Liquid waste'])
    .withMessage('Company type must be either Type-1 or Type-2'),
  
  body('month')
    .isIn(['January', 'February', 'March', 'April', 'May', 'June', 
           'July', 'August', 'September', 'October', 'November', 'December'])
    .withMessage('Invalid month name'),
  
  body('year')
    .isInt({ min: 2020, max: 2100 })
    .withMessage('Year must be between 2020 and 2100'),
  
  handleValidationErrors
];

const validateQueryParams = [
  query('companyType')
    .optional()
    .isIn(['Type-1 w/o Liquid waste', 'Type-2 with Liquid waste'])
    .withMessage('Company type must be either Type-1 or Type-2'),
  
  query('year')
    .optional()
    .isInt({ min: 2020, max: 2100 })
    .withMessage('Year must be between 2020 and 2100'),
  
  handleValidationErrors
];

module.exports = {
  validateFileUpload,
  validateWasteData,
  validateQueryParams,
  handleValidationErrors
};