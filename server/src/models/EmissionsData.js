// server/src/models/EmissionsData.js
const mongoose = require('mongoose');

const MonthlyDataSchema = new mongoose.Schema({
  month: {
    type: String,
    required: true
  },
  scope1: {
    type: Number,
    default: 0,
    description: 'Scope 1 emissions (tCO₂e)'
  },
  scope2: {
    type: Number,
    default: 0,
    description: 'Scope 2 emissions (tCO₂e)'
  },
  scope3: {
    type: Number,
    default: 0,
    description: 'Scope 3 emissions (tCO₂e)'
  },
  scope3Upstream: { type: Number, default: 0 },   
  scope3Downstream: { type: Number, default: 0 },  
  businessUnit: { type: String }, 
  totalEmissions: {
    type: Number,
    required: true,
    description: 'Total emissions for the month (tCO₂e)'
  }
}, { _id: false });
const BreakdownSchema = new mongoose.Schema({
  name: String,
  value: Number
}, { _id: false });

const MetricsSchema = new mongoose.Schema({
  totalEmissions: {
    type: Number,
    required: true,
    description: 'Total emissions across all months (tCO₂e)'
  },
  scope1: {
    type: Number,
    default: 0,
    description: 'Total Scope 1 emissions (tCO₂e)'
  },
  scope2: {
    type: Number,
    default: 0,
    description: 'Total Scope 2 emissions (tCO₂e)'
  },
  scope3: {
    type: Number,
    default: 0,
    description: 'Total Scope 3 emissions (tCO₂e)'
  },
  avgMonthly: {
    type: Number,
    required: true,
    description: 'Average monthly emissions (tCO₂e)'
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
    },
    scope1Breakdown: [BreakdownSchema],
    scope2Breakdown: [BreakdownSchema],
    scope3Breakdown: [BreakdownSchema],
    scope3Upstream: Number,
    scope3Downstream: Number
  }, { _id: false });
  

const TrendsSchema = new mongoose.Schema({
  emissionsTrend: {
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

const EmissionsDataSchema = new mongoose.Schema({
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
  lastAccessedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes
EmissionsDataSchema.index({ userId: 1, file: 1 }, { unique: true });
EmissionsDataSchema.index({ userId: 1, processedAt: -1 });
EmissionsDataSchema.index({ 'metrics.scope1': 1 });
EmissionsDataSchema.pre('findOne', function() {
  this.set({ lastAccessedAt: new Date() });
});
EmissionsDataSchema.virtual('scopePercentages').get(function() {
  const total = this.metrics.totalEmissions;
  return {
    scope1: total > 0 ? (this.metrics.scope1 / total * 100).toFixed(1) : 0,
    scope2: total > 0 ? (this.metrics.scope2 / total * 100).toFixed(1) : 0,
    scope3: total > 0 ? (this.metrics.scope3 / total * 100).toFixed(1) : 0
  };
});

EmissionsDataSchema.statics.getUserSummary = async function(userId) {
  const summary = await this.aggregate([
    { $match: { userId: mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: null,
        totalFiles: { $sum: 1 },
        totalEmissions: { $sum: '$metrics.totalEmissions' },
        avgScope1: { $avg: '$metrics.scope1' },
        avgScope2: { $avg: '$metrics.scope2' },
        avgScope3: { $avg: '$metrics.scope3' },
        mostRecentProcessed: { $max: '$processedAt' }
      }
    }
  ]);

  return summary.length > 0 ? summary[0] : null;
};

EmissionsDataSchema.pre('save', function(next) {
  const calculatedTotal = this.monthlyData.reduce((sum, month) => sum + month.totalEmissions, 0);
  const storedTotal = this.metrics.totalEmissions;
  
  if (Math.abs(calculatedTotal - storedTotal) > 0.1) {
    console.warn(`⚠️ Emissions total mismatch: calculated=${calculatedTotal}, stored=${storedTotal}`);
  }

  next();
});

EmissionsDataSchema.set('toJSON', { virtuals: true });
EmissionsDataSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('EmissionsData', EmissionsDataSchema);