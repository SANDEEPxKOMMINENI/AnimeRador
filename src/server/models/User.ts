import mongoose, { Document, Model } from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  profilePicture?: string;
  bio?: string;
  favorites: string[];
  watchlist: Array<{
    animeId: string;
    status: 'watching' | 'completed' | 'planToWatch' | 'dropped';
    progress: number;
    rating?: number;
    notes?: string;
    startDate?: Date;
    completedDate?: Date;
  }>;
  loginAttempts: number;
  lockUntil?: Date;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
  generateAuthToken(): string;
}

interface IUserMethods {
  comparePassword(candidatePassword: string): Promise<boolean>;
  generateAuthToken(): string;
}

type UserModel = Model<IUser, {}, IUserMethods>;

const userSchema = new mongoose.Schema<IUser, UserModel, IUserMethods>({
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters long'],
    maxlength: [30, 'Username cannot exceed 30 characters'],
    match: [/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, underscores, and hyphens']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters long'],
    select: false
  },
  profilePicture: {
    type: String,
    default: 'default-avatar.png'
  },
  bio: {
    type: String,
    maxlength: [500, 'Bio cannot exceed 500 characters']
  },
  favorites: [{
    type: String,
    ref: 'Anime'
  }],
  watchlist: [{
    animeId: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: ['watching', 'completed', 'planToWatch', 'dropped'],
      required: true
    },
    progress: {
      type: Number,
      default: 0,
      min: 0
    },
    rating: {
      type: Number,
      min: 0,
      max: 10
    },
    notes: String,
    startDate: Date,
    completedDate: Date
  }],
  loginAttempts: {
    type: Number,
    default: 0
  },
  lockUntil: {
    type: Date
  },
  lastLogin: {
    type: Date
  }
}, {
  timestamps: true
});

// Create compound indexes for better query performance
userSchema.index({ email: 1, username: 1 });
userSchema.index({ 'watchlist.animeId': 1 });
userSchema.index({ loginAttempts: 1, lockUntil: 1 });

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error('Error comparing passwords');
  }
};

// Method to generate JWT token
userSchema.methods.generateAuthToken = function(): string {
  return jwt.sign(
    { 
      id: this._id,
      email: this.email,
      username: this.username
    },
    process.env.JWT_SECRET || 'fallback_secret',
    { expiresIn: '7d' }
  );
};

// Remove sensitive fields when converting to JSON
userSchema.set('toJSON', {
  transform: function(doc, ret) {
    delete ret.password;
    delete ret.loginAttempts;
    delete ret.lockUntil;
    delete ret.__v;
    return ret;
  }
});

export const User = mongoose.model<IUser, UserModel>('User', userSchema);