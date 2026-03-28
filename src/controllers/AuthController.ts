import { Request, Response, NextFunction } from "express";
import { AuthService } from "@services/AuthService";
import { LoginDto } from "@/types/dtos";
import { ApiResponse } from "@/types/responses";
import { ENV } from "@config/env";

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  login = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const loginDto: LoginDto = req.body;
      const result = await this.authService.login(loginDto);

      // Set refresh token cookie if present
      if (result.refreshToken) {
        // httpOnly cookie
        if (ENV.NODE_ENV !== "production") {
          // eslint-disable-next-line no-console
          console.log(`AuthController.login: issuing refresh cookie for user=${result.user?.id ?? 'unknown'}`);
        }
        res.cookie("refresh_token", result.refreshToken, {
          httpOnly: true,
          secure: ENV.NODE_ENV === "production",
          // In production we require cross-site cookies for SPA <-> API, so use 'none' with secure
          sameSite: ENV.NODE_ENV === "production" ? "none" : "lax",
          path: "/",
          maxAge: 1000 * 60 * 60 * 24 * 30, // 30 days
        });
        // Do not expose refresh token in body
        delete result.refreshToken;
      }

      const response: ApiResponse = {
        success: true,
        data: result,
        statusCode: 200,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Refresh access token using refresh cookie. Rotates refresh token.
   */
  refresh = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const refreshTokenPlain = req.cookies?.refresh_token;
      if (ENV.NODE_ENV !== "production") {
        // eslint-disable-next-line no-console
        console.log('AuthController.refresh: refresh_token cookie present:', !!refreshTokenPlain);
      }

      if (!refreshTokenPlain) {
        const response = { success: false, message: 'No refresh token', statusCode: 401 };
        res.status(401).json(response);
        return;
      }

      const meta = {
        ip: req.ip,
        userAgent: req.get('user-agent') || null,
      };

      const data = await this.authService.refresh(refreshTokenPlain, meta as any);

      // If service returned a rotated refresh token, set it as cookie
      if ((data as any).refreshToken) {
        if (ENV.NODE_ENV !== "production") {
          // eslint-disable-next-line no-console
          console.log('AuthController.refresh: rotating refresh token for user=', (data as any).user?.id ?? 'unknown');
        }
        res.cookie('refresh_token', (data as any).refreshToken, {
          httpOnly: true,
          secure: ENV.NODE_ENV === 'production',
          sameSite: ENV.NODE_ENV === 'production' ? 'none' : 'lax',
          path: '/',
          maxAge: 1000 * 60 * 60 * 24 * 30,
        });
        // do not expose plaintext refresh token
        delete (data as any).refreshToken;
      }

      const response = {
        success: true,
        data,
        statusCode: 200,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  logout = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      // Client-side will remove token, just send success response
      const response: ApiResponse = {
        success: true,
        message: "Logged out successfully",
        statusCode: 200,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  me = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      // User is already attached by authenticate middleware
      const user = req.user;

      const response: ApiResponse = {
        success: true,
        data: {
          id: user!.id,
          username: user!.username,
          company_name: user!.company_name,
          email: user!.email,
          role: user!.role,
        },
        statusCode: 200,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };
}

