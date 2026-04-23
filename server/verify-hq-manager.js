// server/verify-hq-manager.js
//Temporary, delete after verifying BU for myself (hq manager)
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');
const BusinessUnit = require('./src/models/BusinessUnit');

async function verifyHQManager() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    // Find the HQ Manager user (replace with your email)
    const email = 'psyche@gmail.com'; 
    const user = await User.findOne({ email }).populate('businessUnit');

    if (!user) {
      console.log('❌ User not found with email:', email);
      console.log('💡 Please update the email in this script\n');
      process.exit(1);
    }

    console.log('📋 USER DETAILS:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Email:', user.email);
    console.log('Username:', user.username);
    console.log('Role:', user.role);
    console.log('Is Active:', user.isActive);
    console.log('Business Unit ID:', user.businessUnit);
    
    if (user.businessUnit) {
      const bu = await BusinessUnit.findById(user.businessUnit);
      console.log('Business Unit:', bu ? `${bu.code} - ${bu.name}` : 'Not found');
    }
    
    console.log('\n🔐 PERMISSIONS:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Can View All BUs:', user.permissions?.canViewAllBUs || false);
    console.log('Can Upload Data:', user.permissions?.canUploadData || false);
    console.log('Can Delete Data:', user.permissions?.canDeleteData || false);
    console.log('Can Manage Users:', user.permissions?.canManageUsers || false);

    console.log('\n🏢 ACCESSIBLE BUSINESS UNITS:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    const accessibleBUs = user.getAccessibleBUs();
    console.log('Accessible BUs:', accessibleBUs.join(', '));

    console.log('\n🔍 BU ACCESS CHECK:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    ['HQ', 'GTL', '4AL', 'SESL'].forEach(bu => {
      const canAccess = user.canAccessBU(bu);
      console.log(`  ${canAccess ? '✅' : '❌'} ${bu}`);
    });

    console.log('\n🎯 EXPECTED BEHAVIOR:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    if (user.role === 'hq_manager' || user.role === 'hq_admin') {
      console.log('✅ HQ role detected');
      console.log('✅ Should be able to:');
      console.log('   - View files from ALL business units (GTL, 4AL, SESL)');
      console.log('   - Upload files for ANY business unit');
      console.log('   - See combined data in dashboards');
      
      if (accessibleBUs.length < 4) {
        console.log('\n⚠️  WARNING: Not all BUs accessible!');
        console.log('   Expected: HQ, GTL, 4AL, SESL');
        console.log('   Got:', accessibleBUs.join(', '));
      }
    } else if (user.role.startsWith('bu_')) {
      console.log('✅ BU role detected');
      console.log('✅ Should only see:', user.businessUnit);
      
      if (accessibleBUs.length > 1) {
        console.log('\n⚠️  WARNING: Too many BUs accessible for BU user!');
        console.log('   Expected: Only', user.businessUnit);
        console.log('   Got:', accessibleBUs.join(', '));
      }
    }

    console.log('\n📊 ALL BUSINESS UNITS IN DB:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    const allBUs = await BusinessUnit.find();
    allBUs.forEach(bu => {
      console.log(`  ${bu.code} - ${bu.name}`);
    });

    console.log('\n✅ Verification complete!\n');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

verifyHQManager();