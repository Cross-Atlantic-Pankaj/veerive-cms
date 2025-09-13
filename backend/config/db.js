import mongoose from 'mongoose';

const configDB = async () => {
  try {
    const mongoURI =
      process.env.NODE_ENV === 'production'
        ? process.env.DB_URL_PRODUCTION || process.env.DB_URL // Use the veerive database in production
        : process.env.DB_URL_LOCAL || process.env.DB_URL; // Use the local database in development

    // Simplified connection options for reliability
    const connectionOptions = {
      maxPoolSize: 5, // Maintain up to 5 socket connections
      serverSelectionTimeoutMS: 10000, // Keep trying to send operations for 10 seconds
      socketTimeoutMS: 30000, // Close sockets after 30 seconds of inactivity
      connectTimeoutMS: 15000, // Give up initial connection after 15 seconds
      retryWrites: true,
      w: 'majority'
    };

    const dbConnection = await mongoose.connect(mongoURI, connectionOptions);

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
