import { Router } from 'express';
import {
  getProducts,
  getProductBySlug,
  getProductById,
  getFeaturedProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  uploadProductImages,
} from './product.controller.js';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { requireAdmin } from '../../middlewares/admin.middleware.js';
import { upload } from '../../middlewares/upload.middleware.js';

const router = Router();

// Public routes
router.get('/', getProducts);
router.get('/featured', getFeaturedProducts);
router.get('/slug/:slug', getProductBySlug);
router.get('/:id', getProductById);

// Admin routes
router.use(authenticate, requireAdmin);
router.post('/', createProduct);
router.patch('/:id', updateProduct);
router.delete('/:id', deleteProduct);
router.post('/upload/images', upload.array('images', 10), uploadProductImages);

export default router;
