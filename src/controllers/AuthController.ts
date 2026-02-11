import { Request, Response, NextFunction } from "express";
import { AuthService } from "@services/AuthService";
import { LoginDto } from "@/types/dtos";
import { ApiResponse } from "@/types/responses";

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

