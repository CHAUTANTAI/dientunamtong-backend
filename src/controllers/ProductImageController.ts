import { Request, Response, NextFunction } from "express";
import { ProductImageService } from "@services/ProductImageService";
import { AddProductImageDto, UpdateProductImageSortDto } from "@/types/dtos";
import { ApiResponse } from "@/types/responses";
import { uploadFile } from "@config/supabase";
import { ENV } from "@config/env";
import { randomUUID } from "crypto";

export class ProductImageController {
  private productImageService: ProductImageService;

  constructor() {
    this.productImageService = new ProductImageService();
  }

  getProductImages = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const images = await this.productImageService.getProductImages(id);

      const response: ApiResponse = {
        success: true,
        data: images,
        statusCode: 200,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  addProductImage = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const addDto: AddProductImageDto = req.body;
      const image = await this.productImageService.addProductImage(addDto);

      const response: ApiResponse = {
        success: true,
        data: image,
        message: "Product image added successfully",
        statusCode: 201,
      };

      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  };

  uploadProductImage = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params; // product_id
      const file = req.file;

      if (!file) {
        return next(new Error("File is required"));
      }

      // Upload to Supabase Storage
      const filename = `${randomUUID()}_${file.originalname}`;
      const path = `product/${filename}`;

      const { error: uploadError } = await uploadFile(
        ENV.STORAGE_BUCKET,
        path,
        file.buffer,
        file.mimetype
      );

      if (uploadError) {
        throw uploadError;
      }

      // Add product image record
      const imageUrl = `/${path}`;
      const image = await this.productImageService.addProductImage({
        product_id: id,
        image_url: imageUrl,
        sort_order: 0,
      });

      const response: ApiResponse = {
        success: true,
        data: image,
        message: "Image uploaded successfully",
        statusCode: 201,
      };

      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  };

  updateImageSortOrder = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { imageId } = req.params;
      const updateDto: UpdateProductImageSortDto = req.body;

      const image = await this.productImageService.updateImageSortOrder(
        imageId,
        updateDto
      );

      const response: ApiResponse = {
        success: true,
        data: image,
        message: "Image sort order updated successfully",
        statusCode: 200,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  deleteProductImage = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { imageId } = req.params;
      await this.productImageService.deleteProductImage(imageId);

      const response: ApiResponse = {
        success: true,
        message: "Product image deleted successfully",
        statusCode: 200,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };
}

