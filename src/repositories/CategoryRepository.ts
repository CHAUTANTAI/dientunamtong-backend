import { BaseRepository } from "./BaseRepository";
import { Category } from "@entities/Category";

export class CategoryRepository extends BaseRepository<Category> {
  constructor() {
    super(Category);
  }

  async findActive(): Promise<Category[]> {
    return await this.repository.find({
      where: { is_active: true },
      order: { name: "ASC" },
    });
  }

  async findByName(name: string): Promise<Category | null> {
    return await this.repository.findOne({
      where: { name },
    });
  }
}

