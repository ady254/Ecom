import mongoose, { Document, Schema } from 'mongoose';

export interface ISettings extends Document {
  storeName: string;
  storeEmail: string;
  storePhone: string;
  storeAddress: string;
  currency: string;
  currencySymbol: string;
  freeShippingThreshold: number;
  standardShippingCharge: number;
  taxRate: number;
  instagramUrl: string;
  facebookUrl: string;
  whatsappNumber: string;
  metaTitle: string;
  metaDescription: string;
  maintenanceMode: boolean;
  orderEmailNotifications: boolean;
}

const settingsSchema = new Schema<ISettings>(
  {
    storeName: {
      type: String,
      default: 'MINARA',
      trim: true,
    },
    storeEmail: {
      type: String,
      default: '',
      trim: true,
      lowercase: true,
    },
    storePhone: {
      type: String,
      default: '',
      trim: true,
    },
    storeAddress: {
      type: String,
      default: '',
      trim: true,
    },
    currency: {
      type: String,
      default: 'INR',
      trim: true,
    },
    currencySymbol: {
      type: String,
      default: '₹',
      trim: true,
    },
    freeShippingThreshold: {
      type: Number,
      default: 999,
      min: 0,
    },
    standardShippingCharge: {
      type: Number,
      default: 99,
      min: 0,
    },
    taxRate: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    instagramUrl: {
      type: String,
      default: '',
      trim: true,
    },
    facebookUrl: {
      type: String,
      default: '',
      trim: true,
    },
    whatsappNumber: {
      type: String,
      default: '',
      trim: true,
    },
    metaTitle: {
      type: String,
      default: '',
      trim: true,
    },
    metaDescription: {
      type: String,
      default: '',
      trim: true,
    },
    maintenanceMode: {
      type: Boolean,
      default: false,
    },
    orderEmailNotifications: {
      type: Boolean,
      default: true,
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

export const SettingsModel = mongoose.model<ISettings>('Settings', settingsSchema);
