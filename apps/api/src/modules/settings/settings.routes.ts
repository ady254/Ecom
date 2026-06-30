import { Router } from 'express';
import { SettingsModel } from './settings.model.js';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { requireAdmin } from '../../middlewares/admin.middleware.js';
import { asyncHandler } from '../../utils/asyncHandler.js';

const router = Router();

// ─── Public Routes ────────────────────────────────────────────────────────────

// GET /api/v1/settings — Get store settings (public-safe fields only)
router.get(
  '/',
  asyncHandler(async (_req, res) => {
    let settings = await SettingsModel.findOne().select(
      'storeName storeEmail storePhone storeAddress currency currencySymbol ' +
        'freeShippingThreshold standardShippingCharge taxRate ' +
        'instagramUrl facebookUrl whatsappNumber ' +
        'metaTitle metaDescription maintenanceMode'
    );

    // If no settings document exists yet, return defaults by creating one
    if (!settings) {
      settings = await SettingsModel.create({});
    }

    res.json({ success: true, message: 'Settings fetched', data: { settings } });
  })
);

// ─── Admin Routes ─────────────────────────────────────────────────────────────

// PUT /api/v1/settings — Admin: upsert settings
router.put(
  '/',
  authenticate,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const settings = await SettingsModel.findOneAndUpdate(
      {},
      { $set: req.body },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    );

    res.json({ success: true, message: 'Settings updated', data: { settings } });
  })
);

export default router;
