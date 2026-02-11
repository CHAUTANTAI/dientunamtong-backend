import { Repository, FindOptionsWhere, FindManyOptions } from "typeorm";
import { AppDataSource } from "@config/database";

export class BaseRepository<T> {
  protected repository: Repository<T>;

  constructor(entity: any) {
    this.repository = AppDataSource.getRepository(entity);
  }

  async findAll(options?: FindManyOptions<T>): Promise<T[]> {
    return await this.repository.find(options);
  }

  async findById(id: string, relations?: string[]): Promise<T | null> {
    return await this.repository.findOne({
      where: { id } as FindOptionsWhere<T>,
      relations,
    });
  }

  async findOne(where: FindOptionsWhere<T>, relations?: string[]): Promise<T | null> {
    return await this.repository.findOne({ where, relations });
  }

  async create(data: Partial<T>): Promise<T> {
    const entity = this.repository.create(data as any);
    return await this.repository.save(entity);
  }

  async update(id: string, data: Partial<T>): Promise<T | null> {
    await this.repository.update(id, data as any);
    return await this.findById(id);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.repository.delete(id);
    return result.affected ? result.affected > 0 : false;
  }

  async softDelete(id: string): Promise<boolean> {
    const result = await this.repository.softDelete(id);
    return result.affected ? result.affected > 0 : false;
  }

  async count(where?: FindOptionsWhere<T>): Promise<number> {
    return await this.repository.count({ where });
  }

  async exists(where: FindOptionsWhere<T>): Promise<boolean> {
    const count = await this.repository.count({ where });
    return count > 0;
  }
}

