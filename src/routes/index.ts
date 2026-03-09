import { Router } from "express";
import authRoutes from "./auth.routes";
import productRoutes, { adminRouter as productAdminRouter } from "./product.routes";
import categoryRoutes, { adminRouter as categoryAdminRouter } from "./category.routes";
import contactRoutes, { adminRouter as contactAdminRouter } from "./contact.routes";
import profileRoutes, { adminRouter as profileAdminRouter } from "./profile.routes";
import mediaRoutes from "./media.routes";
import bannerRoutes from "./bannerRoutes";
import publicBannerRoutes from "./publicBannerRoutes";
import publicCategoryRoutes from "./publicCategoryRoutes";
import publicProductRoutes from "./publicProductRoutes";
import publicSystemInfoRoutes from "./publicSystemInfoRoutes";
import pageSectionRoutes from "./pageSection.routes";

const router = Router();

// Debug logging
router.use((req, res, next) => {
  console.log(`📍 Request: ${req.method} ${req.path}`);
  next();
});

// Public routes
router.use("/auth", authRoutes);
router.use("/product", productRoutes);
router.use("/category", categoryRoutes);
router.use("/contact", contactRoutes);
router.use("/profile", profileRoutes);

// Public API routes (no auth required)
router.use("/public/banner", publicBannerRoutes);
router.use("/public/category", publicCategoryRoutes);
router.use("/public/product", publicProductRoutes);
router.use("/public/system-info", publicSystemInfoRoutes);
router.use(pageSectionRoutes); // Handles both /public and /admin routes

// Admin routes
console.log("🔧 Mounting admin routes...");
router.use("/admin/product", (req, res, next) => {
  console.log(`🎯 Admin product route: ${req.method} ${req.path}`);
  next();
}, productAdminRouter);
router.use("/admin/category", categoryAdminRouter);
router.use("/admin/contact", contactAdminRouter);
router.use("/admin/profile", profileAdminRouter);
router.use("/admin/media", mediaRoutes);
router.use("/admin/banner", bannerRoutes);

export default router;