import mongoose from 'mongoose';
import { env } from './env.js';

let isConnected = false;

export const connectDB = async (): Promise<void> => {
  if (isConnected) {
    console.log('✅  MongoDB already connected');
    return;
  }

  if (env.MONGODB_URI.includes('REPLACE_WITH_YOUR_MONGODB_URI')) {
    console.warn('⚠️  MONGODB_URI is set to placeholder. Skipping DB connection for Phase 1 demo mode.');
    return;
  }

  try {
    const conn = await mongoose.connect(env.MONGODB_URI, {
      dbName: 'minara',
    });

    isConnected = true;
    console.log(`✅  MongoDB connected: ${conn.connection.host}`);

    mongoose.connection.on('error', (err) => {
      console.error('❌  MongoDB connection error:', err);
      isConnected = false;
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️   MongoDB disconnected. Reconnecting...');
      isConnected = false;
    });
  } catch (error) {
    console.error('⚠️  MongoDB connection failed, running in demo mode:', error);
  }
};

export const disconnectDB = async (): Promise<void> => {
  if (!isConnected) return;
  await mongoose.disconnect();
  isConnected = false;
  console.log('MongoDB disconnected.');
};
