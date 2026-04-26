// server/src/controllers/waterController.js 
const WaterData = require('../models/WaterData');
const File = require('../models/File');
const { excelSerialToMonthLabel } = require('../utils/dateUtils');

class WaterController {
  static async getWaterFiles(req, res) {
    try {
      const query = { userId: req.user.id, ...req.buFilter };
      const files = await File.find(query).select('name originalName uploadedAt metadata data businessUnit').sort({ uploadedAt: -1 });
      const waterFiles = files.filter(file => {
        if (!file.data || file.data.length === 0) return false;
        const headers = file.metadata?.headers || Object.keys(file.data[0] || {});
        return headers.some(h => /ground.*water|rainwater|recycled|domestic|wet.*process|boiler|wtp|cooling/i.test(h));
      });
      res.json({ success: true, count: waterFiles.length, files: waterFiles.map(f => ({ _id: f._id, name: f.name, originalName: f.originalName, businessUnit: f.businessUnit, uploadedAt: f.uploadedAt || f.createdAt, rowCount: f.data?.length || 0, headers: f.metadata?.headers || [] })) });
    } catch (err) {
      res.status(500).json({ success: false, error: 'Failed to fetch water files', message: err.message });
    }
  }

  static async processWaterFile(req, res) {
    try {
      const file = await File.findOne({ _id: req.params.fileId, userId: req.user.id });
      if (!file) return res.status(404).json({ success: false, error: 'File not found' });
      if (!file.data || file.data.length === 0) return res.status(400).json({ success: false, error: 'File has no data to process' });

      const headers = file.metadata?.headers || Object.keys(file.data[0]);
      const processedData = WaterController.processEnvironmentalWaterData(file.data, headers);

      let waterData = await WaterData.findOne({ file: file._id, userId: req.user.id });
      const dataToSave = { period: processedData.combined.period, metrics: processedData.combined.metrics, monthlyData: processedData.combined.monthlyData, factoryData: processedData.byBU, processedAt: new Date() };

      if (waterData) { Object.assign(waterData, dataToSave); await waterData.save(); }
      else { waterData = new WaterData({ userId: req.user.id, file: file._id, fileName: file.name, ...dataToSave }); await waterData.save(); }

      res.json({ success: true, data: waterData, businessUnits: processedData.businessUnits });
    } catch (err) {
      res.status(500).json({ success: false, error: 'Failed to process water data', message: err.message });
    }
  }

  static processEnvironmentalWaterData(rawData, headers) {
    const findColumn = (patterns) => headers.find(h => patterns.some(p => new RegExp(p, 'i').test(h.trim()))) || null;

    const buCol           = findColumn(['^bu$', 'business.*unit', 'factory']);
    const monthCol        = findColumn(['^month$', 'period', 'name.*month']);
    const gwCol           = findColumn(['ground.*water.*m3', 'ground.*water', '^gw']);
    const rainCol         = findColumn(['rainwater.*m3', 'rain.*water']);
    const recycledCol     = findColumn(['recycled.*m3', 'recycled']);
    const boilerCol       = findColumn(['boiler.*water.*m3', '^boiler']);
    const domesticCol     = findColumn(['domestic.*m3', '^domestic']);
    const wetProcessCol   = findColumn(['wet.*process.*m3', 'wet.*process']);
    const utilityCol      = findColumn(['utility.*m3', '^utility']);
    const wtpCol          = findColumn(['wtp.*backwash.*m3', 'wtp.*backwash', 'backwash']);
    const coolingCol      = findColumn(['non.*contact.*cooling.*water.*m3', 'non.*contact.*cooling.*m3', 'non.*contact.*cooling', 'cooling.*water']);
    const totalSourceCol  = findColumn(['total.*source.*m3', 'total.*source']);
    const totalConCol     = findColumn(['total.*consum.*m3', 'total.*consum']);
    const treatmentCol    = findColumn(['treatment.*m3', '^treatment']);

    if (!buCol || !monthCol) throw new Error('Required columns (BU and Month) not found in file');

    const buData = { GTL: [], '4AL': [], SESL: [] };
    const combinedMonthly = [];

    rawData.forEach((row, index) => {
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

      const getNum = (col) => col ? (parseFloat(row[col]) || 0) : 0;

      const groundWater = getNum(gwCol);
      const rainwater   = getNum(rainCol);
      const recycled    = getNum(recycledCol);
      const totalSource = totalSourceCol ? (getNum(totalSourceCol) || (groundWater + rainwater + recycled)) : (groundWater + rainwater + recycled);

      if (totalSource === 0) return;

      const boilerWater       = getNum(boilerCol);
      const domestic          = getNum(domesticCol);
      const wetProcess        = getNum(wetProcessCol);
      const utility           = getNum(utilityCol);
      const wtpBackwash       = getNum(wtpCol);
      const nonContactCooling = getNum(coolingCol);
      const totalConsumption  = totalConCol ? (getNum(totalConCol) || (boilerWater + domestic + wetProcess + utility + wtpBackwash + nonContactCooling)) : (boilerWater + domestic + wetProcess + utility + wtpBackwash + nonContactCooling);

      let processLoss = 0, treatment = 0, discharge = 0;
      if (bu === 'GTL') { processLoss = (wetProcess * 0.2) + (domestic * 0.2); treatment = wetProcess * 0.8; discharge = domestic * 0.8; }
      else if (bu === '4AL') { processLoss = (boilerWater * 0.2) + (domestic * 0.2); treatment = boilerWater * 0.8; discharge = domestic * 0.8; }
      else if (bu === 'SESL') { const wet = boilerWater + wtpBackwash + nonContactCooling; processLoss = (wet * 0.2) + (domestic * 0.2); treatment = getNum(treatmentCol) || (wet * 0.8); discharge = domestic * 0.8; }

      const waterRecord = {
        month, businessUnit: bu,
        source: { groundWater, rainwater, recycled, total: totalSource },
        consumption: { boilerWater, domestic, wtpBackwash, nonContactCooling, wetProcess, utility, total: totalConsumption },
        processLoss, treatment, discharge, totalRow: totalSource
      };

      if (buData[bu]) buData[bu].push(waterRecord);
      combinedMonthly.push(waterRecord);
    });

    if (combinedMonthly.length === 0) throw new Error('No valid water data found. Please check your file format.');

    const combinedMetrics = WaterController.calculateMetrics(combinedMonthly);
    const byBU = {};
    Object.keys(buData).forEach(bu => {
      if (buData[bu].length > 0) byBU[bu] = { metrics: WaterController.calculateMetrics(buData[bu]), monthlyData: buData[bu] };
    });

    return {
      businessUnits: Object.keys(byBU),
      combined: { period: { start: combinedMonthly[0]?.month || 'Unknown', end: combinedMonthly[combinedMonthly.length - 1]?.month || 'Unknown', months: combinedMonthly.length }, metrics: combinedMetrics, monthlyData: combinedMonthly },
      byBU
    };
  }

