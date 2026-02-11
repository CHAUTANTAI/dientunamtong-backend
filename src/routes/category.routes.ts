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

/**
 * @route   GET /api/category/tree
 * @desc    Get full category tree
 * @access  Public
 */
router.get("/tree", categoryController.getFullCategoryTree);

/**
 * @route   GET /api/category/roots
 * @desc    Get root categories
 * @access  Public
 */
router.get("/roots", categoryController.getRootCategories);

/**
 * @route   GET /api/category/search
 * @desc    Search categories
 * @access  Public
 */
router.get("/search", categoryController.searchCategories);

/**
 * @route   GET /api/category/slug/:slug
 * @desc    Get category by slug
 * @access  Public
 */
router.get("/slug/:slug", categoryController.getCategoryBySlug);

/**
 * @route   GET /api/category/:id
 * @desc    Get category by ID
 * @access  Public
 */
router.get("/:id", categoryController.getCategoryById);

/**
 * @route   GET /api/category/:id/children
 * @desc    Get children of a category
 * @access  Public
 */
router.get("/:id/children", categoryController.getChildrenOf);

/**
 * @route   GET /api/category/:id/tree
 * @desc    Get category tree starting from specific category
 * @access  Public
 */
router.get("/:id/tree", categoryController.getCategoryTree);

/**
 * @route   GET /api/category/:id/breadcrumb
 * @desc    Get breadcrumb for a category
 * @access  Public
 */
router.get("/:id/breadcrumb", categoryController.getBreadcrumb);

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
 * @route   GET /api/admin/category/tree
 * @desc    Get full category tree
 * @access  Private (Admin)
 */
adminRouter.get(
  "/tree",
  authenticate,
  authorize(UserRole.ADMIN),
  categoryController.getFullCategoryTree
);

/**
 * @route   GET /api/admin/category/search
 * @desc    Search categories
 * @access  Private (Admin)
 */
adminRouter.get(
  "/search",
  authenticate,
  authorize(UserRole.ADMIN),
  categoryController.searchCategories
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
 * @route   GET /api/admin/category/:id/children
 * @desc    Get children of a category
 * @access  Private (Admin)
 */
adminRouter.get(
  "/:id/children",
  authenticate,
  authorize(UserRole.ADMIN),
  categoryController.getChildrenOf
);

/**
 * @route   GET /api/admin/category/:id/breadcrumb
 * @desc    Get breadcrumb for a category
 * @access  Private (Admin)
 */
adminRouter.get(
  "/:id/breadcrumb",
  authenticate,
  authorize(UserRole.ADMIN),
  categoryController.getBreadcrumb
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
 * @route   PATCH /api/admin/category/:id/move
 * @desc    Move category to different parent
 * @access  Private (Admin)
 */
adminRouter.patch(
  "/:id/move",
  authenticate,
  authorize(UserRole.ADMIN),
  categoryController.moveCategory
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

/**
 * @route   DELETE /api/admin/category/:id/permanent
 * @desc    Permanently delete category
 * @access  Private (Admin)
 */
adminRouter.delete(
  "/:id/permanent",
  authenticate,
  authorize(UserRole.ADMIN),
  validate(categoryIdValidator),
  categoryController.hardDeleteCategory
);

export default router;
export { adminRouter };

