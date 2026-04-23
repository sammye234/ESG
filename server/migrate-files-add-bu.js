// server/migrate-files-add-bu.js
// Run this ONCE to add businessUnit to existing files

require('dotenv').config();
const mongoose = require('mongoose');
const File = require('./src/models/File');

async function migrateFiles() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    // Find all files without businessUnit
    const filesWithoutBU = await File.find({
      $or: [
        { businessUnit: null },
        { businessUnit: { $exists: false } }
      ]
    });

    console.log(`📊 Found ${filesWithoutBU.length} files without businessUnit\n`);

    if (filesWithoutBU.length === 0) {
      console.log('✅ All files already have businessUnit assigned!');
      process.exit(0);
    }

    // For each file, try to detect BU from filename or assign to HQ
    let updated = 0;
    
    for (const file of filesWithoutBU) {
      let assignedBU = 'HQ'; // Default to HQ
      
      // Try to detect from filename
      const fileName = (file.originalName || file.name || '').toUpperCase();
      
      if (fileName.includes('GTL')) {
        assignedBU = 'GTL';
      } else if (fileName.includes('4AL')) {
        assignedBU = '4AL';
      } else if (fileName.includes('SESL')) {
        assignedBU = 'SESL';
      }
      
      // Update file
      file.businessUnit = assignedBU;
      await file.save();
      
      console.log(`  ✅ ${file.originalName} → ${assignedBU}`);
      updated++;
    }

    console.log(`\n✅ Updated ${updated} files`);
    console.log('\n🎯 Summary:');
    
    // Show final distribution
    const distribution = await File.aggregate([
      {
        $group: {
          _id: '$businessUnit',
          count: { $sum: 1 }
        }
      }
    ]);
    
    distribution.forEach(d => {
      console.log(`   ${d._id || 'NULL'}: ${d.count} files`);
    });

    console.log('\n✅ Migration complete!\n');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

migrateFiles();