// server/src/controllers/emissionsController.js

// DAX Scope 1: (Solar_kWh*0.05 + Diesel_L*2.68 + GasBoiler_m3*2.02 + GasGen_m3*2.02) / 1000
// DAX Scope 2: REB_kWh * 0.62 / 1000
// DAX Scope 3: (waste_kg/1000*4.69 + ETP_m3*0.27 + food_kg/1000*8.91 + chem_kg*0.0035) / 1000


const EmissionsData = require('../models/EmissionsData');
const File = require('../models/File');
const { excelSerialToMonthLabel } = require('../utils/dateUtils');

const EF = {
  solar:        0.05,    // kgCO2e/kWh
  diesel:       2.68,    // kgCO2e/L
  gasBoiler:    2.02,    // kgCO2e/m3
  gasGenerator: 2.02,    // kgCO2e/m3
  reb:          0.62,    // kgCO2e/kWh
  solidWaste:   4.69,    // kgCO2e/tonne 
  foodWaste:    8.91,    // kgCO2e/tonne
  etp:          0.27,    // kgCO2e/m3 
  chemicals:    0.0035,  // kgCO2e/kg
};


class EmissionsController {
  static async getEmissionsFiles(req, res) {
    try {
      const query = { userId: req.user.id, ...req.buFilter };
      const files = await File.find(query).select('name originalName uploadedAt metadata data sheets businessUnit').sort({ uploadedAt: -1 });
      const emissionsFiles = files.filter(file => {
        if (!file.data || file.data.length === 0) return false;
        const headers = file.metadata?.headers || Object.keys(file.data[0] || {});
        return headers.some(h => /reb|diesel|solar|gasboiler|gasgenerator|kwh|jhute|padding|leftover|poly|carton|paper|cone|pattern|medical|metal|electric|drum|sludge|food|dyes|auxilary|basic/i.test(h));
      });
      res.json({ success: true, count: emissionsFiles.length, files: emissionsFiles.map(f => ({ _id: f._id, name: f.name, originalName: f.originalName, businessUnit: f.businessUnit, uploadedAt: f.uploadedAt || f.createdAt, rowCount: f.data?.length || 0, headers: f.metadata?.headers || [] })) });
    } catch (err) {
      res.status(500).json({ success: false, error: 'Failed to fetch emissions files', message: err.message });
    }
  }

