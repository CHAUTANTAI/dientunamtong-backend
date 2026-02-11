import { CategoryRepository } from "@repositories/CategoryRepository";
import { Category } from "@entities/Category";
import { CreateCategoryDto, UpdateCategoryDto } from "@/types/dtos";
import { NotFoundError, ValidationError } from "@/types/responses";

export class CategoryService {
  private categoryRepository: CategoryRepository;

  constructor() {
    this.categoryRepository = new CategoryRepository();
  }

  async getAllCategories(activeOnly: boolean = false): Promise<Category[]> {
    if (activeOnly) {
      return await this.categoryRepository.findActive();
    }
    return await this.categoryRepository.findAll({
      order: { created_at: "DESC" },
    });
  }

  async getCategoryById(id: string): Promise<Category> {
    const category = await this.categoryRepository.findById(id);
    
    if (!category) {
      throw new NotFoundError(`Category with id ${id} not found`);
    }

    return category;
  }

  async createCategory(createDto: CreateCategoryDto): Promise<Category> {
    // Check if category with same name exists
    const existingCategory = await this.categoryRepository.findByName(
      createDto.name
    );

    if (existingCategory) {
      throw new ValidationError(`Category with name "${createDto.name}" already exists`);
    }

    const category = await this.categoryRepository.create(createDto);
    return category;
  }

  async updateCategory(id: string, updateDto: UpdateCategoryDto): Promise<Category> {
    const existingCategory = await this.categoryRepository.findById(id);
    
    if (!existingCategory) {
      throw new NotFoundError(`Category with id ${id} not found`);
    }

    // Check if name is being updated and if it conflicts
    if (updateDto.name && updateDto.name !== existingCategory.name) {
      const categoryWithSameName = await this.categoryRepository.findByName(
        updateDto.name
      );

      if (categoryWithSameName) {
        throw new ValidationError(`Category with name "${updateDto.name}" already exists`);
      }
    }

    const updatedCategory = await this.categoryRepository.update(id, updateDto);
    
    if (!updatedCategory) {
      throw new Error("Failed to update category");
    }

    return updatedCategory;
  }

  async deleteCategory(id: string): Promise<void> {
    const category = await this.categoryRepository.findById(id);
    
    if (!category) {
      throw new NotFoundError(`Category with id ${id} not found`);
    }

    // Soft delete by setting is_active to false
    await this.categoryRepository.update(id, { is_active: false } as any);
  }
}

