

// server/src/models/WasteData.js
const mongoose = require('mongoose');

const monthlyDataSchema = {
  month: String,
  businessUnit: String,
  recycleWaste: {
    preConsumer: {
      jhute: { type: Number, default: 0 },
      padding: { type: Number, default: 0 },
      leftover: { type: Number, default: 0 }
    },
    packaging: {
      polyPlastic: { type: Number, default: 0 },
      carton: { type: Number, default: 0 },
      paper: { type: Number, default: 0 },
      emptyCone: { type: Number, default: 0 },
      patternBoard: { type: Number, default: 0 }
    }
  },
  hazardousWaste: {
    solid: {
      medical: { type: Number, default: 0 },
      metal: { type: Number, default: 0 },
      electric: { type: Number, default: 0 },
      chemicalDrum: { type: Number, default: 0 }
    },
    liquid: {
      etpInlet: { type: Number, default: 0 },
      etpOutlet: { type: Number, default: 0 }
    }
  },
  bioSolidWaste: {
    sludge: { type: Number, default: 0 },
    foodWaste: { type: Number, default: 0 }
  },
  calculated: {
    totalPreConsumer: { type: Number, default: 0 },
    totalPackaging: { type: Number, default: 0 },
    totalRecyclable: { type: Number, default: 0 },
    totalHazardousSolid: { type: Number, default: 0 },
    totalHazardousLiquid: { type: Number, default: 0 },
    totalHazardous: { type: Number, default: 0 },
    totalBioSolid: { type: Number, default: 0 },
    totalWaste: { type: Number, default: 0 }
  }
};

const metricsSchema = {
  totalWaste: { type: Number, default: 0 },
  totalRecyclable: { type: Number, default: 0 },
  totalHazardous: { type: Number, default: 0 },
  preConsumer: { type: Number, default: 0 },
  packaging: { type: Number, default: 0 },
  solidHazardous: { type: Number, default: 0 },
  liquidHazardous: { type: Number, default: 0 },
  bioSolid: { type: Number, default: 0 },
  recyclingRate: { type: Number, default: 0 }
};

const wasteDataSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
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
  
  metrics: metricsSchema,
  monthlyData: [monthlyDataSchema],
  
  // ✅ Changed from Map to plain Object with Mixed type
  factoryData: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  
  processedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Create compound indexes for efficient queries
wasteDataSchema.index({ userId: 1, file: 1 });
wasteDataSchema.index({ userId: 1, processedAt: -1 });

const WasteData = mongoose.model('WasteData', wasteDataSchema);

module.exports = WasteData;