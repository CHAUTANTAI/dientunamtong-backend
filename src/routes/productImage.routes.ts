import { Router } from "express";
import { ProductImageController } from "@controllers/ProductImageController";
import {
  authenticate,
  authorize,
  validate,
  uploadSingle,
} from "@middlewares/index";
import {
  addProductImageValidator,
  updateImageSortValidator,
  imageIdValidator,
  productIdValidator,
} from "@/utils/validators";
import { UserRole } from "@entities/Profile";

const adminRouter = Router();
const uploadRouter = Router();
const productImageController = new ProductImageController();

// ============= Admin Routes =============
/**
 * @route   GET /api/admin/product/:id/images
 * @desc    Get all images for a product
 * @access  Private (Admin)
 */
adminRouter.get(
  "/:id/images",
  authenticate,
  authorize(UserRole.ADMIN),
  validate(productIdValidator),
  productImageController.getProductImages
);

/**
 * @route   POST /api/admin/product-image
 * @desc    Add product image record (image already uploaded to storage)
 * @access  Private (Admin)
 */
adminRouter.post(
  "/",
  authenticate,
  authorize(UserRole.ADMIN),
  validate(addProductImageValidator),
  productImageController.addProductImage
);

/**
 * @route   DELETE /api/admin/product-image/:imageId
 * @desc    Delete product image
 * @access  Private (Admin)
 */
adminRouter.delete(
  "/:imageId",
  authenticate,
  authorize(UserRole.ADMIN),
  validate(imageIdValidator),
  productImageController.deleteProductImage
);

/**
 * @route   PUT /api/admin/product-image/:imageId/sort
 * @desc    Update image sort order
 * @access  Private (Admin)
 */
adminRouter.put(
  "/:imageId/sort",
  authenticate,
  authorize(UserRole.ADMIN),
  validate(updateImageSortValidator),
  productImageController.updateImageSortOrder
);

// ============= Upload Route (Legacy) =============
/**
 * @route   POST /api/admin/product/:id/image
 * @desc    Upload product image (legacy endpoint)
 * @access  Private (Admin)
 */
uploadRouter.post(
  "/:id/image",
  authenticate,
  authorize(UserRole.ADMIN),
  uploadSingle("file"),
  productImageController.uploadProductImage
);

export { adminRouter, uploadRouter };

