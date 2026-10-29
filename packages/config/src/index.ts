// ─── Brand ────────────────────────────────────────────────────────────────────

export const BRAND = {
  name: 'MINARA',
  tagline: 'Luxury Gifting, Reimagined',
  email: 'minaragifting@gmail.com',
  supportEmail: 'minaragifting@gmail.com',
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

// ─── Indian Pincode, State & City Validation ──────────────────────────────────

export const PINCODE_PREFIX_TO_STATE: Record<string, string> = {
  // 1x: Northern Zone
  '11': 'Delhi',
  '12': 'Haryana',
  '13': 'Haryana',
  '14': 'Punjab',
  '15': 'Punjab',
  '16': 'Chandigarh',
  '17': 'Himachal Pradesh',
  '18': 'Jammu & Kashmir',
  '19': 'Jammu & Kashmir',

  // 2x: Northern Zone (UP & Uttarakhand)
  '20': 'Uttar Pradesh',
  '21': 'Uttar Pradesh',
  '22': 'Uttar Pradesh',
  '23': 'Uttar Pradesh',
  '24': 'Uttar Pradesh',
  '25': 'Uttar Pradesh',
  '26': 'Uttar Pradesh',
  '27': 'Uttar Pradesh',
  '28': 'Uttar Pradesh',

  // 3x: Western Zone (Rajasthan & Gujarat)
  '30': 'Rajasthan',
  '31': 'Rajasthan',
  '32': 'Rajasthan',
  '33': 'Rajasthan',
  '34': 'Rajasthan',
  '36': 'Gujarat',
  '37': 'Gujarat',
  '38': 'Gujarat',
  '39': 'Gujarat',

  // 4x: Western Zone (Maharashtra, Goa, MP, Chhattisgarh)
  '40': 'Maharashtra',
  '41': 'Maharashtra',
  '42': 'Maharashtra',
  '43': 'Maharashtra',
  '44': 'Maharashtra',
  '45': 'Madhya Pradesh',
  '46': 'Madhya Pradesh',
  '47': 'Madhya Pradesh',
  '48': 'Madhya Pradesh',
  '49': 'Chhattisgarh',

  // 5x: Southern Zone (Andhra Pradesh, Telangana, Karnataka)
  '50': 'Telangana',
  '51': 'Andhra Pradesh',
  '52': 'Andhra Pradesh',
  '53': 'Andhra Pradesh',
  '56': 'Karnataka',
  '57': 'Karnataka',
  '58': 'Karnataka',
  '59': 'Karnataka',

  // 6x: Southern Zone (Tamil Nadu, Kerala)
  '60': 'Tamil Nadu',
  '61': 'Tamil Nadu',
  '62': 'Tamil Nadu',
  '63': 'Tamil Nadu',
  '64': 'Tamil Nadu',
  '67': 'Kerala',
  '68': 'Kerala',
  '69': 'Kerala',

  // 7x: Eastern Zone (West Bengal, Odisha, North East)
  '70': 'West Bengal',
  '71': 'West Bengal',
  '72': 'West Bengal',
  '73': 'West Bengal',
  '74': 'West Bengal',
  '75': 'Odisha',
  '76': 'Odisha',
  '77': 'Odisha',
  '78': 'Assam',
  '79': 'North East',

  // 8x: Eastern Zone (Bihar, Jharkhand)
  '80': 'Bihar',
  '81': 'Jharkhand',
  '82': 'Jharkhand',
  '83': 'Jharkhand',
  '84': 'Bihar',
  '85': 'Bihar',
};

export const PINCODE_3DIGIT_EXCEPTIONS: Record<string, string> = {
  '194': 'Ladakh',
  '246': 'Uttarakhand',
  '248': 'Uttarakhand',
  '249': 'Uttarakhand',
  '262': 'Uttarakhand',
  '263': 'Uttarakhand',
  '403': 'Goa',
  '605': 'Puducherry',
  '744': 'Andaman and Nicobar Islands',
};

// Major cities uniquely associated with a specific state (for cross-state mismatch detection)
export const MAJOR_CITY_TO_STATE: Record<string, string> = {
  'delhi': 'Delhi',
  'new delhi': 'Delhi',
  'mumbai': 'Maharashtra',
  'bombay': 'Maharashtra',
  'pune': 'Maharashtra',
  'nagpur': 'Maharashtra',
  'thane': 'Maharashtra',
  'nashik': 'Maharashtra',
  'navi mumbai': 'Maharashtra',
  'aurangabad': 'Maharashtra',
  'solapur': 'Maharashtra',
  'kolhapur': 'Maharashtra',
  'bengaluru': 'Karnataka',
  'bangalore': 'Karnataka',
  'mysuru': 'Karnataka',
  'mysore': 'Karnataka',
  'hubballi': 'Karnataka',
  'mangaluru': 'Karnataka',
  'mangalore': 'Karnataka',
  'chennai': 'Tamil Nadu',
  'madras': 'Tamil Nadu',
  'coimbatore': 'Tamil Nadu',
  'madurai': 'Tamil Nadu',
  'salem': 'Tamil Nadu',
  'hyderabad': 'Telangana',
  'secunderabad': 'Telangana',
  'warangal': 'Telangana',
  'visakhapatnam': 'Andhra Pradesh',
  'vizag': 'Andhra Pradesh',
  'vijayawada': 'Andhra Pradesh',
  'guntur': 'Andhra Pradesh',
  'ludhiana': 'Punjab',
  'amritsar': 'Punjab',
  'jalandhar': 'Punjab',
  'patiala': 'Punjab',
  'bathinda': 'Punjab',
  'srinagar': 'Jammu & Kashmir',
  'jammu': 'Jammu & Kashmir',
  'lucknow': 'Uttar Pradesh',
  'kanpur': 'Uttar Pradesh',
  'varanasi': 'Uttar Pradesh',
  'banaras': 'Uttar Pradesh',
  'agra': 'Uttar Pradesh',
  'noida': 'Uttar Pradesh',
  'greater noida': 'Uttar Pradesh',
  'ghaziabad': 'Uttar Pradesh',
  'meerut': 'Uttar Pradesh',
  'kolkata': 'West Bengal',
  'calcutta': 'West Bengal',
  'howrah': 'West Bengal',
  'jaipur': 'Rajasthan',
  'jodhpur': 'Rajasthan',
  'udaipur': 'Rajasthan',
  'ahmedabad': 'Gujarat',
  'surat': 'Gujarat',
  'vadodara': 'Gujarat',
  'baroda': 'Gujarat',
  'bhopal': 'Madhya Pradesh',
  'indore': 'Madhya Pradesh',
  'patna': 'Bihar',
  'ranchi': 'Jharkhand',
  'bhubaneswar': 'Odisha',
  'guwahati': 'Assam',
  'dehradun': 'Uttarakhand',
  'chandigarh': 'Chandigarh',
};

export function normalizeStateName(state: string): string {
  const s = state
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/\b(nct|national capital territory|state|ut|union territory)\b/g, '')
    .replace(/[^a-z0-9]/g, '')
    .trim();
  if (s === 'newdelhi') return 'delhi';
  if (s === 'orissa') return 'odisha';
  if (s === 'uttaranchal') return 'uttarakhand';
  if (s === 'pondicherry') return 'puducherry';
  return s;
}

