'use client';

import { useEffect, useState } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

interface CodEligibility {
  /** Names of the given products the admin has switched Cash on Delivery off for. */
  codBlockedBy: string[];
  /** True while every given product still allows COD. */
  codAllowed: boolean;
}

/**
 * Resolve — fresh from the server — whether COD may be offered for a set of
 * products. Read live rather than from the cart on purpose: a cart persists in
 * localStorage for days, so a stored flag would keep offering COD long after
 * the owner switched it off.
 *
 * Fails open if a lookup errors: the server re-checks COD before accepting any
 * order, so the worst case is an offer that gets rejected, not a bad order.
 *
 * Pass an empty list to skip the lookup entirely (e.g. while a drawer is shut).
 */
export function useCodEligibility(productIds: string[]): CodEligibility {
  const [codBlockedBy, setCodBlockedBy] = useState<string[]>([]);

  // Collapse to a primitive so the effect tracks the actual set of products,
  // not the identity of a fresh array on every render.
  const key = [...new Set(productIds)].sort().join(',');

  useEffect(() => {
    if (!key) {
      setCodBlockedBy([]);
      return;
    }
    let cancelled = false;
    Promise.all(
      key.split(',').map((id) =>
        fetch(`${API_URL}/products/${id}`)
          .then((r) => r.json())
          .then((json) => (json?.success ? json.data.product : null))
          .catch(() => null)
      )
    ).then((products: ({ name: string; codAvailable?: boolean } | null)[]) => {
      if (cancelled) return;
      // Products saved before this flag existed report nothing — absence of a
      // restriction means COD is fine, so only an explicit false blocks.
      const blocked = products.filter(
        (p): p is { name: string; codAvailable: false } => p?.codAvailable === false
      );
      setCodBlockedBy(blocked.map((p) => p.name));
    });
    return () => {
      cancelled = true;
    };
  }, [key]);

  return { codBlockedBy, codAllowed: codBlockedBy.length === 0 };
}
