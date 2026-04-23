// server/src/utils/parseWaterData.js


const detectFactoryFormat = (headers) => {
  const headerStr = headers.join('|').toLowerCase();
  
  // Format 1: 4AL (has "Wet Process", "Total Consumption")
  if (headerStr.includes('wet process') && headerStr.includes('total consumption')) {
    return 'Format1_4AL';
  }
  
  // Format 2: 4AL Yarn (has "Boiler Water", "WTP Backwash", "Non-contact Cooling Water")
  if (headerStr.includes('boiler water') || headerStr.includes('wtp backwash')) {
    return 'Format2_4ALYarn';
  }
  
  // Format 3:basic columns only
  if (headerStr.includes('ground water') && headerStr.includes('domestic')) {
    return 'Format3_Generic';
  }
  
  return 'Unknown';
};

const cleanValue = (value) => {
  if (value === null || value === undefined || value === '') return 0;
  const num = parseFloat(value);
  return isNaN(num) ? 0 : num;
};

const parseFormat1_4AL = (rows) => {
  const monthlyData = [];
  
  rows.forEach(row => {
    const month = row['Name of the Month']?.toString().trim();
    if (!month || month.toLowerCase().includes('name') || month.toLowerCase().includes('month')) {
      return;
    }

    // Source
    const gw         = cleanValue(row['GW']);
    const rainwater  = cleanValue(row['Rainwater']);
    const recycled   = cleanValue(row['Recycled']);
    const sourceTotal = cleanValue(row['Total']) || (gw + rainwater + recycled);

    // Consumption
    const wetProcess = cleanValue(row['Wet Process']);
    const domestic   = cleanValue(row['Domestic']);
    const utility    = cleanValue(row['Utility']);
    
    const wtpBackwash       = cleanValue(row['WTP Backwash(m3)']) || cleanValue(row['WTP Backwash']);
    const nonContactCooling = cleanValue(row['Non-contact Cooling Water(m3)']) || cleanValue(row['Non-contact Cooling Water']);

    const consumptionTotal =
      cleanValue(row['Total Consumption']) ||
      cleanValue(row['Total Consumption']) ||
      (wetProcess + domestic + utility + wtpBackwash + nonContactCooling);

    // Loss, Treatment, Discharge
    const processLoss = cleanValue(row['Process Loss(m3)']) || cleanValue(row['ProcessLoss']);
    const treatment   = cleanValue(row['Treatment(m3)'])    || cleanValue(row['Treatment']);
    const discharge   = cleanValue(row['Discharge(m3)'])    || cleanValue(row['Discharge']);

    monthlyData.push({
      month,
      source: {
        groundWater: gw,
        rainwater,
        recycled,
        total: sourceTotal
      },
      consumption: {
        wetProcess,
        boilerWater: 0,
        domestic,
        utility,
        wtpBackwash,
        nonContactCooling,
        total: consumptionTotal
      },
      processLoss,
      treatment,
      discharge
    });
  });

  return monthlyData;
};

const parseFormat2_4ALYarn = (rows) => {
  const monthlyData = [];
  
  rows.forEach(row => {
    const month = row['Name of the Month']?.toString().trim();
    if (!month || month.toLowerCase().includes('name') || month.toLowerCase().includes('month')) {
      return;
    }

    // Source
    const gw        = cleanValue(row['Ground Water']) || cleanValue(row['GW']);
    const rainwater = cleanValue(row['Rainwater']);
    const recycled  = cleanValue(row['Recycled']);
    const sourceTotal = cleanValue(row['Total']) || (gw + rainwater + recycled);

    // Consumption
    const boilerWater       = cleanValue(row['Boiler Water']);
    const domestic          = cleanValue(row['Domestic']);
    const wtpBackwash       = cleanValue(row['WTP Backwash(m3)'])              || cleanValue(row['WTP Backwash']);
    const nonContactCooling = cleanValue(row['Non-contact Cooling Water(m3)']) || cleanValue(row['Non-contact Cooling Water']);

    const consumptionTotal =
      cleanValue(row['Total Consumption']) ||
      cleanValue(row['Total Consumption']) ||
      (boilerWater + domestic + wtpBackwash + nonContactCooling);

    // Loss, Treatment, Discharge
    const processLoss = cleanValue(row['Process Loss(m3)']) || cleanValue(row['ProcessLoss']);
    const treatment   = cleanValue(row['Treatment(m3)'])    || cleanValue(row['Treatment']);
    const discharge   = cleanValue(row['Discharge(m3)'])    || cleanValue(row['Discharge']);

    monthlyData.push({
      month,
      source: {
        groundWater: gw,
        rainwater,
        recycled,
        total: sourceTotal
      },
      consumption: {
        wetProcess: 0,
        boilerWater,
        domestic,
        utility: 0,
        wtpBackwash,
        nonContactCooling,
        total: consumptionTotal
      },
      processLoss,
      treatment,
      discharge
    });
  });

  return monthlyData;
};