export function getStateFromPincode(pincode: string): string | null {
  if (!/^\d{6}$/.test(pincode)) return null;
  const p3 = pincode.slice(0, 3);
  if (PINCODE_3DIGIT_EXCEPTIONS[p3]) return PINCODE_3DIGIT_EXCEPTIONS[p3];
  const p2 = pincode.slice(0, 2);
  return PINCODE_PREFIX_TO_STATE[p2] || null;
}

export function isPincodeInState(pincode: string, state: string): boolean {
  if (!/^\d{6}$/.test(pincode) || !state) return false;
  const expected = getStateFromPincode(pincode);
  if (!expected) return false;

  const normInput = normalizeStateName(state);
  const normExpected = normalizeStateName(expected);

  if (normInput === normExpected) return true;

  // Shared / border postal zones
  const p2 = pincode.slice(0, 2);
  const p3 = pincode.slice(0, 3);

  // Chandigarh tricity (16) serves Chandigarh, Mohali (Punjab), Panchkula (Haryana)
  if (p2 === '16' && ['chandigarh', 'punjab', 'haryana'].includes(normInput)) return true;

  // Western UP / Uttarakhand shared 24 and 26 prefixes
  if ((p2 === '24' || p2 === '26') && ['uttarpradesh', 'uttarakhand'].includes(normInput)) return true;

  // Puducherry enclave in Tamil Nadu (605)
  if (p3 === '605' && ['puducherry', 'tamilnadu'].includes(normInput)) return true;

  // J&K / Ladakh (18, 19)
  if ((p2 === '18' || p2 === '19') && ['jammuandkashmir', 'ladakh'].includes(normInput)) return true;

  return false;
}

