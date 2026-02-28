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
      order: {
        sort_order: 'ASC',
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
 * Get a single category by ID (public)
 * @route GET /api/public/category/:id
 */
export const getPublicCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const categoryRepository = AppDataSource.getRepository(Category);

    const category = await categoryRepository.findOne({
      where: {
        id,
        is_active: true,
      },
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
