// // server/src/routes/kpi.js
// const express = require('express');
// const router = express.Router();
// const {
//   getKPIs,
//   getKPIById,
//   createKPI,
//   updateKPI,
//   deleteKPI,
//   calculateKPI
// } = require('../controllers/kpiController');
// const { protect } = require('../middleware/auth');


// router.use(protect);

// router.route('/')
//   .get(getKPIs)
//   .post(createKPI);

// router.post('/calculate', calculateKPI);

// router.route('/:id')
//   .get(getKPIById)
//   .put(updateKPI)
//   .delete(deleteKPI);

// module.exports = router;
// server/src/routes/kpi.js
const express = require('express');
const router = express.Router();
const {
  getKPIs,
  getKPIById,
  createKPI,
  updateKPI,
  deleteKPI,
  calculateKPI
} = require('../controllers/kpiController');
const { protect, requireUploadPermission } = require('../middleware/auth');
const { applyBuScope, enforceBuOwnership } = require('../middleware/scope');

router.use(protect);

// ── KPI listing & calculation ── scoped
router.get('/', applyBuScope, getKPIs);
router.post('/calculate', applyBuScope, calculateKPI);

// ── Create / modify ── needs write permission
router.post('/', requireUploadPermission, applyBuScope, enforceBuOwnership, createKPI);

router.route('/:id')
  .get(applyBuScope, getKPIById)
  .put(requireUploadPermission, applyBuScope, enforceBuOwnership, updateKPI)
  .delete(requireUploadPermission, applyBuScope, enforceBuOwnership, deleteKPI);

module.exports = router;AbortController