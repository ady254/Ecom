import { Router } from 'express';
import { CategoryModel } from './category.model.js';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { requireAdmin } from '../../middlewares/admin.middleware.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { slugify } from '@minara/utils';
import { AppError } from '../../utils/AppError.js';

const router = Router();

// GET /api/v1/categories
router.get(
  '/',
  asyncHandler(async (_req, res) => {
    const categories = await CategoryModel.find({ isActive: true })
      .sort('order')
      .populate('parent', 'name slug');
    res.json({ success: true, message: 'Categories fetched', data: { categories } });
  })
);

// GET /api/v1/categories/:slug
router.get(
  '/:slug',
  asyncHandler(async (req, res) => {
    const category = await CategoryModel.findOne({ slug: req.params.slug, isActive: true });
    if (!category) throw new AppError('Category not found', 404);
    res.json({ success: true, message: 'Category fetched', data: { category } });
  })
);

// Admin routes
router.use(authenticate, requireAdmin);

router.post(
  '/',
  asyncHandler(async (req, res) => {
    const { name, description, image, parent, order } = req.body;
    const slug = slugify(name);
    const category = await CategoryModel.create({ name, slug, description, image, parent, order });
    res.status(201).json({ success: true, message: 'Category created', data: { category } });
  })
);

router.patch(
  '/:id',
  asyncHandler(async (req, res) => {
    if (req.body.name) req.body.slug = slugify(req.body.name);
    const category = await CategoryModel.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!category) throw new AppError('Category not found', 404);
    res.json({ success: true, message: 'Category updated', data: { category } });
  })
);

router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const category = await CategoryModel.findByIdAndDelete(req.params.id);
    if (!category) throw new AppError('Category not found', 404);
    res.json({ success: true, message: 'Category deleted' });
  })
);

export default router;
