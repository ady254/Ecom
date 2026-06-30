import { Router } from 'express';
import { UserModel } from './user.model.js';
import { authenticate, AuthRequest } from '../../middlewares/auth.middleware.js';
import { requireAdmin } from '../../middlewares/admin.middleware.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { AppError } from '../../utils/AppError.js';
import { ProductModel } from '../products/product.model.js';

const router = Router();

// ─── Profile ──────────────────────────────────────────────────────────────────

// GET /api/v1/users/profile
router.get(
  '/profile',
  authenticate,
  asyncHandler(async (req: AuthRequest, res) => {
    const user = await UserModel.findById(req.user!.userId).populate('wishlist', 'name slug images price comparePrice');
    if (!user) throw new AppError('User not found', 404);
    res.json({ success: true, message: 'Profile fetched', data: { user } });
  })
);

// PATCH /api/v1/users/profile
router.patch(
  '/profile',
  authenticate,
  asyncHandler(async (req: AuthRequest, res) => {
    const allowed = ['name', 'phone', 'avatar'];
    const updates: Record<string, unknown> = {};
    allowed.forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    const user = await UserModel.findByIdAndUpdate(req.user!.userId, updates, { new: true });
    if (!user) throw new AppError('User not found', 404);
    res.json({ success: true, message: 'Profile updated', data: { user } });
  })
);

// ─── Addresses ────────────────────────────────────────────────────────────────

// POST /api/v1/users/addresses
router.post(
  '/addresses',
  authenticate,
  asyncHandler(async (req: AuthRequest, res) => {
    const user = await UserModel.findById(req.user!.userId);
    if (!user) throw new AppError('User not found', 404);

    if (req.body.isDefault) {
      user.addresses.forEach((addr) => { addr.isDefault = false; });
    }
    user.addresses.push(req.body);
    await user.save();

    res.status(201).json({ success: true, message: 'Address added', data: { addresses: user.addresses } });
  })
);

// DELETE /api/v1/users/addresses/:addressId
router.delete(
  '/addresses/:addressId',
  authenticate,
  asyncHandler(async (req: AuthRequest, res) => {
    const user = await UserModel.findById(req.user!.userId);
    if (!user) throw new AppError('User not found', 404);

    user.addresses = user.addresses.filter(
      (addr) => (addr as { _id?: { toString(): string } })._id?.toString() !== req.params.addressId
    ) as typeof user.addresses;
    await user.save();

    res.json({ success: true, message: 'Address removed', data: { addresses: user.addresses } });
  })
);

// ─── Wishlist ─────────────────────────────────────────────────────────────────

// POST /api/v1/users/wishlist/:productId — toggle wishlist
router.post(
  '/wishlist/:productId',
  authenticate,
  asyncHandler(async (req: AuthRequest, res) => {
    const user = await UserModel.findById(req.user!.userId);
    if (!user) throw new AppError('User not found', 404);

    const productId = req.params.productId;
    const product = await ProductModel.findById(productId);
    if (!product) throw new AppError('Product not found', 404);

    const idx = user.wishlist.findIndex((id) => id.toString() === productId);
    if (idx > -1) {
      user.wishlist.splice(idx, 1);
    } else {
      user.wishlist.push(product._id as typeof user.wishlist[0]);
    }
    await user.save();

    res.json({
      success: true,
      message: idx > -1 ? 'Removed from wishlist' : 'Added to wishlist',
      data: { inWishlist: idx === -1 },
    });
  })
);

// ─── Admin: Customers ─────────────────────────────────────────────────────────

// PATCH /api/v1/users/:id/status — Admin: toggle active
router.patch(
  '/:id/status',
  authenticate,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const user = await UserModel.findByIdAndUpdate(
      req.params.id,
      { isActive: req.body.isActive },
      { new: true }
    );
    if (!user) throw new AppError('User not found', 404);
    res.json({ success: true, message: `User ${user.isActive ? 'activated' : 'blocked'}`, data: { user } });
  })
);

// GET /api/v1/users — Admin only
router.get(
  '/',
  authenticate,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const page = Number(req.query.page) || 1;
    const limit = 20;
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      UserModel.find({ role: 'customer' }).sort('-createdAt').skip(skip).limit(limit),
      UserModel.countDocuments({ role: 'customer' }),
    ]);

    res.json({
      success: true,
      message: 'Customers fetched',
      data: { users },
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  })
);

export default router;
