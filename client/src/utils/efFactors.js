// client/src/utils/efFactors.js

export const MATERIAL_EF = {
  'recycled polyester': 2.5,
  'recycled cotton': 3.5,
  'fleece': 5,
  'organic cotton': 5,
  'polyester': 5,
  'poplin': 5,
  'ribstope': 5,
  'taslon': 5,
  'tpu': 5.3,
  'recycled nylon': 5.4,
  'recycled polyamide': 5.4,
  'bci cotton': 5.5,
  'cotton': 6.5,
  'others': 6.5,
  'viscose': 6.5,
  'woven': 6.5,
  'elastane': 8,
  'lyocell': 8,
  'spandex': 8,
  'nylon': 10,
  'polyamide': 10,
  'rayon': 14,
  'wool': 20,
  'acrylic': 35.7,
  'mod acrylic': 35.7,
  'linen': 10.0,
  'cordura': 6.2,
  'wrap knitted tricot': 5.0,
  'synthetic': 5.0
};

export const EMISSION_FACTORS = {
  scope1: {
    'diesel': { value: 2.68, unit: 'L' },
    'petrol': { value: 2.31, unit: 'L' },
    'gasoline': { value: 2.31, unit: 'L' },
    'naturalgas': { value: 1.9, unit: 'm3' },
    'ng': { value: 1.92, unit: 'm3' },
    'lpg': { value: 1.55, unit: 'L' },
    'coal': { value: 2.42, unit: 'kg' },
    'fueloil': { value: 3.15, unit: 'L' },
  },
  
  scope2: {
    'electricity': { value: 0.62, unit: 'kWh' },
    'reb': { value: 0.62, unit: 'kWh' },
    'steam': { value: 0.35, unit: 'kg' },
    'heating': { value: 0.25, unit: 'kWh' },
    'cooling': { value: 0.18, unit: 'kWh' },
  },
  
      scope3: {
        // Scope 3 emission factors are defined as separate constants below
      }
  };
  
  // Scope 3 emission factors (moved out of EMISSION_FACTORS object)
  export const CHEMICAL_EF = {
    'machine oil': 3.668,
    'machineoil': 3.668,
    'lubricant': 6.0,
    'boilermate': 6.0,
    'boilermate is-101in': 6.0,
    'sodium chloride': 5.5,
    'sodiumchloride': 5.5,
    'rotair plus': 6.0,
    'rotairplus': 6.0,
    'mizho rollax': 6.0,
    'mizhorollax': 6.0,
    'hoggly ink': 10.0,
    'hogglyink': 10.0,
    'wd-40': 2.0,
    'wd40': 2.0,
    'silicone spray': 2.0,
    'siliconespray': 2.0,
    'bwt-phb 301': 6.0,
    'bwtphb301': 6.0,
    'ck 3873': 6.0,
    'ck3873': 6.0,
    'ck 8012': 6.0,
    'ck8012': 6.0,
    'ck 9601': 6.0,
    'ck9601': 6.0,
    'spot lifter-833': 2.0,
    'spot lifter': 2.0,
    'spotlifter': 2.0
  };
  export const TRANSPORT_EF = {
    'covered_van_small': {
      value: 0.00049,
      unit: 'tCO₂e/km.tonne',
      capacity: '3.5-7.5 tons',
      type: 'small'
    },
    'covered_van_large': {
      value: 0.00018,
      unit: 'tCO₂e/km.tonne',
      capacity: '>17 tons',
      type: 'large'
    },
    'van_small': {
      value: 0.00049,
      unit: 'tCO₂e/km.tonne',
      capacity: '3.5-7.5 tons',
      type: 'small'
    },
    'van_large': {
      value: 0.00018,
      unit: 'tCO₂e/km.tonne',
      capacity: '>17 tons',
      type: 'large'
    },
    'truck_small': {
      value: 0.00049,
      unit: 'tCO₂e/km.tonne',
      capacity: '3.5-7.5 tons',
      type: 'small'
    },
    'truck_large': {
      value: 0.00018,
      unit: 'tCO₂e/km.tonne',
      capacity: '>17 tons',
      type: 'large'
    }
  };
  export const BUSINESS_TRAVEL_ROUTES = {
    'dhaka_denmark': {
      name: 'Dhaka → Denmark → Dhaka',
      emission_per_trip: 2.106,
      distance_km: 7150
    },
    'dhaka_frankfurt': {
      name: 'Dhaka → Frankfurt → Dhaka',
      emission_per_trip: 1.013,
      distance_km: 6800
    },
    'dhaka_sweden': {
      name: 'Dhaka → Sweden → Dhaka',
      emission_per_trip: 1.013,
      distance_km: 7200
    },
    'dhaka_china': {
      name: 'Dhaka → China → Dhaka',
      emission_per_trip: 1.139,
      distance_km: 3200
    },
    'dhaka_netherlands': {
      name: 'Dhaka → Netherlands → Dhaka',
      emission_per_trip: 1.035,
      distance_km: 7100
    },
    'custom': {
      name: 'Custom Route',
      emission_per_km: 0.00011, 
      emission_per_km_domestic: 0.00015
    }
  };
  export const COMMUTING_EF = {
    'public_bus': 0.1,
    'public_transport_bus': 0.1,
    'bus': 0.1,
    'motor_bike': 0.08,
    'motorbike': 0.08,
    'motorcycle': 0.08,
    'bike': 0.08,
    'easy_bike': 0.05,
    'easy_bike_auto': 0.05,
    'auto': 0.05,
    'auto_rickshaw': 0.05,
    'cng': 0.05,
    'private_micro_bus': 0.24,
    'micro_bus': 0.24,
    'microbus': 0.24,
    'employee_bus': 0.1,
    'company_bus': 0.1,
    'bicycle': 0,
    'foot': 0,
    'walking': 0,
    'walk': 0
  };
  export const WASTE_EF = {
    'materials': 0.75,
    'material': 0.75,
    'metal': 0.022,
    'metal_waste': 0.022,
    'metalwaste': 0.022,
    'plastic': 0.022,
    'plastic_waste': 0.022,
    'plasticwaste': 0.022,
    'rubber': 0.022,
    'rubber_waste': 0.022,
    'rubberwaste': 0.022,
    'paper': 0.8262,
    'paper_waste': 0.8262,
    'paperwaste': 0.8262,
    'food': 0.6397,
    'food_waste': 0.6397,
    'foodwaste': 0.6397,
    'carton': 0.022,
    'wastage_carton': 0.022,
    'wastagecarton': 0.022,
    'cardboard': 0.022
  };
  export const UPSTREAM_FUEL_ENERGY_EF = {
    'diesel': 0.62874,
    'cng': 0.09487,
    'octane': 0.60283,
    'petrol': 0.60283,
    'gasoline': 0.60283,
    'natural_gas': 0.34593,
    'naturalgas': 0.34593,
    'ng': 0.34593,
    'transmission_loss': 0.0188, // per kWh
    't_d_loss': 0.0188,
    'td_loss': 0.0188,
    'upstream_electricity': 0.55 // per kWh
  };
  export const EOL_EF = {
    'nylon': 1.85,
    'polyester': 2.1,
    'recycled_polyester': 1.65,
    'recycledpolyester': 1.65,
    'others': 2.0,
    'other': 2.0
  };