const parseFormat3_Generic = (rows) => {
  const monthlyData = [];
  
  rows.forEach(row => {
    const month = row['Name of the Month']?.toString().trim();
    if (!month || month.toLowerCase().includes('name') || month.toLowerCase().includes('month')) {
      return;
    }

    // Source
    const gw        = cleanValue(row['GW'])        || cleanValue(row['Ground Water']);
    const rainwater = cleanValue(row['Rainwater'])  || cleanValue(row['Rain Water']);
    const recycled  = cleanValue(row['Recycled'])   || cleanValue(row['Recycled Water']);
    const sourceTotal = gw + rainwater + recycled;

    // Consumption
    const wetProcess = cleanValue(row['Wet Process'])    || cleanValue(row['Factory Production']);
    const domestic   = cleanValue(row['Domestic'])       || cleanValue(row['Domestic Use']);
    const utility    = cleanValue(row['Utility'])        || cleanValue(row['Utility Use']);
    
    const wtpBackwash       = cleanValue(row['WTP Backwash(m3)'])              || cleanValue(row['WTP Backwash']);
    const nonContactCooling = cleanValue(row['Non-contact Cooling Water(m3)']) || cleanValue(row['Non-contact Cooling Water']);

    const consumptionTotal = wetProcess + domestic + utility + wtpBackwash + nonContactCooling;

    // Loss, Treatment, Discharge
    const processLoss = cleanValue(row['Process Loss'])    || cleanValue(row['Process Loss(m3)']);
    const treatment   = cleanValue(row['Treatment'])       || cleanValue(row['Treatment(m3)']);
    const discharge   = cleanValue(row['Discharge'])       || cleanValue(row['Discharge(m3)']);

    monthlyData.push({
      month,
      source: {
        groundWater: gw,
        rainwater,
        recycled,
        total: sourceTotal
      },
      consumption: {
        wetProcess,
        boilerWater: 0,
        domestic,
        utility,
        wtpBackwash,
        nonContactCooling,
        total: consumptionTotal
      },
      processLoss,
      treatment,
      discharge
    });
  });

  return monthlyData;
};

const calculateTotals = (monthlyData) => {
  const totals = {
    totalSource: 0,
    totalGroundWater: 0,
    totalRainwater: 0,
    totalRecycled: 0,
    totalConsumption: 0,
    totalWetProcess: 0,
    totalBoilerWater: 0,
    totalDomestic: 0,
    totalUtility: 0,
    
    totalWTPBackwash: 0,
    totalNonContactCooling: 0,
    totalProcessLoss: 0,
    totalTreatment: 0,
    totalDischarge: 0,
    maxConsumption: { value: 0, month: '' },
    minConsumption: { value: Infinity, month: '' }
  };

  monthlyData.forEach(data => {
    totals.totalSource         += data.source.total;
    totals.totalGroundWater    += data.source.groundWater;
    totals.totalRainwater      += data.source.rainwater;
    totals.totalRecycled       += data.source.recycled;
    totals.totalConsumption    += data.consumption.total;
    totals.totalWetProcess     += data.consumption.wetProcess;
    totals.totalBoilerWater    += data.consumption.boilerWater;
    totals.totalDomestic       += data.consumption.domestic;
    totals.totalUtility        += data.consumption.utility;
    
    totals.totalWTPBackwash      += data.consumption.wtpBackwash      || 0;
    totals.totalNonContactCooling += data.consumption.nonContactCooling || 0;
    totals.totalProcessLoss    += data.processLoss;
    totals.totalTreatment      += data.treatment;
    totals.totalDischarge      += data.discharge;

    if (data.consumption.total > totals.maxConsumption.value) {
      totals.maxConsumption = { value: data.consumption.total, month: data.month };
    }
    if (data.consumption.total < totals.minConsumption.value && data.consumption.total > 0) {
      totals.minConsumption = { value: data.consumption.total, month: data.month };
    }
  });

  return totals;
};

const parseWaterData = (rows, headers = null) => {
  if (!rows || rows.length === 0) {
    console.log('❌ No rows provided to parseWaterData');
    return null;
  }

  if (!headers && rows.length > 0) {
    headers = Object.keys(rows[0]);
  }

  console.log('🔍 Detecting factory format from headers:', headers);
  const factoryType = detectFactoryFormat(headers);
  console.log('✅ Detected format:', factoryType);

  let monthlyData = [];

  switch (factoryType) {
    case 'Format1_4AL':
      monthlyData = parseFormat1_4AL(rows);
      break;
    case 'Format2_4ALYarn':
      monthlyData = parseFormat2_4ALYarn(rows);
      break;
    case 'Format3_Generic':
      monthlyData = parseFormat3_Generic(rows);
      break;
    default:
      console.warn('⚠️ Unknown format, attempting generic parse');
      monthlyData = parseFormat3_Generic(rows);
  }

  if (monthlyData.length === 0) {
    console.log('❌ No valid monthly data parsed');
    return null;
  }

  const totals = calculateTotals(monthlyData);

  return {
    factoryType,
    monthlyData,
    ...totals
  };
};

module.exports = { parseWaterData, detectFactoryFormat };