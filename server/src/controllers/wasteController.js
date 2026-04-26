// server/src/controllers/wasteController.js
const WasteData = require('../models/WasteData');
const File = require('../models/File');
const { excelSerialToMonthLabel } = require('../utils/dateUtils');

class WasteController {
  static async getWasteFiles(req, res) {
    try {
      const files = await File.find({ ...req.buFilter, userId: req.user.id }).select('name originalName uploadedAt metadata data businessUnit').sort({ uploadedAt: -1 });
      res.json({ success: true, count: files.length, files: files.map(f => ({ _id: f._id, name: f.name, originalName: f.originalName, uploadedAt: f.uploadedAt || f.createdAt, rowCount: f.data?.length || 0, headers: f.metadata?.headers || [], businessUnit: f.businessUnit })) });
    } catch (err) {
      res.status(500).json({ success: false, error: 'Failed to fetch waste files' });
    }
  }

  static async processWasteFile(req, res) {
    try {
      const file = await File.findOne({ _id: req.params.fileId, ...req.buFilter, userId: req.user.id });
      if (!file) return res.status(404).json({ success: false, error: 'File not found or you do not have access to this file' });
      if (!file.data || file.data.length === 0) return res.status(400).json({ success: false, error: 'File has no data to process' });

      const headers = file.metadata?.headers || Object.keys(file.data[0]);
      const processedData = WasteController.processMultiBUWasteData(file.data, headers);

      let wasteData = await WasteData.findOne({ file: file._id, userId: req.user.id });
      const dataToSave = { period: processedData.combined.period, metrics: processedData.combined.metrics, monthlyData: processedData.combined.monthlyData, factoryData: processedData.byBU, processedAt: new Date() };

      if (wasteData) { Object.assign(wasteData, dataToSave); await wasteData.save(); }
      else { wasteData = new WasteData({ userId: req.user.id, file: file._id, fileName: file.name, ...dataToSave }); await wasteData.save(); }

      res.json({ success: true, data: wasteData, businessUnits: processedData.businessUnits });
    } catch (err) {
      res.status(500).json({ success: false, error: 'Failed to process waste data', message: err.message });
    }
  }

