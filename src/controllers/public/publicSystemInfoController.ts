import { Request, Response } from 'express';
import { AppDataSource } from '../../config/database';
import { Profile } from '../../entities/Profile';

export const getSystemInfo = async (req: Request, res: Response): Promise<void> => {
  try {
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
