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

      const banner = await this.bannerRepository.findOne({ where: { id } });
      if (!banner) {
        res.status(404).json({ message: 'Banner not found' });
        return;
      }

      // Verify new media exists if updating
      if (media_id && media_id !== banner.media_id) {
        const media = await this.mediaRepository.findOne({ where: { id: media_id } });
        if (!media) {
          res.status(404).json({ message: 'Media not found' });
          return;
        }
      }

      // Update fields
      if (media_id !== undefined) banner.media_id = media_id;
      if (title !== undefined) banner.title = title || null;
      if (link_url !== undefined) banner.link_url = link_url || null;
      if (sort_order !== undefined) banner.sort_order = sort_order;
      if (is_active !== undefined) banner.is_active = is_active;

      await this.bannerRepository.save(banner);

      // Fetch with relations
      const updated = await this.bannerRepository.findOne({
        where: { id },
      });

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
      });

      if (!banner) {
        res.status(404).json({ message: 'Banner not found' });
        return;
      }

      // Delete banner (CASCADE will handle media via FK)
      await this.bannerRepository.remove(banner);

      // Delete media file from Supabase
      if (banner.media?.file_url) {
        try {
          await deleteFile(banner.media.file_url);
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
