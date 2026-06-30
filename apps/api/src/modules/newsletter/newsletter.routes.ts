import { Router } from 'express';
import mongoose from 'mongoose';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { requireAdmin } from '../../middlewares/admin.middleware.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { AppError } from '../../utils/AppError.js';

const subscriberSchema = new mongoose.Schema(
  { email: { type: String, required: true, unique: true, lowercase: true, trim: true } },
  { timestamps: true }
);

const SubscriberModel =
  (mongoose.models.Subscriber as mongoose.Model<{ email: string }>) ||
  mongoose.model<{ email: string }>('Subscriber', subscriberSchema);

const router = Router();

// POST /api/v1/newsletter/subscribe
router.post(
  '/subscribe',
  asyncHandler(async (req, res) => {
    const { email } = req.body;
    if (!email || !String(email).includes('@')) throw new AppError('Valid email is required', 400);

    await SubscriberModel.findOneAndUpdate(
      { email: String(email).toLowerCase().trim() },
      { email: String(email).toLowerCase().trim() },
      { upsert: true, new: true }
    );

    res.json({ success: true, message: 'Successfully subscribed!' });
  })
);

// GET /api/v1/newsletter/subscribers — Admin only
router.get(
  '/subscribers',
  authenticate,
  requireAdmin,
  asyncHandler(async (_req, res) => {
    const subscribers = await SubscriberModel.find().sort('-createdAt').lean();
    res.json({ success: true, data: { subscribers, count: subscribers.length } });
  })
);

export default router;
