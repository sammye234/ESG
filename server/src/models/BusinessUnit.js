//server/src/models/BU.js
const mongoose = require('mongoose');
const businessUnitSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,          
    enum: ['HQ', 'GTL', '4AL', 'SESL'],
    trim: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: 3,
  },
  description: {
    type: String,
    trim: true,
  },
 
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});


businessUnitSchema.virtual('display').get(function() {
  return `${this.code} - ${this.name}`;
});

module.exports = mongoose.model('BusinessUnit', businessUnitSchema);