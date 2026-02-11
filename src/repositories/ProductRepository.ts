import { Like, In, Brackets } from "typeorm";
import { BaseRepository } from "./BaseRepository";
import { Product } from "@entities/Product";
import { ProductFilterDto } from "@/types/dtos";
import { CategoryRepository } from "./CategoryRepository";

export class ProductRepository extends BaseRepository<Product> {
  private categoryRepository: CategoryRepository;

  constructor() {
    super(Product);
    this.categoryRepository = new CategoryRepository();
  }

  async findWithFilters(filters: ProductFilterDto): Promise<Product[]> {
    const {
      category_id,
      category_ids,
      searchKey,
      is_active,
      in_stock,
      min_price,
      max_price,
      tags,
      sort_by = "created_at",
      sort_order = "DESC",
      limit = 20,
      offset = 0,
      include_descendants = false,
    } = filters;

    const queryBuilder = this.repository
      .createQueryBuilder("product")
      .leftJoinAndSelect("product.media", "media", "media.is_active = :mediaActive", { mediaActive: true })
      .leftJoinAndSelect("product.categories", "categories")
      .leftJoinAndSelect("categories.media", "categoryMedia");

    // Filter by active status
    if (is_active !== undefined) {
      queryBuilder.andWhere("product.is_active = :is_active", { is_active });
    }

    // Filter by stock status
    if (in_stock !== undefined) {
      queryBuilder.andWhere("product.in_stock = :in_stock", { in_stock });
    }

    // Filter by category (with descendants support)
    if (category_id) {
      if (include_descendants) {
        // Lấy tất cả category con
        const descendants = await this.categoryRepository.findChildrenOf(category_id);
        const categoryIds = [category_id, ...descendants.map((c) => c.id)];
        queryBuilder.andWhere("categories.id IN (:...categoryIds)", { categoryIds });
      } else {
        queryBuilder.andWhere("categories.id = :category_id", { category_id });
      }
    }

    // Filter by multiple categories
    if (category_ids && category_ids.length > 0) {
      queryBuilder.andWhere("categories.id IN (:...category_ids)", { category_ids });
    }

    // Price range filter
    if (min_price !== undefined) {
      queryBuilder.andWhere("product.price >= :min_price", { min_price });
    }
    if (max_price !== undefined) {
      queryBuilder.andWhere("product.price <= :max_price", { max_price });
    }

    // Tags filter
    if (tags && tags.length > 0) {
      queryBuilder.andWhere("product.tags && :tags", { tags });
    }

    // Search by name, description, sku
    if (searchKey && searchKey.trim()) {
      queryBuilder.andWhere(
        new Brackets((qb) => {
          qb.where("LOWER(product.name) LIKE LOWER(:searchKey)", {
            searchKey: `%${searchKey}%`,
          })
            .orWhere("LOWER(product.short_description) LIKE LOWER(:searchKey)", {
              searchKey: `%${searchKey}%`,
            })
            .orWhere("LOWER(product.description) LIKE LOWER(:searchKey)", {
              searchKey: `%${searchKey}%`,
            })
            .orWhere("LOWER(product.sku) LIKE LOWER(:searchKey)", {
              searchKey: `%${searchKey}%`,
            });
        })
      );
    }

    // Sorting
    const sortColumn = this.getSortColumn(sort_by);
    queryBuilder.orderBy(`product.${sortColumn}`, sort_order as "ASC" | "DESC");
    
    // Always order media by sort_order
    queryBuilder.addOrderBy("media.sort_order", "ASC");

    // Pagination
    queryBuilder.skip(offset).take(limit);

    return await queryBuilder.getMany();
  }

  private getSortColumn(sortBy: string): string {
    const sortMap: Record<string, string> = {
      name: "name",
      price: "price",
      created_at: "created_at",
      updated_at: "updated_at",
      view_count: "view_count",
    };
    return sortMap[sortBy] || "created_at";
  }

  async findByIdWithRelations(id: string): Promise<Product | null> {
    return await this.repository.findOne({
      where: { id },
      relations: ["media", "categories", "categories.media"],
      order: {
        media: {
          sort_order: "ASC",
        },
      },
    });
  }

  async findBySlug(slug: string): Promise<Product | null> {
    return await this.repository.findOne({
      where: { slug },
      relations: ["media", "categories", "categories.media"],
      order: {
        media: {
          sort_order: "ASC",
        },
      },
    });
  }

