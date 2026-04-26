// server/src/controllers/energyController.js
const EnergyData = require('../models/EnergyData');
const File = require('../models/File');
const { excelSerialToMonthLabel } = require('../utils/dateUtils');

class EnergyController {
  static async getEnergyFiles(req, res) {
    try {
      const query = { userId: req.user.id, ...req.buFilter };
      const files = await File.find(query)
        .select('name originalName uploadedAt metadata data sheets businessUnit')
        .sort({ uploadedAt: -1 });

      const energyFiles = files.filter(file => {
        if (!file.data || file.data.length === 0) return false;
        const headers = file.metadata?.headers || Object.keys(file.data[0] || {});
        return headers.some(h => /reb|diesel|solar|gasboiler|gasgenerator|kwh/i.test(h));
      });

      res.json({
        success: true,
        count: energyFiles.length,
        files: energyFiles.map(f => ({
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
      res.status(500).json({ success: false, error: 'Failed to fetch energy files', message: err.message });
    }
  }

  static async processEnergyFile(req, res) {
    try {
      const file = await File.findOne({ _id: req.params.fileId, userId: req.user.id });
      if (!file) return res.status(404).json({ success: false, error: 'File not found' });
      if (!file.data || file.data.length === 0) return res.status(400).json({ success: false, error: 'File has no data to process' });

      const headers = file.metadata?.headers || Object.keys(file.data[0]);
      const processedData = EnergyController.processMultiBUEnergyData(file.data, headers);

      let energyData = await EnergyData.findOne({ file: file._id, userId: req.user.id });
      const dataToSave = {
        period: processedData.combined.period,
        metrics: processedData.combined.metrics,
        monthlyData: processedData.combined.monthlyData,
        trends: processedData.combined.trends,
        factoryData: processedData.byBU,
        processedAt: new Date()
      };

      if (energyData) {
        Object.assign(energyData, dataToSave);
        await energyData.save();
      } else {
        energyData = new EnergyData({ userId: req.user.id, file: file._id, fileName: file.name, ...dataToSave });
        await energyData.save();
      }

      res.json({ success: true, data: energyData, businessUnits: processedData.businessUnits });
    } catch (err) {
      res.status(500).json({ success: false, error: 'Failed to process energy data', message: err.message });
    }
  }

  static processMultiBUEnergyData(rawData, headers) {
    const findColumn = (patterns) => headers.find(h => patterns.some(p => new RegExp(p, 'i').test(h.trim()))) || null;

    const buCol       = findColumn(['^bu$', 'business.*unit', 'factory']);
    const monthCol    = findColumn(['^month$', 'period', 'month.*name']);
    const solarCol    = findColumn(['solar.*kwh', '^solar']);
    const rebCol      = findColumn(['reb.*kwh', '^reb', 'grid.*electric']);
    const dieselCol   = findColumn(['diesel.*ltr', '^diesel']);
    const gasBoilerCol = findColumn(['gasboiler.*m3', 'boiler.*m3', '^gasboiler']);
    const gasGenCol   = findColumn(['gasgenerator.*m3', 'generator.*m3', '^gasgenerator']);
    const productionCol = findColumn(['production.*pcs', '^production']);
    const costCol     = findColumn(['productioncost.*usd', 'production.*cost', '^cost']);
    const weightCol   = findColumn(['productionweight.*kg', 'production.*weight', '^weight']);

    if (!buCol || !monthCol) throw new Error('Required columns (BU and Month) not found in file');

    const buData = { GTL: [], '4AL': [], SESL: [] };
    const combinedMonthly = [];

    rawData.forEach((row) => {
      const buStr   = String(row[buCol] || '').trim().toUpperCase();
      const monthRaw = row[monthCol];

      if (!monthRaw || !buStr || String(monthRaw).toLowerCase() === 'month' || buStr.toLowerCase() === 'bu') return;

      let bu = null;
      if (buStr.includes('GTL'))       bu = 'GTL';
      else if (buStr.includes('4AL'))  bu = '4AL';
      else if (buStr.includes('SESL')) bu = 'SESL';
      if (!bu) return;

      const month = excelSerialToMonthLabel(monthRaw);
      if (!month) return;

      const solar    = parseFloat(row[solarCol])    || 0;
      const reb      = parseFloat(row[rebCol])      || 0;
      const diesel   = parseFloat(row[dieselCol])   || 0;
      const gasBoiler = parseFloat(row[gasBoilerCol]) || 0;
      const gasGen   = parseFloat(row[gasGenCol])   || 0;

      const rebMWh   = reb / 1000;
      const solarMWh = solar / 1000;
      const totalNG  = gasBoiler + gasGen;
      const totalEnergy = rebMWh + solarMWh + diesel + totalNG;

      if (totalEnergy === 0) return;

      const energyRecord = {
        month, businessUnit: bu,
        'Solar (KWh)': solar, 'REB (KWh)': reb, 'Diesel (Ltr)': diesel,
        'GasBoiler (m3)': gasBoiler, 'GasGenerator (m3)': gasGen,
        rebMWh, solarMWh, dieselLtr: diesel, gasBoilerM3: gasBoiler,
        gasGeneratorM3: gasGen, ngTotal: totalNG, totalEnergy,
        renewableEnergy: solarMWh, fossilFuel: rebMWh + diesel + totalNG,
        ProductionCost: parseFloat(row[costCol]) || 0,
        'ProductionWeight (Kg)': parseFloat(row[weightCol]) || 0,
        'Production (Pcs)': parseFloat(row[productionCol]) || 0,
      };

      if (buData[bu]) buData[bu].push(energyRecord);
      combinedMonthly.push(energyRecord);
    });

    if (combinedMonthly.length === 0) throw new Error('No valid energy data found. Please check your file format.');

    const combinedMetrics = EnergyController.calculateMetrics(combinedMonthly);
    const combinedTrends  = EnergyController.calculateTrends(combinedMonthly);

    const byBU = {};
    Object.keys(buData).forEach(bu => {
      if (buData[bu].length > 0) {
        byBU[bu] = { metrics: EnergyController.calculateMetrics(buData[bu]), monthlyData: buData[bu], trends: EnergyController.calculateTrends(buData[bu]) };
      }
    });

    return {
      businessUnits: Object.keys(byBU),
      combined: {
        period: { start: combinedMonthly[0]?.month || 'Unknown', end: combinedMonthly[combinedMonthly.length - 1]?.month || 'Unknown', months: combinedMonthly.length },
        metrics: combinedMetrics, monthlyData: combinedMonthly, trends: combinedTrends
      },
      byBU
    };
  }

  static calculateMetrics(monthlyData) {
    if (monthlyData.length === 0) return { totalEnergy: 0, electricityGrid: 0, electricityRenewable: 0, naturalGas: 0, diesel: 0, renewablePercent: 0, avgMonthly: 0, peakMonth: { value: 0, month: 'N/A', businessUnit: 'N/A' }, lowestMonth: { value: 0, month: 'N/A', businessUnit: 'N/A' } };

    let totalREB = 0, totalDiesel = 0, totalNG = 0, totalSolar = 0;
    monthlyData.forEach(m => { totalREB += m.rebMWh || 0; totalDiesel += m.dieselLtr || 0; totalNG += m.ngTotal || 0; totalSolar += m.solarMWh || 0; });

    const totalEnergy     = totalREB + totalDiesel + totalNG + totalSolar;
    const renewablePercent = totalEnergy > 0 ? (totalSolar / totalEnergy) * 100 : 0;
    const peakMonth       = monthlyData.reduce((max, curr) => curr.totalEnergy > max.totalEnergy ? curr : max, monthlyData[0]);
    const lowestMonth     = monthlyData.reduce((min, curr) => curr.totalEnergy < min.totalEnergy && curr.totalEnergy > 0 ? curr : min, monthlyData[0]);

    return {
      totalEnergy:          parseFloat(totalEnergy.toFixed(2)),
      electricityGrid:      parseFloat(totalREB.toFixed(2)),
      electricityRenewable: parseFloat(totalSolar.toFixed(2)),
      naturalGas:           parseFloat(totalNG.toFixed(2)),
      diesel:               parseFloat(totalDiesel.toFixed(2)),
      renewablePercent:     parseFloat(renewablePercent.toFixed(1)),
      avgMonthly:           parseFloat((totalEnergy / monthlyData.length).toFixed(2)),
      peakMonth:   { value: parseFloat(peakMonth.totalEnergy.toFixed(2)),   month: peakMonth.month   || 'Unknown', businessUnit: peakMonth.businessUnit   || 'Unknown' },
      lowestMonth: { value: parseFloat(lowestMonth.totalEnergy.toFixed(2)), month: lowestMonth.month || 'Unknown', businessUnit: lowestMonth.businessUnit || 'Unknown' }
    };
  }

  static calculateTrends(monthlyData) {
    if (monthlyData.length < 2) return { energyTrend: 'stable', renewableTrend: 'stable', monthlyChange: 0 };
    const windowSize   = Math.min(3, Math.floor(monthlyData.length / 2));
    const firstAvg     = monthlyData.slice(0, windowSize).reduce((s, m) => s + m.totalEnergy, 0) / windowSize;
    const lastAvg      = monthlyData.slice(-windowSize).reduce((s, m) => s + m.totalEnergy, 0) / windowSize;
    const changePercent = firstAvg > 0 ? ((lastAvg - firstAvg) / firstAvg) * 100 : 0;
    return { energyTrend: changePercent > 5 ? 'increasing' : changePercent < -5 ? 'decreasing' : 'stable', monthlyChange: parseFloat(changePercent.toFixed(2)), firstPeriodAvg: parseFloat(firstAvg.toFixed(2)), lastPeriodAvg: parseFloat(lastAvg.toFixed(2)) };
  }

  static async getMetrics(req, res) {
    try {
      const energyData = await EnergyData.findOne({ file: req.params.fileId, userId: req.user.id }).populate('file', 'name originalName uploadedAt');
      if (!energyData) return res.status(404).json({ success: false, error: 'Energy data not found. Please process the file first.' });
      res.json({ success: true, data: energyData });
    } catch (err) {
      res.status(500).json({ success: false, error: 'Failed to fetch metrics', message: err.message });
    }
  }

  static async getDashboardSummary(req, res) { try { res.json({ success: true, data: {} }); } catch (err) { res.status(500).json({ success: false, error: err.message }); } }
  static async compareDatasets(req, res)    { try { res.json({ success: true, data: {} }); } catch (err) { res.status(500).json({ success: false, error: err.message }); } }
  static async getTrendAnalysis(req, res)   { try { res.json({ success: true, data: {} }); } catch (err) { res.status(500).json({ success: false, error: err.message }); } }
  static async getRecommendations(req, res) { try { res.json({ success: true, data: {} }); } catch (err) { res.status(500).json({ success: false, error: err.message }); } }
  static async exportData(req, res)         { try { res.json({ success: true, data: {} }); } catch (err) { res.status(500).json({ success: false, error: err.message }); } }
}

module.exports = EnergyController;