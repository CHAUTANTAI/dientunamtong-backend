import { Router } from "express";
import { CategoryController } from "@controllers/CategoryController";
import { authenticate, authorize, validate } from "@middlewares/index";
import {
  createCategoryValidator,
  updateCategoryValidator,
  categoryIdValidator,
} from "@/utils/validators";
import { UserRole } from "@entities/Profile";

const router = Router();
const adminRouter = Router();
const categoryController = new CategoryController();

// ============= Public Routes =============
/**
 * @route   GET /api/category
 * @desc    Get all active categories
 * @access  Public
 */
router.get("/", categoryController.getAllCategories);

// ============= Admin Routes =============
/**
 * @route   GET /api/admin/category
 * @desc    Get all categories
 * @access  Private (Admin)
 */
adminRouter.get(
  "/",
  authenticate,
  authorize(UserRole.ADMIN),
  categoryController.getAllCategories
);

/**
 * @route   GET /api/admin/category/:id
 * @desc    Get category by ID
 * @access  Private (Admin)
 */
adminRouter.get(
  "/:id",
  authenticate,
  authorize(UserRole.ADMIN),
  validate(categoryIdValidator),
  categoryController.getCategoryById
);

/**
 * @route   POST /api/admin/category
 * @desc    Create new category
 * @access  Private (Admin)
 */
adminRouter.post(
  "/",
  authenticate,
  authorize(UserRole.ADMIN),
  validate(createCategoryValidator),
  categoryController.createCategory
);

/**
 * @route   PUT /api/admin/category/:id
 * @desc    Update category
 * @access  Private (Admin)
 */
adminRouter.put(
  "/:id",
  authenticate,
  authorize(UserRole.ADMIN),
  validate(updateCategoryValidator),
  categoryController.updateCategory
);

/**
 * @route   DELETE /api/admin/category/:id
 * @desc    Delete category (soft delete)
 * @access  Private (Admin)
 */
adminRouter.delete(
  "/:id",
  authenticate,
  authorize(UserRole.ADMIN),
  validate(categoryIdValidator),
  categoryController.deleteCategory
);

export default router;
export { adminRouter };

