import { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '../../config/database';
import { Product } from '../../entities/Product';
import { successResponse, NotFoundError } from '../../types/responses';

/**
 * Get all active products (public)
 * @route GET /api/public/product
 */
export const getPublicProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const productRepository = AppDataSource.getRepository(Product);

    const products = await productRepository.find({
      where: {
        is_active: true,
      },
      relations: ['media', 'categories'],
      order: {
        view_count: 'DESC',   // Sort by view_count descending
        created_at: 'DESC',   // Then by created_at
      },
    });

    return res.json(
      successResponse(
        { products, total: products.length },
        'Products retrieved successfully'
      )
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Get a single product by ID (public)
 * @route GET /api/public/product/:id
 */
export const getPublicProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const productRepository = AppDataSource.getRepository(Product);

    const product = await productRepository.findOne({
      where: {
        id,
        is_active: true,
      },
      relations: ['media', 'categories'],
    });

    if (!product) {
      throw new NotFoundError('Product not found');
    }

    return res.json(
      successResponse(product, 'Product retrieved successfully')
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Increment product view count (public)
 * @route POST /api/public/product/:id/view
 */
export const incrementProductViewCount = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const productRepository = AppDataSource.getRepository(Product);

    const product = await productRepository.findOne({
      where: { id, is_active: true },
    });

    if (!product) {
      throw new NotFoundError('Product not found');
    }

    // Increment view count
    await productRepository.increment({ id }, 'view_count', 1);

    return res.json(
      successResponse({ view_count: product.view_count + 1 }, 'View count updated')
    );
  } catch (error) {
    next(error);
  }
};
