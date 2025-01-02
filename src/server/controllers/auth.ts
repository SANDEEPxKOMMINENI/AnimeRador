import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { User } from '../models/User';
import { logger } from '../config/logger';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import argon2 from 'argon2';
import { z } from 'zod';
import { AuthError } from '../utils/errors';
import { createSession, destroySession } from '../utils/session';
import { sanitizeUser } from '../utils/sanitize';

// Enhanced validation schemas with more specific rules
const loginSchema = z.object({
  email: z.string().email('Invalid email format').toLowerCase().trim(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  rememberMe: z.boolean().optional(),
});

const registerSchema = z.object({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username must not exceed 30 characters')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, underscores, and hyphens')
    .trim(),
  email: z.string().email('Invalid email format').toLowerCase().trim(),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one uppercase letter, one lowercase letter, and one number'),
});

const updateProfileSchema = z.object({
  username: z.string().min(3).max(30).optional(),
  email: z.string().email().optional(),
  bio: z.string().max(500).optional(),
  currentPassword: z.string().min(8).optional(),
  newPassword: z.string().min(8).optional(),
});

const generateToken = (userId: string, expiresIn: string = '7d'): string => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn }
  );
};

export const register = asyncHandler(async (req: Request, res: Response) => {
  try {
    // Validate request body
    const validatedData = registerSchema.parse(req.body);
    const { username, email, password } = validatedData;

    logger.info('Attempting to register user:', { email, username });

    // Check if user exists with detailed error messages
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    }).select('+password');

    if (existingUser) {
      logger.warn('Registration failed: User already exists', {
        email,
        username,
        existingEmail: existingUser.email === email,
        existingUsername: existingUser.username === username
      });

      throw new AuthError(
        existingUser.email === email
          ? 'This email is already registered'
          : 'This username is already taken',
        'DUPLICATE_USER'
      );
    }

    // Generate salt and hash password using bcrypt
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user with hashed password
    const user = await User.create({
      username,
      email,
      password: hashedPassword,
      favorites: [],
      watchlist: [],
      lastLogin: new Date(),
    });

    // Generate tokens
    const token = generateToken(user._id);
    const refreshToken = generateToken(user._id, '30d');

    // Create session
    await createSession(req, {
      userId: user._id,
      refreshToken,
    });

    logger.info('User registered successfully:', {
      userId: user._id,
      email,
      username,
    });

    // Set secure cookie with JWT
    res.cookie('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Return sanitized user data
    res.status(201).json({
      token,
      refreshToken,
      user: sanitizeUser(user),
    });
  } catch (error: any) {
    logger.error('Registration error:', {
      error: error.message,
      code: error.code,
      stack: error.stack,
    });

    if (error instanceof z.ZodError) {
      res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
        })),
      });
      return;
    }

    if (error instanceof AuthError) {
      res.status(400).json({
        status: 'error',
        message: error.message,
        code: error.code,
      });
      return;
    }

    throw error;
  }
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  try {
    // Validate request body
    const validatedData = loginSchema.parse(req.body);
    const { email, password, rememberMe } = validatedData;

    logger.info('Attempting to login user:', { email });

    // Find user and include password field
    const user = await User.findOne({ email }).select('+password +loginAttempts +lockUntil');
    
    // Enhanced error handling for non-existent user
    if (!user) {
      logger.warn('Login failed: User not found', { email });
      throw new AuthError('Invalid email or password', 'INVALID_CREDENTIALS');
    }

    // Check if account is locked due to too many failed attempts
    if (user.loginAttempts >= 5 && user.lockUntil && user.lockUntil > new Date()) {
      logger.warn('Login failed: Account locked', { email });
      throw new AuthError(
        'Account temporarily locked. Please try again later.',
        'ACCOUNT_LOCKED'
      );
    }

    // Verify password using bcrypt
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      // Increment failed login attempts
      user.loginAttempts = (user.loginAttempts || 0) + 1;
      
      // Lock account if too many failed attempts
      if (user.loginAttempts >= 5) {
        user.lockUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
      }
      
      await user.save();

      logger.warn('Login failed: Invalid password', {
        email,
        attempts: user.loginAttempts,
        locked: !!user.lockUntil,
      });

      throw new AuthError('Invalid email or password', 'INVALID_CREDENTIALS');
    }

    // Reset login attempts and lock
    user.loginAttempts = 0;
    user.lockUntil = undefined;
    user.lastLogin = new Date();
    await user.save();

    // Generate tokens
    const token = generateToken(user._id);
    const refreshToken = generateToken(user._id, '30d');

    // Create session
    await createSession(req, {
      userId: user._id,
      refreshToken,
      deviceInfo: {
        userAgent: req.headers['user-agent'] || 'unknown',
        ip: req.ip || 'unknown',
      },
    });

    logger.info('User logged in successfully:', {
      userId: user._id,
      email,
      rememberMe,
    });

    // Set secure cookie with JWT
    res.cookie('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: rememberMe ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000, // 30 days if remember me, else 24 hours
    });

    // Return sanitized user data
    res.json({
      token,
      refreshToken,
      user: sanitizeUser(user),
    });
  } catch (error: any) {
    logger.error('Login error:', {
      error: error.message,
      code: error.code,
      stack: error.stack,
    });

    if (error instanceof z.ZodError) {
      res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
        })),
      });
      return;
    }

    if (error instanceof AuthError) {
      res.status(401).json({
        status: 'error',
        message: error.message,
        code: error.code,
      });
      return;
    }

    throw error;
  }
});

