import mongoose from 'mongoose';
import mongoConnection from '../utils/mongoConnection.js';

const configDB = async () => {
  try {
    // Use singleton connection
    const dbConnection = await mongoConnection.connect();
    
    const dbName = dbConnection.connection.name;
    console.log('Connected to database:', dbName);
    
    // Create indexes for better performance
    await createIndexes();
    
  } catch (err) {
    console.error('Failed to connect to database:', err);
    throw err; // Re-throw to stop server if DB connection fails
  }
};

// Function to create database indexes
const createIndexes = async () => {
  try {
    const db = mongoose.connection.db;
    
    // Create index on users_cms collection for email field
    await db.collection('users_cms').createIndex({ email: 1 }, { unique: true });
    console.log('✅ Created index on users_cms.email');
    
    // Create other useful indexes
    await db.collection('posts').createIndex({ createdAt: -1 });
    await db.collection('contexts').createIndex({ createdAt: -1 });
    await db.collection('themes').createIndex({ createdAt: -1 });
    
    console.log('✅ Database indexes created successfully');
  } catch (error) {
    console.log('⚠️ Index creation error (might already exist):', error.message);
  }
};

export default configDB;
