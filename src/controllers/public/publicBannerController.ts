import { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '../../config/database';
import { Banner } from '../../entities/Banner';
import { successResponse } from '../../types/responses';

/**
 * Get all active banners (public)
 * @route GET /api/public/banner
 */
export const getPublicBanners = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const bannerRepository = AppDataSource.getRepository(Banner);

    const banners = await bannerRepository.find({
      where: {
        is_active: true,
      },
      relations: ['media'],
      order: {
        sort_order: 'ASC',
      },
    });

    return res.json(
      successResponse(banners, 'Banners retrieved successfully')
    );
  } catch (error) {
    next(error);
  }
};
