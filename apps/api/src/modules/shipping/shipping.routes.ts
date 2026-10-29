import { Router } from 'express';
import {
  SERVICEABLE_STATES,
  getStateFromPincode,
  isPincodeServiceable,
  normalizeStateName,
} from '@minara/config';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { AppError } from '../../utils/AppError.js';

const router = Router();

interface PostOffice {
  Name: string;
  District: string;
  State: string;
}

interface PincodeApiResult {
  Status: string;
  PostOffice: PostOffice[] | null;
}

// GET /api/v1/shipping/check-pincode/:pincode — Resolve city/state for a pincode
// and flag whether we currently deliver there. Backed by India Post API with
// deterministic offline fallback to guarantee quick and accurate validation.
router.get(
  '/check-pincode/:pincode',
  asyncHandler(async (req, res) => {
    const pincode = String(req.params.pincode);
    if (!/^\d{6}$/.test(pincode)) throw new AppError('Enter a valid 6-digit pincode', 400);

    const offlineState = getStateFromPincode(pincode);
    const offlineServiceable = isPincodeServiceable(pincode);

    try {
      const response = await fetch(`https://api.postalpincode.in/pincode/${pincode}`, {
        signal: AbortSignal.timeout(3500),
      });
      const [result] = (await response.json()) as PincodeApiResult[];
      const postOffice = result?.Status === 'Success' ? result.PostOffice?.[0] : null;

      if (!postOffice) {
        res.json({
          success: true,
          data: {
            pincode,
            serviceable: offlineState ? offlineServiceable : false,
            state: offlineState,
            city: null,
          },
        });
        return;
      }

      const resolvedState = postOffice.State || offlineState || '';
      const normResolved = normalizeStateName(resolvedState);
      const isServiceableState = (SERVICEABLE_STATES as readonly string[]).some(
        (s) => normalizeStateName(s) === normResolved
      );
      const serviceable = isServiceableState && isPincodeServiceable(pincode);

      res.json({
        success: true,
        data: {
          pincode,
          serviceable,
          state: resolvedState,
          city: postOffice.District || postOffice.Name,
        },
      });
    } catch {
      // Offline fallback: resolve immediately using deterministic postal zone rules
      res.json({
        success: true,
        data: {
          pincode,
          serviceable: offlineState ? offlineServiceable : false,
          state: offlineState,
          city: null,
        },
      });
    }
  })
);

export default router;
