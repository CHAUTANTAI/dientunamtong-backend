import { Router } from "express";
import {
  getPublicStorageObject,
  getStorageHealth,
} from "@controllers/public/publicStorageProxyController";

const router = Router();

router.get("/health", getStorageHealth);

router.use((req, res, next) => {
  if (req.method !== "GET") {
    next();
    return;
  }
  void getPublicStorageObject(req, res, next);
});

export default router;
