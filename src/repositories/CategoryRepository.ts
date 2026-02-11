import { BaseRepository } from "./BaseRepository";
import { Category } from "@entities/Category";
import { IsNull } from "typeorm";

export class CategoryRepository extends BaseRepository<Category> {
  constructor() {
    super(Category);
  }

  // Lấy TreeRepository để sử dụng các methods đặc biệt của tree
  private getTreeRepository() {
    return this.repository.manager.getTreeRepository(Category);
  }

  async findActive(): Promise<Category[]> {
    return await this.repository.find({
      where: { is_active: true },
      order: { sort_order: "ASC", name: "ASC" },
      relations: ["media"],
    });
  }

  async findByName(name: string): Promise<Category | null> {
    return await this.repository.findOne({
      where: { name },
      relations: ["media", "parent"],
    });
  }

  async findBySlug(slug: string): Promise<Category | null> {
    return await this.repository.findOne({
      where: { slug },
      relations: ["media", "parent"],
    });
  }

  // Tree Operations
  async findRootCategories(): Promise<Category[]> {
    return await this.repository.find({
      where: { parent_id: IsNull(), is_active: true },
      order: { sort_order: "ASC", name: "ASC" },
      relations: ["media"],
    });
  }

  async findByParentId(parentId: string | null): Promise<Category[]> {
    const where = parentId ? { parent_id: parentId } : { parent_id: IsNull() };
    return await this.repository.find({
      where,
      order: { sort_order: "ASC", name: "ASC" },
      relations: ["media"],
    });
  }

  async findChildrenOf(categoryId: string): Promise<Category[]> {
    const treeRepo = this.getTreeRepository();
    const category = await treeRepo.findOne({
      where: { id: categoryId },
    });

    if (!category) {
      return [];
    }

    return await treeRepo.findDescendants(category);
  }

  async findDescendantsTree(categoryId: string): Promise<Category | null> {
    const treeRepo = this.getTreeRepository();
    const category = await treeRepo.findOne({
      where: { id: categoryId },
    });

    if (!category) {
      return null;
    }

    return await treeRepo.findDescendantsTree(category);
  }

  async findAncestorsOf(categoryId: string): Promise<Category[]> {
    const treeRepo = this.getTreeRepository();
    const category = await treeRepo.findOne({
      where: { id: categoryId },
    });

    if (!category) {
      return [];
    }

    return await treeRepo.findAncestors(category);
  }

  async findFullTree(): Promise<Category[]> {
    const treeRepo = this.getTreeRepository();
    return await treeRepo.findTrees();
  }

  async findFullTreeActive(): Promise<Category[]> {
    const treeRepo = this.getTreeRepository();
    const roots = await this.findRootCategories();
    
    const trees: Category[] = [];
    for (const root of roots) {
      const tree = await treeRepo.findDescendantsTree(root);
      if (tree) {
        trees.push(tree);
      }
    }
    
    return trees;
  }

  async countChildren(categoryId: string): Promise<number> {
    return await this.repository.count({
      where: { parent_id: categoryId },
    });
  }

  async hasChildren(categoryId: string): Promise<boolean> {
    const count = await this.countChildren(categoryId);
    return count > 0;
  }

  async updateLevel(categoryId: string, level: number): Promise<void> {
    await this.repository.update(categoryId, { level });
  }

  async moveCategory(
    categoryId: string,
    newParentId: string | null
  ): Promise<Category | null> {
    // Kiểm tra không thể move vào chính con của nó
    if (newParentId) {
      const descendants = await this.findChildrenOf(categoryId);
      const descendantIds = descendants.map((d) => d.id);
      
      if (descendantIds.includes(newParentId)) {
        throw new Error("Cannot move category to its own descendant");
      }
    }

    // Calculate new level
    let newLevel = 0;
    if (newParentId) {
      const newParent = await this.findById(newParentId);
      if (newParent) {
        newLevel = newParent.level + 1;
      }
    }

    await this.repository.update(categoryId, {
      parent_id: newParentId === null ? undefined : newParentId,
      level: newLevel,
    } as any);

    // Update levels of all descendants
    await this.updateDescendantsLevel(categoryId);

    return await this.findById(categoryId, ["media", "parent"]);
  }

  private async updateDescendantsLevel(categoryId: string): Promise<void> {
    const category = await this.findById(categoryId);
    if (!category) return;

    const children = await this.findByParentId(categoryId);
    for (const child of children) {
      await this.repository.update(child.id, {
        level: category.level + 1,
      });
      // Recursively update descendants
      await this.updateDescendantsLevel(child.id);
    }
  }

  async searchCategories(searchKey: string): Promise<Category[]> {
    return await this.repository
      .createQueryBuilder("category")
      .leftJoinAndSelect("category.media", "media")
      .leftJoinAndSelect("category.parent", "parent")
      .where("category.is_active = :isActive", { isActive: true })
      .andWhere(
        "(LOWER(category.name) LIKE LOWER(:searchKey) OR LOWER(category.description) LIKE LOWER(:searchKey))",
        { searchKey: `%${searchKey}%` }
      )
      .orderBy("category.sort_order", "ASC")
      .addOrderBy("category.name", "ASC")
      .getMany();
  }

  async getBreadcrumb(categoryId: string): Promise<Category[]> {
    const ancestors = await this.findAncestorsOf(categoryId);
    return ancestors.reverse(); // From root to current
  }
}


