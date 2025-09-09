// import mongoose from "mongoose";

// const mongoURI = 'mongodb+srv://chaubeyp:ConsTrack360@veerive.tta8g.mongodb.net/veerive-db?retryWrites=true&w=majority&appName=veerive';
// //const mongoURI = process.env.DB_URL

// //for local machine ===============

// // const configDB = async () => {

// //   const dbConnection = await mongoose.connect(process.env.DB_URL)
// //   const dbName = dbConnection.connection.name
// //   console.log('connected to database', dbName)
// // }

// //for server deployment ===============
// const configDB = async () => {
//     try {
//         const dbConnection = await mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
//         const dbName = dbConnection.connection.name
//         console.log('connected to database', dbName)
//         } catch (err) {
//         console.error('Failed to connect to database', err);
//       }
//     }

// export default configDB

// /*
// - DB URL for local machine - DB_URL=mongodb://localhost:27017/my-local-database
// for server - 'mongodb+srv://chaubeyp:ConsTrack360@veerive.tta8g.mongodb.net/veerive-db?retryWrites=true&w=majority&appName=veerive';
// */


// import mongoose from 'mongoose';

// // Determine the MongoDB URI based on the environment
// const mongoURI =
//   process.env.NODE_ENV === 'production'
//     ? 'mongodb+srv://chaubeyp:ConsTrack360@veerive.tta8g.mongodb.net/veerive-db?retryWrites=true&w=majority&appName=veerive' // Production URI
//     : process.env.DB_URL || 'mongodb://localhost:27017/my-local-database'; // Local URI with fallback

// // Database configuration function
// const configDB = async () => {
//   try {
//     // Connect to the database
//     const dbConnection = await mongoose.connect(mongoURI, {
//       useNewUrlParser: true,
//       useUnifiedTopology: true,
//     });

//     // Log success
//     const dbName = dbConnection.connection.name;
//     console.log('Connected to database:', dbName);
//   } catch (err) {
//     // Log error
//     console.error('Failed to connect to database:', err);
//   }
// };

// export default configDB;
import mongoose from 'mongoose';

const configDB = async () => {
  try {
    const mongoURI =
      process.env.NODE_ENV === 'production'
        ? process.env.DB_URL_PRODUCTION // Use the veerive database in production
        : process.env.DB_URL_LOCAL; // Use the local database in development

    const dbConnection = await mongoose.connect(mongoURI, {
      maxPoolSize: 10, // Maintain up to 10 socket connections
      serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      maxIdleTimeMS: 30000, // Close connections after 30 seconds of inactivity
      connectTimeoutMS: 10000, // Give up initial connection after 10 seconds
    });

    const dbName = dbConnection.connection.name;
    console.log('Connected to database:', dbName);
  } catch (err) {
    console.error('Failed to connect to database:', err);
  }
};

export default configDB;
