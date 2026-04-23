

// // // // server/src/routes/waste.js
// // // const express = require('express');
// // // const router = express.Router();
// // // const { protect } = require('../middleware/auth');

// // // const WasteController = require('../controllers/wasteController');

// // // // ✅ NEW FILE-BASED ROUTES (matching water/energy pattern)
// // // router.get('/files', protect, WasteController.getWasteFiles);
// // // router.post('/process/:fileId', protect, WasteController.processWasteFile);
// // // router.get('/metrics/:fileId', protect, WasteController.getMetrics);

// // // // ✅ LEGACY ROUTES (keep for backward compatibility if needed)
// // // router.get('/latest', protect, WasteController.getLatest);
// // // router.delete('/:id', protect, WasteController.deleteWasteData);
// // // router.put('/:id', protect, WasteController.updateWasteData);

// // // // Health check
// // // router.get('/health', (req, res) => res.json({ 
// // //   success: true, 
// // //   message: 'Waste routes OK', 
// // //   timestamp: new Date().toISOString() 
// // // }));

// // // module.exports = router;

// // // server/src/routes/waste.js
// // const express = require('express');
// // const router = express.Router();
// // const { protect } = require('../middleware/auth');
// // const WasteController = require('../controllers/wasteController');

// // // ✅ FILE-BASED ROUTES (Primary - matching water/energy pattern)
// // router.get('/files', protect, WasteController.getWasteFiles);
// // router.post('/process/:fileId', protect, WasteController.processWasteFile);
// // router.get('/metrics/:fileId', protect, WasteController.getMetrics);

// // // ✅ LEGACY ROUTES (keep for backward compatibility)
// // router.get('/latest', protect, WasteController.getLatest);
// // router.delete('/:id', protect, WasteController.deleteWasteData);
// // router.put('/:id', protect, WasteController.updateWasteData);

// // // Health check
// // router.get('/health', (req, res) => res.json({ 
// //   success: true, 
// //   message: 'Waste routes OK', 
// //   timestamp: new Date().toISOString() 
// // }));

// // module.exports = router;
// // server/src/routes/waste.js - With RBAC
// const express = require('express');
// const router = express.Router();
// const { 
//   protect, 
//   requireHQAccess, 
//   requireUploadPermission,
//   requireDeletePermission
// } = require('../middleware/auth');

// const WasteController = require('../controllers/wasteController');

// // ✅ Get accessible BUs for current user
// router.get('/accessible-bus', protect, WasteController.getAccessibleBUs);

// // ✅ File-based routes with RBAC
// router.get('/files', protect, WasteController.getWasteFiles);

// // ✅ Upload requires permission
// router.post('/process/:fileId', 
//   protect, 
//   requireUploadPermission, 
//   WasteController.processWasteFile
// );

// // ✅ Metrics - filtered by user's BU access
// router.get('/metrics/:fileId', protect, WasteController.getMetrics);

// // ✅ Legacy routes
// router.get('/latest', protect, WasteController.getLatest);

// // ✅ Delete requires permission
// router.delete('/:id', 
//   protect, 
//   requireDeletePermission, 
//   WasteController.deleteWasteData
// );

// router.put('/:id', 
//   protect, 
//   requireUploadPermission, 
//   WasteController.updateWasteData
// );

// // Health check
// router.get('/health', (req, res) => res.json({ 
//   success: true, 
//   message: 'Waste routes OK', 
//   timestamp: new Date().toISOString() 
// }));

// module.exports = router;
// server/src/routes/waste.js
const express = require('express');
const router = express.Router();
const WasteController = require('../controllers/wasteController');
const { protect, requireUploadPermission, requireDeletePermission } = require('../middleware/auth');
const { applyBuScope, enforceBuOwnership } = require('../middleware/scope');

router.use(protect);

// ── Read operations ── scoped
router.get('/files', applyBuScope, WasteController.getWasteFiles);
router.get('/metrics/:fileId', applyBuScope, WasteController.getMetrics);
router.get('/latest', applyBuScope, WasteController.getLatest);

// ── Write operations ── permission + scope
router.post(
  '/process/:fileId',
  requireUploadPermission,
  applyBuScope,
  enforceBuOwnership,
  WasteController.processWasteFile
);

router.delete(
  '/:id',
  requireDeletePermission,
  applyBuScope,
  enforceBuOwnership,
  WasteController.deleteWasteData
);

router.put(
  '/:id',
  requireUploadPermission,
  applyBuScope,
  enforceBuOwnership,
  WasteController.updateWasteData
);

// Health check (no auth needed)
router.get('/health', (req, res) => res.json({
  success: true,
  message: 'Waste routes OK',
  timestamp: new Date().toISOString()
}));

module.exports = router;