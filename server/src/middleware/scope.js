// // server/src/middleware/scope.js

// const applyBuScope = (req, res, next) => {
//   if (!req.user) {
//     return res.status(401).json({
//       success: false,
//       error: 'Authentication required for data access'
//     });
//   }

//   const { role, businessUnit } = req.user;

//   console.log('🔍 [Scope] User:', {
//     id: req.user.id,
//     role,
//     businessUnit
//   });

//   let allowedBUs = [];
//   let buScope = null; // null means "see all"

//   switch (role) {
//     case 'hq_admin':
//     case 'hq_manager':
//       // ✅ HQ can see everything - NO filtering
//       console.log('✅ [Scope] HQ user → Full access to all BUs');
//       allowedBUs = ['GTL', '4AL', 'SESL', 'HQ'];
//       buScope = null; // Important: null = no filter
//       break;

//     case 'bu_manager':
//     case 'bu_user':
//       // ✅ BU users can only see their own BU
//       if (!businessUnit || businessUnit === 'HQ') {
//         return res.status(403).json({
//           success: false,
//           error: 'No business unit assigned - cannot access data'
//         });
//       }
//       console.log(`✅ [Scope] BU user → Limited to ${businessUnit}`);
//       allowedBUs = [businessUnit];
//       buScope = businessUnit; // Set specific BU filter
//       break;

//     case 'pending':
//     case 'rejected':
//       return res.status(403).json({
//         success: false,
//         error: 'Account not approved'
//       });

//     default:
//       return res.status(403).json({
//         success: false,
//         error: 'Insufficient permissions for data access'
//       });
//   }

//   // ✅ Attach to request for use in controllers
//   req.allowedBusinessUnits = allowedBUs;
//   req.buScope = buScope; // Controllers check this
  
//   // ✅ Query filter helper
//   if (buScope) {
//     // BU user - filter to their BU only
//     req.buFilter = { businessUnit: buScope };
//   } else {
//     // HQ user - no filter (empty object = match all)
//     req.buFilter = {};
//   }

//   console.log('📋 [Scope] Applied:', {
//     allowedBUs,
//     buScope: buScope || 'ALL',
//     buFilter: req.buFilter
//   });

//   next();
// };

// const enforceBuOwnership = (req, res, next) => {
//   if (!req.user || !req.allowedBusinessUnits) {
//     return res.status(403).json({
//       success: false,
//       error: 'Data scoping not applied'
//     });
//   }

//   const { role, businessUnit } = req.user;

  
//   if (role === 'hq_admin' || role === 'hq_manager') {
//     console.log('✅ [Ownership] HQ user → Can modify any BU data');
//     return next();
//   }

  
//   const requestedBU = req.body?.businessUnit || req.params?.businessUnit;

//   if (requestedBU && !req.allowedBusinessUnits.includes(requestedBU)) {
//     console.log(`❌ [Ownership] User tried to access ${requestedBU}, but only allowed: ${req.allowedBusinessUnits.join(',')}`);
//     return res.status(403).json({
//       success: false,
//       error: `You are not allowed to operate on business unit: ${requestedBU}`
//     });
//   }

  
//   if (role.startsWith('bu_') && !req.body.businessUnit) {
//     req.body.businessUnit = businessUnit;
//     console.log(`✅ [Ownership] Auto-set businessUnit to ${businessUnit}`);
//   }

//   next();
// };

// module.exports = {
//   applyBuScope,
//   enforceBuOwnership
// };
// server/src/middleware/scope.js

const applyBuScope = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required for data access'
    });
  }

  const { role, businessUnit } = req.user;

  console.log('🔍 [Scope] User:', {
    id: req.user.id,
    role,
    businessUnit
  });

  let allowedBUs = [];
  let buScope = null; 

  switch (role) {
    case 'hq_admin':
    case 'hq_manager':
      console.log('✅ [Scope] HQ user → Full access to all BUs');
      allowedBUs = ['GTL', '4AL', 'SESL', 'HQ'];
      buScope = null;
      break;

    case 'bu_manager':
    case 'bu_user':
      if (!businessUnit || businessUnit === 'HQ') {
        return res.status(403).json({
          success: false,
          error: 'No business unit assigned - cannot access data'
        });
      }
      console.log(`✅ [Scope] BU user → Limited to ${businessUnit}`);
      allowedBUs = [businessUnit];
      buScope = businessUnit;
      break;

    case 'pending':
    case 'rejected':
      return res.status(403).json({
        success: false,
        error: 'Account not approved'
      });

    default:
      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions for data access'
      });
  }

  req.allowedBusinessUnits = allowedBUs;
  req.buScope = buScope;
  
  
  if (buScope) {
    req.buFilter = {
      $or: [
        { businessUnit: buScope },
        { businessUnit: { $exists: false } },
        { businessUnit: null }
      ]
    };
  } else {
    
    req.buFilter = {};
  }

  console.log('📋 [Scope] Applied:', {
    allowedBUs,
    buScope: buScope || 'ALL',
    buFilter: req.buFilter
  });

  next();
};

const enforceBuOwnership = (req, res, next) => {
  if (!req.user || !req.allowedBusinessUnits) {
    return res.status(403).json({
      success: false,
      error: 'Data scoping not applied'
    });
  }

  const { role, businessUnit } = req.user;

  if (role === 'hq_admin' || role === 'hq_manager') {
    console.log('✅ [Ownership] HQ user → Can modify any BU data');
    return next();
  }

  const requestedBU = req.body?.businessUnit || req.params?.businessUnit;

  if (requestedBU && !req.allowedBusinessUnits.includes(requestedBU)) {
    console.log(`❌ [Ownership] User tried to access ${requestedBU}, but only allowed: ${req.allowedBusinessUnits.join(',')}`);
    return res.status(403).json({
      success: false,
      error: `You are not allowed to operate on business unit: ${requestedBU}`
    });
  }

  if (role.startsWith('bu_') && !req.body.businessUnit) {
    req.body.businessUnit = businessUnit;
    console.log(`✅ [Ownership] Auto-set businessUnit to ${businessUnit}`);
  }

  next();
};

module.exports = {
  applyBuScope,
  enforceBuOwnership
};