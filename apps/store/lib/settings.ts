const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

export interface StoreSettings {
  storeName: string;
  storeEmail: string;
  storePhone: string;
  /** Phone formatted for tel: links (digits with country code) */
  storePhoneTel: string;
  storeAddress: string;
  /** WhatsApp number as digits only, ready for wa.me links */
  whatsappNumber: string;
  instagramUrl: string;
}

// Used when the API is unreachable (e.g. during build) or a field is blank in admin
const DEFAULTS: StoreSettings = {
  storeName: 'MINARA',
  storeEmail: 'support@minara.in',
  storePhone: '+91 88733 55385',
  storePhoneTel: '+918873355385',
  storeAddress: 'Bahadurpura, Hyderabad, Telangana – 500064, India',
  whatsappNumber: '918873355385',
  instagramUrl: 'https://instagram.com/minaraofficial',
};

/**
 * Store settings as configured in the admin panel (Settings page).
 * Cached for 60 seconds, so admin edits go live within a minute.
 * Every field falls back to a sensible default if left blank.
 */
export async function getStoreSettings(): Promise<StoreSettings> {
  try {
    const res = await fetch(`${API_URL}/settings`, { next: { revalidate: 60 } });
    if (!res.ok) return DEFAULTS;
    const json = await res.json();
    const s = json.data?.settings ?? {};

    const phone: string = s.storePhone?.trim() || DEFAULTS.storePhone;
    const phoneDigits = phone.replace(/\D/g, '');
    const whatsappDigits = (s.whatsappNumber?.trim() || DEFAULTS.whatsappNumber).replace(/\D/g, '');

    return {
      storeName: s.storeName?.trim() || DEFAULTS.storeName,
      storeEmail: s.storeEmail?.trim() || DEFAULTS.storeEmail,
      storePhone: phone,
      // Assume India (+91) when the admin enters a bare 10-digit number
      storePhoneTel: phoneDigits.length === 10 ? `+91${phoneDigits}` : `+${phoneDigits}`,
      storeAddress: s.storeAddress?.trim() || DEFAULTS.storeAddress,
      whatsappNumber: whatsappDigits.length === 10 ? `91${whatsappDigits}` : whatsappDigits,
      instagramUrl: s.instagramUrl?.trim() || DEFAULTS.instagramUrl,
    };
  } catch {
    return DEFAULTS;
  }
}
