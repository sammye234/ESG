// server/src/utils/emissionFactors.js

// DAX Scope 1: (Solar_kWh * 0.05 + Diesel_L * 2.68 + GasBoiler_m3 * 2.02 + GasGen_m3 * 2.02) / 1000
// DAX Scope 2: REB_kWh * 0.62 / 1000
// DAX Scope 3: (waste_kg/1000 * 4.69 + ETP_m3 * 0.27 + food_kg/1000 * 8.91 + chem_kg * 0.0035) / 1000
// All intermediate values are in kgCO2e. Final /1000 converts to tCO2e.

'use strict';


exports.EMISSION_FACTORS = {

  // SCOPE 1 — Direct combustion (kgCO2e per unit)
  scope1: {
    solar: {
      ef:     0.05,
      unit:   'kgCO2e/kWh',
      source: 'Project-specific — on-site solar upstream lifecycle',
      note:   'Applied as: (solar_kwh / 1000) * 0.05 — converted to MWh first, result is tCO2e directly'
    },
    diesel: {
      ef:     2.68,
      unit:   'kgCO2e/litre',
      source: 'IPCC AR6 — gas oil / diesel oil'
    },
    gasBoiler: {
      ef:     2.02,           
      unit:   'kgCO2e/m3',
      source: 'IPCC — natural gas'
    },
    gasGenerator: {
      ef:     2.02,           
      unit:   'kgCO2e/m3',
      source: 'IPCC — natural gas'
    },
  },

  // SCOPE 2 — Purchased grid electricity (kgCO2e per kWh)
  scope2: {
    reb: {
      ef:     0.62,
      unit:   'kgCO2e/kWh',
      source: 'Bangladesh Power Development Board'
    },
  },

  // SCOPE 3 — Value chain
  scope3: {
    chemicals: {
      ef:     0.0035,        
      unit:   'kgCO2e/kg',
      source: 'Industry average — blended chemical EF',
      note:   'Applied to: dyes + auxiliary + basic combined kg total. ZDHC item count removed — not a weight unit.'
    },
    wastewater: {
      ef:     0.27,           
      unit:   'kgCO2e/m3',
      source: 'IPCC — wastewater treatment default',
      note:   'Applied to both ETP Inlet and ETP Outlet water volumes'
    },
  },

};


exports.WASTE_EF = {
  
  jhute:             { ef: 0.00469, unit: 'tCO2e/tonne', disposal: 'landfill' },
  padding:           { ef: 0.00469, unit: 'tCO2e/tonne', disposal: 'landfill' },
  leftover:          { ef: 0.00469, unit: 'tCO2e/tonne', disposal: 'landfill' },
  polyPlastic:       { ef: 0.00469, unit: 'tCO2e/tonne', disposal: 'landfill' },
  carton:            { ef: 0.00469, unit: 'tCO2e/tonne', disposal: 'landfill' },
  emptyCone:         { ef: 0.00469, unit: 'tCO2e/tonne', disposal: 'landfill' },
  patternBoard:      { ef: 0.00469, unit: 'tCO2e/tonne', disposal: 'landfill' },
  medicalWaste:      { ef: 0.00469, unit: 'tCO2e/tonne', disposal: 'landfill' },
  metal:             { ef: 0.00469, unit: 'tCO2e/tonne', disposal: 'landfill' },
  electricWaste:     { ef: 0.00469, unit: 'tCO2e/tonne', disposal: 'landfill' },
  paper:            { ef: 0.00469, unit: 'tCO2e/tonne', disposal: 'landfill' },
  emptyChemicalDrum: { ef: 0.00469, unit: 'tCO2e/tonne', disposal: 'landfill' },
  sludge:            { ef: 0.00469, unit: 'tCO2e/tonne', disposal: 'landfill' },


  foodWaste:         { ef: 0.00891, unit: 'tCO2e/tonne', disposal: 'landfill (biogenic methane)' },

  
};


exports.TRANSPORT_EF = {
  road: { ef: 0.062, unit: 'kgCO2e/tonne-km', source: 'GHG Protocol' },
  sea:  { ef: 0.016, unit: 'kgCO2e/tonne-km', source: 'GHG Protocol' },
  air:  { ef: 0.602, unit: 'kgCO2e/tonne-km', source: 'GHG Protocol' },
  rail: { ef: 0.028, unit: 'kgCO2e/tonne-km', source: 'GHG Protocol' },
};


