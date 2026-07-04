import mongoose, { Document, Schema } from 'mongoose';

export type OrderStatusType =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'packed'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded';

export interface IOrder extends Document {
  orderId: string;
  user?: mongoose.Types.ObjectId;
  guestInfo?: { name: string; email: string; phone: string };
  items: Array<{
    product: mongoose.Types.ObjectId;
    name: string;
    image: string;
    price: number;
    quantity: number;
    variant?: Record<string, string>;
  }>;
  shippingAddress: {
    fullName: string;
    phone: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
  };
  subtotal: number;
  shippingCharge: number;
  discount: number;
  total: number;
  couponCode?: string;
  giftMessage?: string;
  paymentMethod: 'razorpay' | 'cod';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  awbNumber?: string;
  status: OrderStatusType;
  timeline: Array<{
    status: OrderStatusType;
    message: string;
    timestamp: Date;
  }>;
  expectedDelivery?: Date;
}

const orderSchema = new Schema<IOrder>(
  {
    orderId: { type: String, required: true, unique: true, index: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    guestInfo: {
      name: String,
      email: String,
      phone: String,
    },
    items: [
      {
        product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
        name: { type: String, required: true },
        image: String,
        price: { type: Number, required: true },
        quantity: { type: Number, required: true, min: 1 },
        variant: { type: Map, of: String },
      },
    ],
    shippingAddress: {
      fullName: String,
      phone: String,
      addressLine1: String,
      addressLine2: String,
      city: String,
      state: String,
      pincode: String,
      country: { type: String, default: 'India' },
    },
    subtotal: { type: Number, required: true },
    shippingCharge: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    total: { type: Number, required: true },
    couponCode: String,
    giftMessage: { type: String, trim: true, maxlength: 300 },
    paymentMethod: {
      type: String,
      enum: ['razorpay', 'cod'],
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending',
    },
    razorpayOrderId: { type: String, index: true },
    // unique+sparse: one captured payment can never be attached to two orders
    razorpayPaymentId: { type: String, unique: true, sparse: true },
    awbNumber: String,
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'processing', 'packed', 'shipped', 'delivered', 'cancelled', 'refunded'],
      default: 'pending',
      index: true,
    },
    timeline: [
      {
        status: String,
        message: String,
        timestamp: { type: Date, default: Date.now },
      },
    ],
    expectedDelivery: Date,
  },
  {
    timestamps: true,
    toJSON: { transform: (_doc, ret) => { delete (ret as Record<string,unknown>).__v; return ret; } },
  }
);

// For the stale-unpaid-order sweeper
orderSchema.index({ paymentMethod: 1, paymentStatus: 1, status: 1, createdAt: 1 });

export const OrderModel = mongoose.model<IOrder>('Order', orderSchema);
