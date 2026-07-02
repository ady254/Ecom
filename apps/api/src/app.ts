import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import { env } from './config/env.js';
import { errorHandler } from './middlewares/error.middleware.js';

// Route imports
import authRoutes from './modules/auth/auth.routes.js';
import productRoutes from './modules/products/product.routes.js';
import categoryRoutes from './modules/categories/category.routes.js';
import dashboardRoutes from './modules/dashboard/dashboard.routes.js';
import orderRoutes from './modules/orders/order.routes.js';
import userRoutes from './modules/users/user.routes.js';
import paymentRoutes from './modules/payments/payment.routes.js';
import couponRoutes from './modules/coupons/coupon.routes.js';
import reviewRoutes from './modules/reviews/review.routes.js';
import bannerRoutes from './modules/banners/banner.routes.js';
import settingsRoutes from './modules/settings/settings.routes.js';
import pageRoutes from './modules/pages/page.routes.js';
import newsletterRoutes from './modules/newsletter/newsletter.routes.js';
import faqRoutes from './modules/faq/faq.routes.js';
import shippingRoutes from './modules/shipping/shipping.routes.js';

const app = express();

// ─── Security ─────────────────────────────────────────────────────────────────
app.use(helmet());

// ─── CORS ─────────────────────────────────────────────────────────────────────
app.use(
  cors({
    origin: [env.FRONTEND_URL, env.ADMIN_URL],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// ─── Rate Limiting ────────────────────────────────────────────────────────────
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later.' },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, message: 'Too many login attempts, please try again later.' },
});

app.use(globalLimiter);

// ─── Body Parsers ─────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// ─── Logger ───────────────────────────────────────────────────────────────────
if (env.NODE_ENV !== 'test') {
  app.use(morgan(env.NODE_ENV === 'development' ? 'dev' : 'combined'));
}

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ success: true, message: 'MINARA API is running', timestamp: new Date() });
});

// ─── Deep Health Check (MongoDB + Cloudinary) ─────────────────────────────────
app.get('/health/check', async (_req, res) => {
  const checks: Record<string, { status: string; message: string }> = {};

  // MongoDB check
  try {
    const mongoose = await import('mongoose');
    const state = mongoose.default.connection.readyState;
    // 0=disconnected, 1=connected, 2=connecting, 3=disconnecting
    const stateMap: Record<number, string> = { 0: 'disconnected', 1: 'connected', 2: 'connecting', 3: 'disconnecting' };
    checks.mongodb = {
      status: state === 1 ? '✅ connected' : '❌ ' + stateMap[state],
      message: state === 1 ? `Connected to: ${mongoose.default.connection.host}` : 'Not connected',
    };
  } catch {
    checks.mongodb = { status: '❌ error', message: 'Could not check MongoDB' };
  }

  // Cloudinary check
  try {
    const { cloudinary } = await import('./config/cloudinary.js');
    const result = await cloudinary.api.ping();
    checks.cloudinary = {
      status: result.status === 'ok' ? '✅ connected' : '❌ error',
      message: `Cloud: ${env.CLOUDINARY_CLOUD_NAME}`,
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    checks.cloudinary = { status: '❌ error', message: msg };
  }

  const allOk = Object.values(checks).every((c) => c.status.startsWith('✅'));
  res.status(allOk ? 200 : 503).json({
    success: allOk,
    message: allOk ? '🚀 All services connected' : '⚠️ Some services failed',
    checks,
    timestamp: new Date(),
  });
});

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use('/api/v1/auth', authLimiter, authRoutes);
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/categories', categoryRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);
app.use('/api/v1/orders', orderRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/payments', paymentRoutes);
app.use('/api/v1/coupons', couponRoutes);
app.use('/api/v1/reviews', reviewRoutes);
app.use('/api/v1/banners', bannerRoutes);
app.use('/api/v1/settings', settingsRoutes);
app.use('/api/v1/pages', pageRoutes);
app.use('/api/v1/newsletter', newsletterRoutes);
app.use('/api/v1/faqs', faqRoutes);
app.use('/api/v1/shipping', shippingRoutes);

// ─── 404 Handler ──────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use(errorHandler);

export default app;
