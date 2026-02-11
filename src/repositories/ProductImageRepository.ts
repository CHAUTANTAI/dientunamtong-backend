import { BaseRepository } from "./BaseRepository";
import { ProductImage } from "@entities/ProductImage";

export class ProductImageRepository extends BaseRepository<ProductImage> {
  constructor() {
    super(ProductImage);
  }

  async findByProductId(productId: string): Promise<ProductImage[]> {
    return await this.repository.find({
      where: { product_id: productId },
      order: { sort_order: "ASC" },
    });
  }

  async updateSortOrder(id: string, sortOrder: number): Promise<ProductImage | null> {
    await this.repository.update(id, { sort_order: sortOrder });
    return await this.findById(id);
  }

  async deleteByProductId(productId: string): Promise<void> {
    await this.repository.delete({ product_id: productId });
  }
}

