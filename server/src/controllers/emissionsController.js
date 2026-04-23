// server/src/controllers/emissionsController.js

// DAX Scope 1: (Solar_kWh*0.05 + Diesel_L*2.68 + GasBoiler_m3*2.02 + GasGen_m3*2.02) / 1000
// DAX Scope 2: REB_kWh * 0.62 / 1000
// DAX Scope 3: (waste_kg/1000*4.69 + ETP_m3*0.27 + food_kg/1000*8.91 + chem_kg*0.0035) / 1000


const EmissionsData = require('../models/EmissionsData');
const File = require('../models/File');

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
      console.log('📂 Fetching emissions files for user:', req.user.id);
      console.log('🔍 BU Scope:', req.buScope || 'ALL');
      console.log('🔍 Allowed BUs:', req.allowedBusinessUnits);

      const query = {
        userId: req.user.id,
        ...req.buFilter
      };

      const files = await File.find(query)
        .select('name originalName uploadedAt metadata data sheets businessUnit')
        .sort({ uploadedAt: -1 });

      const emissionsFiles = files.filter(file => {
        if (!file.data || file.data.length === 0) return false;

        const headers = file.metadata?.headers || Object.keys(file.data[0] || {});
        const hasEmissionsData = headers.some(h =>
          /reb|diesel|solar|gasboiler|gasgenerator|kwh|jhute|padding|leftover|poly|carton|paper|cone|pattern|medical|metal|electric|drum|sludge|food|dyes|auxilary|basic/i.test(h)
        );

        return hasEmissionsData;
      });

      res.json({
        success: true,
        count: emissionsFiles.length,
        files: emissionsFiles.map(f => ({
          _id: f._id,
          name: f.name,
          originalName: f.originalName,
          businessUnit: f.businessUnit,
          uploadedAt: f.uploadedAt || f.createdAt,
          rowCount: f.data?.length || 0,
          headers: f.metadata?.headers || []
        }))
      });
    } catch (err) {
      console.error('❌ Error fetching emissions files:', err);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch emissions files',
        message: err.message
      });
    }
  }

  static detectMultipleBUs(data) {
    if (!data || data.length === 0) return false;

    const buPattern = /GTL|4AL|SESL/i;

    for (let i = 0; i < Math.min(5, data.length); i++) {
      const row = data[i];
      const values = Object.values(row).join(' ');
      if (buPattern.test(values)) {
        return true;
      }
    }

    return false;
  }

  static processMultiBUEmissionsData(rawData, headers) {
    console.log('🏢 Processing multi-BU emissions data...');
    console.log('📊 Raw data rows:', rawData.length);

    const findColumn = (patterns) => {
      return headers.find(h =>
        patterns.some(p => new RegExp(p, 'i').test(h?.trim() || ''))
      ) || null;
    };

    const buCol          = findColumn(['^bu$', 'business.*unit', 'factory']);
    const monthCol       = findColumn(['^month$', 'period', 'month.*name']);
    const solarCol       = findColumn(['solar.*kwh', '^solar']);
    const rebCol         = findColumn(['reb.*kwh', '^reb', 'grid.*electric']);
    const dieselCol      = findColumn(['diesel.*ltr', '^diesel']);
    const gasBoilerCol   = findColumn(['gasboiler.*m3', 'boiler.*m3', '^gasboiler']);
    const gasGenCol      = findColumn(['gasgenerator.*m3', 'generator.*m3', '^gasgenerator']);
    const productionCol  = findColumn(['production.*pcs', '^production']);
    const costCol        = findColumn(['productioncost.*usd', 'production.*cost', '^cost']);
    const weightCol      = findColumn(['productionweight.*kg', 'production.*weight', '^weight']);

    // Scope 3 — waste columns
    const jhuteCol         = findColumn(['jhute.*kg', '^jhute']);
    const paddingCol       = findColumn(['padding.*kg', '^padding']);
    const leftoverCol      = findColumn(['leftover.*kg', '^leftover']);
    const polyCol          = findColumn(['poly.*plastic.*kg', '^poly']);
    const cartonCol        = findColumn(['carton.*kg', '^carton']);
    const paperCol        = findColumn(['paper.*kg', '^paper']);
    const coneCol          = findColumn(['empty.*cone.*kg', '^cone']);
    const patternCol       = findColumn(['pattern.*board.*kg', '^pattern']);
    const medicalCol       = findColumn(['medical.*waste.*kg', '^medical']);
    const metalCol         = findColumn(['metal.*kg', '^metal']);
    const electricWasteCol = findColumn(['electric.*waste.*kg', '^electricwaste']);
    const drumCol          = findColumn(['empty.*chemical.*drum.*kg', '^drum']);
    const sludgeCol        = findColumn(['sludge.*kg', '^sludge']);
    const foodCol          = findColumn(['food.*waste.*kg', '^food']);

    // Scope 3 — ETP water (both inlet and outlet per DAX)
    const etpInletCol  = findColumn(['etp.*inlet.*water', 'etp.*inlet']);
    const etpOutletCol = findColumn(['etp.*outlet.*water', 'etp.*outlet']);

    // Scope 3 — chemicals (kg only — item counts removed)
    const dyesCol  = findColumn(['dyes.*consumption.*kg', '^dyes']);
    const auxCol   = findColumn(['auxilary.*chemical.*consumption.*kg', '^auxilary']);
    const basicCol = findColumn(['basic.*chemical.*consumption.*kg', '^basic']);
    // Removed: ZDHC, Total Auxilary Chemical Item, Total Basic Chemical Item, Total Dyes Item

    if (!buCol || !monthCol) {
      throw new Error('Required columns (BU and Month) not found');
    }

    const buData = { GTL: [], '4AL': [], SESL: [] };
    const combinedMonthly = [];

    const monthNames = {
      'jan': 'January', 'feb': 'February', 'mar': 'March',
      'apr': 'April',   'may': 'May',       'jun': 'June',
      'jul': 'July',    'aug': 'August',    'sep': 'September',
      'oct': 'October', 'nov': 'November',  'dec': 'December'
    };

    rawData.forEach((row) => {
      const buValue  = row[buCol]    || '';
      const buStr    = String(buValue).trim().toUpperCase();
      const monthStr = String(row[monthCol] || '').trim();

      if (!monthStr || !buStr || monthStr.toLowerCase() === 'month' || buStr.toLowerCase() === 'bu') return;

      let bu = null;
      if (buStr.includes('GTL'))  bu = 'GTL';
      else if (buStr.includes('4AL'))  bu = '4AL';
      else if (buStr.includes('SESL')) bu = 'SESL';
      if (!bu) return;

      let month = monthStr;
      const monthMatch = monthStr.match(/^([a-z]+)[-\s]*(\d{2})?/i);
      if (monthMatch) {
        const monthName = monthMatch[1].toLowerCase();
        const year = monthMatch[2] ? `20${monthMatch[2]}` : '';
        if (monthNames[monthName]) {
          month = year ? `${monthNames[monthName]} ${year}` : monthNames[monthName];
        }
      }

      const getNum = (col) => col ? parseFloat(row[col]) || 0 : 0;

      // -----------------------------------------------------------------------
      // SCOPE 1 — DAX: (Solar*0.05 + Diesel*2.68 + GasBoiler*2.02 + GasGen*2.02) / 1000
      // All EFs in kgCO2e/unit → divide total by 1000 for tCO2e
      // -----------------------------------------------------------------------
      const solar        = getNum(solarCol);
      const diesel       = getNum(dieselCol);
      const gasBoiler    = getNum(gasBoilerCol);
      const gasGen       = getNum(gasGenCol);

      const solarEm     = solar     * EF.solar;
      const dieselEm    = diesel    * EF.diesel;
      const gasBoilerEm = gasBoiler * EF.gasBoiler;
      const gasGenEm    = gasGen    * EF.gasGenerator;
      const scope1      = (solarEm + dieselEm + gasBoilerEm + gasGenEm) / 1000; // tCO2e

      const scope1Breakdown = [
        { name: 'Solar',         value: solarEm     / 1000 },
        { name: 'Diesel',        value: dieselEm    / 1000 },
        { name: 'Gas Boiler',    value: gasBoilerEm / 1000 },
        { name: 'Gas Generator', value: gasGenEm    / 1000 },
      ];

      // -----------------------------------------------------------------------
      // SCOPE 2 — DAX: REB_kWh * 0.62 / 1000
      // -----------------------------------------------------------------------
      const reb    = getNum(rebCol);
      const scope2 = (reb * EF.reb) / 1000; // tCO2e

      const scope2Breakdown = [
        { name: 'REB / Grid', value: scope2 },
      ];

      // -----------------------------------------------------------------------
      // SCOPE 3
      // All intermediate values in kgCO2e, /1000 at the end for tCO2e
      // -----------------------------------------------------------------------

      // Solid waste — DAX: (kg / 1000) * 4.69 / 1000 = tCO2e
      const solidWasteKg =
        getNum(jhuteCol) + getNum(paddingCol) + getNum(leftoverCol) +
        getNum(paperCol) + getNum(polyCol)  + getNum(cartonCol)  +
        getNum(coneCol)  + getNum(patternCol) + getNum(medicalCol)  +
        getNum(metalCol) + getNum(electricWasteCol) +
        getNum(drumCol)  + getNum(sludgeCol);

      const solidWasteEm = (solidWasteKg / 1000) * EF.solidWaste; // kgCO2e

      // Food waste — DAX: (kg / 1000) * 8.91 / 1000 = tCO2e
      const foodEm = (getNum(foodCol) / 1000) * EF.foodWaste; // kgCO2e

      // ETP water — DAX: (Inlet + Outlet) * 0.27 / 1000 = tCO2e
      const etpEm = (getNum(etpInletCol) + getNum(etpOutletCol)) * EF.etp; // kgCO2e

      // Chemicals — DAX: (dyes + aux + basic) * 0.0035 / 1000 = tCO2e
      const dyes  = getNum(dyesCol);
      const aux   = getNum(auxCol);
      const basic = getNum(basicCol);
      const chemEm = (dyes + aux + basic) * EF.chemicals; // kgCO2e

      const scope3 = (solidWasteEm + foodEm + etpEm + chemEm) / 1000; // tCO2e

      const scope3Breakdown = [
        { name: 'Solid Waste',    value: solidWasteEm / 1000 },
        { name: 'Food Waste',     value: foodEm       / 1000 },
        { name: 'ETP Wastewater', value: etpEm        / 1000 },
        { name: 'Chemicals/Dyes', value: chemEm       / 1000 },
      ].filter(b => b.value > 0);

      const totalEmissions = scope1 + scope2 + scope3;

      const record = {
        month,
        businessUnit: bu,
        scope1,
        scope2,
        scope3,
        scope1Breakdown,
        scope2Breakdown,
        scope3Breakdown,
        totalEmissions,
      };

      if (buData[bu]) buData[bu].push(record);
      combinedMonthly.push(record);
    });

    console.log('🏢 BU data counts:', {
      GTL:      buData.GTL.length,
      '4AL':    buData['4AL'].length,
      SESL:     buData.SESL.length,
      combined: combinedMonthly.length,
    });

    if (combinedMonthly.length === 0) {
      throw new Error('No valid emissions data found. Please check your file format.');
    }

    const combinedMetrics = EmissionsController.calculateMetrics(combinedMonthly);
    const combinedTrends  = EmissionsController.calculateTrends(combinedMonthly);

    const byBU = {};
    Object.keys(buData).forEach(bu => {
      if (buData[bu].length > 0) {
        byBU[bu] = {
          metrics:     EmissionsController.calculateMetrics(buData[bu]),
          monthlyData: buData[bu],
          trends:      EmissionsController.calculateTrends(buData[bu]),
        };
      }
    });

    return {
      businessUnits: Object.keys(byBU),
      combined: {
        period: {
          start:  combinedMonthly[0]?.month || 'Unknown',
          end:    combinedMonthly[combinedMonthly.length - 1]?.month || 'Unknown',
          months: combinedMonthly.length,
        },
        metrics:     combinedMetrics,
        monthlyData: combinedMonthly,
        trends:      combinedTrends,
      },
      byBU,
    };
  }

  static calculateMetrics(monthlyData) {
    if (monthlyData.length === 0) {
      return {
        totalEmissions: 0, scope1: 0, scope2: 0, scope3: 0,
        avgMonthly: 0,
        peakMonth:   { value: 0, month: 'N/A', businessUnit: 'N/A' },
        lowestMonth: { value: 0, month: 'N/A', businessUnit: 'N/A' },
        scope1Breakdown: [], scope2Breakdown: [], scope3Breakdown: [],
      };
    }

    let totalScope1 = 0, totalScope2 = 0, totalScope3 = 0;
    const scope1Map = new Map();
    const scope2Map = new Map();
    const scope3Map = new Map();

    monthlyData.forEach(month => {
      totalScope1 += month.scope1 || 0;
      totalScope2 += month.scope2 || 0;
      totalScope3 += month.scope3 || 0;

      (month.scope1Breakdown || []).forEach(b => scope1Map.set(b.name, (scope1Map.get(b.name) || 0) + b.value));
      (month.scope2Breakdown || []).forEach(b => scope2Map.set(b.name, (scope2Map.get(b.name) || 0) + b.value));
      (month.scope3Breakdown || []).forEach(b => scope3Map.set(b.name, (scope3Map.get(b.name) || 0) + b.value));
    });

    const totalEmissions = totalScope1 + totalScope2 + totalScope3;

    const peakMonth   = monthlyData.reduce((max, curr) => curr.totalEmissions > max.totalEmissions ? curr : max, monthlyData[0]);
    const lowestMonth = monthlyData.reduce((min, curr) => curr.totalEmissions < min.totalEmissions && curr.totalEmissions > 0 ? curr : min, monthlyData[0]);

    return {
      totalEmissions: parseFloat(totalEmissions.toFixed(4)),
      scope1:         parseFloat(totalScope1.toFixed(4)),
      scope2:         parseFloat(totalScope2.toFixed(4)),
      scope3:         parseFloat(totalScope3.toFixed(4)),
      avgMonthly:     parseFloat((totalEmissions / monthlyData.length).toFixed(4)),
      peakMonth: {
        value:        parseFloat(peakMonth.totalEmissions.toFixed(4)),
        month:        peakMonth.month || 'Unknown',
        businessUnit: peakMonth.businessUnit || 'Unknown',
      },
      lowestMonth: {
        value:        parseFloat(lowestMonth.totalEmissions.toFixed(4)),
        month:        lowestMonth.month || 'Unknown',
        businessUnit: lowestMonth.businessUnit || 'Unknown',
      },
      scope1Breakdown: Array.from(scope1Map, ([name, value]) => ({ name, value })),
      scope2Breakdown: Array.from(scope2Map, ([name, value]) => ({ name, value })),
      scope3Breakdown: Array.from(scope3Map, ([name, value]) => ({ name, value })),
    };
  }

  static calculateTrends(monthlyData) {
    if (monthlyData.length < 2) {
      return { emissionsTrend: 'stable', monthlyChange: 0 };
    }

    const windowSize = Math.min(3, Math.floor(monthlyData.length / 2));
    const first = monthlyData.slice(0, windowSize);
    const last  = monthlyData.slice(-windowSize);

    const firstAvg     = first.reduce((sum, m) => sum + m.totalEmissions, 0) / first.length;
    const lastAvg      = last.reduce((sum, m) => sum + m.totalEmissions, 0) / last.length;
    const changePercent = firstAvg > 0 ? ((lastAvg - firstAvg) / firstAvg) * 100 : 0;

    let emissionsTrend = 'stable';
    if (changePercent > 5)  emissionsTrend = 'increasing';
    else if (changePercent < -5) emissionsTrend = 'decreasing';

    return {
      emissionsTrend,
      monthlyChange:  parseFloat(changePercent.toFixed(2)),
      firstPeriodAvg: parseFloat(firstAvg.toFixed(2)),
      lastPeriodAvg:  parseFloat(lastAvg.toFixed(2)),
    };
  }

  static async getMetrics(req, res) {
    try {
      const emissionsData = await EmissionsData.findOne({
        file: req.params.fileId,
        userId: req.user.id,
      }).populate('file', 'name originalName uploadedAt');

      if (!emissionsData) {
        return res.status(404).json({
          success: false,
          error: 'Emissions data not found. Please process the file first.',
        });
      }

      res.json({ success: true, data: emissionsData });
    } catch (err) {
      console.error('❌ Error fetching metrics:', err);
      res.status(500).json({ success: false, error: 'Failed to fetch metrics', message: err.message });
    }
  }

  static async getDashboardSummary(req, res) {
    try { res.json({ success: true, data: {} }); }
    catch (err) { res.status(500).json({ success: false, error: err.message }); }
  }

  static async compareDatasets(req, res) {
    try { res.json({ success: true, data: {} }); }
    catch (err) { res.status(500).json({ success: false, error: err.message }); }
  }

  static async getTrendAnalysis(req, res) {
    try { res.json({ success: true, data: {} }); }
    catch (err) { res.status(500).json({ success: false, error: err.message }); }
  }

  static async getRecommendations(req, res) {
    try { res.json({ success: true, data: {} }); }
    catch (err) { res.status(500).json({ success: false, error: err.message }); }
  }

  static async exportData(req, res) {
    try { res.json({ success: true, data: {} }); }
    catch (err) { res.status(500).json({ success: false, error: err.message }); }
  }

  static async processEmissionsFile(req, res) {
    try {
      const { fileId } = req.params;
      const userId = req.user.id;

      const file = await File.findOne({ _id: fileId, userId, ...req.buFilter });

      if (!file) {
        return res.status(404).json({ success: false, error: 'File not found or access denied' });
      }

      if (!file.data?.length) {
        return res.status(400).json({ success: false, error: 'File has no data rows' });
      }

      const headers  = file.metadata?.headers || Object.keys(file.data[0] || {});
      const processed = EmissionsController.processMultiBUEmissionsData(file.data, headers);

      if (!processed?.combined?.metrics || !processed?.combined?.monthlyData?.length) {
        return res.status(400).json({
          success: false,
          error: 'Could not extract valid emissions data from this file',
        });
      }

      const updateData = {
        userId,
        file:      fileId,
        fileName:  file.originalName || file.name,
        period:    processed.combined.period,
        metrics:   processed.combined.metrics,
        monthlyData: processed.combined.monthlyData,
        trends:    processed.combined.trends,
        factoryData: processed.byBU,
        processedAt: new Date(),
      };

      const emissionsDoc = await EmissionsData.findOneAndUpdate(
        { userId, file: fileId },
        updateData,
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );

      return res.json({
        success: true,
        data:    emissionsDoc.toObject({ virtuals: true }),
        message: 'Emissions data processed and saved',
      });
    } catch (err) {
      console.error('❌ processEmissionsFile error:', err);
      return res.status(500).json({
        success: false,
        error:   'Failed to process emissions file',
        message: err.message || 'Internal server error',
      });
    }
  }
}

module.exports = EmissionsController;