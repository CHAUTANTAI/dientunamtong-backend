import { Router } from "express";
import { AuthController } from "@controllers/AuthController";
import { validate, authenticate } from "@middlewares/index";
import { loginValidator } from "@/utils/validators";

const router = Router();
const authController = new AuthController();

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post("/login", validate(loginValidator), authController.login);

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

