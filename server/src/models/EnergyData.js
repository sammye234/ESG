// server/src/models/EnergyData.js
const mongoose = require('mongoose');

const MonthlyDataSchema = new mongoose.Schema({
  month: {
    type: String,
    required: true
  },
  reb: {
    type: Number,
    default: 0,
    description: 'Renewable Energy Bought (MWh)'
  },
  diesel: {
    type: Number,
    default: 0,
    description: 'Diesel consumption (Liters)'
  },
  ngBoiler: {
    type: Number,
    default: 0,
    description: 'Natural Gas for Boiler (m³)'
  },
  ngGenerator: {
    type: Number,
    default: 0,
    description: 'Natural Gas for Generator (m³)'
  },
  ngTotal: {
    type: Number,
    default: 0,
    description: 'Total Natural Gas (m³)'
  },
  solar: {
    type: Number,
    default: 0,
    description: 'Solar Energy Generated (MWh)'
  },
  cng: {
    type: Number,
    default: 0,
    description: 'Compressed Natural Gas (m³)'
  },
  totalEnergy: {
    type: Number,
    required: true,
    description: 'Total energy consumption for the month'
  },
  renewableEnergy: {
    type: Number,
    default: 0,
    description: 'Total renewable energy (MWh)'
  },
  fossilFuel: {
    type: Number,
    default: 0,
    description: 'Total fossil fuel energy (MWh)'
  }
}, { _id: false });

const MetricsSchema = new mongoose.Schema({
  totalEnergy: {
    type: Number,
    required: true,
    description: 'Total energy consumption across all months (MWh)'
  },
  electricityGrid: {
    type: Number,
    default: 0,
    description: 'Grid electricity (MWh)'
  },
  electricityRenewable: {
    type: Number,
    default: 0,
    description: 'Renewable electricity - Solar (MWh)'
  },
  naturalGas: {
    type: Number,
    default: 0,
    description: 'Total natural gas consumption (m³)'
  },
  diesel: {
    type: Number,
    default: 0,
    description: 'Total diesel consumption (Liters)'
  },
  cng: {
    type: Number,
    default: 0,
    description: 'Total CNG consumption (m³)'
  },
  renewablePercent: {
    type: Number,
    default: 0,
    description: 'Percentage of renewable energy in mix'
  },
  avgMonthly: {
    type: Number,
    required: true,
    description: 'Average monthly energy consumption (MWh)'
  },
  peakMonth: {
    value: {
      type: Number,
      required: true
    },
    month: {
      type: String,
      required: true
    },
    factory: {           
      type: String
    }
  },
  lowestMonth: {
    value: {
      type: Number,
      required: true
    },
    month: {
      type: String,
      required: true
    },
    factory: {           
      type: String
    }
  }
}, { _id: false });

const TrendsSchema = new mongoose.Schema({
  energyTrend: {
    type: String,
    enum: ['increasing', 'decreasing', 'stable'],
    default: 'stable'
  },
  renewableTrend: {
    type: String,
    enum: ['increasing', 'decreasing', 'stable'],
    default: 'stable'
  },
  monthlyChange: {
    type: Number,
    default: 0,
    description: 'Percentage change in monthly average'
  },
  firstPeriodAvg: {
    type: Number,
    description: 'Average of first 3 months'
  },
  lastPeriodAvg: {
    type: Number,
    description: 'Average of last 3 months'
  }
}, { _id: false });

const PeriodSchema = new mongoose.Schema({
  start: {
    type: String,
    required: true,
    description: 'Starting month of data'
  },
  end: {
    type: String,
    required: true,
    description: 'Ending month of data'
  },
  months: {
    type: Number,
    required: true,
    description: 'Number of months in dataset'
  }
}, { _id: false });

const EnergyDataSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  file: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'File',
    required: true,
    index: true
  },
  fileName: {
    type: String,
    required: true
  },
  period: {
    type: PeriodSchema,
    required: true
  },
  metrics: {
    type: MetricsSchema,
    required: true
  },
  monthlyData: {
    type: [MonthlyDataSchema],
    required: true,
    validate: {
      validator: function(arr) {
        return arr.length > 0;
      },
      message: 'Monthly data cannot be empty'
    }
  },
  trends: {
    type: TrendsSchema,
    required: true
  },
  factoryData: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    default: new Map()
  },
  
  processedAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  processedAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  lastAccessedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for better query performance
