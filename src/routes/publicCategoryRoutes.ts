import { Router } from 'express';
import {
  getPublicCategories,
  getPublicCategory,
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

export default router;
