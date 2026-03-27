import { Router } from "express";
import { StorageController } from "@controllers/StorageController";
import { authenticate, authorize } from "@middlewares/auth.middleware";
import { uploadSingle } from "@middlewares/upload.middleware";
import { UserRole } from "@entities/Profile";

const router = Router();
const storageController = new StorageController();

router.post(
  "/upload",
  authenticate,
  authorize(UserRole.ADMIN),
  uploadSingle("file"),
  storageController.uploadPublic
);

router.delete(
  "/object",
  authenticate,
  authorize(UserRole.ADMIN),
  storageController.deleteObject
);

export default router;
