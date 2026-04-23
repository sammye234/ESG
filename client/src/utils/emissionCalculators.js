// client/src/utils/emissionCalculators.js

// DAX Scope 1: (Solar_kWh*0.05 + Diesel_L*2.68 + GasBoiler_m3*2.02 + GasGen_m3*2.02) / 1000
// DAX Scope 2: REB_kWh * 0.62 / 1000
// DAX Scope 3: (waste_kg/1000*4.69 + ETP_m3*0.27 + food_kg/1000*8.91 + chem_kg*0.0035) / 1000


const EMISSION_FACTORS = {
  scope1: {
    // tCO2e/kWh = 0.05 kgCO2e/kWh / 1000
    solar:        0.00005,
    // tCO2e/L = 2.68 kgCO2e/L / 1000 
    diesel:       0.00268,
    // tCO2e/m3 = 2.02 kgCO2e/m3 / 1000 
    gasBoiler:    0.00202,
    gasGenerator: 0.00202,
  },
  scope2: {
    // tCO2e/kWh = 0.62 kgCO2e/kWh / 1000
    reb: 0.00062,
  },
  scope3: {
    // Solid waste: tCO2e/tonne = 4.69 kgCO2e/tonne / 1000
    // Applied as: (kg / 1000) * ef = tCO2e
    jhute:             0.00469,
    padding:           0.00469,
    leftover:          0.00469,
    polyPlastic:       0.00469,
    carton:            0.00469,
    paper:             0.00469,
    emptyCone:         0.00469,
    patternBoard:      0.00469,
    medicalWaste:      0.00469,
    metal:             0.00469,
    electricWaste:     0.00469,
    emptyChemicalDrum: 0.00469,
    sludge:            0.00469,

    // Food waste: tCO2e/tonne = 8.91 kgCO2e/tonne / 1000
    foodWaste: 0.00891,

    // ETP water: tCO2e/m3 = 0.27 kgCO2e/m3 / 1000 — both inlet and outlet
    etpWater: 0.00027,

    // Chemicals: tCO2e/tonne = 0.0035 kgCO2e/kg → per tonne = 0.0035 tCO2e/tonne
    // Applied as: (kg / 1000) * ef = tCO2e
    dyes:              0.0035,
    auxiliaryChemical: 0.0035,
    basicChemical:     0.0035,
   
  },
};

const getVal = (row, exactName, ...alternates) => {
  if (row[exactName] !== undefined && row[exactName] !== null && row[exactName] !== '') {
    const val = parseFloat(row[exactName]);
    return !isNaN(val) ? val : 0;
  }
  for (const alt of alternates) {
    if (row[alt] !== undefined && row[alt] !== null && row[alt] !== '') {
      const val = parseFloat(row[alt]);
      return !isNaN(val) ? val : 0;
    }
  }
  return 0;
};

// ---------------------------------------------------------------------------
// SCOPE 1 — DAX: (Solar*0.05 + Diesel*2.68 + GasBoiler*2.02 + GasGen*2.02) / 1000
// EFs stored in tCO2e/unit so no extra /1000 needed here
// ---------------------------------------------------------------------------
const calcScope1 = (row) => {
  const solar     = getVal(row, 'Solar (KWh)',       'Solar',       'solar');
  const diesel    = getVal(row, 'Diesel (Ltr)',      'Diesel',      'diesel');
  const gasBoiler = getVal(row, 'GasBoiler (m3)',    'GasBoiler',   'Gas Boiler');
  const gasGen    = getVal(row, 'GasGenerator (m3)', 'GasGenerator','Gas Generator');

  return (
    (solar     * EMISSION_FACTORS.scope1.solar) +
    (diesel    * EMISSION_FACTORS.scope1.diesel) +
    (gasBoiler * EMISSION_FACTORS.scope1.gasBoiler) +
    (gasGen    * EMISSION_FACTORS.scope1.gasGenerator)
  ); // tCO2e
};

// ---------------------------------------------------------------------------
// SCOPE 2 — DAX: REB_kWh * 0.62 / 1000
// ---------------------------------------------------------------------------
const calcScope2 = (row) => {
  const reb = getVal(row, 'REB (KWh)', 'REB', 'reb');
  return reb * EMISSION_FACTORS.scope2.reb; // tCO2e
};

