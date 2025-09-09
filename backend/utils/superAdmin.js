import User from '../app/models/user-model.js';

async function ensureSuperAdmin() {
  const superAdminEmail = 'info@veerive.com';
  
  try {
    const existing = await User.findOne({ email: superAdminEmail });
    if (!existing) {
      console.log('❌ SuperAdmin not found in users_cms collection');
      console.log('Please run: npm run populate-users to create the required users');
    } else if (existing.role !== 'SuperAdmin') {
      existing.role = 'SuperAdmin';
      await existing.save();
      console.log('✅ SuperAdmin role updated');
    } else {
      console.log('✅ SuperAdmin already exists in users_cms collection');
    }
  } catch (error) {
    console.error('❌ Error checking SuperAdmin:', error);
  }
}

export default ensureSuperAdmin; 