import { Router } from 'express';
import mongoose from 'mongoose';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';
import { ReviewModel } from './review.model.js';
import { ProductRepository } from '../products/product.repository.js';
import { authenticate, optionalAuth, AuthRequest } from '../../middlewares/auth.middleware.js';
import { requireAdmin } from '../../middlewares/admin.middleware.js';
import { validate } from '../../middlewares/validate.middleware.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { AppError } from '../../utils/AppError.js';

const router = Router();
const productRepo = new ProductRepository();

const reviewLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many reviews submitted. Please try again later.' },
});

const submitReviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  title: z.string().trim().max(120).optional(),
  comment: z.string().trim().min(1).max(2000),
  guestName: z.string().trim().min(1).max(100).optional(),
  guestEmail: z.string().trim().toLowerCase().email().optional(),
});

// ─── Public Routes ────────────────────────────────────────────────────────────

// GET /api/v1/reviews/product/:productId — Get approved reviews for a product
router.get(
  '/product/:productId',
  asyncHandler(async (req, res) => {
    const page = Number(req.query.page) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;

    const query = { product: req.params.productId, isApproved: true };
    const [reviews, total] = await Promise.all([
      ReviewModel.find(query)
        .sort('-createdAt')
        .skip(skip)
        .limit(limit)
        .populate('user', 'name'),
      ReviewModel.countDocuments(query),
    ]);

    res.json({
      success: true,
      message: 'Reviews fetched',
      data: { reviews },
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  })
);

// POST /api/v1/reviews/product/:productId — Submit a review for a product
router.post(
  '/product/:productId',
  reviewLimiter,
  optionalAuth,
  validate(submitReviewSchema),
  asyncHandler(async (req: AuthRequest, res) => {
    const { rating, title, comment, guestName, guestEmail } = req.body as z.infer<typeof submitReviewSchema>;

    if (!mongoose.isValidObjectId(req.params.productId)) {
      throw new AppError('Invalid product', 400);
    }
    if (!req.user && !guestName) {
      throw new AppError('Guest name is required', 400);
    }

    const review = await ReviewModel.create({
      product: req.params.productId,
      user: req.user?.userId || undefined,
      guestName: !req.user ? guestName : undefined,
      guestEmail: !req.user ? guestEmail : undefined,
      rating,
      title,
      comment,
      isApproved: false,
      isVerifiedPurchase: false,
    });

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully and is pending approval',
      data: { review },
    });
  })
);

// ─── Admin Routes ─────────────────────────────────────────────────────────────

// GET /api/v1/reviews — Admin: list all reviews with filters
router.get(
  '/',
  authenticate,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const page = Number(req.query.page) || 1;
    const limit = 20;
    const skip = (page - 1) * limit;
    const status = req.query.status as string | undefined;
    const rating = req.query.rating ? Number(req.query.rating) : undefined;

    const query: Record<string, unknown> = {};

    if (status === 'pending') {
      query.isApproved = false;
    } else if (status === 'approved') {
      query.isApproved = true;
    }

    if (rating && rating >= 1 && rating <= 5) {
      query.rating = rating;
    }

    const [reviews, total] = await Promise.all([
      ReviewModel.find(query)
        .sort('-createdAt')
        .skip(skip)
        .limit(limit)
        .populate('product', 'name slug')
        .populate('user', 'name email'),
      ReviewModel.countDocuments(query),
    ]);

    res.json({
      success: true,
      message: 'Reviews fetched',
      data: { reviews },
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  })
);

// PATCH /api/v1/reviews/:id — Admin: approve/reject or edit a review
router.patch(
  '/:id',
  authenticate,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const allowedFields = ['isApproved', 'comment', 'title', 'rating'];
    const update: Record<string, unknown> = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        update[field] = req.body[field];
      }
    }

    const review = await ReviewModel.findByIdAndUpdate(req.params.id, update, {
      new: true,
      runValidators: true,
    })
      .populate('product', 'name slug')
      .populate('user', 'name email');

    if (!review) throw new AppError('Review not found', 404);

    // Recalculate product rating whenever approval status or rating changes
    if ((update.isApproved !== undefined || update.rating !== undefined) && review.product) {
      const productId = (review.product as { _id: mongoose.Types.ObjectId })._id;
      const stats = await ReviewModel.aggregate([
        { $match: { product: productId, isApproved: true } },
        {
          $group: {
            _id: '$product',
            avgRating: { $avg: '$rating' },
            count: { $sum: 1 },
          },
        },
      ]);
      if (stats.length > 0) {
        const avg = Math.round(stats[0].avgRating * 10) / 10;
        await productRepo.updateRating(productId.toString(), avg, stats[0].count);
      } else {
        await productRepo.updateRating(productId.toString(), 0, 0);
      }
    }

    res.json({ success: true, message: 'Review updated', data: { review } });
  })
);

// DELETE /api/v1/reviews/:id — Admin: delete a review
router.delete(
  '/:id',
  authenticate,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const review = await ReviewModel.findByIdAndDelete(req.params.id);
    if (!review) throw new AppError('Review not found', 404);

    // Recalculate product rating after deletion
    if (review.product) {
      const stats = await ReviewModel.aggregate([
        { $match: { product: review.product, isApproved: true } },
        {
          $group: {
            _id: '$product',
            avgRating: { $avg: '$rating' },
            count: { $sum: 1 },
          },
        },
      ]);
      if (stats.length > 0) {
        const avg = Math.round(stats[0].avgRating * 10) / 10;
        await productRepo.updateRating(review.product.toString(), avg, stats[0].count);
      } else {
        await productRepo.updateRating(review.product.toString(), 0, 0);
      }
    }

    res.json({ success: true, message: 'Review deleted' });
  })
);

export default router;
