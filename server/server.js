const dotenv = require('dotenv');
dotenv.config();

const connectDB = require('./config/db');
const app = require('./app');

connectDB();

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// Graceful shutdown on SIGTERM / SIGINT for Kubernetes container lifecycles
const gracefulShutdown = (signal) => {
  console.log(`Received ${signal}. Initiating graceful shutdown...`);
  server.close(async () => {
    console.log('HTTP server closed.');
    try {
      const mongoose = require('mongoose');
      await mongoose.connection.close(false);
      console.log('MongoDB connection closed.');
    } catch (err) {
      console.error('Error during MongoDB disconnect:', err);
    }
    process.exit(0);
  });

  // Force close after 10 seconds if shutdown hangs
  setTimeout(() => {
    console.error('Forced shutdown after timeout.');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));