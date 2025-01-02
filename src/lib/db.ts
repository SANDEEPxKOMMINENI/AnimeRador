import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

// Optimize MongoDB connection for limited memory
const options = {
  maxPoolSize: 5,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  family: 4,
  compressors: "zlib",
};

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export async function connectDB() {
  if (cached.conn) {
    console.log('Using cached MongoDB connection');
    return cached.conn;
  }

  if (!cached.promise) {
    console.log('Connecting to MongoDB...');
    cached.promise = mongoose.connect(MONGODB_URI, options)
      .then((mongoose) => {
        console.log('MongoDB connected successfully');
        return mongoose;
      })
      .catch((error) => {
        console.error('MongoDB connection error:', error);
        throw error;
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

// Minimal user schema - only essential fields
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  username: { type: String, required: true },
  favorites: [{ type: String }], // Store only anime IDs
  watchlist: [{
    animeId: { type: String, required: true },
    status: { type: String, enum: ['watching', 'completed', 'planToWatch', 'dropped'] },
    progress: { type: Number, default: 0 },
    rating: { type: Number, min: 0, max: 10 },
    updatedAt: { type: Date, default: Date.now }
  }]
}, {
  timestamps: true,
  autoIndex: false,
  minimize: true,
});

// Create compound index for better query performance
userSchema.index({ email: 1, username: 1 });
userSchema.index({ 'watchlist.animeId': 1 });

export const User = mongoose.models.User || mongoose.model('User', userSchema);