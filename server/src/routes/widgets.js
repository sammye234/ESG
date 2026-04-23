// server/src/routes/widgets.js
const express = require('express');
const router = express.Router();
const {
  getWidgets,
  getWidgetById,
  createWidget,
  updateWidget,
  deleteWidget,
  updateLayout,
  resetWidgets
} = require('../controllers/widgetController');
const { protect } = require('../middleware/auth');

// All routes are protected
router.use(protect);

// Get all widgets & Create widget
router.route('/')
  .get(getWidgets)
  .post(createWidget);

// Update widget layout (batch update)
router.put('/layout', updateLayout);

// Reset widgets to default
router.post('/reset', resetWidgets);

// Widget operations by ID
router.route('/:id')
  .get(getWidgetById)
  .put(updateWidget)
  .delete(deleteWidget);

module.exports = router;