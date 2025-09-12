import mongoose from 'mongoose';

const configDB = async () => {
  try {
    const mongoURI = process.env.DB_URL || process.env.DB_URL_LOCAL;

    const dbConnection = await mongoose.connect(mongoURI);

    const dbName = dbConnection.connection.name;
    console.log('Connected to database:', dbName);
  } catch (err) {
    console.error('Failed to connect to database:', err);
    throw err; // Re-throw to stop server if DB connection fails
  }
};

export default configDB;