  static processMultiBUWasteData(rawData, headers) {
    const findColumn = (patterns) => headers.find(h => patterns.some(p => new RegExp(p, 'i').test(h.trim()))) || null;

    const buCol          = findColumn(['^bu$', 'business.*unit', 'factory', '^unit$', 'factory.*name', 'company']);
    const monthCol       = findColumn(['^month$', 'period', 'name.*month', '^name$', 'name.*of.*month', 'month.*name']);
    const jhuteCol       = findColumn(['jhute.*kg', '^jhute']);
    const paddingCol     = findColumn(['padding.*kg', '^padding']);
    const leftoverCol    = findColumn(['leftover.*kg', '^leftover']);
    const polyCol        = findColumn(['poly.*plastic.*kg', 'poly.*kg', 'plastic.*kg']);
    const cartonCol      = findColumn(['carton.*kg', 'cartoon.*kg', '^carton', '^cartoon']);
    const paperCol       = findColumn(['paper.*kg', '^paper']);
    const emptyConeCol   = findColumn(['empty.*cone.*kg', 'paper.*cone.*kg', '^cone']);
    const patternCol     = findColumn(['pattern.*board.*kg', '^pattern']);
    const medicalCol     = findColumn(['medical.*waste.*kg', '^medical']);
    const metalCol       = findColumn(['metal.*kg', '^metal']);
    const electricCol    = findColumn(['electric.*waste.*kg', '^electric', 'e-waste']);
    const chemDrumCol    = findColumn(['empty.*chemical.*drum.*kg', '^chemical.*drum']);
    const etpInletCol    = findColumn(['etp.*inlet.*m3', '^etp.*inlet']);
    const etpOutletCol   = findColumn(['etp.*outlet.*m3', '^etp.*outlet']);
    const sludgeCol      = findColumn(['sludge.*kg', '^sludge']);
    const foodWasteCol   = findColumn(['food.*waste.*kg', '^food']);

    if (!buCol || !monthCol) throw new Error(`Required columns not found. Available: ${headers.join(', ')}`);

    const buData = { GTL: [], '4AL': [], SESL: [] };
    const combinedMonthly = [];

    rawData.forEach((row) => {
      const buStr    = String(row[buCol] || '').trim().toUpperCase();
      const monthRaw = row[monthCol];

      if (!monthRaw || !buStr || String(monthRaw).toLowerCase() === 'month' || String(monthRaw).toLowerCase().includes('name') || buStr.toLowerCase() === 'bu' || buStr.toLowerCase() === 'unit') return;

      let bu = null;
      if (buStr.includes('GTL'))       bu = 'GTL';
      else if (buStr.includes('4AL'))  bu = '4AL';
      else if (buStr.includes('SESL')) bu = 'SESL';
      if (!bu) return;

      const month = excelSerialToMonthLabel(monthRaw);
      if (!month) return;

      const g = (col) => parseFloat(row[col]) || 0;

      const jhute = g(jhuteCol), padding = g(paddingCol), leftover = g(leftoverCol);
      const polyPlastic = g(polyCol), carton = g(cartonCol), paper = g(paperCol), emptyCone = g(emptyConeCol), patternBoard = g(patternCol);
      const medical = g(medicalCol), metal = g(metalCol), electric = g(electricCol), chemDrum = g(chemDrumCol);
      const etpInlet = g(etpInletCol), etpOutlet = g(etpOutletCol);
      const sludge = g(sludgeCol), foodWaste = g(foodWasteCol);

      const preConsumer     = jhute + padding + leftover;
      const packaging       = polyPlastic + carton + paper + emptyCone + patternBoard;
      const recyclable      = preConsumer + packaging;
      const solidHazardous  = medical + metal + electric + chemDrum;
      const liquidHazardous = etpInlet + etpOutlet + sludge;
      const hazardous       = solidHazardous + liquidHazardous;
      const bioSolid        = foodWaste;
      const totalWaste      = recyclable + solidHazardous + bioSolid;

      if (totalWaste === 0) return;

      const wasteRecord = {
        month, businessUnit: bu,
        recycleWaste: { preConsumer: { jhute, padding, leftover }, packaging: { polyPlastic, carton, paper, emptyCone, patternBoard } },
        hazardousWaste: { solid: { medical, metal, electric, chemicalDrum: chemDrum }, liquid: { etpInlet, etpOutlet } },
        bioSolidWaste: { sludge, foodWaste },
        calculated: { totalPreConsumer: preConsumer, totalPackaging: packaging, totalRecyclable: recyclable, totalHazardousSolid: solidHazardous, totalHazardousLiquid: liquidHazardous, totalHazardous: hazardous, totalBioSolid: bioSolid, totalWaste }
      };

      if (buData[bu]) buData[bu].push(wasteRecord);
      combinedMonthly.push(wasteRecord);
    });

    if (combinedMonthly.length === 0) throw new Error('No valid waste data found after processing. Please check your file format.');

    const combinedMetrics = WasteController.calculateMetrics(combinedMonthly);
    const byBU = {};
    Object.keys(buData).forEach(bu => {
      if (buData[bu].length > 0) byBU[bu] = { metrics: WasteController.calculateMetrics(buData[bu]), monthlyData: buData[bu] };
    });

    return {
      businessUnits: Object.keys(byBU),
      combined: { period: { start: combinedMonthly[0]?.month || 'Unknown', end: combinedMonthly[combinedMonthly.length - 1]?.month || 'Unknown', months: combinedMonthly.length }, metrics: combinedMetrics, monthlyData: combinedMonthly },
      byBU
    };
  }

