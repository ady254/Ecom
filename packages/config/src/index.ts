// ─── Brand ────────────────────────────────────────────────────────────────────

export const BRAND = {
  name: 'MINARA',
  tagline: 'Luxury Gifting, Reimagined',
  email: 'hello@minara.in',
  supportEmail: 'support@minara.in',
  phone: '+91 88733 55385',
  whatsapp: '918873355385',
  address: {
    line1: 'Bahadurpura',
    city: 'Hyderabad',
    state: 'Telangana',
    pincode: '500064',
    country: 'India',
  },
  instagram: 'https://instagram.com/minaraofficial',
  colors: {
    navy: '#0B2342',
    gold: '#CFA96A',
    white: '#FFFFFF',
    lightGold: '#E8D5AA',
    darkNavy: '#071830',
  },
  fonts: {
    heading: 'Cormorant Garamond',
    body: 'Inter',
  },
} as const;

// ─── Order Constants ──────────────────────────────────────────────────────────

export const ORDER_STATUSES = [
  'pending',
  'confirmed',
  'processing',
  'packed',
  'shipped',
  'delivered',
  'cancelled',
  'refunded',
] as const;

export const ORDER_STATUS_LABELS: Record<string, string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  processing: 'Processing',
  packed: 'Packed',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
  refunded: 'Refunded',
};

export const ORDER_STATUS_COLORS: Record<string, string> = {
  pending: 'yellow',
  confirmed: 'blue',
  processing: 'purple',
  packed: 'indigo',
  shipped: 'cyan',
  delivered: 'green',
  cancelled: 'red',
  refunded: 'orange',
};

// ─── Payment Constants ────────────────────────────────────────────────────────

export const PAYMENT_METHODS = ['razorpay', 'cod'] as const;

export const PAYMENT_METHOD_LABELS: Record<string, string> = {
  razorpay: 'Online Payment',
  cod: 'Cash on Delivery',
};

// ─── Shipping Constants ───────────────────────────────────────────────────────

export const SHIPPING = {
  freeShippingThreshold: 999,
  standardShippingCharge: 99,
  estimatedDays: { min: 2, max: 5 },
  processingDays: 1,
} as const;

// States we currently deliver to. Checked server-side at order creation and
// used client-side to warn the customer before checkout.
export const SERVICEABLE_STATES = [
  'Maharashtra',
  'Karnataka',
  'Tamil Nadu',
  'Punjab',
  'Jammu & Kashmir',
  'Telangana',
  'Uttar Pradesh',
  'Andhra Pradesh',
] as const;

// ─── API Constants ────────────────────────────────────────────────────────────

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

export const DEFAULT_PAGE_SIZE = 12;
export const MAX_PAGE_SIZE = 48;

// ─── Cloudinary ───────────────────────────────────────────────────────────────

export const CLOUDINARY_FOLDERS = {
  products: 'minara/products',
  categories: 'minara/categories',
  banners: 'minara/banners',
  avatars: 'minara/avatars',
} as const;

// ─── Coupon Limits ────────────────────────────────────────────────────────────

export const MAX_DISCOUNT_PERCENTAGE = 80;

// ─── Review Constants ─────────────────────────────────────────────────────────

export const MIN_REVIEW_RATING = 1;
export const MAX_REVIEW_RATING = 5;
