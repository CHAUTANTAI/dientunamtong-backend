import { Router } from 'express';
import {
  getPublicProducts,
  getPublicProduct,
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

export default router;
