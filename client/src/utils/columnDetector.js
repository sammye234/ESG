// client/src/utils/columnDetector.js

const normalizeColumnName = (name) => {
  if (!name) return '';
  return name
    .toLowerCase()
    .replace(/[\s\-_\(\)\[\]\.\/]/g, '')
    .replace(/[^a-z0-9]/g, '');
};

const matchesAnyName = (columnName, possibleNames) => {
  const normalized = normalizeColumnName(columnName);
  return possibleNames.some(name => {
    const n = normalizeColumnName(name);
    return normalized.includes(n) || n.includes(normalized);
  });
};

export const findColumn = (row, possibleNames) => {
  if (!row || !possibleNames) return null;
  for (const key of Object.keys(row)) {
    if (matchesAnyName(key, possibleNames)) return row[key];
  }
  return null;
};


export const findColumnKey = (row, possibleNames) => {
  if (!row || !possibleNames) return null;
  for (const key of Object.keys(row)) {
    if (matchesAnyName(key, possibleNames)) return key;
  }
  return null;
};

export const COLUMN_MAPPINGS = {

 
  sl: ['sl', 'serial', 'serialno', 'no'],

  bu: ['bu', 'businessunit', 'business unit', 'factory', 'unit'],

  month: ['month', 'months', 'mon', 'period', 'date'],


  productionPcs: [
    'production pcs', 'productionpcs', 'production(pcs)',
    'pcs', 'pieces', 'units produced'
  ],

  productionCostUSD: [
    'productioncost usd', 'productioncostusd', 'productioncost(usd)',
    'production cost', 'cost usd', 'revenue'
  ],

  productionWeightKg: [
    'productionweight kg', 'productionweightkg', 'productionweight(kg)',
    'production weight', 'weight kg'
    // ⚠️ Often zero — check before using as denominator
  ],

  solarKwh: [
    'solar kwh', 'solarkwh', 'solar(kwh)',
    'solar energy', 'solar power', 'solar'
  ],

  rebKwh: [
    'reb kwh', 'rebkwh', 'reb(kwh)',
    'grid electricity', 'electricity kwh', 'reb'
    // Do NOT include generic 'kwh' here — Solar also uses kWh
  ],

  dieselLtr: [
    'diesel ltr', 'dieselltr', 'diesel(ltr)',
    'diesel l', 'diesel liters', 'diesel litres', 'diesel'
  ],

  gasBoilerM3: [
    'gasboiler m3', 'gasboilerm3', 'gasboiler(m3)',
    'boiler gas', 'boilerm3', 'gas boiler'
  ],

  gasGeneratorM3: [
    'gasgenerator m3', 'gasgeneratorm3', 'gasgenerator(m3)',
    'generator gas', 'generatorm3', 'gas generator'
  ],

  

  groundWaterM3: [
    'ground water m3', 'groundwaterm3', 'ground water(m3)',
    'groundwater', 'borewell', 'bore water'
  ],

  rainwaterM3: [
    'rainwater m3', 'rainwaterm3', 'rainwater(m3)',
    'rainwater', 'rain water', 'harvested water'
  ],

  recycledM3: [
    'recycled m3', 'recycledm3', 'recycled(m3)',
    'recycled water', 'reused water', 'reclaimed water'
  ],

  totalSourceM3: [
    'total source m3', 'totalsourcem3', 'total source(m3)',
    'total water source', 'water source total'
    // Computed: groundWater + rainwater + recycled
  ],

  // ── WATER CONSUMPTION ────────────────────────────────────────────────────

  wetProcessM3: [
    'wet process m3', 'wetprocessm3', 'wet process(m3)',
    'wet process', 'process water', 'dyeing water'
  ],

  boilerWaterM3: [
    'boiler water m3', 'boilerwaterm3', 'boiler water(m3)',
    'boiler water', 'steam water'
  ],

  domesticM3: [
    'domestic m3', 'domesticm3', 'domestic(m3)',
    'domestic water', 'sanitary water', 'domestic use'
  ],

  utilityM3: [
    'utility m3', 'utilitym3', 'utility(m3)',
    'utility water', 'facility water', 'general utility'
  ],

  totalConsumptionM3: [
    'total consumption m3', 'totalconsumptionm3', 'total consumption(m3)',
    'total water consumption', 'water consumption total'
    // Computed: wetProcess + boilerWater + domestic + utility
  ],

  // ── WATER TREATMENT & DISCHARGE ──────────────────────────────────────────

  wtpBackwashM3: [
    'wtp backwash m3', 'wtpbackwashm3', 'wtp backwash(m3)',
    'wtp backwash', 'backwash water', 'filter backwash'
  ],

  nonContactCoolingM3: [
    'non-contact cooling water m3', 'noncontactcoolingwaterm3',
    'non contact cooling water(m3)', 'non contact cooling water',
    'cooling water', 'noncontact cooling'
  ],

  processLossM3: [
    'process loss m3', 'processloosm3', 'process loss(m3)',
    'process loss', 'water loss', 'evaporation loss'
  ],

  treatmentM3: [
    'treatment m3', 'treatmentm3', 'treatment(m3)',
    'water treatment', 'etp feed', 'treated water'
  ],

  dischargeM3: [
    'discharge m3', 'dischargem3', 'discharge(m3)',
    'effluent discharge', 'water discharge', 'outlet discharge'
  ],

  // ── WASTE — SOLID (Non-hazardous) ────────────────────────────────────────

  juteKg: [
    'jhute kg', 'jhutekg', 'jhute(kg)',
    'jute kg', 'jutekg', 'jute(kg)',
    'jute waste', 'jhute waste'
  ],

  paddingKg: [
    'padding kg', 'paddingkg', 'padding(kg)',
    'padding waste', 'interlining waste'
  ],

  leftoverKg: [
    'leftover kg', 'leftoverkg', 'leftover(kg)',
    'leftover', 'fabric offcut', 'cutting waste'
  ],

  polyPlasticKg: [
    'poly plastic kg', 'polyplastickg', 'poly/plastic(kg)',
    'poly plastic', 'plastic waste', 'polythene', 'poly waste'
  ],

  cartonKg: [
    'carton kg', 'cartonkg', 'carton(kg)',
    'carton waste', 'cardboard waste', 'box waste'
  ],

  paperKg: [
    'paper kg', 'paperkg', 'paper(kg)',
    'paper waste', 'paper'
  ],

  emptyConeKg: [
    'empty cone kg', 'emptyconekg', 'empty cone(kg)',
    'cone waste', 'spool waste', 'yarn cone'
  ],

  patternBoardKg: [
    'pattern board kg', 'patternboardkg', 'pattern board(kg)',
    'pattern waste', 'pattern board'
  ],

  // ── WASTE — HAZARDOUS ────────────────────────────────────────────────────

  medicalWasteKg: [
    'medical waste kg', 'medicalwastekg', 'medical waste(kg)',
    'medical waste', 'clinical waste', 'biomedical waste'
  ],

  metalKg: [
    'metal kg', 'metalkg', 'metal(kg)',
    'scrap metal', 'metal waste', 'metal scrap'
    // EF = 0 (recycled)
  ],

  electricWasteKg: [
    'electric waste kg', 'electricwastekg', 'electric waste(kg)',
    'ewaste', 'e-waste', 'electronic waste', 'electrical waste'
  ],

  emptyChemicalDrumKg: [
    'empty chemical drum kg', 'emptychemicaldrumkg', 'empty chemical drum(kg)',
    'chemical drum', 'drum waste', 'empty drum'
  ],

  // ── WASTE — ETP & LIQUID ─────────────────────────────────────────────────

  etpInletM3: [
    'etp inlet water m3', 'etpinletwaterm3', 'etp inlet water(m3)',
    'etp inlet', 'inlet water', 'etp feed water'
  ],

  etpOutletM3: [
    'etp outlet water m3', 'etpoutletwaterm3', 'etp outlet water(m3)',
    'etp outlet', 'outlet water', 'etp treated water'
  ],

  sludgeKg: [
    'sludge kg', 'sludgekg', 'sludge(kg)',
    'etp sludge', 'sludge waste', 'sludge'
  ],

  foodWasteKg: [
    'food waste kg', 'foodwastekg', 'food waste(kg)',
    'food waste', 'canteen waste', 'cafeteria waste'
  ],

  // ── CHEMICALS ────────────────────────────────────────────────────────────

  totalDyesItem: [
    'total dyes item', 'totaldyesitem', 'total dyes',
    'dyes item', 'dye count', 'number of dyes'
  ],

  dyesConsumptionKg: [
    'dyes consumption kg', 'dyesconsumptionkg', 'dyes consumption(kg)',
    'dyes kg', 'dye consumption', 'dyes consumed'
  ],

  totalAuxiliaryItem: [
    'total auxilary chemical item', 'totalauxilarychemiicalitem',
    'total auxiliary chemical item', 'totalauxiliarychemicalitem',
    'auxiliary item', 'aux chemical count', 'auxiliary count'
    // Note: "Auxilary" (one 'i') is the spelling in the actual CSV header
  ],

  auxiliaryConsumptionKg: [
    'auxilary chemical consumption kg', 'auxilarychemiicalconsumptionkg',
    'auxiliary chemical consumption kg', 'auxiliarychemicalconsumptionkg',
    'auxiliary chemical consumption(kg)', 'aux chemical kg', 'auxiliary kg'
  ],

  totalBasicItem: [
    'total basic chemical item', 'totalbasicchemicalitem',
    'basic chemical item', 'basic item count', 'basic chemical count'
  ],

  basicConsumptionKg: [
    'basic chemical consumption kg', 'basicchemicalconsumptionkg',
    'basic chemical consumption(kg)', 'basic chemical kg', 'basic kg'
  ],

  totalZdhcLevel3: [
    'total zdhc level-3 chemical', 'totalzdhclevel3chemical',
    'zdhc level 3', 'zdhclevel3', 'zdhc level-3',
    'zdhc chemical', 'zdhc count', 'zdhc'
  ],

};