export const calculateFabricWeight = (lengthYard, widthInch, gsm) => {
  const weightKg = (lengthYard * widthInch * gsm) / 1550000;
  return weightKg / 1000; // Convert to tons
};


export const calculateMaterialEF = (materialMix) => {
  const materials = [];
  const regex = /(\d+(?:\.\d+)?)%\s*([a-zA-Z\s]+?)(?=\d+%|$)/gi;
  let match;
  
  while ((match = regex.exec(materialMix)) !== null) {
    const percentage = parseFloat(match[1]);
    const material = match[2].trim().toLowerCase();
    materials.push({ percentage, material });
  }
  
  if (materials.length === 0) {
    return {
      success: false,
      error: 'Invalid material format. Use format like: 50%Cotton50%Nylon'
    };
  }

  const totalPercentage = materials.reduce((sum, m) => sum + m.percentage, 0);
  if (Math.abs(totalPercentage - 100) > 0.1) {
    return {
      success: false,
      error: `Material percentages must sum to 100%. Current: ${totalPercentage.toFixed(1)}%`
    };
  }

  let efSum = 0;
  let breakdown = [];
  
  materials.forEach((mat) => {
    const matEF = MATERIAL_EF[mat.material] || MATERIAL_EF['others'];
    const contribution = (mat.percentage / 100) * matEF;
    efSum += contribution;
    breakdown.push({
      material: mat.material,
      percentage: mat.percentage,
      ef: matEF,
      contribution
    });
  });

  return {
    success: true,
    ef: efSum,
    breakdown
  };
};

const efFactors = {
  MATERIAL_EF,
  CHEMICAL_EF,
  TRANSPORT_EF,
  BUSINESS_TRAVEL_ROUTES,
  COMMUTING_EF,
  WASTE_EF,
  UPSTREAM_FUEL_ENERGY_EF,
  EOL_EF,
  calculateFabricWeight,
  calculateMaterialEF
};

export default efFactors;