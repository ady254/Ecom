const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('adminToken');
}

async function adminFetch<T>(path: string): Promise<T> {
  const token = getToken();
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    credentials: 'include',
  });
  if (res.status === 401) {
    if (typeof window !== 'undefined') window.location.href = '/login';
    throw new Error('Unauthorized');
  }
  if (!res.ok) throw new Error(`API error ${res.status}`);
  return res.json() as Promise<T>;
}

async function adminPost<T>(path: string, body: unknown): Promise<T> {
  const token = getToken();
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    credentials: 'include',
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const json = await res.json().catch(() => ({}));
    throw new Error((json as { message?: string }).message || `API error ${res.status}`);
  }
  return res.json() as Promise<T>;
}

async function adminDelete<T>(path: string): Promise<T> {
  const token = getToken();
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    credentials: 'include',
  });
  if (!res.ok) {
    const json = await res.json().catch(() => ({}));
    throw new Error((json as { message?: string }).message || `API error ${res.status}`);
  }
  return res.json() as Promise<T>;
}

async function adminPut<T>(path: string, body: unknown): Promise<T> {
  const token = getToken();
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    credentials: 'include',
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const json = await res.json().catch(() => ({}));
    throw new Error((json as { message?: string }).message || `API error ${res.status}`);
  }
  return res.json() as Promise<T>;
}

async function adminPatch<T>(path: string, body: unknown): Promise<T> {
  const token = getToken();
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    credentials: 'include',
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const json = await res.json().catch(() => ({}));
    throw new Error((json as { message?: string }).message || `API error ${res.status}`);
  }
  return res.json() as Promise<T>;
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

export interface DashboardStats {
  totalOrders: number;
  ordersToday: number;
  pendingOrders: number;
  totalCustomers: number;
  totalProducts: number;
  monthlyRevenue: number;
  totalRevenue: number;
}

export interface RevenuePoint {
  _id: string;
  revenue: number;
  orders: number;
}

export interface RecentOrder {
  orderId: string;
  user?: { name: string; email: string };
  guestInfo?: { name: string; email: string };
  total: number;
  status: string;
  paymentMethod: string;
  createdAt: string;
}

export const dashboardApi = {
  getStats: () => adminFetch<{ success: boolean; data: DashboardStats }>('/dashboard/stats'),
  getRevenue: (days = 7) => adminFetch<{ success: boolean; data: { revenue: RevenuePoint[] } }>(`/dashboard/revenue?days=${days}`),
  getRecentOrders: () => adminFetch<{ success: boolean; data: { orders: RecentOrder[] } }>('/dashboard/recent-orders'),
};

// ─── Orders ───────────────────────────────────────────────────────────────────

export interface Order {
  _id: string;
  orderId: string;
  user?: { name: string; email: string };
  guestInfo?: { name: string; email: string };
  total: number;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  awbNumber?: string;
  createdAt: string;
}

export interface OrderItem {
  product?: { slug: string };
  name: string;
  image?: string;
  price: number;
  quantity: number;
  variant?: Record<string, string>;
}

export interface OrderDetail extends Order {
  items: OrderItem[];
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
  couponCode?: string;
  giftMessage?: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  expectedDelivery?: string;
  timeline: Array<{ status: string; message: string; timestamp: string }>;
}

export const ordersApi = {
  getAll: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return adminFetch<{ success: boolean; data: { orders: Order[]; total: number } }>(`/orders${qs}`);
  },
  getOne: (orderId: string) =>
    adminFetch<{ success: boolean; data: { order: OrderDetail } }>(`/orders/${orderId}`),
  updateStatus: (orderId: string, status: string) =>
    adminPatch<{ success: boolean; data: { order: OrderDetail } }>(`/orders/${orderId}/status`, { status }),
  enterAWB: (orderId: string, awbNumber: string) =>
    adminPatch<{ success: boolean; data: { order: OrderDetail } }>(`/orders/${orderId}/awb`, { awbNumber }),
};

