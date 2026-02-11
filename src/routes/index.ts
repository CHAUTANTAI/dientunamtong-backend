import { Router } from "express";
import authRoutes from "./auth.routes";
import productRoutes, { adminRouter as productAdminRouter } from "./product.routes";
import categoryRoutes, { adminRouter as categoryAdminRouter } from "./category.routes";
import contactRoutes, { adminRouter as contactAdminRouter } from "./contact.routes";
import profileRoutes, { adminRouter as profileAdminRouter } from "./profile.routes";
import {
  adminRouter as productImageAdminRouter,
  uploadRouter as productImageUploadRouter,
} from "./productImage.routes";

const router = Router();

// Public routes
router.use("/auth", authRoutes);
router.use("/product", productRoutes);
router.use("/category", categoryRoutes);
router.use("/contact", contactRoutes);
router.use("/profile", profileRoutes);

// Admin routes
router.use("/admin/product", productAdminRouter);
router.use("/admin/product", productImageUploadRouter); // Legacy upload endpoint
router.use("/admin/product-image", productImageAdminRouter);
router.use("/admin/category", categoryAdminRouter);
router.use("/admin/contact", contactAdminRouter);
router.use("/admin/profile", profileAdminRouter);

export default router;

