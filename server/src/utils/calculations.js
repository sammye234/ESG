// server/src/utils/calculations.js
// DAX Scope 1: (Solar_kWh*0.05 + Diesel_L*2.68 + GasBoiler_m3*2.02 + GasGen_m3*2.02) / 1000
// DAX Scope 2: REB_kWh * 0.62 / 1000
// DAX Scope 3: (waste_kg/1000*4.69 + ETP_m3*0.27 + food_kg/1000*8.91 + chem_kg*0.0035) / 1000


'use strict';

const { EMISSION_FACTORS, WASTE_EF } = require('./emissionFactors');


const toNum = (value) => {
  if (value === null || value === undefined || value === '') return 0;
  const cleaned = String(value).replace(/,/g, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
};

const round = (value, decimals = 6) =>
  parseFloat(value.toFixed(decimals));


exports.calculateScope1 = (row) => {
  const solar        = toNum(row['Solar (KWh)']);
  const diesel       = toNum(row['Diesel (Ltr)']);
  const gasBoiler    = toNum(row['GasBoiler (m3)']);
  const gasGenerator = toNum(row['GasGenerator (m3)']);

  // DAX: (solar*0.05 + diesel*2.68 + gasBoiler*2.02 + gasGen*2.02) / 1000
  // All EFs in kgCO2e/unit → /1000 = tCO2e
  const solarMWh    = solar / 1000;
  const solarEm     = solarMWh    * EMISSION_FACTORS.scope1.solar.ef;          // tCO2e (MWh * tCO2e/MWh)
  const dieselEm    = (diesel       * EMISSION_FACTORS.scope1.diesel.ef)       / 1000; // tCO2e
  const gasBoilerEm = (gasBoiler    * EMISSION_FACTORS.scope1.gasBoiler.ef)    / 1000; // tCO2e
  const gasGenEm    = (gasGenerator * EMISSION_FACTORS.scope1.gasGenerator.ef) / 1000; // tCO2e

  const total = solarEm + dieselEm + gasBoilerEm + gasGenEm;

  return {
    solar:        round(solarEm),
    diesel:       round(dieselEm),
    gasBoiler:    round(gasBoilerEm),
    gasGenerator: round(gasGenEm),
    total:        round(total),
    breakdown: [
      { name: 'Solar',          value: round(solarEm) },
      { name: 'Diesel',         value: round(dieselEm) },
      { name: 'Gas Boiler',     value: round(gasBoilerEm) },
      { name: 'Gas Generator',  value: round(gasGenEm) },
    ],
  };
};


exports.calculateScope2 = (row) => {
  const reb = toNum(row['REB (KWh)']);

  // DAX: REB_kWh * 0.62 / 1000 = tCO2e
  const rebEm = (reb * EMISSION_FACTORS.scope2.reb.ef) / 1000;

  return {
    reb:   round(rebEm),
    total: round(rebEm),
    breakdown: [
      { name: 'REB / Grid', value: round(rebEm) },
    ],
  };
};


exports.calculateScope3Chemicals = (row) => {
  // DAX: (Basic_kg + Dyes_kg + Auxilary_kg) * 0.0035 / 1000 = tCO2e

  const dyes      = toNum(row['Dyes Consumption (Kg)']);
  const auxiliary = toNum(row['Auxilary Chemical Consumption (Kg)']);
  const basic     = toNum(row['Basic Chemical Consumption (Kg)']);

  const totalChemicalKg = dyes + auxiliary + basic;
  const emissions = (totalChemicalKg * EMISSION_FACTORS.scope3.chemicals.ef) / 1000; // tCO2e

  return {
    dyes, auxiliary, basic,
    totalKg: round(totalChemicalKg),
    total:   round(emissions),
  };
};


exports.calculateScope3Waste = (row) => {
  // DAX: all items (kg / 1000) * 4.69 / 1000 = tCO2e
  // WASTE_EF stores 0.00469 (= 4.69/1000) tCO2e/tonne
  // Formula: (kg / 1000) * ef = tCO2e

  const wasteInputs = {
    jhute:             toNum(row['Jhute (Kg)']),
    padding:           toNum(row['Padding (Kg)']),
    leftover:          toNum(row['Leftover (Kg)']),
    polyPlastic:       toNum(row['Poly/Plastic (Kg)']),
    carton:            toNum(row['Carton (Kg)']),
    paper:            toNum(row['Paper(Kg)']),
    emptyCone:         toNum(row['Empty Cone (Kg)']),
    patternBoard:      toNum(row['Pattern Board (Kg)']),
    medicalWaste:      toNum(row['Medical Waste (Kg)']),
    metal:             toNum(row['Metal (Kg)']),
    electricWaste:     toNum(row['Electric Waste(Kg)']),
    emptyChemicalDrum: toNum(row['Empty Chemical Drum (Kg)']),
    sludge:            toNum(row['Sludge (Kg)']),
    foodWaste:         toNum(row['Food Waste (Kg)']),
  };

  const emissions = {};
  const breakdown = [];
  let total = 0;

  Object.entries(wasteInputs).forEach(([type, kg]) => {
    const ef    = WASTE_EF[type]?.ef ?? 0;
    const tCO2e = (kg / 1000) * ef; // tCO2e/tonne * tonnes = tCO2e
    emissions[type] = round(tCO2e);
    total += tCO2e;
    if (tCO2e > 0) {
      breakdown.push({ name: type, value: round(tCO2e) });
    }
  });

  return { ...emissions, total: round(total), breakdown };
};


exports.calculateScope3Wastewater = (row) => {
  // DAX: (ETP_Inlet_m3 + ETP_Outlet_m3) * 0.27 / 1000 = tCO2e
  const etpInlet  = toNum(row['ETP Inlet Water (m3)']);
  const etpOutlet = toNum(row['ETP Outlet Water (m3)']);
  const total = ((etpInlet + etpOutlet) * EMISSION_FACTORS.scope3.wastewater.ef) / 1000;

  return {
    etpInletM3:  etpInlet,
    etpOutletM3: etpOutlet,
    total:       round(total),
  };
};


exports.calculateScope3 = (row) => {
  const chemicals  = exports.calculateScope3Chemicals(row);
  const waste      = exports.calculateScope3Waste(row);
  const wastewater = exports.calculateScope3Wastewater(row);

  const total = chemicals.total + waste.total + wastewater.total;

  const breakdown = [
    { name: 'Chemicals / Dyes', value: chemicals.total },
    ...waste.breakdown,
    ...(wastewater.total > 0 ? [{ name: 'Wastewater (ETP)', value: wastewater.total }] : []),
  ].filter(b => b.value > 0);

  return {
    chemicals,
    waste,
    wastewater,
    total:     round(total),
    breakdown,
  };
};


exports.calculateRowEmissions = (row) => {
  const scope1 = exports.calculateScope1(row);
  const scope2 = exports.calculateScope2(row);
  const scope3 = exports.calculateScope3(row);

  const total = round(scope1.total + scope2.total + scope3.total);

  return {
    scope1,
    scope2,
    scope3,
    total,
    breakdown: {
      scope1: scope1.total,
      scope2: scope2.total,
      scope3: scope3.total,
    },
  };
};


exports.calculateIntensity = (totalEmissionsTCO2e, row) => {
  const pcs    = toNum(row['Production (Pcs)']);
  const usd    = toNum(row['ProductionCost (USD)']);
  const weight = toNum(row['ProductionWeight (Kg)']);

  return {
    perPiece: pcs    > 0 ? round(totalEmissionsTCO2e / pcs,    8) : null,
    perUSD:   usd    > 0 ? round(totalEmissionsTCO2e / usd,    8) : null,
    perKg:    weight > 0 ? round(totalEmissionsTCO2e / weight, 8) : null,
  };
};


// 1L diesel = 10.7 kWh | 1m3 gas = 9.97 kWh
exports.calculateEnergyMetrics = (row) => {
  const solar        = toNum(row['Solar (KWh)']);
  const reb          = toNum(row['REB (KWh)']);
  const diesel       = toNum(row['Diesel (Ltr)']);
  const gasBoiler    = toNum(row['GasBoiler (m3)']);
  const gasGenerator = toNum(row['GasGenerator (m3)']);

  const dieselKwh    = diesel       * 10.7;
  const gasBoilerKwh = gasBoiler    * 9.97;
  const gasGenKwh    = gasGenerator * 9.97;
  const totalKwh     = solar + reb + dieselKwh + gasBoilerKwh + gasGenKwh;
  const renewablePct = totalKwh > 0 ? round((solar / totalKwh) * 100, 2) : 0;

  const pcs = toNum(row['Production (Pcs)']);

  return {
    solarKwh:        round(solar),
    rebKwh:          round(reb),
    dieselKwh:       round(dieselKwh),
    gasBoilerKwh:    round(gasBoilerKwh),
    gasGenKwh:       round(gasGenKwh),
    totalKwh:        round(totalKwh),
    renewablePct,
    energyIntensity: pcs > 0 ? round(totalKwh / pcs, 4) : null,
  };
};


exports.calculateWaterMetrics = (row) => {
  const groundWater = toNum(row['Ground Water (m3)']);
  const rainwater   = toNum(row['Rainwater (m3)']);
  const recycled    = toNum(row['Recycled (m3)']);
  const totalSource = groundWater + rainwater + recycled;

  const wetProcess       = toNum(row['Wet Process (m3)']);
  const boiler           = toNum(row['Boiler Water (m3)']);
  const domestic         = toNum(row['Domestic (m3)']);
  const utility          = toNum(row['Utility (m3)']);
  const totalConsumption = wetProcess + boiler + domestic + utility;

  const etpInlet  = toNum(row['ETP Inlet Water (m3)']);
  const etpOutlet = toNum(row['ETP Outlet Water (m3)']);

  const pcs = toNum(row['Production (Pcs)']);

  return {
    source:      { groundWater, rainwater, recycled, total: round(totalSource) },
    consumption: { wetProcess, boiler, domestic, utility, total: round(totalConsumption) },
    etp:         { inlet: etpInlet, outlet: etpOutlet },
    recyclingRate:         totalSource > 0 ? round((recycled / totalSource) * 100, 2) : 0,
    etpRemovalEfficiency:  etpInlet    > 0 ? round(((etpInlet - etpOutlet) / etpInlet) * 100, 2) : 0,
    waterIntensity:        pcs         > 0 ? round(totalConsumption / pcs, 6) : null,
  };
};


exports.calculateWasteMetrics = (row) => {
  // Removed: Paper — not in DAX formula
  const nonHazardous = {
    jhute:        toNum(row['Jhute (Kg)']),
    padding:      toNum(row['Padding (Kg)']),
    leftover:     toNum(row['Leftover (Kg)']),
    polyPlastic:  toNum(row['Poly/Plastic (Kg)']),
    carton:       toNum(row['Carton (Kg)']),
    paper:        toNum(row['Paper(Kg)']),
    emptyCone:    toNum(row['Empty Cone (Kg)']),
    patternBoard: toNum(row['Pattern Board (Kg)']),
    foodWaste:    toNum(row['Food Waste (Kg)']),
  };
  const recyclable = {
    metal: toNum(row['Metal (Kg)']),
  };
  const hazardous = {
    medicalWaste:      toNum(row['Medical Waste (Kg)']),
    electricWaste:     toNum(row['Electric Waste(Kg)']),
    emptyChemicalDrum: toNum(row['Empty Chemical Drum (Kg)']),
    sludge:            toNum(row['Sludge (Kg)']),
  };

  const totalNonHazardous = Object.values(nonHazardous).reduce((s, v) => s + v, 0);
  const totalRecyclable   = Object.values(recyclable).reduce((s, v) => s + v, 0);
  const totalHazardous    = Object.values(hazardous).reduce((s, v) => s + v, 0);
  const totalWaste        = totalNonHazardous + totalRecyclable + totalHazardous;

  const pcs = toNum(row['Production (Pcs)']);

  return {
    nonHazardous: { ...nonHazardous, total: round(totalNonHazardous) },
    recyclable:   { ...recyclable,   total: round(totalRecyclable) },
    hazardous:    { ...hazardous,    total: round(totalHazardous) },
    totalWaste:   round(totalWaste),
    wasteIntensity: pcs > 0 ? round(totalWaste / pcs, 6) : null,
  };
};


exports.calculateChemicalMetrics = (row) => {
  // Removed: Total item count columns — item counts are not weights
  const dyesKg         = toNum(row['Dyes Consumption (Kg)']);
  const auxiliaryKg    = toNum(row['Auxilary Chemical Consumption (Kg)']);
  const basicKg        = toNum(row['Basic Chemical Consumption (Kg)']);

  const totalKg = dyesKg + auxiliaryKg + basicKg;
  const pcs     = toNum(row['Production (Pcs)']);

  return {
    dyes:      { kg: round(dyesKg) },
    auxiliary: { kg: round(auxiliaryKg) },
    basic:     { kg: round(basicKg) },
    totalKg:   round(totalKg),
    chemicalIntensity: pcs > 0 ? round(totalKg / pcs, 6) : null,
  };
};


exports.processRow = (row) => {
  const emissions = exports.calculateRowEmissions(row);
  const intensity = exports.calculateIntensity(emissions.total, row);
  const energy    = exports.calculateEnergyMetrics(row);
  const water     = exports.calculateWaterMetrics(row);
  const waste     = exports.calculateWasteMetrics(row);
  const chemicals = exports.calculateChemicalMetrics(row);

  return {
    bu:    String(row['BU']    || '').trim().toUpperCase(),
    month: String(row['Month'] || '').trim(),
    production: {
      pcs:    toNum(row['Production (Pcs)']),
      usd:    toNum(row['ProductionCost (USD)']),
      weight: toNum(row['ProductionWeight (Kg)']),
    },
    emissions,
    intensity,
    energy,
    water,
    waste,
    chemicals,
  };
};


exports.processDataset = (rows) => {
  if (!rows || rows.length === 0) {
    throw new Error('Dataset is empty — nothing to process.');
  }

  const byBU = {};
  const all  = [];

  rows.forEach((row, index) => {
    try {
      const processed = exports.processRow(row);
      if (!processed.bu || !processed.month) return;
      if (!byBU[processed.bu]) byBU[processed.bu] = [];
      byBU[processed.bu].push(processed);
      all.push(processed);
    } catch (err) {
      console.warn(`Warning: Skipping row ${index} — ${err.message}`);
    }
  });

  if (all.length === 0) {
    throw new Error('No valid rows found. Check file format and column headers.');
  }

  return {
    businessUnits: Object.keys(byBU),
    byBU,
    combined:    buildSummary(all),
    byBUSummary: Object.fromEntries(
      Object.entries(byBU).map(([bu, buRows]) => [bu, buildSummary(buRows)])
    ),
  };
};


const buildSummary = (processedRows) => {
  let totalScope1 = 0;
  let totalScope2 = 0;
  let totalScope3 = 0;

  const scope1Map = new Map();
  const scope2Map = new Map();
  const scope3Map = new Map();

  const monthlyData = processedRows.map(r => {
    totalScope1 += r.emissions.scope1.total;
    totalScope2 += r.emissions.scope2.total;
    totalScope3 += r.emissions.scope3.total;

    r.emissions.scope1.breakdown.forEach(b => scope1Map.set(b.name, (scope1Map.get(b.name) || 0) + b.value));
    r.emissions.scope2.breakdown.forEach(b => scope2Map.set(b.name, (scope2Map.get(b.name) || 0) + b.value));
    r.emissions.scope3.breakdown.forEach(b => scope3Map.set(b.name, (scope3Map.get(b.name) || 0) + b.value));

    return {
      month:          r.month,
      businessUnit:   r.bu,
      scope1:         r.emissions.scope1.total,
      scope2:         r.emissions.scope2.total,
      scope3:         r.emissions.scope3.total,
      totalEmissions: r.emissions.total,
    };
  });

  const totalEmissions = round(totalScope1 + totalScope2 + totalScope3);
  const avgMonthly     = round(totalEmissions / monthlyData.length);

  const peak   = monthlyData.reduce((max, m) => m.totalEmissions > max.totalEmissions ? m : max, monthlyData[0]);
  const lowest = monthlyData.reduce((min, m) => m.totalEmissions < min.totalEmissions ? m : min, monthlyData[0]);

  const windowSize    = Math.min(3, Math.floor(monthlyData.length / 2));
  const firstAvg      = monthlyData.slice(0, windowSize).reduce((s, m) => s + m.totalEmissions, 0) / windowSize;
  const lastAvg       = monthlyData.slice(-windowSize).reduce((s, m) => s + m.totalEmissions, 0) / windowSize;
  const changePercent = firstAvg > 0 ? round(((lastAvg - firstAvg) / firstAvg) * 100, 2) : 0;
  const emissionsTrend = changePercent > 5 ? 'increasing' : changePercent < -5 ? 'decreasing' : 'stable';

  return {
    period: {
      start:  monthlyData[0].month,
      end:    monthlyData[monthlyData.length - 1].month,
      months: monthlyData.length,
    },
    metrics: {
      totalEmissions,
      scope1:     round(totalScope1),
      scope2:     round(totalScope2),
      scope3:     round(totalScope3),
      avgMonthly,
      peakMonth:   { value: peak.totalEmissions,   month: peak.month,   businessUnit: peak.businessUnit },
      lowestMonth: { value: lowest.totalEmissions, month: lowest.month, businessUnit: lowest.businessUnit },
      scope1Breakdown: Array.from(scope1Map, ([name, value]) => ({ name, value })),
      scope2Breakdown: Array.from(scope2Map, ([name, value]) => ({ name, value })),
      scope3Breakdown: Array.from(scope3Map, ([name, value]) => ({ name, value })),
    },
    monthlyData,
    trends: {
      emissionsTrend,
      monthlyChange:  changePercent,
      firstPeriodAvg: round(firstAvg),
      lastPeriodAvg:  round(lastAvg),
    },
  };
};