import { Router } from 'express';
import { PageModel } from './page.model.js';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { requireAdmin } from '../../middlewares/admin.middleware.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { AppError } from '../../utils/AppError.js';

const router = Router();

// ─── Public Routes ────────────────────────────────────────────────────────────

// GET /api/v1/pages — List published pages (title + slug only)
router.get(
  '/',
  asyncHandler(async (_req, res) => {
    const pages = await PageModel.find({ isPublished: true })
      .sort('title')
      .select('title slug');
    res.json({ success: true, message: 'Pages fetched', data: { pages } });
  })
);

// GET /api/v1/pages/admin/all — Admin: list all pages including unpublished
// NOTE: must be defined before /:slug to prevent "admin" being matched as a slug
router.get(
  '/admin/all',
  authenticate,
  requireAdmin,
  asyncHandler(async (_req, res) => {
    const pages = await PageModel.find().sort('-createdAt');
    res.json({ success: true, message: 'All pages fetched', data: { pages } });
  })
);

// POST /api/v1/pages — Admin: create a page
router.post(
  '/',
  authenticate,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const { title, content, isPublished, seoTitle, seoDescription } = req.body;
    let { slug } = req.body;

    if (!slug && title) {
      slug = title
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
    }

    if (!slug) throw new AppError('Slug could not be generated from title', 400);

    const page = await PageModel.create({ title, slug, content, isPublished, seoTitle, seoDescription });
    res.status(201).json({ success: true, message: 'Page created', data: { page } });
  })
);

// PATCH /api/v1/pages/:id — Admin: update a page
router.patch(
  '/:id',
  authenticate,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const page = await PageModel.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!page) throw new AppError('Page not found', 404);
    res.json({ success: true, message: 'Page updated', data: { page } });
  })
);

// DELETE /api/v1/pages/:id — Admin: delete a page
router.delete(
  '/:id',
  authenticate,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const page = await PageModel.findByIdAndDelete(req.params.id);
    if (!page) throw new AppError('Page not found', 404);
    res.json({ success: true, message: 'Page deleted' });
  })
);

// GET /api/v1/pages/:slug — Get single published page by slug
// NOTE: keep this last so static segments (/admin/all) are matched first
router.get(
  '/:slug',
  asyncHandler(async (req, res) => {
    const page = await PageModel.findOne({ slug: req.params.slug, isPublished: true });
    if (!page) throw new AppError('Page not found', 404);
    res.json({ success: true, message: 'Page fetched', data: { page } });
  })
);

export default router;
