import { Router } from "express";
import { AuthController } from "@controllers/AuthController";
import { validate, authenticate } from "@middlewares/index";
import { loginValidator } from "@/utils/validators";

import cookieParser from "cookie-parser";

const router = Router();
const authController = new AuthController();

// parse cookies for refresh endpoint
router.use(cookieParser());

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post("/login", validate(loginValidator), authController.login);

/**
 * @route   POST /api/auth/refresh
 * @desc    Refresh access token using HttpOnly refresh cookie
 * @access  Public (cookie-based)
 */
router.post("/refresh", authController.refresh);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user
 * @access  Private
 */
router.post("/logout", authenticate, authController.logout);

/**
 * @route   GET /api/auth/me
 * @desc    Get current user info
 * @access  Private
 */
router.get("/me", authenticate, authController.me);

export default router;