// ─── Products ─────────────────────────────────────────────────────────────────

export interface AdminProduct {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  shortDescription?: string;
  price: number;
  comparePrice?: number;
  stock: number;
  weight?: number;
  sku?: string;
  isActive: boolean;
  isFeatured: boolean;
  isCustomizable?: boolean;
  codAvailable?: boolean;
  customFields?: Array<{ label: string; placeholder?: string; required?: boolean }>;
  images: { url: string; alt?: string }[];
  category?: { _id: string; name: string };
  categories?: Array<{ _id: string; name: string; slug?: string }>;
  tags: string[];
  ratings?: { averageRating: number; reviewCount: number };
}

export const productsAdminApi = {
  getAll: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return adminFetch<{ success: boolean; data: { products: AdminProduct[] }; pagination: { total: number } }>(`/products/admin/all${qs}`);
  },
  getById: (id: string) =>
    adminFetch<{ success: boolean; data: { product: AdminProduct } }>(`/products/${id}`),
  create: (data: unknown) => adminPost<{ success: boolean; data: { product: AdminProduct } }>('/products', data),
  update: (id: string, data: unknown) => adminPatch<{ success: boolean; data: { product: AdminProduct } }>(`/products/${id}`, data),
  delete: (id: string) => adminDelete<{ success: boolean }>(`/products/${id}`),

  uploadImages: async (files: File[]): Promise<string[]> => {
    const token = getToken();
    const formData = new FormData();
    files.forEach((f) => formData.append('images', f));
    const res = await fetch(`${BASE_URL}/products/upload/images`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      credentials: 'include',
      body: formData,
    });
    if (!res.ok) throw new Error('Image upload failed');
    const json = await res.json();
    return json.data.images as string[];
  },
};

// ─── Categories ───────────────────────────────────────────────────────────────

export interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  order: number;
  isActive: boolean;
  parent?: { _id: string; name: string };
}

export const categoriesAdminApi = {
  getAll: () => adminFetch<{ success: boolean; data: { categories: Category[] } }>('/categories'),
  create: (data: { name: string; description?: string; image?: string; order?: number }) =>
    adminPost<{ success: boolean; data: { category: Category } }>('/categories', data),
  update: (id: string, data: Partial<Category>) =>
    adminPatch<{ success: boolean; data: { category: Category } }>(`/categories/${id}`, data),
  delete: (id: string) =>
    adminDelete<{ success: boolean; message: string }>(`/categories/${id}`),
};

// ─── Customers ────────────────────────────────────────────────────────────────

export interface Customer {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  isActive: boolean;
  createdAt: string;
  addresses: { city: string; state: string }[];
}

export const customersApi = {
  getAll: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return adminFetch<{ success: boolean; data: { users: Customer[] }; pagination: { total: number; totalPages: number } }>(`/users${qs}`);
  },
  toggleStatus: (id: string, isActive: boolean) =>
    adminPatch<{ success: boolean }>(`/users/${id}/status`, { isActive }),
};

// ─── Coupons ──────────────────────────────────────────────────────────────────

export interface Coupon {
  _id: string;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  minOrderAmount: number;
  maxDiscount?: number;
  usageLimit?: number;
  usageCount: number;
  isActive: boolean;
  expiresAt?: string;
  createdAt: string;
}

export const couponsApi = {
  getAll: () => adminFetch<{ success: boolean; data: { coupons: Coupon[] } }>('/coupons'),
  create: (data: unknown) => adminPost<{ success: boolean; data: { coupon: Coupon } }>('/coupons', data),
  update: (id: string, data: unknown) => adminPatch<{ success: boolean; data: { coupon: Coupon } }>(`/coupons/${id}`, data),
  delete: (id: string) => adminDelete<{ success: boolean }>(`/coupons/${id}`),
};

// ─── Reviews ──────────────────────────────────────────────────────────────────

