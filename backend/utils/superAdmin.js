import User from '../app/models/user-model.js';
import bcryptjs from 'bcryptjs';

async function ensureSuperAdmin() {
  const superAdminEmail = 'info@veerive.com';
  const superAdminPassword = 'Password@123';
  const existing = await User.findOne({ email: superAdminEmail });
  if (!existing) {
    const hash = await bcryptjs.hash(superAdminPassword, 10);
    await User.create({
      email: superAdminEmail,
      password: hash,
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