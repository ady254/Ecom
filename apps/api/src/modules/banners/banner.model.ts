import mongoose, { Document, Schema } from 'mongoose';

export interface IBanner extends Document {
  title: string;
  subtitle?: string;
  buttonText?: string;
  buttonLink?: string;
  image?: string;
  bgColor?: string;
  position: 'hero' | 'mid' | 'bottom';
  isActive: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const bannerSchema = new Schema<IBanner>(
  {
    title: {
      type: String,
      trim: true,
      default: '',
    },
    subtitle: {
      type: String,
      trim: true,
    },
    buttonText: {
      type: String,
      trim: true,
    },
    buttonLink: {
      type: String,
      trim: true,
    },
    image: String,
    bgColor: {
      type: String,
      trim: true,
    },
    position: {
      type: String,
      enum: ['hero', 'mid', 'bottom'],
      default: 'hero',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret) => {
        delete (ret as Record<string, unknown>).__v;
        return ret;
      },
    },
  }
);

export const BannerModel = mongoose.model<IBanner>('Banner', bannerSchema);
