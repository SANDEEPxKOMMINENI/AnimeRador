import express from 'express';
import cors from 'cors';
import { corsConfig } from './config/cors';
import { sessionMiddleware, sessionErrorHandler, validateSession } from './middleware/session';
import rootRouter from './routes/root';
import streamingRoutes from './routes/streaming';
import authRoutes from './routes/auth';
import { errorHandler } from './middleware/errorHandler';
import { logger } from '@/lib/logger';
import { connectDB } from '@/lib/db/connection';

const app = express();
const PORT = process.env.PORT || 5000;

// Basic middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors(corsConfig));

// Session middleware
app.use(sessionMiddleware);
app.use(validateSession);
app.use(sessionErrorHandler);

// Routes
app.use('/', rootRouter);
app.use('/api/streaming', streamingRoutes);
app.use('/api/auth', authRoutes);

// Error handling
app.use(errorHandler);

// Create logs directory if it doesn't exist
import { mkdir } from 'fs/promises';
import { join } from 'path';

async function ensureLogsDirectory() {
  try {
    await mkdir(join(process.cwd(), 'logs'), { recursive: true });
  } catch (error) {
    console.error('Failed to create logs directory:', error);
  }
}

async function startServer() {
  try {
    await ensureLogsDirectory();
    await connectDB();
    
    app.listen(PORT, () => {
      logger.info(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

export default app;