// server/src/middleware/validator.js
const { body, validationResult } = require('express-validator');

// Validation middleware
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      error: 'Validation failed', 
      errors: errors.array() 
    });
  }
  next();
};

// User registration validation
const validateRegistration = [
  body('username')
    .trim()
    .isLength({ min: 3 })
    .withMessage('Username must be at least 3 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Invalid email address'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]/)
    .withMessage('Password must contain uppercase, lowercase, number, and special character'),
  validate
];

// Login validation
const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Invalid email address'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  validate
];

// File creation validation
const validateFileCreation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('File name is required')
    .isLength({ max: 255 })
    .withMessage('File name too long'),
  body('type')
    .isIn(['file', 'folder'])
    .withMessage('Type must be either file or folder'),
  validate
];

// Widget creation validation
const validateWidgetCreation = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Widget title is required'),
  body('unit')
    .trim()
    .notEmpty()
    .withMessage('Unit is required'),
  body('color')
    .matches(/^#[0-9A-F]{6}$/i)
    .withMessage('Invalid color format (use hex like #FF0000)'),
  validate
];

// KPI creation validation
const validateKPICreation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('KPI name is required'),
  body('formula')
    .trim()
    .notEmpty()
    .withMessage('Formula is required'),
  validate
];

// Password change validation
const validatePasswordChange = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('New password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]/)
    .withMessage('Password must contain uppercase, lowercase, number, and special character'),
  validate
];

module.exports = {
  validate,
  validateRegistration,
  validateLogin,
  validateFileCreation,
  validateWidgetCreation,
  validateKPICreation,
  validatePasswordChange
};