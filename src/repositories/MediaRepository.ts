import { BaseRepository } from "./BaseRepository";
import { Media, MediaType } from "@entities/Media";
import { FindOptionsWhere, In } from "typeorm";

export class MediaRepository extends BaseRepository<Media> {
  constructor() {
    super(Media);
  }

  async findByProductId(productId: string): Promise<Media[]> {
    return await this.repository.find({
      where: { product_id: productId, is_active: true },
      order: { sort_order: "ASC", created_at: "DESC" },
    });
  }

  async findByIds(ids: string[]): Promise<Media[]> {
    return await this.repository.find({
      where: { id: In(ids), is_active: true },
    });
  }

  async findByType(mediaType: MediaType): Promise<Media[]> {
    return await this.repository.find({
      where: { media_type: mediaType, is_active: true },
      order: { created_at: "DESC" },
    });
  }

  async findActive(): Promise<Media[]> {
    return await this.repository.find({
      where: { is_active: true },
      order: { created_at: "DESC" },
    });
  }

  async updateSortOrder(id: string, sortOrder: number): Promise<Media | null> {
    await this.repository.update(id, { sort_order: sortOrder });
    return await this.findById(id);
  }

  async bulkUpdateSortOrder(updates: { id: string; sort_order: number }[]): Promise<void> {
    for (const update of updates) {
      await this.repository.update(update.id, { sort_order: update.sort_order });
    }
  }

  async deleteByProductId(productId: string): Promise<boolean> {
    const result = await this.repository.delete({ product_id: productId });
    return result.affected ? result.affected > 0 : false;
  }

  async findOrphanMedia(): Promise<Media[]> {
    // Media không liên kết với product nào và không liên kết với category nào
    return await this.repository
      .createQueryBuilder("media")
      .leftJoin("media.product", "product")
      .leftJoin("media.categories", "category")
      .where("media.product_id IS NULL")
      .andWhere("category.id IS NULL")
      .getMany();
  }

  async searchMedia(searchKey: string, mediaType?: MediaType): Promise<Media[]> {
    const query = this.repository
      .createQueryBuilder("media")
      .where("media.is_active = :isActive", { isActive: true })
      .andWhere(
        "(LOWER(media.file_name) LIKE LOWER(:searchKey) OR LOWER(media.alt_text) LIKE LOWER(:searchKey) OR LOWER(media.description) LIKE LOWER(:searchKey))",
        { searchKey: `%${searchKey}%` }
      );

    if (mediaType) {
      query.andWhere("media.media_type = :mediaType", { mediaType });
    }

    return await query.orderBy("media.created_at", "DESC").getMany();
  }

  async getMediaStatistics(): Promise<{
    total: number;
    byType: Record<MediaType, number>;
    totalSize: number;
  }> {
    const allMedia = await this.repository.find({
      where: { is_active: true },
    });

    const byType: Record<MediaType, number> = {
      [MediaType.IMAGE]: 0,
      [MediaType.VIDEO]: 0,
      [MediaType.AUDIO]: 0,
      [MediaType.DOCUMENT]: 0,
      [MediaType.OTHER]: 0,
    };

    let totalSize = 0;

    allMedia.forEach((media) => {
      byType[media.media_type]++;
      totalSize += Number(media.file_size || 0);
    });

    return {
      total: allMedia.length,
      byType,
      totalSize,
    };
  }
}