  async findBySku(sku: string): Promise<Product | null> {
    return await this.repository.findOne({
      where: { sku },
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

  async incrementViewCount(productId: string): Promise<void> {
    await this.repository.increment({ id: productId }, "view_count", 1);
  }

  async findRelatedProducts(
    productId: string,
    limit: number = 8
  ): Promise<Product[]> {
    // Tìm sản phẩm liên quan dựa trên cùng category
    const product = await this.findByIdWithRelations(productId);
    if (!product || !product.categories || product.categories.length === 0) {
      return [];
    }

    const categoryIds = product.categories.map((c) => c.id);

    return await this.repository
      .createQueryBuilder("product")
      .leftJoinAndSelect("product.media", "media", "media.is_active = :mediaActive", { mediaActive: true })
      .leftJoinAndSelect("product.categories", "categories")
      .where("product.id != :productId", { productId })
      .andWhere("product.is_active = :isActive", { isActive: true })
      .andWhere("categories.id IN (:...categoryIds)", { categoryIds })
      .orderBy("product.view_count", "DESC")
      .addOrderBy("product.created_at", "DESC")
      .addOrderBy("media.sort_order", "ASC")
      .take(limit)
      .getMany();
  }

  async findFeaturedProducts(limit: number = 10): Promise<Product[]> {
    return await this.repository
      .createQueryBuilder("product")
      .leftJoinAndSelect("product.media", "media", "media.is_active = :mediaActive", { mediaActive: true })
      .leftJoinAndSelect("product.categories", "categories")
      .where("product.is_active = :isActive", { isActive: true })
      .andWhere("product.in_stock = :inStock", { inStock: true })
      .orderBy("product.view_count", "DESC")
      .addOrderBy("product.created_at", "DESC")
      .addOrderBy("media.sort_order", "ASC")
      .take(limit)
      .getMany();
  }

  async countWithFilters(filters: ProductFilterDto): Promise<number> {
    const {
      category_id,
      category_ids,
      searchKey,
      is_active,
      in_stock,
      min_price,
      max_price,
      tags,
      include_descendants = false,
    } = filters;

    const queryBuilder = this.repository
      .createQueryBuilder("product")
      .leftJoin("product.categories", "categories");

    if (is_active !== undefined) {
      queryBuilder.andWhere("product.is_active = :is_active", { is_active });
    }

    if (in_stock !== undefined) {
      queryBuilder.andWhere("product.in_stock = :in_stock", { in_stock });
    }

    if (category_id) {
      if (include_descendants) {
        const descendants = await this.categoryRepository.findChildrenOf(category_id);
        const categoryIds = [category_id, ...descendants.map((c) => c.id)];
        queryBuilder.andWhere("categories.id IN (:...categoryIds)", { categoryIds });
      } else {
        queryBuilder.andWhere("categories.id = :category_id", { category_id });
      }
    }

    if (category_ids && category_ids.length > 0) {
      queryBuilder.andWhere("categories.id IN (:...category_ids)", { category_ids });
    }

    if (min_price !== undefined) {
      queryBuilder.andWhere("product.price >= :min_price", { min_price });
    }
    if (max_price !== undefined) {
      queryBuilder.andWhere("product.price <= :max_price", { max_price });
    }

    if (tags && tags.length > 0) {
      queryBuilder.andWhere("product.tags && :tags", { tags });
    }

    if (searchKey && searchKey.trim()) {
      queryBuilder.andWhere(
        new Brackets((qb) => {
          qb.where("LOWER(product.name) LIKE LOWER(:searchKey)", {
            searchKey: `%${searchKey}%`,
          })
            .orWhere("LOWER(product.short_description) LIKE LOWER(:searchKey)", {
              searchKey: `%${searchKey}%`,
            })
            .orWhere("LOWER(product.description) LIKE LOWER(:searchKey)", {
              searchKey: `%${searchKey}%`,
            })
            .orWhere("LOWER(product.sku) LIKE LOWER(:searchKey)", {
              searchKey: `%${searchKey}%`,
            });
        })
      );
    }

    return await queryBuilder.getCount();
  }

  async getProductsByTag(tag: string, limit: number = 20): Promise<Product[]> {
    return await this.repository
      .createQueryBuilder("product")
      .leftJoinAndSelect("product.media", "media", "media.is_active = :mediaActive", { mediaActive: true })
      .leftJoinAndSelect("product.categories", "categories")
      .where("product.is_active = :isActive", { isActive: true })
      .andWhere(":tag = ANY(product.tags)", { tag })
      .orderBy("product.created_at", "DESC")
      .addOrderBy("media.sort_order", "ASC")
      .take(limit)
      .getMany();
  }

  async getAllTags(): Promise<string[]> {
    const products = await this.repository.find({
      where: { is_active: true },
      select: ["tags"],
    });

    const tagsSet = new Set<string>();
    products.forEach((product) => {
      if (product.tags) {
        product.tags.forEach((tag) => tagsSet.add(tag));
      }
    });

    return Array.from(tagsSet).sort();
  }
}

