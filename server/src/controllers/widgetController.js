// server/src/controllers/widgetController.js
const Widget = require('../models/Widget');

/**
 * Get all widgets for the current user
 */
exports.getWidgets = async (req, res, next) => {
  try {
    const widgets = await Widget.find({ userId: req.user.id })
      .sort({ y: 1, x: 1 });

    res.status(200).json({
      success: true,
      count: widgets.length,
      widgets
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get a single widget by ID
 */
exports.getWidgetById = async (req, res, next) => {
  try {
    const widget = await Widget.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!widget) {
      return res.status(404).json({
        success: false,
        message: 'Widget not found'
      });
    }

    res.status(200).json({
      success: true,
      widget
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new widget
 */
exports.createWidget = async (req, res, next) => {
  try {
    const { i, title, value, unit, color, x, y, w, h } = req.body;

    const widget = await Widget.create({
      i,
      title,
      value,
      unit,
      color,
      x,
      y,
      w,
      h,
      userId: req.user.id
    });

    res.status(201).json({
      success: true,
      message: 'Widget created successfully',
      widget
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update widget
 */
exports.updateWidget = async (req, res, next) => {
  try {
    const { title, value, unit, color, x, y, w, h } = req.body;

    const widget = await Widget.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { title, value, unit, color, x, y, w, h },
      { new: true, runValidators: true }
    );

    if (!widget) {
      return res.status(404).json({
        success: false,
        message: 'Widget not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Widget updated successfully',
      widget
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete widget
 */
exports.deleteWidget = async (req, res, next) => {
  try {
    const widget = await Widget.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!widget) {
      return res.status(404).json({
        success: false,
        message: 'Widget not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Widget deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update widget layout (batch update positions)
 */
exports.updateLayout = async (req, res, next) => {
  try {
    const { layout } = req.body;

    if (!Array.isArray(layout)) {
      return res.status(400).json({
        success: false,
        message: 'Layout must be an array'
      });
    }

    // Update each widget's position
    const updatePromises = layout.map(item => 
      Widget.findOneAndUpdate(
        { i: item.i, userId: req.user.id },
        { x: item.x, y: item.y, w: item.w, h: item.h },
        { new: true }
      )
    );

    const updatedWidgets = await Promise.all(updatePromises);

    res.status(200).json({
      success: true,
      message: 'Layout updated successfully',
      widgets: updatedWidgets.filter(w => w !== null)
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Reset widgets to default
 */
exports.resetWidgets = async (req, res, next) => {
  try {
    // Delete all user's widgets
    await Widget.deleteMany({ userId: req.user.id });

    // Create default widgets
    const defaultWidgets = [
      { i: 'scope1', x: 0, y: 0, w: 3, h: 2, title: 'Scope 1 Emissions', value: 0, unit: 't CO₂e', color: '#EF4444' },
      { i: 'scope2', x: 3, y: 0, w: 3, h: 2, title: 'Scope 2 Emissions', value: 0, unit: 't CO₂e', color: '#3B82F6' },
      { i: 'scope3', x: 6, y: 0, w: 3, h: 2, title: 'Scope 3 Emissions', value: 0, unit: 't CO₂e', color: '#10B981' },
      { i: 'total', x: 9, y: 0, w: 3, h: 2, title: 'Total Emissions', value: 0, unit: 't CO₂e', color: '#8B5CF6' },
     // { i: 'carbon-scope1', x: 0, y: 2, w: 3, h: 2, title: 'Carbon Scope 1', value: 0, unit: 't CO₂e', color: '#DC2626' },
     // { i: 'carbon-scope2', x: 3, y: 2, w: 3, h: 2, title: 'Carbon Scope 2', value: 0, unit: 't CO₂e', color: '#2563EB' },
     // { i: 'carbon-scope3', x: 6, y: 2, w: 3, h: 2, title: 'Carbon Scope 3', value: 0, unit: 't CO₂e', color: '#059669' },
     // { i: 'carbon-total', x: 9, y: 2, w: 3, h: 2, title: 'Total Carbon', value: 0, unit: 't CO₂e', color: '#7C3AED' }
    ];

    const widgets = await Widget.insertMany(
      defaultWidgets.map(w => ({ ...w, userId: req.user.id }))
    );

    res.status(200).json({
      success: true,
      message: 'Widgets reset to default',
      widgets
    });
  } catch (error) {
    next(error);
  }
};