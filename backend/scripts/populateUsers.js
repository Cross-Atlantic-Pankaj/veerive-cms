import mongoose from 'mongoose';
import User from '../app/models/user-model.js';

const populateUsers = async () => {
  try {
    // Connect to database
    const mongoURI = process.env.NODE_ENV === 'production'
      ? process.env.DB_URL_PRODUCTION
      : process.env.DB_URL_LOCAL || 'mongodb://localhost:27017/veerive-local';

    await mongoose.connect(mongoURI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      maxIdleTimeMS: 30000,
      connectTimeoutMS: 10000,
    });

    console.log('Connected to database');

    // Clear existing users
    await User.deleteMany({});
    console.log('Cleared existing users');

    // Create the 3 users
    const users = [
      {
        _id: new mongoose.Types.ObjectId('684f201cb93410d26d225f1c'),
        email: 'info@veerive.com',
        password: 'password@360',
        role: 'SuperAdmin',
        name: 'Pankaj',
        provider: 'local',
        lastPasswordUpdate: new Date('2025-09-01T03:01:20.354+00:00'),
        createdAt: new Date('2025-07-02T19:33:48.574+00:00'),
        updatedAt: new Date('2025-07-21T03:01:20.358+00:00')
      },
      {
        _id: new mongoose.Types.ObjectId('684f23612a933ad28c3cf55e'),
        email: 'sharmaharsh634@gmail.com',
        password: '123456',
        role: 'Admin',
        name: 'Harsh',
        provider: 'local',
        resetToken: null,
        resetTokenExpiration: null,
        lastPasswordUpdate: new Date('2025-07-06T06:35:15.914+00:00'),
        createdAt: new Date('2025-06-15T19:47:45.062+00:00'),
        updatedAt: new Date('2025-07-06T06:35:15.915+00:00'),
        __v: 0
      },
      {
        _id: new mongoose.Types.ObjectId('687dabb0d00af4adfa4a2fde'),
        email: 'chaubeyp@gmail.com',
        password: 'pankaj1234',
        role: 'User',
        name: 'PC2',
        provider: 'local',
        resetToken: null,
        resetTokenExpiration: null,
        lastPasswordUpdate: new Date('2025-07-21T02:54:43.284+00:00'),
        createdAt: new Date('2025-07-21T02:53:36.054+00:00'),
        updatedAt: new Date('2025-07-21T02:54:43.287+00:00'),
        __v: 0
      }
    ];

    // Insert users
    const createdUsers = await User.insertMany(users);
    console.log(`✅ Successfully created ${createdUsers.length} users:`);
    
    createdUsers.forEach(user => {
      console.log(`- ${user.name} (${user.email}) - ${user.role}`);
    });

    console.log('✅ Users population completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error populating users:', error);
    process.exit(1);
  }
};

populateUsers();
