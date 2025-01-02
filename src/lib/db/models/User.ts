import { Schema, model, Document, Model } from 'mongoose';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

// Validation schema for user data
export const userValidationSchema = z.object({
  username: z.string()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username must not exceed 30 characters')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, underscores, and hyphens'),
  email: z.string().email('Invalid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one uppercase letter, one lowercase letter, and one number'),
});

// Interface for user methods
interface IUserMethods {
  comparePassword(candidatePassword: string): Promise<boolean>;
  generateAuthToken(): string;
  toJSON(): any;
}

// Interface for user document
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
  followers: string[];
  following: string[];
  isEmailVerified: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
  refreshToken?: string;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
}

// Interface for user model
interface IUserModel extends Model<IUser, {}, IUserMethods> {
  findByEmail(email: string): Promise<IUser | null>;
  findByUsername(username: string): Promise<IUser | null>;
}

// User schema definition
const userSchema = new Schema<IUser, IUserModel, IUserMethods>({
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters'],
    maxlength: [30, 'Username must not exceed 30 characters'],
    match: [/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, underscores, and hyphens'],
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters'],
    select: false,
  },
  profilePicture: {
    type: String,
    default: 'default-profile.png',
  },
  bio: {
    type: String,
    maxlength: [500, 'Bio must not exceed 500 characters'],
  },
  favorites: [{
    type: String,
    ref: 'Anime',
  }],
  watchlist: [{
    animeId: {
      type: String,
      required: true,
      ref: 'Anime',
    },
    status: {
      type: String,
      enum: ['watching', 'completed', 'planToWatch', 'dropped'],
      required: true,
    },
    progress: {
      type: Number,
      default: 0,
      min: 0,
    },
    rating: {
      type: Number,
      min: 0,
      max: 10,
    },
    notes: String,
    startDate: Date,
    completedDate: Date,
  }],
  followers: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
  }],
  following: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
  }],
  isEmailVerified: {
    type: Boolean,
    default: false,
  },
  lastLogin: Date,
  refreshToken: String,
  passwordResetToken: String,
  passwordResetExpires: Date,
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      delete ret.password;
      delete ret.refreshToken;
      delete ret.passwordResetToken;
      delete ret.passwordResetExpires;
      delete ret.__v;
      return ret;
    },
  },
});

// Indexes for better query performance
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ username: 1 }, { unique: true });
userSchema.index({ 'watchlist.animeId': 1 });
userSchema.index({ followers: 1 });
userSchema.index({ following: 1 });

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error('Error comparing passwords');
  }
};

// Static method to find user by email
userSchema.statics.findByEmail = function(email: string) {
  return this.findOne({ email });
};

// Static method to find user by username
userSchema.statics.findByUsername = function(username: string) {
  return this.findOne({ username });
};

// Virtual for full profile URL
userSchema.virtual('profileUrl').get(function() {
  return `/users/${this.username}`;
});

// Method to check if user is following another user
userSchema.methods.isFollowing = function(userId: string): boolean {
  return this.following.includes(userId);
};

// Method to follow a user
userSchema.methods.follow = async function(userId: string): Promise<void> {
  if (!this.following.includes(userId)) {
    this.following.push(userId);
    await this.save();
  }
};

// Method to unfollow a user
userSchema.methods.unfollow = async function(userId: string): Promise<void> {
  this.following = this.following.filter(id => id.toString() !== userId);
  await this.save();
};

// Export the model
export const User = model<IUser, IUserModel>('User', userSchema);