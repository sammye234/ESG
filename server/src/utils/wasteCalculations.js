// server/src/utils/wasteCalculations.js


const calculateTotalRecycle = (recycleWaste) => {
  const preConsumer = 
    (recycleWaste.preConsumer?.jhute || 0) +
    (recycleWaste.preConsumer?.leftover || 0) +
    (recycleWaste.preConsumer?.padding || 0);
  
  const packaging = 
    (recycleWaste.packaging?.polyPlastic || 0) +
    (recycleWaste.packaging?.carton || 0) +
    (recycleWaste.packaging?.paper || 0) +
    (recycleWaste.packaging?.paperCone || 0);
  
  return preConsumer + packaging;
};


const calculateTotalHazardousSolid = (hazardousWaste) => {
  return (
    (hazardousWaste.solid?.medicalWaste || 0) +
    (hazardousWaste.solid?.metal || 0) +
    (hazardousWaste.solid?.electricWaste || 0) +
    (hazardousWaste.solid?.emptyChemicalDrum || 0)
  );
};


const calculateTotalHazardousLiquid = (hazardousWaste) => {
  return (
    (hazardousWaste.liquid?.etpInlet || 0) +
    (hazardousWaste.liquid?.etpOutlet || 0)
  );
};


const calculateTotalBioSolid = (bioSolidWaste) => {
  return (
    (bioSolidWaste?.sludge || 0) +
    (bioSolidWaste?.foodWaste || 0)
  );
};


const calculateRecyclingRate = (totalRecycle, totalWaste) => {
  return totalWaste > 0 ? (totalRecycle / totalWaste) * 100 : 0;
};


const calculateMoMChange = (current, previous) => {
  if (!previous || previous === 0) return 0;
  return ((current - previous) / previous * 100).toFixed(2);
};


const calculateYoYChange = (current, previous) => {
  if (!previous || previous === 0) return 0;
  return ((current - previous) / previous * 100).toFixed(2);
};


const aggregateYearlyData = (monthlyRecords) => {
  let totalWaste = 0;
  let totalRecycle = 0;
  
  monthlyRecords.forEach(record => {
    if (record.calculated) {
      totalWaste += record.calculated.totalWaste || 0;
      totalRecycle += record.calculated.totalRecycle || 0;
    }
  });
  
  return {
    totalWaste,
    totalRecycle,
    avgRecyclingRate: totalWaste > 0 ? (totalRecycle / totalWaste * 100) : 0
  };
};


// const generateSankeyData = (record) => {

//   return {
//     nodes: [],
//     links: []
//   };
// };

