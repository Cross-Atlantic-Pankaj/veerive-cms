import mongoose from 'mongoose';

const configDB = async () => {
  try {
    const mongoURI =
      process.env.NODE_ENV === 'production'
        ? process.env.DB_URL_PRODUCTION || process.env.DB_URL // Use the veerive database in production
        : process.env.DB_URL_LOCAL || process.env.DB_URL; // Use the local database in development

    // Optimized connection options for production
    const connectionOptions = {
      maxPoolSize: process.env.VERCEL ? 5 : 10, // Fewer connections in Vercel
      serverSelectionTimeoutMS: process.env.VERCEL ? 3000 : 5000, // Faster timeout in Vercel
      socketTimeoutMS: process.env.VERCEL ? 10000 : 45000, // Shorter timeout in Vercel
      maxIdleTimeMS: process.env.VERCEL ? 10000 : 30000, // Shorter idle time in Vercel
      connectTimeoutMS: process.env.VERCEL ? 10000 : 20000, // Faster connection in Vercel
      retryWrites: true,
      w: 'majority'
    };

    console.log('🔗 Attempting to connect to MongoDB...');
    const dbConnection = await mongoose.connect(mongoURI, connectionOptions);

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
