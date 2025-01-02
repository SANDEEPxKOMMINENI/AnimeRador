import mongoose from 'mongoose';
import { z } from 'zod';

// Environment variable validation schema
const envSchema = z.object({
  MONGODB_URI: z.string().min(1, "MongoDB URI is required"),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  DB_NAME: z.string().min(1, "Database name is required"),
});

// MongoDB connection options specifically for Atlas
const mongooseOptions: mongoose.ConnectOptions = {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  connectTimeoutMS: 10000,
  retryWrites: true,
  retryReads: true,
  // Atlas specific settings
  ssl: true,
  authSource: 'admin',
  w: 'majority',
};

// Connection state tracking
let isConnected = false;
let connectionAttempts = 0;
const MAX_RETRIES = 3;

// Enhanced connection function with retry mechanism
export async function connectDB(): Promise<typeof mongoose | null> {
  try {
    if (isConnected) {
      console.log('📊 Using existing MongoDB connection');
      return mongoose;
    }

    // Clear any existing connections
    if (mongoose.connections.length > 0) {
      const activeConn = mongoose.connections[0];
      if (activeConn.readyState !== 1) {
        await mongoose.disconnect();
      }
    }

    // Connection with retry logic
    while (connectionAttempts < MAX_RETRIES) {
      try {
        console.log(`🔄 Attempting MongoDB Atlas connection (Attempt ${connectionAttempts + 1}/${MAX_RETRIES})`);
        
        if (!process.env.MONGODB_URI) {
          throw new Error('MongoDB URI is not defined in environment variables');
        }

        const conn = await mongoose.connect(process.env.MONGODB_URI, mongooseOptions);

        if (conn.connection.readyState === 1) {
          isConnected = true;
          console.log('✅ MongoDB Atlas connected successfully!');
          
          // Log connection details in development
          if (process.env.NODE_ENV === 'development') {
            console.log({
              host: conn.connection.host,
              dbName: conn.connection.name,
              models: Object.keys(conn.models),
            });
          }

          // Setup connection event handlers
          conn.connection.on('error', (err) => {
            console.error('MongoDB connection error:', err);
            isConnected = false;
          });

          conn.connection.on('disconnected', () => {
            console.log('MongoDB disconnected');
            isConnected = false;
          });

          conn.connection.on('reconnected', () => {
            console.log('MongoDB reconnected');
            isConnected = true;
          });

          return conn;
        }
      } catch (error) {
        connectionAttempts++;
        console.error(`❌ MongoDB connection attempt ${connectionAttempts} failed:`, error.message);
        
        if (connectionAttempts === MAX_RETRIES) {
          throw new Error(`Failed to connect to MongoDB Atlas after ${MAX_RETRIES} attempts`);
        }
        
        // Wait before retrying (exponential backoff)
        const delay = Math.min(1000 * Math.pow(2, connectionAttempts), 10000);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    return null;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    if (error.name === 'MongoServerError') {
      console.error('MongoDB Server Error Details:', {
        code: error.code,
        codeName: error.codeName,
        errorLabels: error.errorLabels,
      });
    }
    return null;
  }
}

// Connection status checker
export function isDBConnected(): boolean {
  return isConnected && mongoose.connection.readyState === 1;
}

// Connection health check
export async function checkDBConnection(): Promise<boolean> {
  try {
    if (!isDBConnected()) {
      await connectDB();
    }
    await mongoose.connection.db.admin().ping();
    return true;
  } catch (error) {
    console.error('❌ Database health check failed:', error);
    return false;
  }
}

// Export mongoose instance for direct access if needed
export { mongoose };