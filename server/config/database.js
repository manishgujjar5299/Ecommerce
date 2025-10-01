const mongoose = require('mongoose');
require('dotenv').config();

class DatabaseConfig {
  constructor() {
    this.connectionString = this.buildConnectionString();
    this.options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 10, // Maintain up to 10 socket connections
      serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      // bufferCommands: false, // Disable mongoose buffering
      // bufferMaxEntries: 0, // Disable mongoose buffering
      // Security options
      // authMechanism: 'SCRAM-SHA-1',
    };
  }

  buildConnectionString() {
    const {
      MONGO_HOST = 'localhost',
      MONGO_PORT = '27017',
      MONGO_DATABASE = 'pressmart',
      MONGO_USERNAME,
      MONGO_PASSWORD,
      MONGO_URI,
      NODE_ENV
    } = process.env;

    // If full URI is provided, use it
    if (MONGO_URI) {
      return MONGO_URI.trim();
    }

    // Build URI from components
    let uri = 'mongodb://';
    
    if (MONGO_USERNAME && MONGO_PASSWORD) {
      uri += `${encodeURIComponent(MONGO_USERNAME)}:${encodeURIComponent(MONGO_PASSWORD)}@`;
    }
    
    uri += `${MONGO_HOST}:${MONGO_PORT}/${MONGO_DATABASE}`;
    
    // Add SSL options for production
    if (NODE_ENV === 'production') {
      uri += '?ssl=true&replicaSet=atlas-xxxxx-shard-0&authSource=admin&retryWrites=true&w=majority';
    }
    
    return uri;
  }

  async connect() {
    try {
      console.log('Connecting to MongoDB...');
      await mongoose.connect(this.connectionString, this.options);
      console.log('✅ MongoDB connected successfully');
      
      // Handle connection events
      mongoose.connection.on('error', (err) => {
        console.error('❌ MongoDB connection error:', err);
      });
      
      mongoose.connection.on('disconnected', () => {
        console.warn('⚠️ MongoDB disconnected');
      });
      
      mongoose.connection.on('reconnected', () => {
        console.log('🔄 MongoDB reconnected');
      });
      
    } catch (error) {
      console.error('❌ MongoDB connection failed:', error.message);
      process.exit(1);
    }
  }

  async disconnect() {
    try {
      await mongoose.disconnect();
      console.log('MongoDB disconnected');
    } catch (error) {
      console.error('Error disconnecting from MongoDB:', error);
    }
  }
}

module.exports = new DatabaseConfig();