  static processMultiBUEmissionsData(rawData, headers) {
    const findColumn = (patterns) => headers.find(h => patterns.some(p => new RegExp(p, 'i').test(h?.trim() || ''))) || null;

    const buCol          = findColumn(['^bu$', 'business.*unit', 'factory']);
    const monthCol       = findColumn(['^month$', 'period', 'month.*name']);
    const solarCol       = findColumn(['solar.*kwh', '^solar']);
    const rebCol         = findColumn(['reb.*kwh', '^reb', 'grid.*electric']);
    const dieselCol      = findColumn(['diesel.*ltr', '^diesel']);
    const gasBoilerCol   = findColumn(['gasboiler.*m3', 'boiler.*m3', '^gasboiler']);
    const gasGenCol      = findColumn(['gasgenerator.*m3', 'generator.*m3', '^gasgenerator']);
    const jhuteCol       = findColumn(['jhute.*kg', '^jhute']);
    const paddingCol     = findColumn(['padding.*kg', '^padding']);
    const leftoverCol    = findColumn(['leftover.*kg', '^leftover']);
    const polyCol        = findColumn(['poly.*plastic.*kg', '^poly']);
    const cartonCol      = findColumn(['carton.*kg', '^carton']);
    const paperCol       = findColumn(['paper.*kg', '^paper']);
    const coneCol        = findColumn(['empty.*cone.*kg', '^cone']);
    const patternCol     = findColumn(['pattern.*board.*kg', '^pattern']);
    const medicalCol     = findColumn(['medical.*waste.*kg', '^medical']);
    const metalCol       = findColumn(['metal.*kg', '^metal']);
    const electricWasteCol = findColumn(['electric.*waste.*kg', '^electricwaste']);
    const drumCol        = findColumn(['empty.*chemical.*drum.*kg', '^drum']);
    const sludgeCol      = findColumn(['sludge.*kg', '^sludge']);
    const foodCol        = findColumn(['food.*waste.*kg', '^food']);
    const etpInletCol    = findColumn(['etp.*inlet.*water', 'etp.*inlet']);
    const etpOutletCol   = findColumn(['etp.*outlet.*water', 'etp.*outlet']);
    const dyesCol        = findColumn(['dyes.*consumption.*kg', '^dyes']);
    const auxCol         = findColumn(['auxilary.*chemical.*consumption.*kg', '^auxilary']);
    const basicCol       = findColumn(['basic.*chemical.*consumption.*kg', '^basic']);

    if (!buCol || !monthCol) throw new Error('Required columns (BU and Month) not found');

    const buData = { GTL: [], '4AL': [], SESL: [] };
    const combinedMonthly = [];

    rawData.forEach((row) => {
      const buStr    = String(row[buCol] || '').trim().toUpperCase();
      const monthRaw = row[monthCol];

      if (!monthRaw || !buStr || String(monthRaw).toLowerCase() === 'month' || buStr.toLowerCase() === 'bu') return;

      let bu = null;
      if (buStr.includes('GTL'))       bu = 'GTL';
      else if (buStr.includes('4AL'))  bu = '4AL';
      else if (buStr.includes('SESL')) bu = 'SESL';
      if (!bu) return;

      const month = excelSerialToMonthLabel(monthRaw);
      if (!month) return;

      const g = (col) => col ? parseFloat(row[col]) || 0 : 0;

      const solar = g(solarCol), diesel = g(dieselCol), gasBoiler = g(gasBoilerCol), gasGen = g(gasGenCol);
      const scope1 = (solar * EF.solar + diesel * EF.diesel + gasBoiler * EF.gasBoiler + gasGen * EF.gasGenerator) / 1000;
      const scope1Breakdown = [{ name: 'Solar', value: (solar * EF.solar) / 1000 }, { name: 'Diesel', value: (diesel * EF.diesel) / 1000 }, { name: 'Gas Boiler', value: (gasBoiler * EF.gasBoiler) / 1000 }, { name: 'Gas Generator', value: (gasGen * EF.gasGenerator) / 1000 }];

      const reb = g(rebCol);
      const scope2 = (reb * EF.reb) / 1000;
      const scope2Breakdown = [{ name: 'REB / Grid', value: scope2 }];

      const solidWasteKg = g(jhuteCol) + g(paddingCol) + g(leftoverCol) + g(paperCol) + g(polyCol) + g(cartonCol) + g(coneCol) + g(patternCol) + g(medicalCol) + g(metalCol) + g(electricWasteCol) + g(drumCol) + g(sludgeCol);
      const solidWasteEm = (solidWasteKg / 1000) * EF.solidWaste;
      const foodEm  = (g(foodCol) / 1000) * EF.foodWaste;
      const etpEm   = (g(etpInletCol) + g(etpOutletCol)) * EF.etp;
      const chemEm  = (g(dyesCol) + g(auxCol) + g(basicCol)) * EF.chemicals;
      const scope3  = (solidWasteEm + foodEm + etpEm + chemEm) / 1000;
      const scope3Breakdown = [{ name: 'Solid Waste', value: solidWasteEm / 1000 }, { name: 'Food Waste', value: foodEm / 1000 }, { name: 'ETP Wastewater', value: etpEm / 1000 }, { name: 'Chemicals/Dyes', value: chemEm / 1000 }].filter(b => b.value > 0);

      const totalEmissions = scope1 + scope2 + scope3;
      const record = { month, businessUnit: bu, scope1, scope2, scope3, scope1Breakdown, scope2Breakdown, scope3Breakdown, totalEmissions };

      if (buData[bu]) buData[bu].push(record);
      combinedMonthly.push(record);
    });

    if (combinedMonthly.length === 0) throw new Error('No valid emissions data found. Please check your file format.');

    const combinedMetrics = EmissionsController.calculateMetrics(combinedMonthly);
    const combinedTrends  = EmissionsController.calculateTrends(combinedMonthly);
    const byBU = {};
    Object.keys(buData).forEach(bu => {
      if (buData[bu].length > 0) byBU[bu] = { metrics: EmissionsController.calculateMetrics(buData[bu]), monthlyData: buData[bu], trends: EmissionsController.calculateTrends(buData[bu]) };
    });

    return {
      businessUnits: Object.keys(byBU),
      combined: { period: { start: combinedMonthly[0]?.month || 'Unknown', end: combinedMonthly[combinedMonthly.length - 1]?.month || 'Unknown', months: combinedMonthly.length }, metrics: combinedMetrics, monthlyData: combinedMonthly, trends: combinedTrends },
      byBU
    };
  }