export const getProfile = asyncHandler(async (req: Request, res: Response) => {
  try {
    const userId = req.user?._id;
    logger.info('Fetching user profile:', { userId });

    const user = await User.findById(userId)
      .select('-password -refreshToken -loginAttempts -lockUntil')
      .lean();

    if (!user) {
      logger.warn('Profile fetch failed: User not found', { userId });
      throw new AuthError('User profile not found', 'PROFILE_NOT_FOUND');
    }

    logger.info('Profile fetched successfully:', { userId });
    res.json(sanitizeUser(user));
  } catch (error: any) {
    logger.error('Profile fetch error:', {
      error: error.message,
      stack: error.stack,
      userId: req.user?._id,
    });

    if (error instanceof AuthError) {
      res.status(404).json({
        status: 'error',
        message: error.message,
        code: error.code,
      });
      return;
    }

    throw error;
  }
});

export const updateProfile = asyncHandler(async (req: Request, res: Response) => {
  try {
    const validatedData = updateProfileSchema.parse(req.body);
    const userId = req.user?._id;

    logger.info('Attempting to update user profile:', { userId });

    const user = await User.findById(userId).select('+password');
    if (!user) {
      logger.warn('Profile update failed: User not found', { userId });
      throw new AuthError('User not found', 'USER_NOT_FOUND');
    }

    // Handle password change if requested
    if (validatedData.currentPassword && validatedData.newPassword) {
      const isValidPassword = await bcrypt.compare(validatedData.currentPassword, user.password);
      if (!isValidPassword) {
        logger.warn('Profile update failed: Invalid current password', { userId });
        throw new AuthError('Current password is incorrect', 'INVALID_PASSWORD');
      }

      const salt = await bcrypt.genSalt(12);
      user.password = await bcrypt.hash(validatedData.newPassword, salt);
    }

    // Update other fields
    if (validatedData.username) user.username = validatedData.username;
    if (validatedData.email) user.email = validatedData.email;
    if (validatedData.bio) user.bio = validatedData.bio;

    await user.save();

    logger.info('Profile updated successfully:', { userId });
    res.json(sanitizeUser(user));
  } catch (error: any) {
    logger.error('Profile update error:', {
      error: error.message,
      stack: error.stack,
      userId: req.user?._id,
    });

    if (error instanceof z.ZodError) {
      res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
        })),
      });
      return;
    }

    if (error instanceof AuthError) {
      res.status(400).json({
        status: 'error',
        message: error.message,
        code: error.code,
      });
      return;
    }

    throw error;
  }
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  try {
    const userId = req.user?._id;
    logger.info('User logging out:', { userId });

    // Destroy session
    await destroySession(req);

    // Clear auth cookie
    res.clearCookie('auth_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });

    res.json({ message: 'Logged out successfully' });
  } catch (error: any) {
    logger.error('Logout error:', {
      error: error.message,
      stack: error.stack,
      userId: req.user?._id,
    });
    throw error;
  }
});