import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { logger } from './config/logger';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/anime-radar';

// Updated MongoDB connection options
const mongooseOptions = {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  family: 4, // Use IPv4, skip trying IPv6
  autoIndex: true, // Build indexes
  retryWrites: true,
};

export async function connectDB() {
  try {
    await mongoose.connect(MONGODB_URI, mongooseOptions);
    logger.info('Connected to MongoDB');
  } catch (error) {
    logger.error('MongoDB connection error:', error);
    process.exit(1);
  }
}

// User Schema
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  favorites: [{ type: String }], // Array of anime IDs
  createdAt: { type: Date, default: Date.now },
});

// Review Schema
const reviewSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  animeId: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 10 },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

// Add indexes for better query performance
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ username: 1 }, { unique: true });
reviewSchema.index({ userId: 1, animeId: 1 });

export const User = mongoose.model('User', userSchema);
export const Review = mongoose.model('Review', reviewSchema);