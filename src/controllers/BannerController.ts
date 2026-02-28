import { Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { Banner } from '../entities/Banner';
import { Media } from '../entities/Media';
import { deleteFile } from '../config/supabase';

export class BannerController {
  private bannerRepository = AppDataSource.getRepository(Banner);
  private mediaRepository = AppDataSource.getRepository(Media);

  // Get all banners (Admin)
  getAllBanners = async (req: Request, res: Response): Promise<void> => {
    try {
      const banners = await this.bannerRepository.find({
        order: { sort_order: 'ASC', created_at: 'DESC' },
      });

      res.json(banners);
    } catch (error) {
      console.error('Get banners error:', error);
      res.status(500).json({ message: 'Failed to fetch banners' });
    }
  };

  // Get available sort_order values
  getAvailableSortOrders = async (req: Request, res: Response): Promise<void> => {
    try {
      const { excludeId } = req.query;

      // Get max_banners from profile
      const { Profile } = await import('../entities/Profile');
      const profileRepository = AppDataSource.getRepository(Profile);
      const profile = await profileRepository.findOne({ where: { is_active: true } });
      const maxBanners = profile?.max_banners || 6;

      // Get all current banners
      const banners = await this.bannerRepository.find({
        select: ['id', 'sort_order'],
      });

      // Get used sort_orders (excluding the banner being edited)
      const usedSortOrders = banners
        .filter(b => b.id !== excludeId)
        .map(b => b.sort_order);

      // Generate available options (0 to maxBanners-1)
      const availableSortOrders: number[] = [];
      for (let i = 0; i < maxBanners; i++) {
        if (!usedSortOrders.includes(i)) {
          availableSortOrders.push(i);
        }
      }

      // Calculate default value (max + 1, or first available)
      const maxSortOrder = banners.length > 0 
        ? Math.max(...banners.map(b => b.sort_order))
        : -1;
      const defaultValue = Math.min(maxSortOrder + 1, maxBanners - 1);

      res.json({
        available: availableSortOrders,
        default: availableSortOrders.includes(defaultValue) 
          ? defaultValue 
          : availableSortOrders[0] || 0,
        maxBanners,
      });
    } catch (error) {
      console.error('Get available sort orders error:', error);
      res.status(500).json({ message: 'Failed to fetch available sort orders' });
    }
  };

  // Get active banners only (Public - for Client)
  getPublicBanners = async (req: Request, res: Response): Promise<void> => {
    try {
      const banners = await this.bannerRepository.find({
        where: { is_active: true },
        order: { sort_order: 'ASC' },
      });

      res.json(banners);
    } catch (error) {
      console.error('Get public banners error:', error);
      res.status(500).json({ message: 'Failed to fetch banners' });
    }
  };

  // Get banner by ID
  getBannerById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      const banner = await this.bannerRepository.findOne({
        where: { id },
      });

      if (!banner) {
        res.status(404).json({ message: 'Banner not found' });
        return;
      }

      res.json(banner);
    } catch (error) {
      console.error('Get banner error:', error);
      res.status(500).json({ message: 'Failed to fetch banner' });
    }
  };

  // Create banner
  createBanner = async (req: Request, res: Response): Promise<void> => {
    try {
      const { media_id, title, link_url, sort_order, is_active } = req.body;

      // Get max_banners from profile
      const { Profile } = await import('../entities/Profile');
      const profileRepository = AppDataSource.getRepository(Profile);
      const profile = await profileRepository.findOne({ where: { is_active: true } });
      const maxBanners = profile?.max_banners || 6;

      // Validate max banners from profile
      const count = await this.bannerRepository.count();
      if (count >= maxBanners) {
        res.status(400).json({ message: `Maximum ${maxBanners} banners allowed` });
        return;
      }

      // Verify media exists
      const media = await this.mediaRepository.findOne({ where: { id: media_id } });
      if (!media) {
        res.status(404).json({ message: 'Media not found' });
        return;
      }

      // Auto-assign sort_order if not provided
      let finalSortOrder = sort_order;
      if (finalSortOrder === undefined) {
        const maxBanner = await this.bannerRepository.findOne({
          order: { sort_order: 'DESC' },
        });
        finalSortOrder = maxBanner ? maxBanner.sort_order + 1 : 0;
        if (finalSortOrder > 5) finalSortOrder = 5;
      }

      const banner = this.bannerRepository.create({
        media_id,
        title: title || null,
        link_url: link_url || null,
        sort_order: finalSortOrder,
        is_active: is_active !== undefined ? is_active : true,
      });

      await this.bannerRepository.save(banner);

      // Fetch with relations
      const created = await this.bannerRepository.findOne({
        where: { id: banner.id },
      });

      res.status(201).json(created);
    } catch (error) {
      console.error('Create banner error:', error);
      res.status(500).json({ message: 'Failed to create banner' });
    }
  };

  // Update banner
  updateBanner = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { media_id, title, link_url, sort_order, is_active } = req.body;

      console.log('📝 Update banner request:', { id, media_id, title, link_url, sort_order, is_active });

      const banner = await this.bannerRepository.findOne({ 
        where: { id },
        relations: ['media']
      });
      if (!banner) {
        res.status(404).json({ message: 'Banner not found' });
        return;
      }

      console.log('📦 Current banner media_id:', banner.media_id);

      // Store old media for cleanup if media_id is changing
      let oldMedia: Media | null = null;
      if (media_id && media_id !== banner.media_id) {
        console.log('🔄 Media is changing from', banner.media_id, 'to', media_id);
        
        // Verify new media exists
        const newMedia = await this.mediaRepository.findOne({ where: { id: media_id } });
        if (!newMedia) {
          res.status(404).json({ message: 'Media not found' });
          return;
        }

        // Get old media for deletion
        if (banner.media_id) {
          oldMedia = await this.mediaRepository.findOne({ 
            where: { id: banner.media_id }
          });
          console.log('🗑️ Old media to delete:', oldMedia?.id, oldMedia?.file_url);
        }
      } else {
        console.log('ℹ️ Media not changing');
      }

      // Build update object
      const updateData: Partial<Banner> = {};
      if (media_id !== undefined) updateData.media_id = media_id;
      if (title !== undefined) updateData.title = title || null;
      if (link_url !== undefined) updateData.link_url = link_url || null;
      if (sort_order !== undefined) updateData.sort_order = sort_order;
      if (is_active !== undefined) updateData.is_active = is_active;

      console.log('💾 Updating banner with data:', updateData);

      // Use QueryBuilder to force update all fields
      await this.bannerRepository
        .createQueryBuilder()
        .update(Banner)
        .set(updateData)
        .where('id = :id', { id })
        .execute();

      console.log('✅ Banner updated successfully');

      // Delete old media if it was replaced
      if (oldMedia) {
        try {
          console.log('🗑️ Deleting old media from storage:', oldMedia.file_url);
          // Delete file from Supabase Storage
          if (oldMedia.file_url) {
            await deleteFile('content', [oldMedia.file_url]);
          }
          console.log('🗑️ Deleting old media record from DB:', oldMedia.id);
          // Delete media record from DB
          await this.mediaRepository.remove(oldMedia);
          console.log('✅ Old media deleted successfully');
        } catch (error) {
          console.warn('❌ Failed to delete old media:', error);
          // Continue even if cleanup fails
        }
      }

      // Fetch with relations
      const updated = await this.bannerRepository.findOne({
        where: { id },
        relations: ['media']
      });

      console.log('✅ Final banner media_id:', updated?.media_id);
      res.json(updated);
    } catch (error) {
      console.error('Update banner error:', error);
      res.status(500).json({ message: 'Failed to update banner' });
    }
  };

  // Delete banner
  deleteBanner = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      const banner = await this.bannerRepository.findOne({
        where: { id },
        relations: ['media']
      });

      if (!banner) {
        res.status(404).json({ message: 'Banner not found' });
        return;
      }

      // Store media info before deleting banner
      const mediaToDelete = banner.media;
      const mediaId = banner.media_id;

      // Delete banner first
      await this.bannerRepository.remove(banner);

      // Delete media record from DB
      if (mediaId) {
        try {
          const media = await this.mediaRepository.findOne({ where: { id: mediaId } });
          if (media) {
            await this.mediaRepository.remove(media);
          }
        } catch (error) {
          console.warn('Failed to delete media record from DB:', error);
        }
      }

      // Delete media file from Supabase Storage
      if (mediaToDelete?.file_url) {
        try {
          await deleteFile('content', [mediaToDelete.file_url]);
        } catch (error) {
          console.warn('Failed to delete media file from Supabase:', error);
          // Continue even if file deletion fails
        }
      }

      res.json({ message: 'Banner deleted successfully' });
    } catch (error) {
      console.error('Delete banner error:', error);
      res.status(500).json({ message: 'Failed to delete banner' });
    }
  };
}
