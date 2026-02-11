import { ProductRepository } from "@repositories/ProductRepository";
import { Product } from "@entities/Product";
import { CreateProductDto, UpdateProductDto, ProductFilterDto } from "@/types/dtos";
import { NotFoundError } from "@/types/responses";

export class ProductService {
  private productRepository: ProductRepository;

  constructor() {
    this.productRepository = new ProductRepository();
  }

  async getAllProducts(filters: ProductFilterDto): Promise<Product[]> {
    return await this.productRepository.findWithFilters(filters);
  }

  async getProductById(id: string): Promise<Product> {
    const product = await this.productRepository.findByIdWithRelations(id);
    
    if (!product) {
      throw new NotFoundError(`Product with id ${id} not found`);
    }

    return product;
  }

  async createProduct(createDto: CreateProductDto): Promise<Product> {
    const product = await this.productRepository.create(createDto);
    return product;
  }

  async updateProduct(id: string, updateDto: UpdateProductDto): Promise<Product> {
    const existingProduct = await this.productRepository.findById(id);
    
    if (!existingProduct) {
      throw new NotFoundError(`Product with id ${id} not found`);
    }

    const updatedProduct = await this.productRepository.update(id, updateDto);
    
    if (!updatedProduct) {
      throw new Error("Failed to update product");
    }

    return updatedProduct;
  }

  async deleteProduct(id: string): Promise<void> {
    const product = await this.productRepository.findById(id);
    
    if (!product) {
      throw new NotFoundError(`Product with id ${id} not found`);
    }

    // Soft delete by setting is_active to false
    await this.productRepository.update(id, { is_active: false } as any);
  }

  async updateProductCategories(
    productId: string,
    categoryIds: string[]
  ): Promise<void> {
    const product = await this.productRepository.findById(productId);
    
    if (!product) {
      throw new NotFoundError(`Product with id ${productId} not found`);
    }

    await this.productRepository.updateCategories(productId, categoryIds);
  }
}

