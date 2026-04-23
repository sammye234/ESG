// server/src/controllers/energyController.js
const EnergyData = require('../models/EnergyData');
const File = require('../models/File');

class EnergyController {
  static async getEnergyFiles(req, res) {
    try {
      console.log('📂 Fetching files for user:', req.user.id);
      console.log('🔍 BU Scope:', req.buScope || 'ALL');
      console.log('🔍 Allowed BUs:', req.allowedBusinessUnits);
      
      
      const query = {
        userId: req.user.id,
        ...req.buFilter 
      };

      console.log('📋 Query:', query);

      const files = await File.find(query)
        .select('name originalName uploadedAt metadata data sheets businessUnit')
        .sort({ uploadedAt: -1 });

      console.log(`📊 Found ${files.length} total files`);

      const energyFiles = files.filter(file => {
        if (!file.data || file.data.length === 0) return false;
        
        const headers = file.metadata?.headers || Object.keys(file.data[0] || {});
        const hasEnergyData = headers.some(h => 
          /reb|diesel|solar|gasboiler|gasgenerator|kwh/i.test(h)
        );
        
        return hasEnergyData;
      });

      console.log(`⚡ Found ${energyFiles.length} files with energy data`);

      res.json({
        success: true,
        count: energyFiles.length,
        files: energyFiles.map(f => ({
          _id: f._id,
          name: f.name,
          originalName: f.originalName,
          businessUnit: f.businessUnit, // ✅ Include BU in response
          uploadedAt: f.uploadedAt || f.createdAt,
          rowCount: f.data?.length || 0,
          headers: f.metadata?.headers || []
        }))
      });
    } catch (err) {
      console.error('❌ Error fetching energy files:', err);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch energy files',
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

  static async processEnergyFile(req, res) {
    try {
      const file = await File.findOne({
        _id: req.params.fileId,
        userId: req.user.id
      });

      if (!file) {
        return res.status(404).json({
          success: false,
          error: 'File not found'
        });
      }

      if (!file.data || file.data.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'File has no data to process'
        });
      }

      console.log('⚙️ Processing energy file:', file.name);
      console.log('📊 Row count:', file.data.length);

      const headers = file.metadata?.headers || Object.keys(file.data[0]);
      console.log('📋 Headers:', headers);

      const processedData = EnergyController.processMultiBUEnergyData(
        file.data, 
        headers
      );

      console.log('✅ Processed data:', {
        businessUnits: processedData.businessUnits,
        totalEnergy: processedData.combined?.metrics?.totalEnergy
      });

      // Store processed data
      let energyData = await EnergyData.findOne({
        file: file._id,
        userId: req.user.id
      });

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
        energyData = new EnergyData({
          userId: req.user.id,
          file: file._id,
          fileName: file.name,
          ...dataToSave
        });
        await energyData.save();
      }

      res.json({
        success: true,
        data: energyData,
        businessUnits: processedData.businessUnits
      });
    } catch (err) {
      console.error('❌ Error processing energy file:', err);
      res.status(500).json({
        success: false,
        error: 'Failed to process energy data',
        message: err.message
      });
    }
  }

  static processMultiBUEnergyData(rawData, headers) {
    console.log('🏢 Processing multi-BU energy data...');

    // Helper function to find columns
    const findColumn = (patterns) => {
      return headers.find(h => 
        patterns.some(p => new RegExp(p, 'i').test(h.trim()))
      ) || null;
    };

    // ✅ Detect columns from your dataset structure
    const buCol = findColumn(['^bu$', 'business.*unit', 'factory']);
    const monthCol = findColumn(['^month$', 'period', 'month.*name']);
    const solarCol = findColumn(['solar.*kwh', '^solar']);
    const rebCol = findColumn(['reb.*kwh', '^reb', 'grid.*electric']);
    const dieselCol = findColumn(['diesel.*ltr', '^diesel']);
    const gasBoilerCol = findColumn(['gasboiler.*m3', 'boiler.*m3', '^gasboiler']);
    const gasGenCol = findColumn(['gasgenerator.*m3', 'generator.*m3', '^gasgenerator']);
    
    // ✅ NEW: Detect production and cost columns
    const productionCol = findColumn(['production.*pcs', '^production']);
    const costCol = findColumn(['productioncost.*usd', 'production.*cost', '^cost']);
    const weightCol = findColumn(['productionweight.*kg', 'production.*weight', '^weight']);

    console.log('📋 Detected columns:', {
      bu: buCol,
      month: monthCol,
      solar: solarCol,
      reb: rebCol,
      diesel: dieselCol,
      gasBoiler: gasBoilerCol,
      gasGen: gasGenCol,
      production: productionCol,
      cost: costCol,
      weight: weightCol
    });

    if (!buCol || !monthCol) {
      throw new Error('Required columns (BU and Month) not found in file');
    }

    const buData = {
      GTL: [],
      '4AL': [],
      SESL: []
    };

    const combinedMonthly = [];

    const monthNames = {
      'jan': 'January', 'feb': 'February', 'mar': 'March', 
      'apr': 'April', 'may': 'May', 'jun': 'June',
      'jul': 'July', 'aug': 'August', 'sep': 'September',
      'oct': 'October', 'nov': 'November', 'dec': 'December'
    };

    rawData.forEach((row, index) => {
      // ✅ Get BU from the BU column
      const buValue = row[buCol] || '';
      let buStr = String(buValue).trim().toUpperCase();
      
      // ✅ Get month from the Month column
      const monthValue = row[monthCol] || '';
      let monthStr = String(monthValue).trim();

      // Skip empty or header rows
      if (!monthStr || !buStr || 
          monthStr.toLowerCase() === 'month' || 
          buStr.toLowerCase() === 'bu') {
        return;
      }

      // ✅ Identify BU
      let bu = null;
      if (buStr.includes('GTL')) {
        bu = 'GTL';
      } else if (buStr.includes('4AL')) {
        bu = '4AL';
      } else if (buStr.includes('SESL')) {
        bu = 'SESL';
      }

      if (!bu) {
        console.log(`⚠️ Unknown BU: "${buStr}" in row ${index}`);
        return;
      }

      // ✅ Format month properly
      let month = monthStr;
      const monthMatch = monthStr.match(/^([a-z]+)[-\s]*(\d{2})?/i);
      if (monthMatch) {
        const monthName = monthMatch[1].toLowerCase();
        const year = monthMatch[2] ? `20${monthMatch[2]}` : '';
        
        if (monthNames[monthName]) {
          month = year ? `${monthNames[monthName]} ${year}` : monthNames[monthName];
        }
      }

      // ✅ Parse energy values (handle null/undefined)
      const solar = parseFloat(row[solarCol]) || 0;
      const reb = parseFloat(row[rebCol]) || 0;
      const diesel = parseFloat(row[dieselCol]) || 0;
      const gasBoiler = parseFloat(row[gasBoilerCol]) || 0;
      const gasGen = parseFloat(row[gasGenCol]) || 0;

      // Convert kWh to MWh for calculations
      const rebMWh = reb / 1000;
      const solarMWh = solar / 1000;
      const totalNG = gasBoiler + gasGen;

      const totalEnergy = rebMWh + solarMWh + diesel + totalNG;

      // Skip rows with zero total energy
      if (totalEnergy === 0) {
        return;
      }

      const energyRecord = {
        month,
        businessUnit: bu,
        'Solar (KWh)': solar,
        'REB (KWh)': reb,
        'Diesel (Ltr)': diesel,
        'GasBoiler (m3)': gasBoiler,
        'GasGenerator (m3)': gasGen,
        rebMWh,
        solarMWh,
        dieselLtr: diesel,
        gasBoilerM3: gasBoiler,
        gasGeneratorM3: gasGen,
        ngTotal: totalNG,
        totalEnergy,
        renewableEnergy: solarMWh,
        fossilFuel: rebMWh + diesel + totalNG
      };

      // Add to respective BU data
      if (buData[bu]) {
        buData[bu].push(energyRecord);
      }

      combinedMonthly.push(energyRecord);
    });

    console.log('🏢 BU data counts:', {
      GTL: buData.GTL.length,
      '4AL': buData['4AL'].length,
      SESL: buData.SESL.length,
      combined: combinedMonthly.length
    });

    if (combinedMonthly.length === 0) {
      throw new Error('No valid energy data found. Please check your file format.');
    }

    const combinedMetrics = EnergyController.calculateMetrics(combinedMonthly);
    const combinedTrends = EnergyController.calculateTrends(combinedMonthly);

    const byBU = {};
    Object.keys(buData).forEach(bu => {
      if (buData[bu].length > 0) {
        byBU[bu] = {
          metrics: EnergyController.calculateMetrics(buData[bu]),
          monthlyData: buData[bu],
          trends: EnergyController.calculateTrends(buData[bu])
        };
      }
    });

    return {
      businessUnits: Object.keys(byBU),
      combined: {
        period: {
          start: combinedMonthly[0]?.month || 'Unknown',
          end: combinedMonthly[combinedMonthly.length - 1]?.month || 'Unknown',
          months: combinedMonthly.length
        },
        metrics: combinedMetrics,
        monthlyData: combinedMonthly,
        trends: combinedTrends
      },
      byBU
    };
  }

  static calculateMetrics(monthlyData) {
    if (monthlyData.length === 0) {
      return {
        totalEnergy: 0,
        electricityGrid: 0,
        electricityRenewable: 0,
        naturalGas: 0,
        diesel: 0,
        renewablePercent: 0,
        avgMonthly: 0,
        peakMonth: { value: 0, month: 'N/A', businessUnit: 'N/A' },
        lowestMonth: { value: 0, month: 'N/A', businessUnit: 'N/A' }
      };
    }

    let totalREB = 0, totalDiesel = 0, totalNG = 0, totalSolar = 0;

    monthlyData.forEach(month => {
      totalREB += month.rebMWh || 0;
      totalDiesel += month.dieselLtr || 0;
      totalNG += month.ngTotal || 0;
      totalSolar += month.solarMWh || 0;
    });

    const totalEnergy = totalREB + totalDiesel + totalNG + totalSolar;
    const renewablePercent = totalEnergy > 0 ? (totalSolar / totalEnergy) * 100 : 0;

    const peakMonth = monthlyData.reduce((max, curr) => 
      curr.totalEnergy > max.totalEnergy ? curr : max
    , monthlyData[0]);

    const lowestMonth = monthlyData.reduce((min, curr) => 
      curr.totalEnergy < min.totalEnergy && curr.totalEnergy > 0 ? curr : min
    , monthlyData[0]);

    return {
      totalEnergy: parseFloat(totalEnergy.toFixed(2)),
      electricityGrid: parseFloat(totalREB.toFixed(2)),
      electricityRenewable: parseFloat(totalSolar.toFixed(2)),
      naturalGas: parseFloat(totalNG.toFixed(2)),
      diesel: parseFloat(totalDiesel.toFixed(2)),
      renewablePercent: parseFloat(renewablePercent.toFixed(1)),
      avgMonthly: parseFloat((totalEnergy / monthlyData.length).toFixed(2)),
      peakMonth: {
        value: parseFloat(peakMonth.totalEnergy.toFixed(2)),
        month: peakMonth.month || 'Unknown',
        businessUnit: peakMonth.businessUnit || 'Unknown'
      },
      lowestMonth: {
        value: parseFloat(lowestMonth.totalEnergy.toFixed(2)),
        month: lowestMonth.month || 'Unknown',
        businessUnit: lowestMonth.businessUnit || 'Unknown'
      }
    };
  }

  static calculateTrends(monthlyData) {
    if (monthlyData.length < 2) {
      return {
        energyTrend: 'stable',
        renewableTrend: 'stable',
        monthlyChange: 0
      };
    }

    const windowSize = Math.min(3, Math.floor(monthlyData.length / 2));
    const first = monthlyData.slice(0, windowSize);
    const last = monthlyData.slice(-windowSize);

    const firstAvg = first.reduce((sum, m) => sum + m.totalEnergy, 0) / first.length;
    const lastAvg = last.reduce((sum, m) => sum + m.totalEnergy, 0) / last.length;
    const changePercent = firstAvg > 0 ? ((lastAvg - firstAvg) / firstAvg) * 100 : 0;

    let energyTrend = 'stable';
    if (changePercent > 5) energyTrend = 'increasing';
    else if (changePercent < -5) energyTrend = 'decreasing';

    return {
      energyTrend,
      monthlyChange: parseFloat(changePercent.toFixed(2)),
      firstPeriodAvg: parseFloat(firstAvg.toFixed(2)),
      lastPeriodAvg: parseFloat(lastAvg.toFixed(2))
    };
  }

  static async getMetrics(req, res) {
    try {
      const energyData = await EnergyData.findOne({
        file: req.params.fileId,
        userId: req.user.id
      }).populate('file', 'name originalName uploadedAt');

      if (!energyData) {
        return res.status(404).json({
          success: false,
          error: 'Energy data not found. Please process the file first.'
        });
      }

      res.json({
        success: true,
        data: energyData
      });
    } catch (err) {
      console.error('❌ Error fetching metrics:', err);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch metrics',
        message: err.message
      });
    }
  }

  static async getDashboardSummary(req, res) {
    try {
      res.json({ success: true, data: {} });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  static async compareDatasets(req, res) {
    try {
      res.json({ success: true, data: {} });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  static async getTrendAnalysis(req, res) {
    try {
      res.json({ success: true, data: {} });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  static async getRecommendations(req, res) {
    try {
      res.json({ success: true, data: {} });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  static async exportData(req, res) {
    try {
      res.json({ success: true, data: {} });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  }
}

module.exports = EnergyController;