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
  if (!res.ok) throw new Error(`API error ${res.status}`);
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
  if (!res.ok) throw new Error(`API error ${res.status}`);
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
  date: string;
  revenue: number;
}

export interface RecentOrder {
  orderId: string;
  user?: { name: string; email: string };
  guestInfo?: { name: string; email: string };
  total: number;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  createdAt: string;
}

export const dashboardApi = {
  getStats: () => adminFetch<{ success: boolean; data: DashboardStats }>('/dashboard/stats'),
  getRevenue: (days = 7) => adminFetch<{ success: boolean; data: RevenuePoint[] }>(`/dashboard/revenue?days=${days}`),
  getRecentOrders: () => adminFetch<{ success: boolean; data: RecentOrder[] }>('/dashboard/recent-orders'),
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

export const ordersApi = {
  getAll: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return adminFetch<{ success: boolean; data: { orders: Order[]; total: number } }>(`/orders${qs}`);
  },
  updateStatus: (orderId: string, status: string) =>
    adminPatch<{ success: boolean }>(`/orders/${orderId}/status`, { status }),
  enterAWB: (orderId: string, awbNumber: string) =>
    adminPatch<{ success: boolean }>(`/orders/${orderId}/awb`, { awbNumber }),
};

// ─── Products ─────────────────────────────────────────────────────────────────

export const productsAdminApi = {
  getAll: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return adminFetch<{ success: boolean; data: { products: unknown[]; total: number } }>(`/products${qs}`);
  },
};
