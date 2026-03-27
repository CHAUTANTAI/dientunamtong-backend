import { Request, Response, NextFunction } from "express";
import { deleteFile, getPublicUrlForKey, putObject } from "@config/r2";
import { successResponse } from "@/types/responses";
import { ValidationError } from "@/types/responses";

function sanitizeFilename(filename: string): string {
  let sanitized = filename.replace(/\s+/g, "_");
  sanitized = sanitized.replace(/[^\w\-._]/g, "");
  sanitized = sanitized.replace(/_+/g, "_");
  sanitized = sanitized.replace(/^_+|_+$/g, "");
  return sanitized;
}

function isValidFolder(folder: string): boolean {
  if (!folder || folder.includes("..")) return false;
  return /^[a-zA-Z0-9][a-zA-Z0-9/_-]*$/.test(folder);
}

export class StorageController {
  /**
   * POST multipart: file + folder (e.g. product, homepage/slider)
   * Optional: fileName
   */
  uploadPublic = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const file = req.file;
      if (!file) {
        throw new ValidationError("file is required");
      }

      const folder = String(req.body.folder ?? "").trim();
      if (!folder) {
        throw new ValidationError("folder is required");
      }
      if (!isValidFolder(folder)) {
        throw new ValidationError("folder is invalid");
      }

      const rawName =
        String(req.body.fileName ?? "").trim() ||
        `${Date.now()}_${file.originalname}`;
      const sanitized = sanitizeFilename(rawName);
      if (!sanitized) {
        throw new ValidationError("fileName is invalid after sanitization");
      }

      const key = `${folder}/${sanitized}`;

      await putObject(key, file.buffer, file.mimetype);

      res.json(
        successResponse(
          {
            path: key,
            fullPath: key,
            publicUrl: getPublicUrlForKey(key),
          },
          "Upload successful"
        )
      );
    } catch (error) {
      next(error);
    }
  };

  /**
   * DELETE ?key=relative/path/to/object
   */
  deleteObject = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const key = String(req.query.key ?? "").trim();
      if (!key) {
        throw new ValidationError("key is required");
      }
      if (key.includes("..") || key.startsWith("/")) {
        throw new ValidationError("key is invalid");
      }

      const { error } = await deleteFile("", [key]);
      if (error) {
        throw error;
      }

      res.json(successResponse(null, "Deleted"));
    } catch (error) {
      next(error);
    }
  };
}
