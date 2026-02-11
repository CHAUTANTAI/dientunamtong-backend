import { Router } from "express";
import { MediaController } from "@controllers/MediaController";
import { authenticate, authorize } from "@middlewares/auth.middleware";
import { UserRole } from "@entities/Profile";

const router = Router();
const mediaController = new MediaController();

// Public routes (if needed)
// router.get("/public", mediaController.getAllMedia);

// Protected routes - Admin only
router.use(authenticate, authorize(UserRole.ADMIN));

// Get all media
router.get("/", mediaController.getAllMedia);

// Search media
router.get("/search", mediaController.searchMedia);

// Get media statistics
router.get("/statistics", mediaController.getMediaStatistics);

// Get orphan media
router.get("/orphan", mediaController.getOrphanMedia);

// Cleanup orphan media
router.delete("/orphan/cleanup", mediaController.cleanupOrphanMedia);

// Get media by product
router.get("/product/:productId", mediaController.getMediaByProductId);

// Get single media
router.get("/:id", mediaController.getMediaById);

// Create single media
router.post("/", mediaController.createMedia);

// Create multiple media
router.post("/bulk", mediaController.createMultipleMedia);

// Update media
router.put("/:id", mediaController.updateMedia);

// Update sort order
router.patch("/:id/sort-order", mediaController.updateSortOrder);

// Bulk update sort orders
router.patch("/bulk/sort-order", mediaController.bulkUpdateSortOrder);

// Soft delete media
router.delete("/:id", mediaController.deleteMedia);

// Hard delete media
router.delete("/:id/permanent", mediaController.hardDeleteMedia);

export default router;

