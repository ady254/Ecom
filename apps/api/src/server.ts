import { env } from './config/env.js';
import { connectDB } from './config/db.js';
import { configureCloudinary } from './config/cloudinary.js';
import app from './app.js';

const start = async () => {
  // Connect to MongoDB
  await connectDB();

  // Configure Cloudinary
  configureCloudinary();

  // Start server
  const PORT = Number(env.PORT);
  app.listen(PORT, () => {
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