export interface Review {
  _id: string;
  product?: { _id: string; name: string; slug: string };
  user?: { _id: string; name: string; email: string };
  guestName?: string;
  guestEmail?: string;
  rating: number;
  title?: string;
  comment: string;
  isApproved: boolean;
  isVerifiedPurchase: boolean;
  createdAt: string;
}

export const reviewsApi = {
  getAll: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return adminFetch<{ success: boolean; data: { reviews: Review[] }; pagination: { total: number; totalPages: number } }>(`/reviews${qs}`);
  },
  update: (id: string, data: unknown) => adminPatch<{ success: boolean }>(`/reviews/${id}`, data),
  delete: (id: string) => adminDelete<{ success: boolean }>(`/reviews/${id}`),
};

// ─── Banners ──────────────────────────────────────────────────────────────────

export interface Banner {
  _id: string;
  title: string;
  subtitle?: string;
  buttonText?: string;
  buttonLink?: string;
  image?: string;
  bgColor?: string;
  position: 'hero' | 'mid' | 'bottom';
  isActive: boolean;
  order: number;
  createdAt: string;
}

export const bannersApi = {
  getAll: () => adminFetch<{ success: boolean; data: { banners: Banner[] } }>('/banners/admin/all'),
  create: (data: unknown) => adminPost<{ success: boolean; data: { banner: Banner } }>('/banners', data),
  update: (id: string, data: unknown) => adminPatch<{ success: boolean; data: { banner: Banner } }>(`/banners/${id}`, data),
  delete: (id: string) => adminDelete<{ success: boolean }>(`/banners/${id}`),

  uploadImage: async (file: File): Promise<string> => {
    const token = getToken();
    const formData = new FormData();
    formData.append('image', file);
    const res = await fetch(`${BASE_URL}/banners/upload`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      credentials: 'include',
      body: formData,
    });
    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      throw new Error((json as { message?: string }).message || 'Banner image upload failed');
    }
    const json = await res.json();
    return (json as { data: { url: string } }).data.url;
  },
};

// ─── Settings ─────────────────────────────────────────────────────────────────

export interface StoreSettings {
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

export const settingsApi = {
  get: () => adminFetch<{ success: boolean; data: { settings: StoreSettings } }>('/settings'),
  update: (data: unknown) => adminPut<{ success: boolean; data: { settings: StoreSettings } }>('/settings', data),
};

// ─── FAQs ─────────────────────────────────────────────────────────────────────

export interface FAQ {
  _id: string;
  question: string;
  answer: string;
  order: number;
  isActive: boolean;
  createdAt: string;
}

export const faqApi = {
  getAll: () => adminFetch<{ success: boolean; data: { faqs: FAQ[] } }>('/faqs/admin/all'),
  create: (data: { question: string; answer: string; order?: number; isActive?: boolean }) =>
    adminPost<{ success: boolean; data: { faq: FAQ } }>('/faqs', data),
  update: (id: string, data: Partial<FAQ>) =>
    adminPatch<{ success: boolean; data: { faq: FAQ } }>(`/faqs/${id}`, data),
  delete: (id: string) => adminDelete<{ success: boolean }>(`/faqs/${id}`),
};

// ─── Pages ────────────────────────────────────────────────────────────────────

export interface CmsPage {
  _id: string;
  title: string;
  slug: string;
  content: string;
  isPublished: boolean;
  seoTitle?: string;
  seoDescription?: string;
  createdAt: string;
  updatedAt: string;
}

export const pagesApi = {
  getAll: () => adminFetch<{ success: boolean; data: { pages: CmsPage[] } }>('/pages/admin/all'),
  create: (data: unknown) => adminPost<{ success: boolean; data: { page: CmsPage } }>('/pages', data),
  update: (id: string, data: unknown) => adminPatch<{ success: boolean; data: { page: CmsPage } }>(`/pages/${id}`, data),
  delete: (id: string) => adminDelete<{ success: boolean }>(`/pages/${id}`),
};
