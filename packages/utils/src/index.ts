// ─── Currency ─────────────────────────────────────────────────────────────────

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

// ─── Slugify ──────────────────────────────────────────────────────────────────

export const slugify = (text: string): string => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
};

// ─── Order ID Generator ───────────────────────────────────────────────────────

export const generateOrderId = (): string => {
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 100000)
    .toString()
    .padStart(5, '0');
  return `MIN-${year}-${random}`;
};

// ─── Delivery Date Calculator ─────────────────────────────────────────────────

export const calculateEstimatedDelivery = (
  processingDays = 1,
  transitDays = 4
): { from: Date; to: Date } => {
  const now = new Date();
  const from = new Date(now);
  from.setDate(from.getDate() + processingDays + 2);
  // skip weekends
  while (from.getDay() === 0 || from.getDay() === 6) {
    from.setDate(from.getDate() + 1);
  }
  const to = new Date(from);
  to.setDate(to.getDate() + transitDays);
  while (to.getDay() === 0 || to.getDay() === 6) {
    to.setDate(to.getDate() + 1);
  }
  return { from, to };
};

export const formatDeliveryDate = (date: Date): string => {
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    weekday: 'short',
  });
};

// ─── Discount Calculator ──────────────────────────────────────────────────────

export const calculateDiscount = (
  price: number,
  comparePrice?: number
): number => {
  if (!comparePrice || comparePrice <= price) return 0;
  return Math.round(((comparePrice - price) / comparePrice) * 100);
};

// ─── Truncate Text ────────────────────────────────────────────────────────────

export const truncate = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trimEnd() + '…';
};

// ─── Class Names ──────────────────────────────────────────────────────────────

export const cn = (...classes: (string | undefined | null | false)[]): string => {
  return classes.filter(Boolean).join(' ');
};

// ─── Pagination ───────────────────────────────────────────────────────────────

export const getPaginationMeta = (total: number, page: number, limit: number) => {
  const totalPages = Math.ceil(total / limit);
  return {
    page,
    limit,
    total,
    totalPages,
    hasPrevPage: page > 1,
    hasNextPage: page < totalPages,
  };
};

// ─── API Response Helpers ─────────────────────────────────────────────────────

export const apiSuccess = <T>(message: string, data?: T, pagination?: object) => ({
  success: true,
  message,
  data,
  pagination,
});

export const apiError = (message: string, error?: string) => ({
  success: false,
  message,
  error,
});

// ─── Date Formatters ──────────────────────────────────────────────────────────

export const formatDate = (date: string | Date): string => {
  return new Date(date).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

export const formatDateTime = (date: string | Date): string => {
  return new Date(date).toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// ─── Phone Formatter ──────────────────────────────────────────────────────────

export const formatPhone = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `+91 ${cleaned.slice(0, 5)} ${cleaned.slice(5)}`;
  }
  return phone;
};
