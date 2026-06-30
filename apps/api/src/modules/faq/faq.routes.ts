import { Router } from 'express';
import mongoose, { Schema, Document } from 'mongoose';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { requireAdmin } from '../../middlewares/admin.middleware.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { AppError } from '../../utils/AppError.js';

interface IFAQ extends Document {
  question: string;
  answer: string;
  order: number;
  isActive: boolean;
}

const faqSchema = new Schema<IFAQ>(
  {
    question: { type: String, required: true, trim: true },
    answer:   { type: String, required: true, trim: true },
    order:    { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const FAQModel =
  (mongoose.models.FAQ as mongoose.Model<IFAQ>) ||
  mongoose.model<IFAQ>('FAQ', faqSchema);

const router = Router();

// GET /api/v1/faqs — Public: active FAQs
router.get(
  '/',
  asyncHandler(async (_req, res) => {
    const faqs = await FAQModel.find({ isActive: true }).sort('order').lean();
    res.json({ success: true, data: { faqs } });
  })
);

// GET /api/v1/faqs/admin/all — Admin: all FAQs
router.get(
  '/admin/all',
  authenticate,
  requireAdmin,
  asyncHandler(async (_req, res) => {
    const faqs = await FAQModel.find().sort('order').lean();
    res.json({ success: true, data: { faqs } });
  })
);

// POST /api/v1/faqs — Admin: create
router.post(
  '/',
  authenticate,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const { question, answer, order, isActive } = req.body;
    if (!question?.trim()) throw new AppError('Question is required', 400);
    if (!answer?.trim()) throw new AppError('Answer is required', 400);
    const faq = await FAQModel.create({ question, answer, order: order ?? 0, isActive: isActive ?? true });
    res.status(201).json({ success: true, data: { faq } });
  })
);

// PATCH /api/v1/faqs/:id — Admin: update
router.patch(
  '/:id',
  authenticate,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const faq = await FAQModel.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!faq) throw new AppError('FAQ not found', 404);
    res.json({ success: true, data: { faq } });
  })
);

// DELETE /api/v1/faqs/:id — Admin: delete
router.delete(
  '/:id',
  authenticate,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const faq = await FAQModel.findByIdAndDelete(req.params.id);
    if (!faq) throw new AppError('FAQ not found', 404);
    res.json({ success: true, message: 'FAQ deleted' });
  })
);

export default router;
