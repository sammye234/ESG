// server/check-files-in-db.js
// Run this to see what files exist in your database

require('dotenv').config();
const mongoose = require('mongoose');
const File = require('./src/models/File');
const User = require('./src/models/User');

async function checkFiles() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    // Count total files
    const totalFiles = await File.countDocuments();
    console.log('📊 TOTAL FILES IN DATABASE:', totalFiles);

    if (totalFiles === 0) {
      console.log('\n❌ NO FILES FOUND!');
      console.log('This means you need to upload files first.\n');
      console.log('Steps:');
      console.log('1. Go to File Management page');
      console.log('2. Click "Upload File" button');
      console.log('3. Select a CSV/Excel file');
      console.log('4. Choose a Business Unit (GTL/4AL/SESL)');
      console.log('5. Upload\n');
      process.exit(0);
    }

    console.log('\n📋 FILES BY BUSINESS UNIT:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Group by BU
    const filesByBU = await File.aggregate([
      {
        $group: {
          _id: '$businessUnit',
          count: { $sum: 1 },
          files: { 
            $push: { 
              name: '$originalName',
              type: '$type',
              uploadedAt: '$createdAt'
            } 
          }
        }
      }
    ]);

    if (filesByBU.length === 0) {
      console.log('⚠️ Files exist but no businessUnit assigned!\n');
    }

    for (const group of filesByBU) {
      console.log(`🏢 Business Unit: ${group._id || 'NULL/UNASSIGNED'}`);
      console.log(`   Count: ${group.count}`);
      console.log(`   Files:`);
      group.files.forEach((f, i) => {
        console.log(`     ${i + 1}. ${f.name} (${f.type})`);
      });
      console.log('');
    }

    // Check for your user's files
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('🔍 YOUR FILES (as HQ Manager):\n');

    const hqUser = await User.findOne({ email: 'psyche@gmail.com' });
    
    if (!hqUser) {
      console.log('❌ User not found!');
      process.exit(1);
    }

    console.log('User ID:', hqUser._id);
    console.log('Role:', hqUser.role);
    console.log('BU:', hqUser.businessUnit || 'None\n');

    // Files uploaded by this user
    const userFiles = await File.find({ userId: hqUser._id });
    console.log(`Files uploaded by you: ${userFiles.length}`);

    if (userFiles.length > 0) {
      console.log('\nYour uploaded files:');
      userFiles.forEach((f, i) => {
        console.log(`  ${i + 1}. ${f.originalName || f.name}`);
        console.log(`     BU: ${f.businessUnit || 'NONE!'}`);
        console.log(`     Type: ${f.type}`);
        console.log(`     Uploaded: ${f.createdAt}`);
        console.log('');
      });
    }

    // Show what API would return for HQ user
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('🌐 API SIMULATION (GET /api/files):\n');

    // HQ users should see ALL files
    const accessibleFiles = await File.find({ userId: hqUser._id });
    
    console.log(`Files API would return: ${accessibleFiles.length}`);
    
    if (accessibleFiles.length === 0) {
      console.log('\n⚠️ API would return EMPTY!');
      console.log('This is why File Management shows no files.\n');
      
      // Check if files exist for other users
      const otherUsersFiles = await File.find({ userId: { $ne: hqUser._id } });
      if (otherUsersFiles.length > 0) {
        console.log(`Found ${otherUsersFiles.length} files from OTHER users.`);
        console.log('HQ Manager should be able to see these too!\n');
      }
    }

    console.log('\n✅ Check complete!\n');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkFiles();