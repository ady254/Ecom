import mongoose, { Document, Schema } from 'mongoose';

export interface IProduct extends Document {
  name: string;
  slug: string;
  description: string;
  shortDescription?: string;
  price: number;
  comparePrice?: number;
  images: { url: string; alt?: string }[];
  categories?: mongoose.Types.ObjectId[];
  tags: string[];
  stock: number;
  variants: Array<{
    name: string;
    options: Array<{ label: string; price?: number; stock?: number }>;
  }>;
  isFeatured: boolean;
  isActive: boolean;
  isCustomizable: boolean;
  /** When false, this product can only be bought with an online (prepaid) payment. */
  codAvailable: boolean;
  customFields: Array<{ label: string; placeholder?: string; required?: boolean }>;
  /** Quran language / translation options shown as pill selectors on the PDP */
  quranOptions?: {
    enabled: boolean;
    languages: string[];
  };
  /** Tasbeeh type options */
  tasbeehOptions?: {
    enabled: boolean;
    types: string[];
  };
  /** Janamaz / prayer mat shape options */
  janamazOptions?: {
    enabled: boolean;
    shapes: string[];
  };
  weight?: number;
  sku?: string;
  metaTitle?: string;
  metaDescription?: string;
  averageRating: number;
  reviewCount: number;
}

const productSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, index: true },
    description: { type: String, required: true },
    shortDescription: String,
    price: { type: Number, required: true, min: 0 },
    comparePrice: { type: Number, min: 0 },
    images: [{ url: { type: String, required: true }, alt: String }],
    categories: [{ type: Schema.Types.ObjectId, ref: 'Category', index: true }],
    tags: [{ type: String, lowercase: true }],
    stock: { type: Number, required: true, min: 0, default: 0 },
    variants: [
      {
        name: String,
        options: [
          {
            label: String,
            price: Number,
            stock: Number,
          },
        ],
      },
    ],
    isFeatured: { type: Boolean, default: false, index: true },
    isActive: { type: Boolean, default: true, index: true },
    isCustomizable: { type: Boolean, default: false },
    codAvailable: { type: Boolean, default: true },
    customFields: [{ label: String, placeholder: String, required: Boolean }],
    quranOptions: {
      enabled: { type: Boolean, default: false },
      languages: [{ type: String }],
    },
    tasbeehOptions: {
      enabled: { type: Boolean, default: false },
      types: [{ type: String }],
    },
    janamazOptions: {
      enabled: { type: Boolean, default: false },
      shapes: [{ type: String }],
    },
    weight: Number,
    sku: { type: String, sparse: true, index: true },
    metaTitle: String,
    metaDescription: String,
    averageRating: { type: Number, default: 0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0 },
  },
  {
    timestamps: true,
    toJSON: { transform: (_doc, ret) => { delete (ret as Record<string,unknown>).__v; return ret; } },
  }
);

// Text search index
productSchema.index({ name: 'text', description: 'text', tags: 'text' });

export const ProductModel = mongoose.model<IProduct>('Product', productSchema);
