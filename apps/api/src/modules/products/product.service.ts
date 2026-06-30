import { ProductRepository, ProductFilter } from './product.repository.js';
import { AppError } from '../../utils/AppError.js';
import { slugify, getPaginationMeta } from '@minara/utils';
import { IProduct } from './product.model.js';

export class ProductService {
  private repo: ProductRepository;

  constructor() {
    this.repo = new ProductRepository();
  }

  // Public: always restricts to isActive:true unless caller explicitly overrides
  async getProducts(
    filter: ProductFilter & { page?: number; limit?: number; sort?: string }
  ) {
    const page = filter.page || 1;
    const limit = Math.min(filter.limit || 12, 48);
    const sort = filter.sort || '-createdAt';
    const { products, total } = await this.repo.findAll(
      { ...filter, isActive: filter.isActive ?? true },
      page,
      limit,
      sort
    );
    return { products, pagination: getPaginationMeta(total, page, limit) };
  }

  // Admin: no isActive filter — returns all products including inactive
  async getAdminProducts(
    filter: ProductFilter & { page?: number; limit?: number; sort?: string }
  ) {
    const page = filter.page || 1;
    const limit = Math.min(filter.limit || 48, 100);
    const sort = filter.sort || '-createdAt';
    const { products, total } = await this.repo.findAll(filter, page, limit, sort);
    return { products, pagination: getPaginationMeta(total, page, limit) };
  }

  async getProductBySlug(slug: string): Promise<IProduct> {
    const product = await this.repo.findBySlug(slug);
    if (!product) throw new AppError('Product not found', 404);
    return product;
  }

  async getProductById(id: string): Promise<IProduct> {
    const product = await this.repo.findById(id);
    if (!product) throw new AppError('Product not found', 404);
    return product;
  }

  async createProduct(data: Partial<IProduct> & { name: string }): Promise<IProduct> {
    const slug = slugify(data.name);
    return this.repo.create({ ...data, slug });
  }

  async updateProduct(id: string, data: Partial<IProduct>): Promise<IProduct> {
    if (data.name) {
      data.slug = slugify(data.name);
    }
    const product = await this.repo.update(id, data);
    if (!product) throw new AppError('Product not found', 404);
    return product;
  }

  async deleteProduct(id: string): Promise<void> {
    const product = await this.repo.findById(id);
    if (!product) throw new AppError('Product not found', 404);
    await this.repo.delete(id);
  }

  async getFeaturedProducts(): Promise<IProduct[]> {
    const { products } = await this.repo.findAll({ isFeatured: true, isActive: true }, 1, 8);
    return products;
  }
}