  static calculateMetrics(monthlyData) {
    if (monthlyData.length === 0) return { totalSource: 0, totalGroundWater: 0, totalRainwater: 0, totalRecycled: 0, totalConsumption: 0, totalBoilerWater: 0, totalDomestic: 0, totalWTPBackwash: 0, totalNonContactCooling: 0, totalWetProcess: 0, totalUtility: 0, totalProcessLoss: 0, totalTreatment: 0, totalDischarge: 0, maxConsumption: { value: 0, month: 'N/A', businessUnit: 'N/A' }, minConsumption: { value: 0, month: 'N/A', businessUnit: 'N/A' } };

    let totalGW = 0, totalRain = 0, totalRecycled = 0, totalBoiler = 0, totalDomestic = 0, totalWTP = 0, totalCooling = 0, totalWet = 0, totalUtility = 0, totalLoss = 0, totalTreatment = 0, totalDischarge = 0;

    monthlyData.forEach(m => {
      totalGW       += m.source.groundWater; totalRain     += m.source.rainwater; totalRecycled += m.source.recycled;
      totalBoiler   += m.consumption.boilerWater; totalDomestic += m.consumption.domestic; totalWTP  += m.consumption.wtpBackwash;
      totalCooling  += m.consumption.nonContactCooling; totalWet += m.consumption.wetProcess; totalUtility += m.consumption.utility;
      totalLoss     += m.processLoss; totalTreatment += m.treatment; totalDischarge += m.discharge;
    });

    const peak   = monthlyData.reduce((max, curr) => curr.consumption.total > max.consumption.total ? curr : max, monthlyData[0]);
    const lowest = monthlyData.reduce((min, curr) => curr.consumption.total < min.consumption.total && curr.consumption.total > 0 ? curr : min, monthlyData[0]);

    return {
      totalSource: parseFloat((totalGW + totalRain + totalRecycled).toFixed(2)), totalGroundWater: parseFloat(totalGW.toFixed(2)), totalRainwater: parseFloat(totalRain.toFixed(2)), totalRecycled: parseFloat(totalRecycled.toFixed(2)),
      totalConsumption: parseFloat((totalBoiler + totalDomestic + totalWTP + totalCooling + totalWet + totalUtility).toFixed(2)), totalBoilerWater: parseFloat(totalBoiler.toFixed(2)), totalDomestic: parseFloat(totalDomestic.toFixed(2)),
      totalWTPBackwash: parseFloat(totalWTP.toFixed(2)), totalNonContactCooling: parseFloat(totalCooling.toFixed(2)), totalWetProcess: parseFloat(totalWet.toFixed(2)), totalUtility: parseFloat(totalUtility.toFixed(2)),
      totalProcessLoss: parseFloat(totalLoss.toFixed(2)), totalTreatment: parseFloat(totalTreatment.toFixed(2)), totalDischarge: parseFloat(totalDischarge.toFixed(2)),
      maxConsumption: { value: parseFloat(peak.consumption.total.toFixed(2)),   month: peak.month,   businessUnit: peak.businessUnit   || 'Unknown' },
      minConsumption: { value: parseFloat(lowest.consumption.total.toFixed(2)), month: lowest.month, businessUnit: lowest.businessUnit || 'Unknown' }
    };
  }

  static async getMetrics(req, res) {
    try {
      const waterData = await WaterData.findOne({ file: req.params.fileId, userId: req.user.id }).populate('file', 'name originalName uploadedAt');
      if (!waterData) return res.status(404).json({ success: false, error: 'Water data not found. Please process the file first.' });
      res.json({ success: true, data: waterData });
    } catch (err) {
      res.status(500).json({ success: false, error: 'Failed to fetch metrics', message: err.message });
    }
  }

  static async exportData(req, res) { try { res.json({ success: true, data: {} }); } catch (err) { res.status(500).json({ success: false, error: err.message }); } }
}

module.exports = WaterController;