import User from '../app/models/user-model.js';

async function ensureSuperAdmin() {
  const superAdminEmail = 'info@veerive.com';
  const superAdminPassword = 'Password@123';
  
  try {
    const existing = await User.findOne({ email: superAdminEmail });
    if (!existing) {
      // Store password as plain text to match the current system
      await User.create({
        email: superAdminEmail,
        password: superAdminPassword, // Plain text password
        role: 'SuperAdmin',
        name: 'Super Admin',
        lastPasswordUpdate: Date.now()
      });
      console.log('✅ SuperAdmin created successfully');
    } else if (existing.role !== 'SuperAdmin') {
      existing.role = 'SuperAdmin';
      await existing.save();
      console.log('✅ SuperAdmin role updated');
    } else {
      console.log('✅ SuperAdmin already exists');
    }
  } catch (error) {
    console.error('❌ Error ensuring SuperAdmin:', error);
  }
}

export default ensureSuperAdmin; 