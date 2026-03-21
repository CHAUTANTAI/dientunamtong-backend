import { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '../../config/database';
import { Category } from '../../entities/Category';
import { successResponse, NotFoundError } from '../../types/responses';

/**
 * Get all active categories (public)
 * @route GET /api/public/category
 */
export const getPublicCategories = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const categoryRepository = AppDataSource.getRepository(Category);

    const categories = await categoryRepository.find({
      where: {
        is_active: true,
      },
      relations: ['media'], // Load media relation
      order: {
        view_count: 'DESC', // Sort by view_count descending
        sort_order: 'ASC',  // Then by sort_order
      },
    });

    return res.json(
      successResponse(categories, 'Categories retrieved successfully')
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Get a single category by slug (public)
 * @route GET /api/public/category/:slug
 */
export const getPublicCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id: slug } = req.params; // 'id' param is actually the slug
    const categoryRepository = AppDataSource.getRepository(Category);

    const category = await categoryRepository.findOne({
      where: {
        slug,
        is_active: true,
      },
      relations: ['media'], // Load media relation
    });

    if (!category) {
      throw new NotFoundError('Category not found');
    }

    return res.json(
      successResponse(category, 'Category retrieved successfully')
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Increment category view count (public)
 * @route POST /api/public/category/:slug/view
 */
export const incrementCategoryViewCount = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id: slug } = req.params; // 'id' param is actually the slug
    const categoryRepository = AppDataSource.getRepository(Category);

    const category = await categoryRepository.findOne({
      where: { slug, is_active: true },
    });

    if (!category) {
      throw new NotFoundError('Category not found');
    }

    // Increment view count
    await categoryRepository.increment({ id: category.id }, 'view_count', 1);

    return res.json(
      successResponse({ view_count: category.view_count + 1 }, 'View count updated')
    );
  } catch (error) {
    next(error);
  }
};
