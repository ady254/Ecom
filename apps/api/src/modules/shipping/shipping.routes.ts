import { Router } from 'express';
import { SERVICEABLE_STATES } from '@minara/config';
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
// and flag whether we currently deliver there. Backed by the free India Post API;
// on any lookup failure we return serviceable: null so checkout can fall back to
// manual entry instead of blocking the customer.
router.get(
  '/check-pincode/:pincode',
  asyncHandler(async (req, res) => {
    const pincode = String(req.params.pincode);
    if (!/^\d{6}$/.test(pincode)) throw new AppError('Enter a valid 6-digit pincode', 400);

    try {
      const response = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
      const [result] = (await response.json()) as PincodeApiResult[];
      const postOffice = result?.Status === 'Success' ? result.PostOffice?.[0] : null;

      if (!postOffice) {
        res.json({ success: true, data: { pincode, serviceable: null, state: null, city: null } });
        return;
      }

      const serviceable = (SERVICEABLE_STATES as readonly string[]).includes(postOffice.State);
      res.json({
        success: true,
        data: { pincode, serviceable, state: postOffice.State, city: postOffice.District },
      });
    } catch {
      res.json({ success: true, data: { pincode, serviceable: null, state: null, city: null } });
    }
  })
);

export default router;
