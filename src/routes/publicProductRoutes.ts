import { Router } from 'express';
import {
  getPublicProducts,
  getPublicProduct,
  incrementProductViewCount,
} from '../controllers/public/publicProductController';

const router = Router();

/**
 * @route GET /api/public/product
 * @desc Get all active products (public, no auth)
 */
router.get('/', getPublicProducts);

/**
 * @route GET /api/public/product/:id
 * @desc Get a single product by ID (public, no auth)
 */
router.get('/:id', getPublicProduct);

/**
 * @route POST /api/public/product/:id/view
 * @desc Increment product view count (public, no auth)
 */
router.post('/:id/view', incrementProductViewCount);

export default router;
