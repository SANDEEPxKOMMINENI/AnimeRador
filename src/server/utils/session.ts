import { Request } from 'express';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import { logger } from '../config/logger';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

declare module 'express-session' {
  interface SessionData {
    userId: string;
    refreshToken: string;
    lastActivity: Date;
    deviceInfo: {
      userAgent: string;
      ip: string;
    };
  }
}

// Validate required environment variables
if (!process.env.MONGODB_URI) {
  throw new Error('MONGODB_URI is not defined in environment variables');
}

if (!process.env.SESSION_SECRET) {
  throw new Error('SESSION_SECRET is not defined in environment variables');
}

// Configure MongoDB session store with enhanced options
const mongoStoreOptions = {
  mongoUrl: process.env.MONGODB_URI,
  dbName: process.env.DB_NAME || 'animeradar',
  collectionName: 'sessions',
  ttl: 14 * 24 * 60 * 60, // 14 days in seconds
  autoRemove: 'native',
  touchAfter: 24 * 3600, // 24 hours in seconds
  crypto: {
    secret: process.env.SESSION_SECRET
  },
  mongoOptions: {
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000,
    heartbeatFrequencyMS: 2000,
  },
};

// Create session store instance with error handling
export const sessionStore = MongoStore.create(mongoStoreOptions);

// Handle session store events
sessionStore.on('create', (sessionId) => {
  logger.info('New session created:', { sessionId });
});

sessionStore.on('touch', (sessionId) => {
  logger.debug('Session touched:', { sessionId });
});

sessionStore.on('destroy', (sessionId) => {
  logger.info('Session destroyed:', { sessionId });
});

sessionStore.on('error', (error) => {
  logger.error('Session store error:', error);
});

// Enhanced session configuration
export const sessionConfig = {
  store: sessionStore,
  secret: process.env.SESSION_SECRET!,
  name: 'sid', // Custom session ID cookie name
  resave: false,
  saveUninitialized: false,
  rolling: true, // Reset expiration on every response
  proxy: process.env.NODE_ENV === 'production', // Trust proxy in production
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict' as const,
    maxAge: 14 * 24 * 60 * 60 * 1000, // 14 days in milliseconds
    path: '/',
    domain: process.env.NODE_ENV === 'production' ? '.yourdomain.com' : undefined,
  },
};

// Helper function to safely regenerate session
const safeRegenerateSession = (req: Request): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (!req.session) {
      logger.error('Session object is undefined');
      reject(new Error('Session object is undefined'));
      return;
    }

    req.session.regenerate((err) => {
      if (err) {
        logger.error('Session regeneration failed:', err);
        reject(err);
        return;
      }
      resolve();
    });
  });
};

// Helper function to safely save session
const safeSaveSession = (req: Request): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (!req.session) {
      logger.error('Session object is undefined');
      reject(new Error('Session object is undefined'));
      return;
    }

    req.session.save((err) => {
      if (err) {
        logger.error('Session save failed:', err);
        reject(err);
        return;
      }
      resolve();
    });
  });
};

// Helper function to create a new session with enhanced security and error handling
export async function createSession(
  req: Request,
  data: {
    userId: string;
    refreshToken: string;
    deviceInfo?: {
      userAgent: string;
      ip: string;
    };
  }
): Promise<void> {
  try {
    // First, ensure we have a session object
    if (!req.session) {
      throw new Error('Session middleware not properly initialized');
    }

    // Safely regenerate the session
    await safeRegenerateSession(req);

    // Set session data
    req.session.userId = data.userId;
    req.session.refreshToken = data.refreshToken;
    req.session.lastActivity = new Date();
    req.session.deviceInfo = data.deviceInfo || {
      userAgent: req.headers['user-agent'] || 'unknown',
      ip: req.ip || 'unknown',
    };

    // Safely save the session
    await safeSaveSession(req);

    logger.info('Session created successfully:', {
      userId: data.userId,
      sessionId: req.sessionID,
    });
  } catch (error) {
    logger.error('Failed to create session:', error);
    throw error;
  }
}

// Helper function to destroy session with cleanup and error handling
export async function destroySession(req: Request): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!req.session) {
      logger.warn('No session to destroy');
      resolve();
      return;
    }

    const sessionId = req.sessionID;
    
    req.session.destroy((err) => {
      if (err) {
        logger.error('Session destruction failed:', {
          error: err,
          sessionId,
        });
        reject(err);
        return;
      }

      logger.info('Session destroyed successfully:', { sessionId });
      resolve();
    });
  });
}

// Helper function to validate session with enhanced checks
export function isValidSession(req: Request): boolean {
  if (!req.session || !req.session.userId) {
    logger.debug('Invalid session: Missing session or userId');
    return false;
  }

  // Check session age
  const lastActivity = req.session.lastActivity;
  if (!lastActivity) {
    logger.debug('Invalid session: Missing lastActivity timestamp');
    return false;
  }

  const maxAge = sessionConfig.cookie.maxAge;
  const now = new Date().getTime();
  const sessionAge = now - lastActivity.getTime();

  const isValid = sessionAge < maxAge;
  if (!isValid) {
    logger.debug('Invalid session: Session expired', {
      sessionAge,
      maxAge,
    });
  }

  return isValid;
}

// Helper function to refresh session with error handling
export async function refreshSession(req: Request): Promise<void> {
  try {
    if (!req.session || !req.session.userId) {
      throw new Error('No active session to refresh');
    }

    req.session.lastActivity = new Date();
    await safeSaveSession(req);
    
    logger.debug('Session refreshed successfully', {
      userId: req.session.userId,
      sessionId: req.sessionID,
    });
  } catch (error) {
    logger.error('Failed to refresh session:', error);
    throw error;
  }
}