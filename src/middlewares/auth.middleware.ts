import { Request, Response, NextFunction } from "express";
import { AuthService } from "@services/AuthService";
import { ProfileRepository } from "@repositories/ProfileRepository";
import { UnauthorizedError, ForbiddenError } from "@/types/responses";
import { UserRole } from "@entities/Profile";

const authService = new AuthService();
const profileRepository = new ProfileRepository();

/**
 * Middleware to verify JWT token and attach user to request
 */
export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new UnauthorizedError("No token provided");
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token
    const decoded = authService.verifyToken(token);

    // Get user from database
    const user = await profileRepository.findById(decoded.userId);

    if (!user) {
      throw new UnauthorizedError("User not found");
    }

    if (!user.is_active) {
      throw new UnauthorizedError("User account is inactive");
    }

    // Attach user to request
    req.user = user;
    req.userId = user.id;

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware to check if user has required role
 */
export const authorize = (...allowedRoles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      if (!req.user) {
        throw new UnauthorizedError("Authentication required");
      }

      const hasRole = allowedRoles.includes(req.user.role);

      if (!hasRole) {
        throw new ForbiddenError(
          "You do not have permission to access this resource"
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Optional authentication - doesn't throw error if no token
 */
export const optionalAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.substring(7);
      const decoded = authService.verifyToken(token);
      const user = await profileRepository.findById(decoded.userId);

      if (user && user.is_active) {
        req.user = user;
        req.userId = user.id;
      }
    }

    next();
  } catch (error) {
    // Silently fail for optional auth
    next();
  }
};

