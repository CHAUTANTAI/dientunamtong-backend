import { Router } from 'express';
import { getPublicBanners } from '../controllers/public/publicBannerController';

const router = Router();

/**
 * @route GET /api/public/banner
 * @desc Get all active banners (public, no auth)
 */
router.get('/', getPublicBanners);

export default router;
