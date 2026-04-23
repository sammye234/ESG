//server/src/scripts/seedBusinessUnits.js
require('dotenv').config();
const mongoose = require('mongoose');
const BusinessUnit = require('../models/BusinessUnit');

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const existing = await BusinessUnit.countDocuments();
    if (existing > 0) {
      console.log('Business units already exist. Skipping seed.');
      process.exit(0);
    }

    await BusinessUnit.insertMany([
      { code: 'HQ',  name: 'TEAM Group Ltd.' },
      { code: 'GTL', name: 'Gramtech Ltd.' },
      { code: '4AL', name: '4A Yarn Dyeing Ltd.' },
      { code: 'SESL', name: 'Southend Sweater Co. Ltd.' }
    ]);

    console.log('Business units seeded successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Seed failed:', err);
    process.exit(1);
  }
};

seedData();