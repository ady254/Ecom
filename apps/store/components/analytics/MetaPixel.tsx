'use client';

import Script from 'next/script';

const META_PIXEL_ID = '1012179617948110';

// ---------------------------------------------------------------------------
// Pixel base script + noscript fallback
// Loaded once in the root layout so every page view is automatically tracked.
// ---------------------------------------------------------------------------
export default function MetaPixel() {
  return (
    <>
      <Script
        id="meta-pixel"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${META_PIXEL_ID}');
            fbq('track', 'PageView');
          `,
        }}
      />
      {/* Noscript fallback — renders a 1x1 tracking pixel when JS is disabled */}
      <noscript>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          height="1"
          width="1"
          style={{ display: 'none' }}
          src={`https://www.facebook.com/tr?id=${META_PIXEL_ID}&ev=PageView&noscript=1`}
          alt=""
        />
      </noscript>
    </>
  );
}

// ---------------------------------------------------------------------------
// fbq() helper — safe to call from any client component.
// Checks that the pixel has been initialised before firing an event.
// ---------------------------------------------------------------------------
declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

export function fbq(eventType: 'track' | 'trackCustom', eventName: string, params?: Record<string, unknown>) {
  if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
    window.fbq(eventType, eventName, params);
  }
}

// ---------------------------------------------------------------------------
// Convenience typed event helpers used across the store
// ---------------------------------------------------------------------------

/** Fire when the user views their cart or starts checkout */
export function trackInitiateCheckout(value: number, currency = 'INR', numItems?: number) {
  fbq('track', 'InitiateCheckout', {
    value,
    currency,
    ...(numItems !== undefined ? { num_items: numItems } : {}),
  });
}

/** Fire once per completed purchase on the order confirmation page */
export function trackPurchase(params: {
  orderId: string;
  value: number;
  currency?: string;
  numItems?: number;
}) {
  fbq('track', 'Purchase', {
    content_type: 'product',
    order_id: params.orderId,
    value: params.value,
    currency: params.currency ?? 'INR',
    ...(params.numItems !== undefined ? { num_items: params.numItems } : {}),
  });
}

/** Fire when a user submits a lead form (contact / newsletter) */
export function trackLead() {
  fbq('track', 'Lead');
}

/** Fire when a user views a product detail page */
export function trackViewContent(params: { contentId: string; contentName: string; value?: number; currency?: string }) {
  fbq('track', 'ViewContent', {
    content_ids: [params.contentId],
    content_name: params.contentName,
    content_type: 'product',
    ...(params.value !== undefined ? { value: params.value, currency: params.currency ?? 'INR' } : {}),
  });
}

/** Fire when a user adds a product to the cart */
export function trackAddToCart(params: { contentId: string; contentName: string; value: number; currency?: string }) {
  fbq('track', 'AddToCart', {
    content_ids: [params.contentId],
    content_name: params.contentName,
    content_type: 'product',
    value: params.value,
    currency: params.currency ?? 'INR',
  });
}
