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
 * @route   GET /api/product/featured
 * @desc    Get featured products
 * @access  Public
 */
router.get("/featured", productController.getFeaturedProducts);

/**
 * @route   GET /api/product/tags
 * @desc    Get all product tags
 * @access  Public
 */
router.get("/tags", productController.getAllTags);

/**
 * @route   GET /api/product/tag/:tag
 * @desc    Get products by tag
 * @access  Public
 */
router.get("/tag/:tag", productController.getProductsByTag);

/**
 * @route   GET /api/product/category/:slug
 * @desc    Get products by category slug
 * @access  Public
 */
router.get("/category/:slug", productController.getProductsByCategorySlug);

/**
 * @route   GET /api/product/slug/:slug
 * @desc    Get product by slug
 * @access  Public
 */
router.get("/slug/:slug", productController.getProductBySlug);

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

/**
 * @route   GET /api/product/:id/related
 * @desc    Get related products
 * @access  Public
 */
router.get(
  "/:id/related",
  validate(productIdValidator),
  productController.getRelatedProducts
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
 * @route   GET /api/admin/product/featured
 * @desc    Get featured products
 * @access  Private (Admin)
 */
adminRouter.get(
  "/featured",
  authenticate,
  authorize(UserRole.ADMIN),
  productController.getFeaturedProducts
);

/**
 * @route   GET /api/admin/product/tags
 * @desc    Get all product tags
 * @access  Private (Admin)
 */
adminRouter.get(
  "/tags",
  authenticate,
  authorize(UserRole.ADMIN),
  productController.getAllTags
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
 * @route   GET /api/admin/product/:id/related
 * @desc    Get related products
 * @access  Private (Admin)
 */
adminRouter.get(
  "/:id/related",
  authenticate,
  authorize(UserRole.ADMIN),
  validate(productIdValidator),
  productController.getRelatedProducts
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
 * @route   DELETE /api/admin/product/:id/permanent
 * @desc    Permanently delete product
 * @access  Private (Admin)
 */
adminRouter.delete(
  "/:id/permanent",
  authenticate,
  authorize(UserRole.ADMIN),
  validate(productIdValidator),
  productController.hardDeleteProduct
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

// ============= Media Management Routes =============

/**
 * @route   GET /api/admin/product/:id/media
 * @desc    Get all media for a product
 * @access  Private (Admin)
 */
adminRouter.get(
  "/:id/media",
  authenticate,
  authorize(UserRole.ADMIN),
  validate(productIdValidator),
  productController.getProductMedia
);

/**
 * @route   POST /api/admin/product/:id/media
 * @desc    Add media to product (max 9 images + 1 video)
 * @access  Private (Admin)
 */
adminRouter.post(
  "/:id/media",
  authenticate,
  authorize(UserRole.ADMIN),
  validate(productIdValidator),
  productController.addProductMedia
);

/**
 * @route   DELETE /api/admin/product/media/:mediaId
 * @desc    Remove media from product
 * @access  Private (Admin)
 */
adminRouter.delete(
  "/media/:mediaId",
  authenticate,
  authorize(UserRole.ADMIN),
  productController.removeProductMedia
);

/**
 * @route   PATCH /api/admin/product/media/:mediaId/sort-order
 * @desc    Update media sort order
 * @access  Private (Admin)
 */
adminRouter.patch(
  "/media/:mediaId/sort-order",
  authenticate,
  authorize(UserRole.ADMIN),
  productController.updateMediaSortOrder
);

export default router;
export { adminRouter };

