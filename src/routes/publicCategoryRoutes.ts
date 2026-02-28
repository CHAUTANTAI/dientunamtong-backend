import { Router } from 'express';
import {
  getPublicCategories,
  getPublicCategory,
  incrementCategoryViewCount,
} from '../controllers/public/publicCategoryController';

const router = Router();

/**
 * @route GET /api/public/category
 * @desc Get all active categories (public, no auth)
 */
router.get('/', getPublicCategories);

/**
 * @route GET /api/public/category/:id
 * @desc Get a single category by ID (public, no auth)
 */
router.get('/:id', getPublicCategory);

/**
 * @route POST /api/public/category/:id/view
 * @desc Increment category view count (public, no auth)
 */
router.post('/:id/view', incrementCategoryViewCount);

export default router;
