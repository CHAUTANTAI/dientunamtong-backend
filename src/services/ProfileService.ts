import bcrypt from "bcrypt";
import { ProfileRepository } from "@repositories/ProfileRepository";
import { Profile } from "@entities/Profile";
import { UpdateProfileDto, UpdatePasswordDto } from "@/types/dtos";
import { NotFoundError, ValidationError, UnauthorizedError } from "@/types/responses";

export class ProfileService {
  private profileRepository: ProfileRepository;

  constructor() {
    this.profileRepository = new ProfileRepository();
  }

  async getProfile(): Promise<Profile> {
    const profile = await this.profileRepository.findActiveProfile();
    
    if (!profile) {
      throw new NotFoundError("Profile not found");
    }

    return profile;
  }

  async getPublicProfile(): Promise<Partial<Profile>> {
    const profile = await this.profileRepository.getPublicProfile();
    
    if (!profile) {
      throw new NotFoundError("Profile not found");
    }

    return profile;
  }

  async updateProfile(updateDto: UpdateProfileDto): Promise<Profile> {
    const profile = await this.profileRepository.findActiveProfile();
    
    if (!profile) {
      throw new NotFoundError("Profile not found");
    }

    const updatedProfile = await this.profileRepository.update(
      profile.id,
      updateDto
    );
    
    if (!updatedProfile) {
      throw new Error("Failed to update profile");
    }

    return updatedProfile;
  }

  async updatePassword(
    userId: string,
    updatePasswordDto: UpdatePasswordDto
  ): Promise<void> {
    const { currentPassword, newPassword } = updatePasswordDto;

    // Find user with password
    const user = await this.profileRepository.findById(userId);
    
    if (!user) {
      throw new NotFoundError("User not found");
    }

    // Get user with password field
    const userWithPassword = await this.profileRepository.findByUsername(
      user.username
    );

    if (!userWithPassword) {
      throw new NotFoundError("User not found");
    }

    // Verify current password
    const isPasswordValid = await userWithPassword.comparePassword(
      currentPassword
    );

    if (!isPasswordValid) {
      throw new UnauthorizedError("Current password is incorrect");
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await this.profileRepository.update(userId, {
      password: hashedPassword,
    } as any);
  }
}

