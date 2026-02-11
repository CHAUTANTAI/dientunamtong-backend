import { MediaRepository } from "@repositories/MediaRepository";
import { Media, MediaType } from "@entities/Media";
import { CreateMediaDto, UpdateMediaDto, MediaFilterDto } from "@/types/dtos";
import { NotFoundError, ValidationError } from "@/types/responses";

export class MediaService {
  private mediaRepository: MediaRepository;

  constructor() {
    this.mediaRepository = new MediaRepository();
  }

  async getAllMedia(filters: MediaFilterDto = {}): Promise<Media[]> {
    const { media_type, product_id, is_active } = filters;

    if (product_id) {
      return await this.mediaRepository.findByProductId(product_id);
    }

    if (media_type) {
      return await this.mediaRepository.findByType(media_type);
    }

    if (is_active !== undefined) {
      if (is_active) {
        return await this.mediaRepository.findActive();
      }
    }

    return await this.mediaRepository.findAll({
      order: { created_at: "DESC" },
    });
  }

  async getMediaById(id: string): Promise<Media> {
    const media = await this.mediaRepository.findById(id);

    if (!media) {
      throw new NotFoundError(`Media with id ${id} not found`);
    }

    return media;
  }

  async createMedia(createDto: CreateMediaDto): Promise<Media> {
    // Validate file_url
    if (!createDto.file_url || !createDto.file_url.trim()) {
      throw new ValidationError("File URL is required");
    }

    // Auto-detect media type from file extension if not provided
    if (!createDto.media_type) {
      createDto.media_type = this.detectMediaType(createDto.file_url);
    }

    // Extract file name from URL if not provided
    if (!createDto.file_name) {
      createDto.file_name = this.extractFileName(createDto.file_url);
    }

    const media = await this.mediaRepository.create(createDto);
    return media;
  }

  async createMultipleMedia(createDtos: CreateMediaDto[]): Promise<Media[]> {
    const media: Media[] = [];

    for (const dto of createDtos) {
      const createdMedia = await this.createMedia(dto);
      media.push(createdMedia);
    }

    return media;
  }

  async updateMedia(id: string, updateDto: UpdateMediaDto): Promise<Media> {
    const existingMedia = await this.mediaRepository.findById(id);

    if (!existingMedia) {
      throw new NotFoundError(`Media with id ${id} not found`);
    }

    const updatedMedia = await this.mediaRepository.update(id, updateDto);

    if (!updatedMedia) {
      throw new Error("Failed to update media");
    }

    return updatedMedia;
  }

  async updateSortOrder(id: string, sortOrder: number): Promise<Media> {
    const existingMedia = await this.mediaRepository.findById(id);

    if (!existingMedia) {
      throw new NotFoundError(`Media with id ${id} not found`);
    }

    const updatedMedia = await this.mediaRepository.updateSortOrder(id, sortOrder);

    if (!updatedMedia) {
      throw new Error("Failed to update media sort order");
    }

    return updatedMedia;
  }

  async bulkUpdateSortOrder(
    updates: { id: string; sort_order: number }[]
  ): Promise<void> {
    // Validate all media exist
    const mediaIds = updates.map((u) => u.id);
    const existingMedia = await this.mediaRepository.findByIds(mediaIds);

    if (existingMedia.length !== mediaIds.length) {
      throw new NotFoundError("Some media items not found");
    }

    await this.mediaRepository.bulkUpdateSortOrder(updates);
  }

  async deleteMedia(id: string): Promise<void> {
    const media = await this.mediaRepository.findById(id);

    if (!media) {
      throw new NotFoundError(`Media with id ${id} not found`);
    }

    // Soft delete by setting is_active to false
    await this.mediaRepository.update(id, { is_active: false } as any);
  }

  async hardDeleteMedia(id: string): Promise<void> {
    const media = await this.mediaRepository.findById(id);

    if (!media) {
      throw new NotFoundError(`Media with id ${id} not found`);
    }

    await this.mediaRepository.delete(id);
  }

  async searchMedia(searchKey: string, mediaType?: MediaType): Promise<Media[]> {
    return await this.mediaRepository.searchMedia(searchKey, mediaType);
  }

  async getMediaByProductId(productId: string): Promise<Media[]> {
    return await this.mediaRepository.findByProductId(productId);
  }

  async getOrphanMedia(): Promise<Media[]> {
    return await this.mediaRepository.findOrphanMedia();
  }

  async getMediaStatistics(): Promise<{
    total: number;
    byType: Record<MediaType, number>;
    totalSize: number;
  }> {
    return await this.mediaRepository.getMediaStatistics();
  }

  async cleanupOrphanMedia(): Promise<number> {
    const orphanMedia = await this.mediaRepository.findOrphanMedia();
    
    for (const media of orphanMedia) {
      await this.mediaRepository.delete(media.id);
    }

    return orphanMedia.length;
  }

  // Helper methods
  private detectMediaType(fileUrl: string): MediaType {
    const extension = fileUrl.split(".").pop()?.toLowerCase() || "";

    const imageExtensions = ["jpg", "jpeg", "png", "gif", "webp", "svg", "bmp", "ico"];
    const videoExtensions = ["mp4", "webm", "ogg", "mov", "avi", "wmv", "flv", "mkv"];
    const audioExtensions = ["mp3", "wav", "ogg", "m4a", "flac", "aac"];
    const documentExtensions = ["pdf", "doc", "docx", "xls", "xlsx", "ppt", "pptx", "txt"];

    if (imageExtensions.includes(extension)) {
      return MediaType.IMAGE;
    } else if (videoExtensions.includes(extension)) {
      return MediaType.VIDEO;
    } else if (audioExtensions.includes(extension)) {
      return MediaType.AUDIO;
    } else if (documentExtensions.includes(extension)) {
      return MediaType.DOCUMENT;
    } else {
      return MediaType.OTHER;
    }
  }

  private extractFileName(fileUrl: string): string {
    const parts = fileUrl.split("/");
    return parts[parts.length - 1] || "unknown";
  }
}