exports.BUSINESS_TRAVEL_ROUTES = {
  dhaka_denmark:     { emissionPerTrip: 2.106, name: 'Dhaka <-> Denmark',     distanceKm: 7150 },
  dhaka_frankfurt:   { emissionPerTrip: 1.013, name: 'Dhaka <-> Frankfurt',   distanceKm: 6800 },
  dhaka_sweden:      { emissionPerTrip: 1.013, name: 'Dhaka <-> Sweden',      distanceKm: 7200 },
  dhaka_china:       { emissionPerTrip: 1.139, name: 'Dhaka <-> China',       distanceKm: 3200 },
  dhaka_netherlands: { emissionPerTrip: 1.035, name: 'Dhaka <-> Netherlands', distanceKm: 7100 },
  custom: {
    emissionPerKmInternational: 0.00011,
    emissionPerKmDomestic:      0.00015,
  },
};


exports.COMMUTING_EF = {
  public_bus: { ef: 0.100, unit: 'kgCO2e/km' },
  motor_bike: { ef: 0.080, unit: 'kgCO2e/km' },
  easy_bike:  { ef: 0.050, unit: 'kgCO2e/km' },
  micro_bus:  { ef: 0.240, unit: 'kgCO2e/km' },
  bicycle:    { ef: 0.000, unit: 'kgCO2e/km' },
  walking:    { ef: 0.000, unit: 'kgCO2e/km' },
};

// ---------------------------------------------------------------------------
// MATERIAL EMISSION FACTORS
// ---------------------------------------------------------------------------

exports.MATERIAL_EF = {
  'recycled polyester': 2.5,
  'recycled cotton':    3.5,
  'recycled nylon':     5.4,
  'organic cotton':     5.0,
  'polyester':          5.0,
  'fleece':             5.0,
  'bci cotton':         5.5,
  'cotton':             6.5,
  'viscose':            6.5,
  'woven':              6.5,
  'others':             6.5,
  'elastane':           8.0,
  'spandex':            8.0,
  'lyocell':            8.0,
  'linen':             10.0,
  'nylon':             10.0,
  'polyamide':         10.0,
  'rayon':             14.0,
  'wool':              20.0,
  'acrylic':           35.7,
  'modacrylic':        35.7,
};


exports.getMaterialEF = (materialName) => {
  if (!materialName) {
    return { name: 'others', ef: exports.MATERIAL_EF['others'], unit: 'tCO2e/tonne' };
  }
  const normalized = materialName.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();
  for (const [key, value] of Object.entries(exports.MATERIAL_EF)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return { name: key, ef: value, unit: 'tCO2e/tonne' };
    }
  }
  return { name: 'others', ef: exports.MATERIAL_EF['others'], unit: 'tCO2e/tonne' };
};

exports.calculateMaterialBlendEF = (materialMix) => {
  const materials = [];
  const regex = /(\d+(?:\.\d+)?)%\s*([a-zA-Z\s]+?)(?=\d+%|$)/gi;
  let match;
  while ((match = regex.exec(materialMix)) !== null) {
    materials.push({ percentage: parseFloat(match[1]), material: match[2].trim().toLowerCase() });
  }
  if (materials.length === 0) {
    return { success: false, error: 'Invalid format. Use: "50% Cotton 50% Polyester"' };
  }
  const totalPct = materials.reduce((sum, m) => sum + m.percentage, 0);
  if (Math.abs(totalPct - 100) > 0.1) {
    return { success: false, error: `Percentages must sum to 100%. Got: ${totalPct.toFixed(1)}%` };
  }
  let efSum = 0;
  const breakdown = materials.map(mat => {
    const { name, ef } = exports.getMaterialEF(mat.material);
    const contribution = (mat.percentage / 100) * ef;
    efSum += contribution;
    return { material: name, percentage: mat.percentage, ef, contribution };
  });
  return { success: true, ef: efSum, unit: 'tCO2e/tonne', breakdown };
};

exports.calculateFabricWeight = (lengthYard, widthInch, gsm) => {
  const weightKg = (lengthYard * widthInch * gsm) / 1550000;
  return {
    weightKg:    parseFloat(weightKg.toFixed(6)),
    weightTonne: parseFloat((weightKg / 1000).toFixed(9)),
  };
};