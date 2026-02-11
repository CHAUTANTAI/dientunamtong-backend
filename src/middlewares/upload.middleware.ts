import multer from "multer";
import { Request } from "express";
import { ValidationError } from "@/types/responses";
import { ENV } from "@config/env";

// Configure multer for memory storage
const storage = multer.memoryStorage();

// File filter
const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  callback: multer.FileFilterCallback
) => {
  // Accept images only
  if (file.mimetype.startsWith("image/")) {
    callback(null, true);
  } else {
    callback(
      new ValidationError("Only image files are allowed") as any,
      false
    );
  }
};

// Upload configuration
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: ENV.MAX_FILE_SIZE, // 5MB default
  },
});

// Single file upload
export const uploadSingle = (fieldName: string) => {
  return upload.single(fieldName);
};

// Multiple files upload
export const uploadMultiple = (fieldName: string, maxCount: number = 10) => {
  return upload.array(fieldName, maxCount);
};

