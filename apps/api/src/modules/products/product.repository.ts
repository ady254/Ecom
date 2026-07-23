import mongoose from 'mongoose';
import { ProductModel, IProduct } from './product.model.js';
import { CategoryModel } from '../categories/category.model.js';
import { FilterQuery } from 'mongoose';

export interface ProductFilter {
  category?: string;
  isFeatured?: boolean;
  isActive?: boolean;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  tags?: string[];
}

export class ProductRepository {
  async findAll(
    filter: ProductFilter,
    page = 1,
    limit = 12,
    sort = '-createdAt'
  ): Promise<{ products: IProduct[]; total: number }> {
    const query: FilterQuery<IProduct> = { isActive: true };

    if (filter.category) {
      // Accept either a MongoDB ObjectId string or a category slug.
      // The sidebar sends slugs; admin might send _id directly.
      if (mongoose.Types.ObjectId.isValid(filter.category)) {
        query.categories = { $in: [filter.category] };
      } else {
        const cat = await CategoryModel.findOne({ slug: filter.category }).select('_id').lean();
        if (cat) {
          query.categories = { $in: [cat._id] };
        } else {
          // Unknown slug — return empty result set rather than a CastError
          return { products: [], total: 0 };
        }
      }
    }

    if (filter.isFeatured !== undefined) query.isFeatured = filter.isFeatured;
    if (filter.isActive !== undefined) query.isActive = filter.isActive;
    if (filter.tags?.length) query.tags = { $in: filter.tags };
    if (filter.minPrice !== undefined || filter.maxPrice !== undefined) {
      query.price = {};
      if (filter.minPrice !== undefined) query.price.$gte = filter.minPrice;
      if (filter.maxPrice !== undefined) query.price.$lte = filter.maxPrice;
    }
    if (filter.search) {
      query.$text = { $search: filter.search };
    }

    const skip = (page - 1) * limit;
    const [products, total] = await Promise.all([
      ProductModel.find(query)
        .populate('categories', 'name slug')
        .sort(sort)
        .skip(skip)
        .limit(limit),
      ProductModel.countDocuments(query),
    ]);

    return { products, total };
  }

  async findBySlug(slug: string): Promise<IProduct | null> {
    return ProductModel.findOne({ slug, isActive: true }).populate('categories', 'name slug');
  }

  async findById(id: string): Promise<IProduct | null> {
    return ProductModel.findById(id).populate('categories', 'name slug');
  }

  async create(data: Partial<IProduct>): Promise<IProduct> {
    return ProductModel.create(data);
  }

  async update(id: string, data: Partial<IProduct>): Promise<IProduct | null> {
    return ProductModel.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  }

  async delete(id: string): Promise<void> {
    await ProductModel.findByIdAndDelete(id);
  }

  async updateRating(productId: string, avgRating: number, reviewCount: number): Promise<void> {
    await ProductModel.findByIdAndUpdate(productId, { averageRating: avgRating, reviewCount });
  }
}
