import { Router } from "express";
import { ProfileController } from "@controllers/ProfileController";
import { authenticate, authorize, validate } from "@middlewares/index";
import {
  updateProfileValidator,
  updatePasswordValidator,
} from "@/utils/validators";
import { UserRole } from "@entities/Profile";

const router = Router();
const adminRouter = Router();
const profileController = new ProfileController();

// ============= Public Routes =============
/**
 * @route   GET /api/profile
 * @desc    Get public profile (company info)
 * @access  Public
 */
router.get("/", profileController.getPublicProfile);

// ============= Admin Routes =============
/**
 * @route   GET /api/admin/profile
 * @desc    Get full profile
 * @access  Private (Admin)
 */
adminRouter.get(
  "/",
  authenticate,
  authorize(UserRole.ADMIN),
  profileController.getProfile
);

/**
 * @route   PUT /api/admin/profile
 * @desc    Update profile
 * @access  Private (Admin)
 */
adminRouter.put(
  "/",
  authenticate,
  authorize(UserRole.ADMIN),
  validate(updateProfileValidator),
  profileController.updateProfile
);

/**
 * @route   PUT /api/admin/profile/password
 * @desc    Update password
 * @access  Private (Admin)
 */
adminRouter.put(
  "/password",
  authenticate,
  authorize(UserRole.ADMIN),
  validate(updatePasswordValidator),
  profileController.updatePassword
);

export default router;
export { adminRouter };