export function isPincodeServiceable(pincode: string): boolean {
  if (!/^\d{6}$/.test(pincode)) return false;
  // Goa (403) starts with 40 but is NOT in SERVICEABLE_STATES
  if (pincode.startsWith('403')) return false;
  // Puducherry (605) is NOT in SERVICEABLE_STATES
  if (pincode.startsWith('605')) return false;
  // Ladakh (194) is NOT in SERVICEABLE_STATES
  if (pincode.startsWith('194')) return false;
  // Uttarakhand (246, 248, 249, 262, 263) is NOT in SERVICEABLE_STATES
  if (['246', '248', '249', '262', '263'].some((prefix) => pincode.startsWith(prefix))) return false;

  const expected = getStateFromPincode(pincode);
  if (!expected) return false;

  const normExpected = normalizeStateName(expected);
  return (SERVICEABLE_STATES as readonly string[]).some(
    (s) => normalizeStateName(s) === normExpected
  );
}

export function isCityValidForState(city: string, state: string): boolean {
  if (!city || !state) return true;
  const cleanCity = city.trim().toLowerCase();
  const normState = normalizeStateName(state);

  // Check against known major city list
  for (const [keyCity, homeState] of Object.entries(MAJOR_CITY_TO_STATE)) {
    if (cleanCity === keyCity || cleanCity.startsWith(`${keyCity} `) || cleanCity.endsWith(` ${keyCity}`)) {
      const normHome = normalizeStateName(homeState);
      // Chandigarh can be addressed in Punjab/Haryana/Chandigarh
      if (keyCity === 'chandigarh' && ['chandigarh', 'punjab', 'haryana'].includes(normState)) {
        return true;
      }
      if (normHome !== normState) {
        return false;
      }
    }
  }

  return true;
}

export interface AddressConsistencyResult {
  valid: boolean;
  error?: string;
  expectedState?: string;
}

export function validateAddressConsistency(address: {
  city: string;
  state: string;
  pincode: string;
}): AddressConsistencyResult {
  const pincode = address.pincode?.trim() || '';
  const state = address.state?.trim() || '';
  const city = address.city?.trim() || '';

  if (!/^\d{6}$/.test(pincode)) {
    return { valid: false, error: 'Enter a valid 6-digit pincode' };
  }

  const expectedState = getStateFromPincode(pincode);
  if (!expectedState) {
    return { valid: false, error: 'Please enter a valid Indian pincode' };
  }

  if (!state) {
    return { valid: false, error: 'State is required' };
  }

  if (!isPincodeInState(pincode, state)) {
    return {
      valid: false,
      error: `Pincode ${pincode} belongs to ${expectedState}, not ${state}`,
      expectedState,
    };
  }

  const normState = normalizeStateName(state);
  const isStateServiceable = (SERVICEABLE_STATES as readonly string[]).some(
    (s) => normalizeStateName(s) === normState
  );

  if (!isStateServiceable || !isPincodeServiceable(pincode)) {
    return {
      valid: false,
      error: `Sorry, we don't currently deliver to ${state} (pincode ${pincode})`,
      expectedState,
    };
  }

  if (!city) {
    return { valid: false, error: 'City is required' };
  }

  if (!isCityValidForState(city, state)) {
    return {
      valid: false,
      error: `City "${city}" does not match state ${state}`,
      expectedState,
    };
  }

  return { valid: true };
}

// ─── API Constants ────────────────────────────────────────────────────────────

declare const process:
  | {
      env: {
        NEXT_PUBLIC_API_URL?: string;
      };
    }
  | undefined;

export const API_BASE_URL =
  (typeof process !== 'undefined' ? process?.env?.NEXT_PUBLIC_API_URL : undefined) ||
  'http://localhost:5000/api/v1';

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