export const detectColumns = (data) => {
  if (!data || data.length === 0) return {};

  const firstRow = data[0];
  const detected = {};

  Object.keys(COLUMN_MAPPINGS).forEach(fieldKey => {
    const columnKey = findColumnKey(firstRow, COLUMN_MAPPINGS[fieldKey]);
    if (columnKey) {
      detected[fieldKey] = columnKey;
    }
  });

  console.log('🔍 Auto-detected columns:', detected);
  return detected;
};


export const getValueFromRow = (row, fieldKey) => {
  if (!row || !fieldKey) return null;

  const possibleNames = COLUMN_MAPPINGS[fieldKey];
  if (!possibleNames) return null;

  const value = findColumn(row, possibleNames);
  if (value === null || value === undefined || value === '') return null;

  
  const cleaned = String(value).replace(/,/g, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? null : parsed;
};

/**
 * Get the production denominator for intensity calculations.
 *
 * Priority order:
 *   1. Pieces (productionPcs)   — most reliable, always populated
 *   2. Cost (productionCostUSD) — fallback if pieces unavailable
 *   3. Weight (productionWeightKg) — last resort: often 0 in the dataset
 *
 * ⚠️ Weight is intentionally LAST because it is frequently 0
 *    in the current dataset, which would produce infinite intensity values.
 */
export const getProductionDenominator = (row) => {
  const pcs = getValueFromRow(row, 'productionPcs');
  if (pcs !== null && pcs > 0) return { value: pcs, unit: 'pcs' };

  const usd = getValueFromRow(row, 'productionCostUSD');
  if (usd !== null && usd > 0) return { value: usd, unit: 'USD' };

  const kg = getValueFromRow(row, 'productionWeightKg');
  if (kg !== null && kg > 0) return { value: kg, unit: 'kg' };

  return { value: null, unit: null }; // Cannot compute intensity
};

/**
 * Extract all energy values from a row as a structured object.
 * Returns 0 (not null) for missing energy fields — energy summing
 * is safe to do even when some sources are absent.
 */
export const getEnergyValues = (row) => ({
  solarKwh:        getValueFromRow(row, 'solarKwh')        ?? 0,
  rebKwh:          getValueFromRow(row, 'rebKwh')          ?? 0,
  dieselLtr:       getValueFromRow(row, 'dieselLtr')       ?? 0,
  gasBoilerM3:     getValueFromRow(row, 'gasBoilerM3')     ?? 0,
  gasGeneratorM3:  getValueFromRow(row, 'gasGeneratorM3')  ?? 0,
});

/**
 * Extract all water values from a row.
 */
export const getWaterValues = (row) => ({
  groundWaterM3:      getValueFromRow(row, 'groundWaterM3')      ?? 0,
  rainwaterM3:        getValueFromRow(row, 'rainwaterM3')        ?? 0,
  recycledM3:         getValueFromRow(row, 'recycledM3')         ?? 0,
  wetProcessM3:       getValueFromRow(row, 'wetProcessM3')       ?? 0,
  boilerWaterM3:      getValueFromRow(row, 'boilerWaterM3')      ?? 0,
  domesticM3:         getValueFromRow(row, 'domesticM3')         ?? 0,
  utilityM3:          getValueFromRow(row, 'utilityM3')          ?? 0,
  wtpBackwashM3:      getValueFromRow(row, 'wtpBackwashM3')      ?? 0,
  nonContactCoolingM3:getValueFromRow(row, 'nonContactCoolingM3')?? 0,
  processLossM3:      getValueFromRow(row, 'processLossM3')      ?? 0,
  treatmentM3:        getValueFromRow(row, 'treatmentM3')        ?? 0,
  dischargeM3:        getValueFromRow(row, 'dischargeM3')        ?? 0,
  etpInletM3:         getValueFromRow(row, 'etpInletM3')         ?? 0,
  etpOutletM3:        getValueFromRow(row, 'etpOutletM3')        ?? 0,
});

/**
 * Extract all waste values from a row.
 */
export const getWasteValues = (row) => ({
  // Non-hazardous
  juteKg:            getValueFromRow(row, 'juteKg')            ?? 0,
  paddingKg:         getValueFromRow(row, 'paddingKg')         ?? 0,
  leftoverKg:        getValueFromRow(row, 'leftoverKg')        ?? 0,
  polyPlasticKg:     getValueFromRow(row, 'polyPlasticKg')     ?? 0,
  cartonKg:          getValueFromRow(row, 'cartonKg')          ?? 0,
  paperKg:           getValueFromRow(row, 'paperKg')           ?? 0,
  emptyConeKg:       getValueFromRow(row, 'emptyConeKg')       ?? 0,
  patternBoardKg:    getValueFromRow(row, 'patternBoardKg')    ?? 0,
  foodWasteKg:       getValueFromRow(row, 'foodWasteKg')       ?? 0,
  // Recyclable
  metalKg:           getValueFromRow(row, 'metalKg')           ?? 0,
  // Hazardous
  medicalWasteKg:       getValueFromRow(row, 'medicalWasteKg')       ?? 0,
  electricWasteKg:      getValueFromRow(row, 'electricWasteKg')      ?? 0,
  emptyChemicalDrumKg:  getValueFromRow(row, 'emptyChemicalDrumKg')  ?? 0,
  sludgeKg:             getValueFromRow(row, 'sludgeKg')             ?? 0,
});

/**
 * Extract all chemical values from a row.
 */
export const getChemicalValues = (row) => ({
  totalDyesItem:          getValueFromRow(row, 'totalDyesItem')          ?? 0,
  dyesConsumptionKg:      getValueFromRow(row, 'dyesConsumptionKg')      ?? 0,
  totalAuxiliaryItem:     getValueFromRow(row, 'totalAuxiliaryItem')     ?? 0,
  auxiliaryConsumptionKg: getValueFromRow(row, 'auxiliaryConsumptionKg') ?? 0,
  totalBasicItem:         getValueFromRow(row, 'totalBasicItem')         ?? 0,
  basicConsumptionKg:     getValueFromRow(row, 'basicConsumptionKg')     ?? 0,
  totalZdhcLevel3:        getValueFromRow(row, 'totalZdhcLevel3')        ?? 0,
});

// ---------------------------------------------------------------------------
// DEFAULT EXPORT
// ---------------------------------------------------------------------------

export default {
  findColumn,
  findColumnKey,
  detectColumns,
  getValueFromRow,
  getProductionDenominator,
  getEnergyValues,
  getWaterValues,
  getWasteValues,
  getChemicalValues,
  COLUMN_MAPPINGS,
};