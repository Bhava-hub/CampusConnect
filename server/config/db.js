const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/campusconnect';
    const conn = await mongoose.connect(uri, { serverSelectionTimeoutMS: 2500 });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.warn(`Local MongoDB connection warning: ${error.message}`);
    if (process.env.NODE_ENV !== 'production') {
      try {
        console.log('Starting in-memory MongoDB fallback for local development...');
        const { MongoMemoryServer } = require('mongodb-memory-server');
        const mongod = await MongoMemoryServer.create();
        const memUri = mongod.getUri();
        const conn = await mongoose.connect(memUri);
        console.log(`In-memory MongoDB Connected successfully: ${conn.connection.host}`);
        return;
      } catch (memError) {
        console.error(`In-memory MongoDB fallback error: ${memError.message}`);
      }
    }
    process.exit(1);
  }
};

module.exports = connectDB;
