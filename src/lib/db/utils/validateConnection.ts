import { isDBConnected, connectDB } from '../config';

export async function ensureConnection() {
  if (!isDBConnected()) {
    console.log('🔄 No active connection found, attempting to connect...');
    await connectDB();
  }
}

export async function handleConnectionError(error: any) {
  console.error('MongoDB Error:', {
    message: error.message,
    code: error.code,
    name: error.name,
    stack: error.stack,
  });

  if (error.name === 'MongoNetworkError') {
    console.log('🔄 Network error detected, attempting to reconnect...');
    await connectDB();
  }

  throw error;
}