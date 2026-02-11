import jwt, { SignOptions } from "jsonwebtoken";
import { ProfileRepository } from "@repositories/ProfileRepository";
import { LoginDto, AuthResponseDto } from "@/types/dtos";
import { UnauthorizedError, NotFoundError } from "@/types/responses";
import { ENV } from "@config/env";
import { UserRole } from "@entities/Profile";

export class AuthService {
  private profileRepository: ProfileRepository;

  constructor() {
    this.profileRepository = new ProfileRepository();
  }

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const { username, password } = loginDto;

    // Find user by username (with password field)
    const user = await this.profileRepository.findByUsername(username);

    if (!user) {
      throw new NotFoundError("Invalid username or password");
    }

    if (!user.is_active) {
      throw new UnauthorizedError("Account is inactive");
    }

    // Compare password
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      throw new UnauthorizedError("Invalid username or password");
    }

    // Generate JWT token
    const token = this.generateToken(user.id, user.username, user.role);

    return {
      success: true,
      token,
      user: {
        id: user.id,
        username: user.username,
        company_name: user.company_name,
        email: user.email,
        role: user.role,
      },
    };
  }

  generateToken(userId: string, username: string, role: UserRole): string {
    return jwt.sign(
      {
        userId,
        username,
        role,
      },
      ENV.JWT_SECRET,
      {
        expiresIn: ENV.JWT_EXPIRES_IN,
      } as SignOptions
    );
  }

  verifyToken(token: string): any {
    try {
      return jwt.verify(token, ENV.JWT_SECRET);
    } catch (error) {
      throw new UnauthorizedError("Invalid or expired token");
    }
  }
}

