// server/src/models/WaterData.js
const mongoose = require('mongoose');

const waterDataSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  file: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'File',
    required: true
  },
  fileName: {
    type: String,
    required: true
  },
  period: {
    start: String,
    end: String,
    months: Number
  },
  metrics: {
    totalSource: Number,
    totalGroundWater: Number,
    totalRainwater: Number,
    totalRecycled: Number,
    totalConsumption: Number,
    totalBoilerWater: Number,
    totalDomestic: Number,
    totalWTPBackwash: Number,
    totalNonContactCooling: Number,
    totalWetProcess: Number,
    totalUtility: Number,
    totalProcessLoss: Number,
    totalTreatment: Number,
    totalDischarge: Number,
    maxConsumption: {
      value: Number,
      month: String,
      businessUnit: String
    },
    minConsumption: {
      value: Number,
      month: String,
      businessUnit: String
    }
  },
  monthlyData: [{
    month: String,
    businessUnit: String,
    source: {
      groundWater: Number,
      rainwater: Number,
      recycled: Number,
      total: Number
    },
    consumption: {
      boilerWater: Number,
      domestic: Number,
      wtpBackwash: Number,
      nonContactCooling: Number,
      wetProcess: Number,
      utility: Number,
      total: Number
    },
    processLoss: Number,
    treatment: Number,
    discharge: Number,
    totalRow: Number
  }],
  factoryData: {
    type: Map,
    of: {
      metrics: mongoose.Schema.Types.Mixed,
      monthlyData: [mongoose.Schema.Types.Mixed]
    }
  },
  processedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for faster queries
waterDataSchema.index({ userId: 1, file: 1 });

module.exports = mongoose.model('WaterData', waterDataSchema);