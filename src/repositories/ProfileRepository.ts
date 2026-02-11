import { BaseRepository } from "./BaseRepository";
import { Profile } from "@entities/Profile";

export class ProfileRepository extends BaseRepository<Profile> {
  constructor() {
    super(Profile);
  }

  async findByUsername(username: string): Promise<Profile | null> {
    return await this.repository.findOne({
      where: { username },
      select: [
        "id",
        "username",
        "password",
        "role",
        "company_name",
        "email",
        "phone",
        "address",
        "logo",
        "is_active",
        "created_at",
        "updated_at",
      ],
    });
  }

  async findActiveProfile(): Promise<Profile | null> {
    return await this.repository.findOne({
      where: { is_active: true },
      order: { created_at: "ASC" },
    });
  }

  async getPublicProfile(): Promise<Partial<Profile> | null> {
    const profile = await this.findActiveProfile();
    if (!profile) return null;

    // Return only public fields
    return {
      id: profile.id,
      company_name: profile.company_name,
      phone: profile.phone,
      address: profile.address,
      email: profile.email,
      logo: profile.logo,
    };
  }
}

