// server/src/routes/emissionsRoutes.js
const express = require('express');
const router = express.Router();
const EmissionsController = require('../controllers/emissionsController');
const { protect, requireUploadPermission } = require('../middleware/auth');
const { applyBuScope, enforceBuOwnership } = require('../middleware/scope');
router.use((req, res, next) => {
  console.log('🌍 [EmissionsRoutes] Incoming request:', req.method, req.path);
  console.log('🌍 [EmissionsRoutes] Full URL:', req.originalUrl);
  console.log('🌍 [EmissionsRoutes] Has Auth Header?', !!req.headers.authorization);
  next();
});

router.use(protect); 

router.get('/files', applyBuScope, EmissionsController.getEmissionsFiles);
router.get('/metrics/:fileId', applyBuScope, EmissionsController.getMetrics);
router.get('/dashboard-summary', applyBuScope, EmissionsController.getDashboardSummary);
router.get('/trends/:fileId', applyBuScope, EmissionsController.getTrendAnalysis);
router.get('/recommendations/:fileId', applyBuScope, EmissionsController.getRecommendations);

router.post('/compare', applyBuScope, EmissionsController.compareDatasets);
router.get('/export/:fileId', applyBuScope, EmissionsController.exportData);

router.post(
  '/process/:fileId',
  requireUploadPermission,
  applyBuScope,
  enforceBuOwnership,
  EmissionsController.processEmissionsFile
);

module.exports = router;