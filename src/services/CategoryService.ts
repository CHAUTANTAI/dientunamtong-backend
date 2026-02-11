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
      order: { sort_order: "ASC", created_at: "DESC" },
      relations: ["media", "parent"],
    });
  }

  async getCategoryById(id: string): Promise<Category> {
    const category = await this.categoryRepository.findById(id, ["media", "parent"]);
    
    if (!category) {
      throw new NotFoundError(`Category with id ${id} not found`);
    }

    return category;
  }

  async getCategoryBySlug(slug: string): Promise<Category> {
    const category = await this.categoryRepository.findBySlug(slug);
    
    if (!category) {
      throw new NotFoundError(`Category with slug ${slug} not found`);
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

    // Check if slug exists
    if (createDto.slug) {
      const existingSlug = await this.categoryRepository.findBySlug(createDto.slug);
      if (existingSlug) {
        throw new ValidationError(`Category with slug "${createDto.slug}" already exists`);
      }
    } else {
      // Auto-generate slug from name
      createDto.slug = this.generateSlug(createDto.name);
    }

    // Calculate level based on parent
    let level = 0;
    if (createDto.parent_id) {
      const parent = await this.categoryRepository.findById(createDto.parent_id);
      if (!parent) {
        throw new NotFoundError(`Parent category with id ${createDto.parent_id} not found`);
      }
      level = parent.level + 1;
    }

    const category = await this.categoryRepository.create({
      ...createDto,
      level,
    });

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

      if (categoryWithSameName && categoryWithSameName.id !== id) {
        throw new ValidationError(`Category with name "${updateDto.name}" already exists`);
      }
    }

    // Check if slug is being updated and if it conflicts
    if (updateDto.slug && updateDto.slug !== existingCategory.slug) {
      const categoryWithSameSlug = await this.categoryRepository.findBySlug(
        updateDto.slug
      );

      if (categoryWithSameSlug && categoryWithSameSlug.id !== id) {
        throw new ValidationError(`Category with slug "${updateDto.slug}" already exists`);
      }
    }

    const updatedCategory = await this.categoryRepository.update(id, updateDto);
    
    if (!updatedCategory) {
      throw new Error("Failed to update category");
    }

    return updatedCategory;
  }

  async deleteCategory(id: string, cascade: boolean = false): Promise<void> {
    const category = await this.categoryRepository.findById(id);
    
    if (!category) {
      throw new NotFoundError(`Category with id ${id} not found`);
    }

    // Check if has children
    const hasChildren = await this.categoryRepository.hasChildren(id);
    
    if (hasChildren && !cascade) {
      throw new ValidationError(
        "Category has children. Please delete children first or use cascade delete."
      );
    }

    if (cascade) {
      // Delete all descendants
      const descendants = await this.categoryRepository.findChildrenOf(id);
      for (const descendant of descendants) {
        await this.categoryRepository.update(descendant.id, { is_active: false } as any);
      }
    }

    // Soft delete by setting is_active to false
    await this.categoryRepository.update(id, { is_active: false } as any);
  }

  async hardDeleteCategory(id: string, cascade: boolean = false): Promise<void> {
    const category = await this.categoryRepository.findById(id);
    
    if (!category) {
      throw new NotFoundError(`Category with id ${id} not found`);
    }

    const hasChildren = await this.categoryRepository.hasChildren(id);
    
    if (hasChildren && !cascade) {
      throw new ValidationError(
        "Category has children. Please delete children first or use cascade delete."
      );
    }

    if (cascade) {
      const descendants = await this.categoryRepository.findChildrenOf(id);
      for (const descendant of descendants) {
        await this.categoryRepository.delete(descendant.id);
      }
    }

    await this.categoryRepository.delete(id);
  }

  // Tree-specific operations
  async getRootCategories(): Promise<Category[]> {
    return await this.categoryRepository.findRootCategories();
  }

  async getChildrenOf(categoryId: string): Promise<Category[]> {
    return await this.categoryRepository.findByParentId(categoryId);
  }

  async getCategoryTree(categoryId?: string): Promise<Category | Category[]> {
    if (categoryId) {
      const tree = await this.categoryRepository.findDescendantsTree(categoryId);
      if (!tree) {
        throw new NotFoundError(`Category with id ${categoryId} not found`);
      }
      return tree;
    }

    return await this.categoryRepository.findFullTreeActive();
  }

  async getBreadcrumb(categoryId: string): Promise<Category[]> {
    return await this.categoryRepository.getBreadcrumb(categoryId);
  }

  async moveCategory(
    categoryId: string,
    newParentId: string | null
  ): Promise<Category> {
    const category = await this.categoryRepository.findById(categoryId);
    
    if (!category) {
      throw new NotFoundError(`Category with id ${categoryId} not found`);
    }

    if (newParentId) {
      const newParent = await this.categoryRepository.findById(newParentId);
      if (!newParent) {
        throw new NotFoundError(`Parent category with id ${newParentId} not found`);
      }
    }

    const movedCategory = await this.categoryRepository.moveCategory(
      categoryId,
      newParentId
    );

    if (!movedCategory) {
      throw new Error("Failed to move category");
    }

    return movedCategory;
  }

  async searchCategories(searchKey: string): Promise<Category[]> {
    return await this.categoryRepository.searchCategories(searchKey);
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

