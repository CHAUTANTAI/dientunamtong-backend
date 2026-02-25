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

// ============= Specific routes FIRST (most specific to least specific) =============

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
  (req, res, next) => {
    console.log("🎯 POST /:id/media route HIT!", {
      params: req.params,
      body: req.body,
      path: req.path,
      url: req.url,
    });
    next();
  },
  authenticate,
  authorize(UserRole.ADMIN),
  validate(productIdValidator),
  productController.addProductMedia
);

/**
 * @route   DELETE /api/admin/product/:id/media/all
 * @desc    Remove all media from product
 * @access  Private (Admin)
 */
adminRouter.delete(
  "/:id/media/all",
  authenticate,
  authorize(UserRole.ADMIN),
  validate(productIdValidator),
  productController.removeAllProductMedia
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

// ============= Generic Product CRUD Routes (LAST) =============

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

export default router;
export { adminRouter };

