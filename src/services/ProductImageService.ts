import { ProductImageRepository } from "@repositories/ProductImageRepository";
import { ProductRepository } from "@repositories/ProductRepository";
import { ProductImage } from "@entities/ProductImage";
import { AddProductImageDto, UpdateProductImageSortDto } from "@/types/dtos";
import { NotFoundError } from "@/types/responses";
import { deleteFile } from "@config/supabase";
import { ENV } from "@config/env";

export class ProductImageService {
  private productImageRepository: ProductImageRepository;
  private productRepository: ProductRepository;

  constructor() {
    this.productImageRepository = new ProductImageRepository();
    this.productRepository = new ProductRepository();
  }

  async getProductImages(productId: string): Promise<ProductImage[]> {
    return await this.productImageRepository.findByProductId(productId);
  }

  async addProductImage(addDto: AddProductImageDto): Promise<ProductImage> {
    const { product_id, image_url, sort_order = 0 } = addDto;

    // Verify product exists
    const product = await this.productRepository.findById(product_id);
    if (!product) {
      throw new NotFoundError(`Product with id ${product_id} not found`);
    }

    const productImage = await this.productImageRepository.create({
      product_id,
      image_url,
      sort_order,
    });

    return productImage;
  }

  async updateImageSortOrder(
    imageId: string,
    updateDto: UpdateProductImageSortDto
  ): Promise<ProductImage> {
    const image = await this.productImageRepository.findById(imageId);
    
    if (!image) {
      throw new NotFoundError(`Product image with id ${imageId} not found`);
    }

    const updatedImage = await this.productImageRepository.updateSortOrder(
      imageId,
      updateDto.sort_order
    );

    if (!updatedImage) {
      throw new Error("Failed to update image sort order");
    }

    return updatedImage;
  }

  async deleteProductImage(imageId: string): Promise<void> {
    const image = await this.productImageRepository.findById(imageId);
    
    if (!image) {
      throw new NotFoundError(`Product image with id ${imageId} not found`);
    }

    // Delete from database
    await this.productImageRepository.delete(imageId);

    // Delete from Supabase storage
    try {
      if (image.image_url) {
        // Remove leading slash if present
        const path = image.image_url.startsWith("/")
          ? image.image_url.slice(1)
          : image.image_url;
        
        await deleteFile(ENV.STORAGE_BUCKET, [path]);
      }
    } catch (error) {
      console.error("Error deleting file from storage:", error);
      // Don't throw error if storage deletion fails
    }
  }
}

