import { Router } from "express";
import { ProductController } from "@controllers/ProductController";
import { authenticate, authorize, validate } from "@middlewares/index";
import {
  createProductValidator,
  updateProductValidator,
  productIdValidator,
  productCategoriesValidator,
} from "@/utils/validators";
import { UserRole } from "@entities/Profile";

const router = Router();
const adminRouter = Router();
const productController = new ProductController();

// ============= Public Routes =============
/**
 * @route   GET /api/product
 * @desc    Get all active products with filters
 * @access  Public
 */
router.get("/", productController.getAllProducts);

/**
 * @route   GET /api/product/:id
 * @desc    Get product by ID
 * @access  Public
 */
router.get(
  "/:id",
  validate(productIdValidator),
  productController.getProductById
);

// ============= Admin Routes =============
/**
 * @route   GET /api/admin/product
 * @desc    Get all products (including inactive)
 * @access  Private (Admin)
 */
adminRouter.get(
  "/",
  authenticate,
  authorize(UserRole.ADMIN),
  productController.getAllProducts
);

/**
 * @route   GET /api/admin/product/:id
 * @desc    Get product by ID
 * @access  Private (Admin)
 */
adminRouter.get(
  "/:id",
  authenticate,
  authorize(UserRole.ADMIN),
  validate(productIdValidator),
  productController.getProductById
);

/**
 * @route   POST /api/admin/product
 * @desc    Create new product
 * @access  Private (Admin)
 */
adminRouter.post(
  "/",
  authenticate,
  authorize(UserRole.ADMIN),
  validate(createProductValidator),
  productController.createProduct
);

/**
 * @route   PUT /api/admin/product/:id
 * @desc    Update product
 * @access  Private (Admin)
 */
adminRouter.put(
  "/:id",
  authenticate,
  authorize(UserRole.ADMIN),
  validate(updateProductValidator),
  productController.updateProduct
);

/**
 * @route   DELETE /api/admin/product/:id
 * @desc    Delete product (soft delete)
 * @access  Private (Admin)
 */
adminRouter.delete(
  "/:id",
  authenticate,
  authorize(UserRole.ADMIN),
  validate(productIdValidator),
  productController.deleteProduct
);

/**
 * @route   PUT /api/admin/product/:id/category
 * @desc    Update product categories
 * @access  Private (Admin)
 */
adminRouter.put(
  "/:id/category",
  authenticate,
  authorize(UserRole.ADMIN),
  validate(productCategoriesValidator),
  productController.updateProductCategories
);

export default router;
export { adminRouter };