  static calculateMetrics(monthlyData) {
    if (monthlyData.length === 0) return { totalWaste: 0, totalRecyclable: 0, totalHazardous: 0, preConsumer: 0, packaging: 0, solidHazardous: 0, liquidHazardous: 0, bioSolid: 0, recyclingRate: 0 };

    let totalWaste = 0, totalRecyclable = 0, totalHazardous = 0, preConsumer = 0, packaging = 0, solidHazardous = 0, liquidHazardous = 0, bioSolid = 0;
    monthlyData.forEach(m => {
      totalWaste      += m.calculated?.totalWaste || 0; totalRecyclable += m.calculated?.totalRecyclable || 0; totalHazardous  += m.calculated?.totalHazardous || 0;
      preConsumer     += m.calculated?.totalPreConsumer || 0; packaging += m.calculated?.totalPackaging || 0;
      solidHazardous  += m.calculated?.totalHazardousSolid || 0; liquidHazardous += m.calculated?.totalHazardousLiquid || 0; bioSolid += m.calculated?.totalBioSolid || 0;
    });

    return { totalWaste: parseFloat(totalWaste.toFixed(2)), totalRecyclable: parseFloat(totalRecyclable.toFixed(2)), totalHazardous: parseFloat(totalHazardous.toFixed(2)), preConsumer: parseFloat(preConsumer.toFixed(2)), packaging: parseFloat(packaging.toFixed(2)), solidHazardous: parseFloat(solidHazardous.toFixed(2)), liquidHazardous: parseFloat(liquidHazardous.toFixed(2)), bioSolid: parseFloat(bioSolid.toFixed(2)), recyclingRate: parseFloat((totalWaste > 0 ? (totalRecyclable / totalWaste) * 100 : 0).toFixed(1)) };
  }

  static async getMetrics(req, res) {
    try {
      const wasteData = await WasteData.findOne({ file: req.params.fileId, userId: req.user.id }).populate('file', 'name originalName uploadedAt');
      if (!wasteData) return res.status(404).json({ success: false, error: 'Waste data not found. Please process the file first.' });
      res.json({ success: true, data: wasteData });
    } catch (err) {
      res.status(500).json({ success: false, error: 'Failed to fetch metrics', message: err.message });
    }
  }

  static async getAccessibleBUs(req, res) { try { res.json({ success: true, data: { accessibleBUs: req.user.getAccessibleBUs(), canViewAllBUs: req.user.permissions.canViewAllBUs, currentBU: req.user.businessUnit, role: req.user.role } }); } catch (err) { res.status(500).json({ success: false, error: err.message }); } }
  static async validateUploadAccess(req, res, next) { try { if (!req.user.permissions.canUploadData) return res.status(403).json({ success: false, error: 'No upload permission' }); next(); } catch (err) { res.status(500).json({ success: false, error: err.message }); } }
  static async getLatest(req, res) { try { const r = await WasteData.findOne({ userId: req.user.id }).sort({ year: -1, month: -1 }); if (!r) return res.status(404).json({ success: false, message: 'No waste data found' }); res.json({ success: true, data: r }); } catch (err) { res.status(500).json({ success: false, message: err.message }); } }
  static async deleteWasteData(req, res) { try { const w = await WasteData.findOne({ _id: req.params.id, userId: req.user.id }); if (!w) return res.status(404).json({ success: false, message: 'Not found' }); await w.deleteOne(); res.json({ success: true, message: 'Deleted' }); } catch (err) { res.status(500).json({ success: false, message: err.message }); } }
  static async updateWasteData(req, res) { try { const w = await WasteData.findOne({ _id: req.params.id, userId: req.user.id }); if (!w) return res.status(404).json({ success: false, message: 'Not found' }); Object.assign(w, req.body); await w.save(); res.json({ success: true, data: w }); } catch (err) { res.status(500).json({ success: false, message: err.message }); } }
}

module.exports = WasteController;