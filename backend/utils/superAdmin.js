import User from '../app/models/user-model.js';

async function ensureSuperAdmin() {
  const superAdminEmail = 'info@veerive.com';
  const superAdminPassword = 'password@360';
  const existing = await User.findOne({ email: superAdminEmail });
  if (!existing) {
    await User.create({
      email: superAdminEmail,
      password: superAdminPassword, // Store as plain text to match login logic
      role: 'SuperAdmin',
      name: 'Super Admin',
      provider: 'local'
    });
    console.log('SuperAdmin created');
  } else if (existing.role !== 'SuperAdmin') {
    existing.role = 'SuperAdmin';
    await existing.save();
    console.log('SuperAdmin role updated');
  }
}

export default ensureSuperAdmin; 