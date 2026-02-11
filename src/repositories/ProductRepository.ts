import { Like, In } from "typeorm";
import { BaseRepository } from "./BaseRepository";
import { Product } from "@entities/Product";
import { ProductFilterDto } from "@/types/dtos";

export class ProductRepository extends BaseRepository<Product> {
  constructor() {
    super(Product);
  }

  async findWithFilters(filters: ProductFilterDto): Promise<Product[]> {
    const {
      category_id,
      searchKey,
      is_active,
      limit = 10,
      offset = 0,
    } = filters;

    const queryBuilder = this.repository
      .createQueryBuilder("product")
      .leftJoinAndSelect("product.images", "images")
      .leftJoinAndSelect("product.categories", "categories")
      .orderBy("images.sort_order", "ASC")
      .addOrderBy("product.created_at", "DESC");

    // Filter by active status
    if (is_active !== undefined) {
      queryBuilder.andWhere("product.is_active = :is_active", { is_active });
    }

    // Filter by category
    if (category_id) {
      queryBuilder.andWhere("categories.id = :category_id", { category_id });
    }

    // Search by name
    if (searchKey) {
      queryBuilder.andWhere("product.name ILIKE :searchKey", {
        searchKey: `%${searchKey}%`,
      });
    }

    queryBuilder.skip(offset).take(limit);

    return await queryBuilder.getMany();
  }

  async findByIdWithRelations(id: string): Promise<Product | null> {
    return await this.repository.findOne({
      where: { id },
      relations: ["images", "categories"],
      order: {
        images: {
          sort_order: "ASC",
        },
      },
    });
  }

  async updateCategories(
    productId: string,
    categoryIds: string[]
  ): Promise<void> {
    const product = await this.repository.findOne({
      where: { id: productId },
      relations: ["categories"],
    });

    if (!product) {
      throw new Error("Product not found");
    }

    // TypeORM will handle the junction table automatically
    product.categories = categoryIds.map((id) => ({ id } as any));
    await this.repository.save(product);
  }
}

