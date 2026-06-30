import { Router } from 'express';
import { CouponModel } from './coupon.model.js';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { requireAdmin } from '../../middlewares/admin.middleware.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { AppError } from '../../utils/AppError.js';

const router = Router();

// ─── Public Routes ────────────────────────────────────────────────────────────

// POST /api/v1/coupons/validate — Validate a coupon code against an order amount
router.post(
  '/validate',
  asyncHandler(async (req, res) => {
    const { code, orderAmount } = req.body;

    if (!code) throw new AppError('Coupon code is required', 400);
    if (orderAmount === undefined || orderAmount === null)
      throw new AppError('Order amount is required', 400);

    const coupon = await CouponModel.findOne({ code: String(code).toUpperCase() });

    if (!coupon) {
      return res.json({ valid: false, discount: 0, message: 'Invalid coupon code', coupon: null });
    }

    if (!coupon.isActive) {
      return res.json({ valid: false, discount: 0, message: 'This coupon is no longer active', coupon: null });
    }

    if (coupon.expiresAt && coupon.expiresAt < new Date()) {
      return res.json({ valid: false, discount: 0, message: 'This coupon has expired', coupon: null });
    }

    if (coupon.usageLimit !== undefined && coupon.usageLimit !== null && coupon.usageCount >= coupon.usageLimit) {
      return res.json({ valid: false, discount: 0, message: 'This coupon has reached its usage limit', coupon: null });
    }

    if (orderAmount < coupon.minOrderAmount) {
      return res.json({
        valid: false,
        discount: 0,
        message: `Minimum order amount of ₹${coupon.minOrderAmount} required for this coupon`,
        coupon: null,
      });
    }

    let discount = 0;
    if (coupon.type === 'percentage') {
      discount = (orderAmount * coupon.value) / 100;
      if (coupon.maxDiscount && discount > coupon.maxDiscount) {
        discount = coupon.maxDiscount;
      }
    } else {
      discount = coupon.value;
    }

    // Ensure discount does not exceed order amount
    discount = Math.min(discount, orderAmount);
    discount = Math.round(discount * 100) / 100;

    res.json({
      valid: true,
      discount,
      message: 'Coupon applied successfully',
      coupon: {
        _id: coupon._id,
        code: coupon.code,
        type: coupon.type,
        value: coupon.value,
        maxDiscount: coupon.maxDiscount,
      },
    });
  })
);

// ─── Admin Routes ─────────────────────────────────────────────────────────────

// GET /api/v1/coupons — List all coupons
router.get(
  '/',
  authenticate,
  requireAdmin,
  asyncHandler(async (_req, res) => {
    const coupons = await CouponModel.find().sort('-createdAt');
    res.json({ success: true, message: 'Coupons fetched', data: { coupons } });
  })
);

// POST /api/v1/coupons — Create a coupon
router.post(
  '/',
  authenticate,
  requireAdmin,
  asyncHandler(async (req, res) => {
    if (req.body.code) {
      req.body.code = String(req.body.code).toUpperCase().trim();
    }
    const coupon = await CouponModel.create(req.body);
    res.status(201).json({ success: true, message: 'Coupon created', data: { coupon } });
  })
);

// PATCH /api/v1/coupons/:id — Update a coupon
router.patch(
  '/:id',
  authenticate,
  requireAdmin,
  asyncHandler(async (req, res) => {
    if (req.body.code) {
      req.body.code = String(req.body.code).toUpperCase().trim();
    }
    const coupon = await CouponModel.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!coupon) throw new AppError('Coupon not found', 404);
    res.json({ success: true, message: 'Coupon updated', data: { coupon } });
  })
);

// DELETE /api/v1/coupons/:id — Delete a coupon
router.delete(
  '/:id',
  authenticate,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const coupon = await CouponModel.findByIdAndDelete(req.params.id);
    if (!coupon) throw new AppError('Coupon not found', 404);
    res.json({ success: true, message: 'Coupon deleted' });
  })
);

export default router;
