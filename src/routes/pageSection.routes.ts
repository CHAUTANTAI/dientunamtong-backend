import { Router } from "express";
import { PageSectionController } from "../controllers/PageSectionController";
import { authenticate, authorize } from "@middlewares/index";
import { UserRole } from "../entities/Profile";

const router = Router();
const pageSectionController = new PageSectionController();

// Admin routes (require authentication and manager role)
router.get(
  "/admin/page-sections/:pageIdentifier",
  authenticate,
  authorize(UserRole.MANAGER, UserRole.ADMIN),
  pageSectionController.getPageSections
);

router.put(
  "/admin/page-sections/:pageIdentifier",
  authenticate,
  authorize(UserRole.MANAGER, UserRole.ADMIN),
  pageSectionController.updatePageSections
);

router.delete(
  "/admin/page-sections/:id",
  authenticate,
  authorize(UserRole.MANAGER, UserRole.ADMIN),
  pageSectionController.deleteSection
);

// Public routes (no authentication required)
router.get(
  "/public/page-sections/:pageIdentifier",
  pageSectionController.getActivePageSections
);

export default router;
