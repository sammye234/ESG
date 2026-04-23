
// server/src/routes/energyRoutes.js
const express = require('express');
const router = express.Router();
const EnergyController = require('../controllers/energyController');
const { protect, requireUploadPermission } = require('../middleware/auth');
const { applyBuScope, enforceBuOwnership } = require('../middleware/scope');

router.use(protect); // All energy routes require login

// ── Read operations ── filtered by BU
router.get('/files', applyBuScope, EnergyController.getEnergyFiles);
router.get('/metrics/:fileId', applyBuScope, EnergyController.getMetrics);
router.get('/dashboard-summary', applyBuScope, EnergyController.getDashboardSummary);
router.get('/trends/:fileId', applyBuScope, EnergyController.getTrendAnalysis);
router.get('/recommendations/:fileId', applyBuScope, EnergyController.getRecommendations);

// ── Comparison & export ── also scoped
router.post('/compare', applyBuScope, EnergyController.compareDatasets);
router.get('/export/:fileId', applyBuScope, EnergyController.exportData);

// ── Process file ── requires upload permission + ownership enforcement
router.post(
  '/process/:fileId',
  requireUploadPermission,
  applyBuScope,
  enforceBuOwnership,
  EnergyController.processEnergyFile
);

module.exports = router;