// module.exports = {
//   aggregateYearlyData,
//   calculateMoMChange,
//   calculateYoYChange,
//   generateSankeyData
// };
const generateSankeyData = (wasteData) => {
  const nodes = [
    { name: 'Total Waste' },           // 0
    { name: 'Recycle' },               // 1
    { name: 'Hazardous' },             // 2
    { name: 'Bio-Solid' },             // 3
    { name: 'Pre-Consumer' },          // 4
    { name: 'Packaging' },             // 5
    { name: 'Jhute' },                 // 6
    { name: 'Leftover/Padding' },      // 7
    { name: 'Poly/Plastic' },          // 8
    { name: 'Carton' },               // 9
    { name: 'Paper' },                 // 10
    { name: 'Solid Waste' },           // 11
    { name: 'Liquid Waste' },          // 12
    { name: 'Sludge' },                // 13
    { name: 'Food Waste' }             // 14
  ];

  const totalRecycle = wasteData.calculated?.totalRecycle || 0;
  const totalHazardousSolid = wasteData.calculated?.totalHazardousSolid || 0;
  const totalHazardousLiquid = wasteData.calculated?.totalHazardousLiquid || 0;
  const totalBioSolid = wasteData.calculated?.totalBioSolid || 0;

  const links = [];

  // Total to main categories
  if (totalRecycle > 0) {
    links.push({ source: 0, target: 1, value: totalRecycle });
  }
  if (totalHazardousSolid > 0 || totalHazardousLiquid > 0) {
    links.push({ source: 0, target: 2, value: totalHazardousSolid + totalHazardousLiquid });
  }
  if (totalBioSolid > 0) {
    links.push({ source: 0, target: 3, value: totalBioSolid });
  }

  // Recycle breakdown
  const preConsumerTotal = 
    (wasteData.recycleWaste?.preConsumer?.jhute || 0) +
    (wasteData.recycleWaste?.preConsumer?.leftover || 0) +
    (wasteData.recycleWaste?.preConsumer?.padding || 0);
  
  const packagingTotal = 
    (wasteData.recycleWaste?.packaging?.polyPlastic || 0) +
    (wasteData.recycleWaste?.packaging?.carton || 0) +
    (wasteData.recycleWaste?.packaging?.paper || 0) +
    (wasteData.recycleWaste?.packaging?.paperCone || 0);

  if (preConsumerTotal > 0) {
    links.push({ source: 1, target: 4, value: preConsumerTotal });
  }
  if (packagingTotal > 0) {
    links.push({ source: 1, target: 5, value: packagingTotal });
  }

  // Pre-consumer details
  if (wasteData.recycleWaste?.preConsumer?.jhute > 0) {
    links.push({ source: 4, target: 6, value: wasteData.recycleWaste.preConsumer.jhute });
  }
  const leftoverOrPadding = 
    (wasteData.recycleWaste?.preConsumer?.leftover || 0) +
    (wasteData.recycleWaste?.preConsumer?.padding || 0);
  if (leftoverOrPadding > 0) {
    links.push({ source: 4, target: 7, value: leftoverOrPadding });
  }

  // Packaging details
  if (wasteData.recycleWaste?.packaging?.polyPlastic > 0) {
    links.push({ source: 5, target: 8, value: wasteData.recycleWaste.packaging.polyPlastic });
  }
  if (wasteData.recycleWaste?.packaging?.carton > 0) {
    links.push({ source: 5, target: 9, value: wasteData.recycleWaste.packaging.carton });
  }
  const paperTotal = 
    (wasteData.recycleWaste?.packaging?.paper || 0) +
    (wasteData.recycleWaste?.packaging?.paperCone || 0);
  if (paperTotal > 0) {
    links.push({ source: 5, target: 10, value: paperTotal });
  }

  // Hazardous breakdown
  if (totalHazardousSolid > 0) {
    links.push({ source: 2, target: 11, value: totalHazardousSolid });
  }
  if (totalHazardousLiquid > 0) {
    links.push({ source: 2, target: 12, value: totalHazardousLiquid });
  }

  // Bio-solid breakdown
  if (wasteData.bioSolidWaste?.sludge > 0) {
    links.push({ source: 3, target: 13, value: wasteData.bioSolidWaste.sludge });
  }
  if (wasteData.bioSolidWaste?.foodWaste > 0) {
    links.push({ source: 3, target: 14, value: wasteData.bioSolidWaste.foodWaste });
  }

  return { nodes, links };
};


const getMonthIndex = (monthName) => {
  const months = {
    'January': 1, 'February': 2, 'March': 3, 'April': 4,
    'May': 5, 'June': 6, 'July': 7, 'August': 8,
    'September': 9, 'October': 10, 'November': 11, 'December': 12
  };
  return months[monthName] || 0;
};

//Get month name from index 
const getMonthName = (monthIndex) => {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  return months[monthIndex - 1] || '';
};

//Format number with commas
const formatNumber = (num) => {
  return num.toLocaleString('en-US', { maximumFractionDigits: 0 });
};
// same as b4 format %
const formatPercentage = (num) => {
  return num.toFixed(1) + '%';
};

module.exports = {
  calculateTotalRecycle,
  calculateTotalHazardousSolid,
  calculateTotalHazardousLiquid,
  calculateTotalBioSolid,
  calculateRecyclingRate,
  calculateMoMChange,
  calculateYoYChange,
  aggregateYearlyData,
  generateSankeyData,
  getMonthIndex,
  getMonthName,
  formatNumber,
  formatPercentage
};