  static calculateMetrics(monthlyData) {
    if (monthlyData.length === 0) return { totalEmissions: 0, scope1: 0, scope2: 0, scope3: 0, avgMonthly: 0, peakMonth: { value: 0, month: 'N/A', businessUnit: 'N/A' }, lowestMonth: { value: 0, month: 'N/A', businessUnit: 'N/A' }, scope1Breakdown: [], scope2Breakdown: [], scope3Breakdown: [] };

    let totalScope1 = 0, totalScope2 = 0, totalScope3 = 0;
    const s1Map = new Map(), s2Map = new Map(), s3Map = new Map();
    monthlyData.forEach(m => {
      totalScope1 += m.scope1 || 0; totalScope2 += m.scope2 || 0; totalScope3 += m.scope3 || 0;
      (m.scope1Breakdown || []).forEach(b => s1Map.set(b.name, (s1Map.get(b.name) || 0) + b.value));
      (m.scope2Breakdown || []).forEach(b => s2Map.set(b.name, (s2Map.get(b.name) || 0) + b.value));
      (m.scope3Breakdown || []).forEach(b => s3Map.set(b.name, (s3Map.get(b.name) || 0) + b.value));
    });

    const totalEmissions = totalScope1 + totalScope2 + totalScope3;
    const peak   = monthlyData.reduce((max, curr) => curr.totalEmissions > max.totalEmissions ? curr : max, monthlyData[0]);
    const lowest = monthlyData.reduce((min, curr) => curr.totalEmissions < min.totalEmissions && curr.totalEmissions > 0 ? curr : min, monthlyData[0]);

    return {
      totalEmissions: parseFloat(totalEmissions.toFixed(4)), scope1: parseFloat(totalScope1.toFixed(4)), scope2: parseFloat(totalScope2.toFixed(4)), scope3: parseFloat(totalScope3.toFixed(4)),
      avgMonthly: parseFloat((totalEmissions / monthlyData.length).toFixed(4)),
      peakMonth:   { value: parseFloat(peak.totalEmissions.toFixed(4)),   month: peak.month   || 'Unknown', businessUnit: peak.businessUnit   || 'Unknown' },
      lowestMonth: { value: parseFloat(lowest.totalEmissions.toFixed(4)), month: lowest.month || 'Unknown', businessUnit: lowest.businessUnit || 'Unknown' },
      scope1Breakdown: Array.from(s1Map, ([name, value]) => ({ name, value })),
      scope2Breakdown: Array.from(s2Map, ([name, value]) => ({ name, value })),
      scope3Breakdown: Array.from(s3Map, ([name, value]) => ({ name, value })),
    };
  }

  static calculateTrends(monthlyData) {
    if (monthlyData.length < 2) return { emissionsTrend: 'stable', monthlyChange: 0 };
    const w = Math.min(3, Math.floor(monthlyData.length / 2));
    const firstAvg = monthlyData.slice(0, w).reduce((s, m) => s + m.totalEmissions, 0) / w;
    const lastAvg  = monthlyData.slice(-w).reduce((s, m) => s + m.totalEmissions, 0) / w;
    const pct = firstAvg > 0 ? ((lastAvg - firstAvg) / firstAvg) * 100 : 0;
    return { emissionsTrend: pct > 5 ? 'increasing' : pct < -5 ? 'decreasing' : 'stable', monthlyChange: parseFloat(pct.toFixed(2)), firstPeriodAvg: parseFloat(firstAvg.toFixed(2)), lastPeriodAvg: parseFloat(lastAvg.toFixed(2)) };
  }

  static async getMetrics(req, res) {
    try {
      const emissionsData = await EmissionsData.findOne({ file: req.params.fileId, userId: req.user.id }).populate('file', 'name originalName uploadedAt');
      if (!emissionsData) return res.status(404).json({ success: false, error: 'Emissions data not found. Please process the file first.' });
      res.json({ success: true, data: emissionsData });
    } catch (err) {
      res.status(500).json({ success: false, error: 'Failed to fetch metrics', message: err.message });
    }
  }

  static async processEmissionsFile(req, res) {
    try {
      const { fileId } = req.params;
      const file = await File.findOne({ _id: fileId, userId: req.user.id, ...req.buFilter });
      if (!file) return res.status(404).json({ success: false, error: 'File not found or access denied' });
      if (!file.data?.length) return res.status(400).json({ success: false, error: 'File has no data rows' });

      const headers   = file.metadata?.headers || Object.keys(file.data[0] || {});
      const processed = EmissionsController.processMultiBUEmissionsData(file.data, headers);

      if (!processed?.combined?.metrics || !processed?.combined?.monthlyData?.length) return res.status(400).json({ success: false, error: 'Could not extract valid emissions data from this file' });

      const updateData = { userId: req.user.id, file: fileId, fileName: file.originalName || file.name, period: processed.combined.period, metrics: processed.combined.metrics, monthlyData: processed.combined.monthlyData, trends: processed.combined.trends, factoryData: processed.byBU, processedAt: new Date() };
      const emissionsDoc = await EmissionsData.findOneAndUpdate({ userId: req.user.id, file: fileId }, updateData, { upsert: true, new: true, setDefaultsOnInsert: true });

      return res.json({ success: true, data: emissionsDoc.toObject({ virtuals: true }), message: 'Emissions data processed and saved' });
    } catch (err) {
      return res.status(500).json({ success: false, error: 'Failed to process emissions file', message: err.message });
    }
  }

  static async getDashboardSummary(req, res) { try { res.json({ success: true, data: {} }); } catch (err) { res.status(500).json({ success: false, error: err.message }); } }
  static async compareDatasets(req, res)    { try { res.json({ success: true, data: {} }); } catch (err) { res.status(500).json({ success: false, error: err.message }); } }
  static async getTrendAnalysis(req, res)   { try { res.json({ success: true, data: {} }); } catch (err) { res.status(500).json({ success: false, error: err.message }); } }
  static async getRecommendations(req, res) { try { res.json({ success: true, data: {} }); } catch (err) { res.status(500).json({ success: false, error: err.message }); } }
  static async exportData(req, res)         { try { res.json({ success: true, data: {} }); } catch (err) { res.status(500).json({ success: false, error: err.message }); } }
}

module.exports = EmissionsController;