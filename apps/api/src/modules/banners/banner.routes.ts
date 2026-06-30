import { Router } from 'express';
import fs from 'fs';
import { BannerModel } from './banner.model.js';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { requireAdmin } from '../../middlewares/admin.middleware.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { AppError } from '../../utils/AppError.js';
import { upload } from '../../middlewares/upload.middleware.js';
import { uploadToCloudinary } from '../../config/cloudinary.js';
import { CLOUDINARY_FOLDERS } from '@minara/config';

const router = Router();

// ─── Public Routes ────────────────────────────────────────────────────────────

// GET /api/v1/banners — Get active banners sorted by order
router.get(
  '/',
  asyncHandler(async (_req, res) => {
    const banners = await BannerModel.find({ isActive: true }).sort('order');
    res.json({ success: true, message: 'Banners fetched', data: { banners } });
  })
);

// ─── Admin Routes ─────────────────────────────────────────────────────────────

// POST /api/v1/banners/upload — Admin: upload a banner image to Cloudinary
router.post(
  '/upload',
  authenticate,
  requireAdmin,
  upload.single('image'),
  asyncHandler(async (req, res) => {
    if (!req.file) throw new AppError('No image provided', 400);
    const { url } = await uploadToCloudinary(req.file.path, CLOUDINARY_FOLDERS.banners);
    fs.unlink(req.file.path, () => {});
    res.json({ success: true, data: { url } });
  })
);

// GET /api/v1/banners/admin/all — Admin: get all banners including inactive
router.get(
  '/admin/all',
  authenticate,
  requireAdmin,
  asyncHandler(async (_req, res) => {
    const banners = await BannerModel.find().sort('order');
    res.json({ success: true, message: 'All banners fetched', data: { banners } });
  })
);

// POST /api/v1/banners — Admin: create a banner
router.post(
  '/',
  authenticate,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const banner = await BannerModel.create(req.body);
    res.status(201).json({ success: true, message: 'Banner created', data: { banner } });
  })
);

// PATCH /api/v1/banners/:id — Admin: update a banner
router.patch(
  '/:id',
  authenticate,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const banner = await BannerModel.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!banner) throw new AppError('Banner not found', 404);
    res.json({ success: true, message: 'Banner updated', data: { banner } });
  })
);

// DELETE /api/v1/banners/:id — Admin: delete a banner
router.delete(
  '/:id',
  authenticate,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const banner = await BannerModel.findByIdAndDelete(req.params.id);
    if (!banner) throw new AppError('Banner not found', 404);
    res.json({ success: true, message: 'Banner deleted' });
  })
);

export default router;
