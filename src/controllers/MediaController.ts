import { Request, Response, NextFunction } from "express";
import { MediaService } from "@services/MediaService";
import { CreateMediaDto, UpdateMediaDto, MediaFilterDto } from "@/types/dtos";
import { successResponse } from "@/types/responses";

export class MediaController {
  private mediaService: MediaService;

  constructor() {
    this.mediaService = new MediaService();
  }

  getAllMedia = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const filters: MediaFilterDto = {
        media_type: req.query.media_type as any,
        product_id: req.query.product_id as string,
        is_active: req.query.is_active === "true",
      };

      const media = await this.mediaService.getAllMedia(filters);

      res.json(
        successResponse(media, "Media retrieved successfully", {
          count: media.length,
        })
      );
    } catch (error) {
      next(error);
    }
  };

  getMediaById = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const media = await this.mediaService.getMediaById(id);

      res.json(successResponse(media, "Media retrieved successfully"));
    } catch (error) {
      next(error);
    }
  };

  createMedia = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const createDto: CreateMediaDto = req.body;
      const media = await this.mediaService.createMedia(createDto);

      res.status(201).json(successResponse(media, "Media created successfully"));
    } catch (error) {
      next(error);
    }
  };

  createMultipleMedia = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const createDtos: CreateMediaDto[] = req.body.media;

      if (!Array.isArray(createDtos)) {
        res.status(400).json({
          success: false,
          message: "Invalid request body. Expected an array of media items.",
        });
        return;
      }

      const media = await this.mediaService.createMultipleMedia(createDtos);

      res
        .status(201)
        .json(
          successResponse(media, "Multiple media created successfully", {
            count: media.length,
          })
        );
    } catch (error) {
      next(error);
    }
  };

  updateMedia = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const updateDto: UpdateMediaDto = req.body;

      const media = await this.mediaService.updateMedia(id, updateDto);

      res.json(successResponse(media, "Media updated successfully"));
    } catch (error) {
      next(error);
    }
  };

  updateSortOrder = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const { sort_order } = req.body;

      const media = await this.mediaService.updateSortOrder(id, sort_order);

      res.json(successResponse(media, "Media sort order updated successfully"));
    } catch (error) {
      next(error);
    }
  };

  bulkUpdateSortOrder = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { updates } = req.body;

      if (!Array.isArray(updates)) {
        res.status(400).json({
          success: false,
          message: "Invalid request body. Expected an array of updates.",
        });
        return;
      }

      await this.mediaService.bulkUpdateSortOrder(updates);

      res.json(
        successResponse(null, "Media sort orders updated successfully")
      );
    } catch (error) {
      next(error);
    }
  };

  deleteMedia = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;
      await this.mediaService.deleteMedia(id);

      res.json(successResponse(null, "Media deleted successfully"));
    } catch (error) {
      next(error);
    }
  };

  hardDeleteMedia = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;
      await this.mediaService.hardDeleteMedia(id);

      res.json(successResponse(null, "Media permanently deleted successfully"));
    } catch (error) {
      next(error);
    }
  };

  searchMedia = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { q, media_type } = req.query;

      if (!q || typeof q !== "string") {
        res.status(400).json({
          success: false,
          message: "Search query parameter 'q' is required",
        });
        return;
      }

      const media = await this.mediaService.searchMedia(q, media_type as any);

      res.json(
        successResponse(media, "Media search completed", {
          count: media.length,
          query: q,
        })
      );
    } catch (error) {
      next(error);
    }
  };

  getMediaByProductId = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { productId } = req.params;
      const media = await this.mediaService.getMediaByProductId(productId);

      res.json(
        successResponse(media, "Product media retrieved successfully", {
          count: media.length,
        })
      );
    } catch (error) {
      next(error);
    }
  };

  getOrphanMedia = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const media = await this.mediaService.getOrphanMedia();

      res.json(
        successResponse(media, "Orphan media retrieved successfully", {
          count: media.length,
        })
      );
    } catch (error) {
      next(error);
    }
  };

  getMediaStatistics = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const statistics = await this.mediaService.getMediaStatistics();

      res.json(
        successResponse(statistics, "Media statistics retrieved successfully")
      );
    } catch (error) {
      next(error);
    }
  };

  cleanupOrphanMedia = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const deletedCount = await this.mediaService.cleanupOrphanMedia();

      res.json(
        successResponse(
          { deletedCount },
          `${deletedCount} orphan media items deleted successfully`
        )
      );
    } catch (error) {
      next(error);
    }
  };
}

