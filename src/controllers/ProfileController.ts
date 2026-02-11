import { Request, Response, NextFunction } from "express";
import { ProfileService } from "@services/ProfileService";
import { UpdateProfileDto, UpdatePasswordDto } from "@/types/dtos";
import { ApiResponse } from "@/types/responses";

export class ProfileController {
  private profileService: ProfileService;

  constructor() {
    this.profileService = new ProfileService();
  }

  getProfile = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const profile = await this.profileService.getProfile();

      const response: ApiResponse = {
        success: true,
        data: profile,
        statusCode: 200,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  getPublicProfile = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const profile = await this.profileService.getPublicProfile();

      const response: ApiResponse = {
        success: true,
        data: profile,
        statusCode: 200,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  updateProfile = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const updateDto: UpdateProfileDto = req.body;
      const profile = await this.profileService.updateProfile(updateDto);

      const response: ApiResponse = {
        success: true,
        data: profile,
        message: "Profile updated successfully",
        statusCode: 200,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  updatePassword = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const updatePasswordDto: UpdatePasswordDto = req.body;
      const userId = req.userId!;

      await this.profileService.updatePassword(userId, updatePasswordDto);

      const response: ApiResponse = {
        success: true,
        message: "Password updated successfully",
        statusCode: 200,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };
}

