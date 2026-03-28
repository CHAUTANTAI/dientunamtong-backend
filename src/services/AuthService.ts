import jwt, { SignOptions } from "jsonwebtoken";
import crypto from "crypto";
import { ProfileRepository } from "@repositories/ProfileRepository";
import { RefreshTokenRepository } from "@repositories/RefreshTokenRepository";
import { LoginDto, AuthResponseDto } from "@/types/dtos";
import { UnauthorizedError, NotFoundError } from "@/types/responses";
import { ENV } from "@config/env";
import { UserRole } from "@entities/Profile";

const refreshTokenRepo = new RefreshTokenRepository();

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

    // Create refresh token (opaque) and store hash in DB
    const refreshTokenPlain = crypto.randomBytes(64).toString("hex");
    const hash = crypto.createHash("sha256").update(refreshTokenPlain).digest("hex");
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30); // 30 days

    await refreshTokenRepo.create({
      user: user as any,
      token_hash: hash,
      device_info: loginDto.deviceName || null,
      ip: null,
      user_agent: null,
      expires_at: expiresAt,
      revoked: false,
    } as any);

    return {
      success: true,
      token,
      refreshToken: refreshTokenPlain,
      user: {
        id: user.id,
        username: user.username,
        company_name: user.company_name,
        email: user.email,
        role: user.role,
      },
    } as any;
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

  /**
   * Rotate refresh token and issue a new access token.
   * Returns { token, refreshToken (plain), user }
   */
  async refresh(refreshTokenPlain: string, meta?: { ip?: string | null; userAgent?: string | null }) {
    const hash = crypto.createHash("sha256").update(refreshTokenPlain).digest("hex");

    const existing = await refreshTokenRepo.findByHash(hash);

    if (!existing) {
      throw new UnauthorizedError("Invalid refresh token");
    }

    // Check revoked / expired
    if (existing.revoked) {
      throw new UnauthorizedError("Refresh token revoked");
    }

    if (existing.expires_at.getTime() < Date.now()) {
      throw new UnauthorizedError("Refresh token expired");
    }

    const user = existing.user;

    // Rotate: create a new refresh token record and revoke the old one
    const newPlain = crypto.randomBytes(64).toString("hex");
    const newHash = crypto.createHash("sha256").update(newPlain).digest("hex");
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);

    const newRecord = await refreshTokenRepo.create({
      user: user as any,
      token_hash: newHash,
      device_info: existing.device_info ?? null,
      ip: meta?.ip ?? null,
      user_agent: meta?.userAgent ?? null,
      expires_at: expiresAt,
      revoked: false,
    } as any);

    // Mark old as revoked and link to new
    await refreshTokenRepo.update(existing.id, { revoked: true, replaced_by: newRecord.id } as any);

    const token = this.generateToken(user.id, user.username, user.role);

    return {
      token,
      refreshToken: newPlain,
      user: {
        id: user.id,
        username: user.username,
        company_name: user.company_name,
        email: user.email,
        role: user.role,
      },
    } as any;
  }
}

