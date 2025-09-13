import User from '../app/models/user-model.js';

async function ensureSuperAdmin() {
  try {
    const superAdminEmail = 'info@veerive.com';
    const superAdminPassword = 'password@360';
    
    console.log('🔍 Checking for SuperAdmin in users_cms collection...');
    const existing = await User.findOne({ email: superAdminEmail }).maxTimeMS(15000);
    
    if (!existing) {
      console.log('📝 Creating SuperAdmin...');
      await User.create({
        email: superAdminEmail,
        password: superAdminPassword, // Store as plain text to match login logic
        role: 'SuperAdmin',
        name: 'Pankaj',
        provider: 'local'
      });
      console.log('✅ SuperAdmin created in users_cms collection');
    } else if (existing.role !== 'SuperAdmin') {
      existing.role = 'SuperAdmin';
      await existing.save();
      console.log('✅ SuperAdmin role updated');
    } else {
      console.log('✅ SuperAdmin already exists');
    }
  } catch (error) {
    console.error('❌ Error ensuring SuperAdmin:', error.message);
  }
}

export default ensureSuperAdmin; 