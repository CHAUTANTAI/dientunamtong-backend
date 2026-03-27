import { Request, Response } from 'express';
import { AppDataSource } from '../../config/database';
import { Profile } from '../../entities/Profile';
import { getStoragePublicBaseUrl } from '@config/env';

export const getSystemInfo = async (req: Request, res: Response): Promise<void> => {
  try {
    if (process.env.DEBUG_STORAGE === '1') {
      console.log(
        '[storage:system-info] storage_public_base_url =',
        getStoragePublicBaseUrl()
      );
    }
    const profileRepository = AppDataSource.getRepository(Profile);
    
    const profile = await profileRepository.findOne({
      where: { is_active: true },
      select: ['company_name', 'phone', 'email', 'address', 'logo', 'about_us', 'google_maps_embed', 'business_hours']
    });

    if (!profile) {
      res.status(404).json({
        success: false,
        message: 'System info not found',
      });
      return;
    }

    res.json({
      success: true,
      data: {
        company_name: profile.company_name,
        company_logo: profile.logo,
        phone: profile.phone,
        email: profile.email,
        address: profile.address,
        about_us: profile.about_us,
        google_maps_embed: profile.google_maps_embed,
        business_hours: profile.business_hours,
        /** Direct R2 URL or `/api/public/storage` proxy base — no trailing slash */
        storage_public_base_url: getStoragePublicBaseUrl(),
      },
    });
  } catch (error) {
    console.error('Get system info error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch system info',
    });
  }
};