// ---------------------------------------------------------------------------
// SCOPE 3 — DAX: (waste/1000*4.69 + ETP*0.27 + food/1000*8.91 + chem*0.0035) / 1000
// All waste/chemical EFs stored in tCO2e/tonne — applied as (kg/1000) * ef
// ETP stored as tCO2e/m3 — applied directly as m3 * ef
// ---------------------------------------------------------------------------
const calcScope3 = (row) => {
  let total = 0;

  // Solid waste — (kg / 1000) * ef (tCO2e/tonne) = tCO2e
  const jhute    = getVal(row, 'Jhute (Kg)',               'Jhute')        / 1000;
  const padding  = getVal(row, 'Padding (Kg)',             'Padding')      / 1000;
  const leftover = getVal(row, 'Leftover (Kg)',            'Leftover')     / 1000;
  const plastic  = getVal(row, 'Poly/Plastic (Kg)',        'Poly/Plastic') / 1000;
  const carton   = getVal(row, 'Carton (Kg)',              'Carton')       / 1000;
  const paper    = getVal(row, 'Paper (Kg)',               'Paper')        / 1000;
  const cone     = getVal(row, 'Empty Cone (Kg)',          'Empty Cone')   / 1000;
  const board    = getVal(row, 'Pattern Board (Kg)',       'Pattern Board')/ 1000;
  const medical  = getVal(row, 'Medical Waste (Kg)',       'Medical Waste')/ 1000;
  const metal    = getVal(row, 'Metal (Kg)',               'Metal')        / 1000;
  const electric = getVal(row, 'Electric Waste(Kg)',       'Electric Waste')/ 1000;
  const drum     = getVal(row, 'Empty Chemical Drum (Kg)', 'Empty Chemical Drum') / 1000;
  const sludge   = getVal(row, 'Sludge (Kg)',              'Sludge')       / 1000;

  total += jhute   * EMISSION_FACTORS.scope3.jhute;
  total += padding * EMISSION_FACTORS.scope3.padding;
  total += leftover * EMISSION_FACTORS.scope3.leftover;
  total += plastic * EMISSION_FACTORS.scope3.polyPlastic;
  total += carton  * EMISSION_FACTORS.scope3.carton;
  total += paper   * EMISSION_FACTORS.scope3.paper;
  total += cone    * EMISSION_FACTORS.scope3.emptyCone;
  total += board   * EMISSION_FACTORS.scope3.patternBoard;
  total += medical * EMISSION_FACTORS.scope3.medicalWaste;
  total += metal   * EMISSION_FACTORS.scope3.metal;
  total += electric * EMISSION_FACTORS.scope3.electricWaste;
  total += drum    * EMISSION_FACTORS.scope3.emptyChemicalDrum;
  total += sludge  * EMISSION_FACTORS.scope3.sludge;

  // Food waste — (kg / 1000) * ef (tCO2e/tonne) = tCO2e
  const food = getVal(row, 'Food Waste (Kg)', 'Food Waste') / 1000;
  total += food * EMISSION_FACTORS.scope3.foodWaste;

  // ETP water — m3 * ef (tCO2e/m3) = tCO2e — both inlet and outlet per DAX
  const etpInlet  = getVal(row, 'ETP Inlet Water (m3)',  'ETP Inlet Water');
  const etpOutlet = getVal(row, 'ETP Outlet Water (m3)', 'ETP Outlet Water');
  total += (etpInlet + etpOutlet) * EMISSION_FACTORS.scope3.etpWater;

  // Chemicals — (kg / 1000) * ef (tCO2e/tonne) = tCO2e
  const dyes  = getVal(row, 'Dyes Consumption (Kg)',             'Dyes Consumption') / 1000;
  const aux   = getVal(row, 'Auxilary Chemical Consumption (Kg)','Auxilary Chemical') / 1000;
  const basic = getVal(row, 'Basic Chemical Consumption (Kg)',   'Basic Chemical')   / 1000;

  total += dyes  * EMISSION_FACTORS.scope3.dyes;
  total += aux   * EMISSION_FACTORS.scope3.auxiliaryChemical;
  total += basic * EMISSION_FACTORS.scope3.basicChemical;

  return total; // tCO2e
};

export const calculateEmissionsFromCSV = (data) => {
  if (!data || data.length === 0) {
    return {
      scope1: 0, scope2: 0, scope3: 0, total: 0,
      unit: 'tCO2e',
      breakdown: { scope1: [], scope2: [], scope3: [] },
    };
  }

  let totalScope1 = 0;
  let totalScope2 = 0;
  let totalScope3 = 0;

  data.forEach(row => {
    totalScope1 += calcScope1(row);
    totalScope2 += calcScope2(row);
    totalScope3 += calcScope3(row);
  });

  const total = totalScope1 + totalScope2 + totalScope3;

  console.log('📊 ✅ Emissions Calculated:', {
    scope1: totalScope1.toFixed(4) + ' tCO2e',
    scope2: totalScope2.toFixed(4) + ' tCO2e',
    scope3: totalScope3.toFixed(4) + ' tCO2e',
    total:  total.toFixed(4)       + ' tCO2e',
  });

  return {
    scope1: totalScope1,
    scope2: totalScope2,
    scope3: totalScope3,
    total,
    unit: 'tCO2e',
    breakdown: { scope1: [], scope2: [], scope3: [] },
  };
};

export const calculateIntensityForRow = (row) => {
  const scope1 = calcScope1(row);
  const scope2 = calcScope2(row);
  const scope3 = calcScope3(row);
  const totalEmissions = scope1 + scope2 + scope3;

  let production = getVal(row, 'ProductionWeight (Kg)', 'Production Weight', 'Weight');
  let unit = 'kg';

  if (production === 0) {
    production = getVal(row, 'Production (Pcs)', 'Production', 'Pcs');
    unit = 'pcs';
  }
  if (production === 0) {
    production = getVal(row, 'ProductionCost (USD)', 'Production Cost', 'Cost');
    unit = 'USD';
  }

  const intensity = production > 0 ? totalEmissions / production : 0;
  return { totalEmissions, production, unit, intensity };
};

export const calculateCarbonEmissions = (data) => {
  const result = calculateEmissionsFromCSV(data);
  return { scope1: result.scope1, scope2: result.scope2, scope3: result.scope3, total: result.total };
};

export const calculateEmissionsWithUnit = (data, forceUnit = 'auto') => {
  const result = calculateEmissionsFromCSV(data);

  if (forceUnit === 'kg') {
    return {
      ...result,
      scope1: result.scope1 * 1000,
      scope2: result.scope2 * 1000,
      scope3: result.scope3 * 1000,
      total:  result.total  * 1000,
      unit:   'kgCO2e',
    };
  }

  return result;
};

export const calculateEmissions = calculateEmissionsFromCSV;

const emissionCalculators = {
  calculateEmissions,
  calculateCarbonEmissions,
  calculateEmissionsFromCSV,
  calculateEmissionsWithUnit,
  calculateIntensityForRow,
  EMISSION_FACTORS,
};

export default emissionCalculators;