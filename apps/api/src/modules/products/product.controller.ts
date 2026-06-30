import { Request, Response } from 'express';
import fs from 'fs';
import { ProductService } from './product.service.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { uploadToCloudinary } from '../../config/cloudinary.js';
import { CLOUDINARY_FOLDERS } from '@minara/config';

const productService = new ProductService();

export const getAdminProducts = asyncHandler(async (req: Request, res: Response) => {
  const { category, isFeatured, minPrice, maxPrice, search, page, limit, sort, tags, isActive } = req.query;

  const { products, pagination } = await productService.getAdminProducts({
    category: category as string,
    isFeatured: isFeatured === 'true' ? true : isFeatured === 'false' ? false : undefined,
    isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
    minPrice: minPrice ? Number(minPrice) : undefined,
    maxPrice: maxPrice ? Number(maxPrice) : undefined,
    search: search as string,
    tags: tags ? (tags as string).split(',') : undefined,
    page: page ? Number(page) : 1,
    limit: limit ? Number(limit) : 48,
    sort: sort as string,
  });

  res.json({ success: true, message: 'Products fetched', data: { products }, pagination });
});

export const getProducts = asyncHandler(async (req: Request, res: Response) => {
  const { category, isFeatured, minPrice, maxPrice, search, page, limit, sort, tags } = req.query;

  const { products, pagination } = await productService.getProducts({
    category: category as string,
    isFeatured: isFeatured === 'true' ? true : undefined,
    minPrice: minPrice ? Number(minPrice) : undefined,
    maxPrice: maxPrice ? Number(maxPrice) : undefined,
    search: search as string,
    tags: tags ? (tags as string).split(',') : undefined,
    page: page ? Number(page) : 1,
    limit: limit ? Number(limit) : 12,
    sort: sort as string,
  });

  res.json({ success: true, message: 'Products fetched', data: { products }, pagination });
});

export const getProductBySlug = asyncHandler(async (req: Request, res: Response) => {
  const product = await productService.getProductBySlug(req.params.slug as string);
  res.json({ success: true, message: 'Product fetched', data: { product } });
});

export const getProductById = asyncHandler(async (req: Request, res: Response) => {
  const product = await productService.getProductById(req.params.id as string);
  res.json({ success: true, message: 'Product fetched', data: { product } });
});

export const getFeaturedProducts = asyncHandler(async (_req: Request, res: Response) => {
  const products = await productService.getFeaturedProducts();
  res.json({ success: true, message: 'Featured products fetched', data: { products } });
});

export const createProduct = asyncHandler(async (req: Request, res: Response) => {
  const product = await productService.createProduct(req.body);
  res.status(201).json({ success: true, message: 'Product created', data: { product } });
});

export const updateProduct = asyncHandler(async (req: Request, res: Response) => {
  const product = await productService.updateProduct(req.params.id as string, req.body);
  res.json({ success: true, message: 'Product updated', data: { product } });
});

export const deleteProduct = asyncHandler(async (req: Request, res: Response) => {
  await productService.deleteProduct(req.params.id as string);
  res.json({ success: true, message: 'Product deleted' });
});

export const uploadProductImages = asyncHandler(async (req: Request, res: Response) => {
  const files = req.files as Express.Multer.File[];
  if (!files?.length) {
    res.status(400).json({ success: false, message: 'No images provided' });
    return;
  }

  const uploads = await Promise.all(
    files.map((file) => uploadToCloudinary(file.path, CLOUDINARY_FOLDERS.products))
  );

  // Clean up temp files (fire-and-forget — don't block the response)
  files.forEach((file) => fs.unlink(file.path, () => {}));

  res.json({
    success: true,
    message: 'Images uploaded',
    data: { images: uploads.map((u) => u.url) },
  });
});