EnergyDataSchema.index({ userId: 1, file: 1 }, { unique: true });
EnergyDataSchema.index({ userId: 1, processedAt: -1 });
EnergyDataSchema.index({ 'metrics.renewablePercent': 1 });
EnergyDataSchema.index({ 'metrics.totalEnergy': -1 });

// Update lastAccessedAt on each query
EnergyDataSchema.pre('findOne', function() {
  this.set({ lastAccessedAt: new Date() });
});

// Virtual for renewable vs fossil fuel comparison
EnergyDataSchema.virtual('energyMixComparison').get(function() {
  const renewable = this.metrics.electricityRenewable;
  const fossil = this.metrics.electricityGrid + this.metrics.naturalGas + this.metrics.diesel;
  const total = this.metrics.totalEnergy;
  
  return {
    renewable: {
      value: renewable,
      percent: total > 0 ? (renewable / total) * 100 : 0
    },
    fossil: {
      value: fossil,
      percent: total > 0 ? (fossil / total) * 100 : 0
    }
  };
});

// Method to check if data needs refresh
EnergyDataSchema.methods.needsRefresh = function() {
  const daysSinceProcessed = (Date.now() - this.processedAt) / (1000 * 60 * 60 * 24);
  return daysSinceProcessed > 30; // Refresh if older than 30 days
};

// Static method to get user's energy summary
EnergyDataSchema.statics.getUserSummary = async function(userId) {
  const summary = await this.aggregate([
    { $match: { userId: mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: null,
        totalFiles: { $sum: 1 },
        totalEnergy: { $sum: '$metrics.totalEnergy' },
        totalRenewable: { $sum: '$metrics.electricityRenewable' },
        avgRenewablePercent: { $avg: '$metrics.renewablePercent' },
        mostRecentProcessed: { $max: '$processedAt' }
      }
    }
  ]);

  return summary.length > 0 ? summary[0] : null;
};

// Static method to find data with low renewable percentage
EnergyDataSchema.statics.findLowRenewable = async function(userId, threshold = 20) {
  return this.find({
    userId: userId,
    'metrics.renewablePercent': { $lt: threshold }
  }).sort({ 'metrics.renewablePercent': 1 });
};

// Static method to get trend analysis across all user data
EnergyDataSchema.statics.getOverallTrends = async function(userId) {
  const data = await this.find({ userId: userId })
    .sort({ processedAt: -1 })
    .limit(12); // Last 12 datasets

  if (data.length === 0) return null;

  const trends = {
    energyConsumption: {
      increasing: 0,
      decreasing: 0,
      stable: 0
    },
    renewableAdoption: {
      increasing: 0,
      decreasing: 0,
      stable: 0
    },
    avgRenewablePercent: 0
  };

  data.forEach(d => {
    trends.energyConsumption[d.trends.energyTrend]++;
    trends.renewableAdoption[d.trends.renewableTrend]++;
    trends.avgRenewablePercent += d.metrics.renewablePercent;
  });

  trends.avgRenewablePercent /= data.length;
  trends.avgRenewablePercent = parseFloat(trends.avgRenewablePercent.toFixed(1));

  return trends;
};

// Pre-save middleware to validate data integrity
EnergyDataSchema.pre('save', function(next) {
  // Ensure totalEnergy matches sum of components
  const calculatedTotal = this.monthlyData.reduce((sum, month) => sum + month.totalEnergy, 0);
  const storedTotal = this.metrics.totalEnergy;
  
  // Allow for small floating point differences
  if (Math.abs(calculatedTotal - storedTotal) > 0.1) {
    console.warn(`⚠️ Energy total mismatch: calculated=${calculatedTotal}, stored=${storedTotal}`);
  }

  next();
});

// Enable virtuals in JSON
EnergyDataSchema.set('toJSON', { virtuals: true });
EnergyDataSchema.set('toObject', { virtuals: true });

// Export model
module.exports = mongoose.model('EnergyData', EnergyDataSchema);