import { env } from './config/env.js';
import { connectDB, disconnectDB } from './config/db.js';
import { configureCloudinary } from './config/cloudinary.js';
import { sweepStaleUnpaidOrders } from './modules/orders/order.lifecycle.js';
import app from './app.js';
import type { Server } from 'http';

let server: Server;
let sweeperInterval: NodeJS.Timeout;

const SWEEP_EVERY_MS = 10 * 60 * 1000; // every 10 minutes
const STALE_AFTER_MINUTES = 30; // cancel unpaid online orders after 30 min

const start = async () => {
  // Connect to MongoDB
  await connectDB();

  // Configure Cloudinary
  configureCloudinary();

  // Release stock held by online orders whose payment never completed
  sweeperInterval = setInterval(() => {
    sweepStaleUnpaidOrders(STALE_AFTER_MINUTES).catch((err) =>
      console.error('Stale-order sweeper failed:', err)
    );
  }, SWEEP_EVERY_MS);
  sweeperInterval.unref();

  // Start server
  const PORT = Number(env.PORT);
  server = app.listen(PORT, () => {
    console.log(`
    ╔══════════════════════════════════════╗
    ║        MINARA API is running         ║
    ╠══════════════════════════════════════╣
    ║  Port:    ${PORT}                        ║
    ║  Env:     ${env.NODE_ENV.padEnd(22)}   ║
    ║  Health:  http://localhost:${PORT}/health ║
    ╚══════════════════════════════════════╝
    `);
  });
};

// Finish in-flight requests, close DB, then exit — so deploys don't drop orders
const shutdown = (signal: string) => {
  console.log(`${signal} received — shutting down gracefully...`);
  clearInterval(sweeperInterval);
  const forceExit = setTimeout(() => {
    console.error('Could not close connections in time, forcing exit');
    process.exit(1);
  }, 10_000);
  forceExit.unref();

  server?.close(async () => {
    await disconnectDB().catch(() => {});
    console.log('Shutdown complete.');
    process.exit(0);
  });
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION — shutting down:', err);
  process.exit(1);
});

// Handle unhandled rejections
process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION — shutting down:', err);
  process.exit(1);
});

start();
