import { ProductRepository } from "@repositories/ProductRepository";
import { MediaRepository } from "@repositories/MediaRepository";
import { CategoryRepository } from "@repositories/CategoryRepository";
import { Product } from "@entities/Product";
import { CreateProductDto, UpdateProductDto, ProductFilterDto } from "@/types/dtos";
import { NotFoundError, ValidationError } from "@/types/responses";

export class ProductService {
  private productRepository: ProductRepository;
  private mediaRepository: MediaRepository;
  private categoryRepository: CategoryRepository;

  constructor() {
    this.productRepository = new ProductRepository();
    this.mediaRepository = new MediaRepository();
    this.categoryRepository = new CategoryRepository();
  }

  async getAllProducts(filters: ProductFilterDto): Promise<{
    products: Product[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const products = await this.productRepository.findWithFilters(filters);
    const total = await this.productRepository.countWithFilters(filters);
    const limit = filters.limit || 20;
    const offset = filters.offset || 0;
    const page = Math.floor(offset / limit) + 1;
    const totalPages = Math.ceil(total / limit);

    return {
      products,
      total,
      page,
      limit,
      totalPages,
    };
  }

  async getProductById(id: string, incrementView: boolean = false): Promise<Product> {
    const product = await this.productRepository.findByIdWithRelations(id);
    
    if (!product) {
      throw new NotFoundError(`Product with id ${id} not found`);
    }

    if (incrementView) {
      await this.productRepository.incrementViewCount(id);
      product.view_count++;
    }

    return product;
  }

  async getProductBySlug(slug: string, incrementView: boolean = false): Promise<Product> {
    const product = await this.productRepository.findBySlug(slug);
    
    if (!product) {
      throw new NotFoundError(`Product with slug ${slug} not found`);
    }

    if (incrementView) {
      await this.productRepository.incrementViewCount(product.id);
      product.view_count++;
    }

    return product;
  }

  async createProduct(createDto: CreateProductDto): Promise<Product> {
    // Check if SKU exists
    if (createDto.sku) {
      const existingSku = await this.productRepository.findBySku(createDto.sku);
      if (existingSku) {
        throw new ValidationError(`Product with SKU "${createDto.sku}" already exists`);
      }
    }

    // Auto-generate slug if not provided
    if (!createDto.slug) {
      createDto.slug = this.generateSlug(createDto.name);
    } else {
      // Check if slug exists
      const existingSlug = await this.productRepository.findBySlug(createDto.slug);
      if (existingSlug) {
        throw new ValidationError(`Product with slug "${createDto.slug}" already exists`);
      }
    }

    // Validate categories exist
    if (createDto.category_ids && createDto.category_ids.length > 0) {
      for (const categoryId of createDto.category_ids) {
        const category = await this.categoryRepository.findById(categoryId);
        if (!category) {
          throw new NotFoundError(`Category with id ${categoryId} not found`);
        }
      }
    }

    const product = await this.productRepository.create(createDto);

    // Update categories if provided
    if (createDto.category_ids && createDto.category_ids.length > 0) {
      await this.productRepository.updateCategories(product.id, createDto.category_ids);
    }

    return await this.getProductById(product.id);
  }

  async updateProduct(id: string, updateDto: UpdateProductDto): Promise<Product> {
    const existingProduct = await this.productRepository.findById(id);
    
    if (!existingProduct) {
      throw new NotFoundError(`Product with id ${id} not found`);
    }

    // Check if SKU is being updated and if it conflicts
    if (updateDto.sku && updateDto.sku !== existingProduct.sku) {
      const productWithSameSku = await this.productRepository.findBySku(updateDto.sku);
      if (productWithSameSku && productWithSameSku.id !== id) {
        throw new ValidationError(`Product with SKU "${updateDto.sku}" already exists`);
      }
    }

    // Check if slug is being updated and if it conflicts
    if (updateDto.slug && updateDto.slug !== existingProduct.slug) {
      const productWithSameSlug = await this.productRepository.findBySlug(updateDto.slug);
      if (productWithSameSlug && productWithSameSlug.id !== id) {
        throw new ValidationError(`Product with slug "${updateDto.slug}" already exists`);
      }
    }

    const updatedProduct = await this.productRepository.update(id, updateDto);
    
    if (!updatedProduct) {
      throw new Error("Failed to update product");
    }

    return await this.getProductById(id);
  }

  async deleteProduct(id: string): Promise<void> {
    const product = await this.productRepository.findById(id);
    
    if (!product) {
      throw new NotFoundError(`Product with id ${id} not found`);
    }

    // Soft delete by setting is_active to false
    await this.productRepository.update(id, { is_active: false } as any);
  }

  async hardDeleteProduct(id: string): Promise<void> {
    const product = await this.productRepository.findById(id);
    
    if (!product) {
      throw new NotFoundError(`Product with id ${id} not found`);
    }

    // Delete associated media
    await this.mediaRepository.deleteByProductId(id);

    await this.productRepository.delete(id);
  }

  async updateProductCategories(
    productId: string,
    categoryIds: string[]
  ): Promise<void> {
    const product = await this.productRepository.findById(productId);
    
    if (!product) {
      throw new NotFoundError(`Product with id ${productId} not found`);
    }

    // Validate all categories exist
    for (const categoryId of categoryIds) {
      const category = await this.categoryRepository.findById(categoryId);
      if (!category) {
        throw new NotFoundError(`Category with id ${categoryId} not found`);
      }
    }

    await this.productRepository.updateCategories(productId, categoryIds);
  }

  async getRelatedProducts(productId: string, limit: number = 8): Promise<Product[]> {
    return await this.productRepository.findRelatedProducts(productId, limit);
  }

  async getFeaturedProducts(limit: number = 10): Promise<Product[]> {
    return await this.productRepository.findFeaturedProducts(limit);
  }

  async getProductsByTag(tag: string, limit: number = 20): Promise<Product[]> {
    return await this.productRepository.getProductsByTag(tag, limit);
  }

  async getAllTags(): Promise<string[]> {
    return await this.productRepository.getAllTags();
  }

  async getProductsByCategorySlug(
    categorySlug: string,
    filters: ProductFilterDto
  ): Promise<{
    products: Product[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    category: any;
  }> {
    const category = await this.categoryRepository.findBySlug(categorySlug);
    
    if (!category) {
      throw new NotFoundError(`Category with slug ${categorySlug} not found`);
    }

    // Update filters with category_id
    const updatedFilters = {
      ...filters,
      category_id: category.id,
    };

    const result = await this.getAllProducts(updatedFilters);

    return {
      ...result,
      category: {
        id: category.id,
        name: category.name,
        slug: category.slug,
        description: category.description,
      },
    };
  }

  // Helper methods
  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // Remove diacritics
      .replace(/đ/g, "d")
      .replace(/Đ/g, "D")
      .replace(/[^a-z0-9\s-]/g, "") // Remove special chars
      .trim()
      .replace(/\s+/g, "-") // Replace spaces with -
      .replace(/-+/g, "-"); // Replace multiple - with single -
  }
}

