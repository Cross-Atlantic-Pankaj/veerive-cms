import mongoose from 'mongoose';

const configDB = async () => {
  try {
    const mongoURI =
      process.env.NODE_ENV === 'production'
        ? process.env.DB_URL_PRODUCTION || process.env.DB_URL // Use the veerive database in production
        : process.env.DB_URL_LOCAL || process.env.DB_URL; // Use the local database in development

    // Optimized connection options for production
    const connectionOptions = {
      maxPoolSize: process.env.VERCEL ? 3 : 10, // Even fewer connections in Vercel
      serverSelectionTimeoutMS: process.env.VERCEL ? 2000 : 5000, // Much faster timeout in Vercel
      socketTimeoutMS: process.env.VERCEL ? 5000 : 45000, // Much shorter timeout in Vercel
      maxIdleTimeMS: process.env.VERCEL ? 5000 : 30000, // Much shorter idle time in Vercel
      connectTimeoutMS: process.env.VERCEL ? 5000 : 20000, // Much faster connection in Vercel
      retryWrites: true,
      w: 'majority',
      // Additional Vercel optimizations
      ...(process.env.VERCEL && {
        bufferMaxEntries: 0,
        bufferCommands: false
      })
    };

    console.log('🔗 Attempting to connect to MongoDB...');
    
    // Add timeout wrapper for Vercel
    const connectWithTimeout = (mongoURI, options) => {
      return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Database connection timeout'));
        }, process.env.VERCEL ? 8000 : 15000); // 8s timeout for Vercel, 15s for others
        
        mongoose.connect(mongoURI, options)
          .then((connection) => {
            clearTimeout(timeout);
            resolve(connection);
          })
          .catch((error) => {
            clearTimeout(timeout);
            reject(error);
          });
      });
    };
    
    const dbConnection = await connectWithTimeout(mongoURI, connectionOptions);

    const dbName = dbConnection.connection.name;
    console.log('✅ Connected to database:', dbName);
    
    // Create indexes for better performance
    console.log('📊 Creating database indexes...');
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
    
    // Check if users_cms collection has data
    const userCount = await db.collection('users_cms').countDocuments();
    console.log(`📊 users_cms collection has ${userCount} users`);
    
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
