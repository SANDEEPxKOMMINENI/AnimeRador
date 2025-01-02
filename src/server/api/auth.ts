import { connectDB, User } from '@/lib/db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'default_secret_key';

export async function register(userData: { email: string; password: string; username: string }) {
  await connectDB();

  // Check if user exists
  const existingUser = await User.findOne({ 
    $or: [{ email: userData.email }, { username: userData.username }] 
  });

  if (existingUser) {
    throw new Error('User already exists');
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(userData.password, 10);

  // Create user
  const user = await User.create({
    ...userData,
    password: hashedPassword,
    favorites: [],
    watchlist: []
  });

  // Generate token
  const token = jwt.sign(
    { userId: user._id },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  return {
    token,
    user: {
      id: user._id,
      email: user.email,
      username: user.username,
      favorites: user.favorites,
      watchlist: user.watchlist
    }
  };
}

export async function login(email: string, password: string) {
  await connectDB();

  // Find user
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error('User not found');
  }

  // Check password
  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) {
    throw new Error('Invalid password');
  }

  // Generate token
  const token = jwt.sign(
    { userId: user._id },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  return {
    token,
    user: {
      id: user._id,
      email: user.email,
      username: user.username,
      favorites: user.favorites,
      watchlist: user.watchlist
    }
  };
}