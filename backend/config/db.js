import mongoose from 'mongoose';

const configDB = async () => {
  try {
    const mongoURI =
      process.env.NODE_ENV === 'production'
        ? process.env.DB_URL_PRODUCTION || process.env.DB_URL // Use the veerive database in production
        : process.env.DB_URL_LOCAL || process.env.DB_URL; // Use the local database in development

    const dbConnection = await mongoose.connect(mongoURI);

    const dbName = dbConnection.connection.name;
    console.log('Connected to database:', dbName);
  } catch (err) {
    console.error('Failed to connect to database:', err);
    throw err; // Re-throw to stop server if DB connection fails
  }
};

export default configDB;
