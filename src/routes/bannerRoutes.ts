import { Router } from 'express';
import { body, param } from 'express-validator';
import { BannerController } from '../controllers/BannerController';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validation.middleware';
import { UserRole } from '../entities/Profile';

const router = Router();
const bannerController = new BannerController();

// Public routes (for client)
router.get('/public', bannerController.getPublicBanners);

// Protected routes (admin only)
router.get(
  '/',
  authenticate,
  authorize(UserRole.ADMIN),
  bannerController.getAllBanners
);

router.get(
  '/available-sort-orders',
  authenticate,
  authorize(UserRole.ADMIN),
  bannerController.getAvailableSortOrders
);

router.get(
  '/:id',
  authenticate,
  authorize(UserRole.ADMIN),
  validate([param('id').isUUID()]),
  bannerController.getBannerById
);

router.post(
  '/',
  authenticate,
  authorize(UserRole.ADMIN),
  validate([
    body('media_id').isUUID().withMessage('Media ID must be a valid UUID'),
    body('title').optional().isString().isLength({ max: 255 }),
    body('link_url').optional().isString(),
    body('sort_order').optional().isInt({ min: 0, max: 5 }),
    body('is_active').optional().isBoolean(),
  ]),
  bannerController.createBanner
);

router.put(
  '/:id',
  authenticate,
  authorize(UserRole.ADMIN),
  validate([
    param('id').isUUID(),
    body('media_id').optional().isUUID(),
    body('title').optional().isString().isLength({ max: 255 }),
    body('link_url').optional().isString(),
    body('sort_order').optional().isInt({ min: 0, max: 5 }),
    body('is_active').optional().isBoolean(),
  ]),
  bannerController.updateBanner
);

router.delete(
  '/:id',
  authenticate,
  authorize(UserRole.ADMIN),
  validate([param('id').isUUID()]),
  bannerController.deleteBanner
);

export default router;
