import { Request, Response, NextFunction } from "express";
import { getR2ConfigStatus } from "@config/env";
import { getObjectStream, getS3ErrorMeta } from "@config/r2";

/**
 * GET /api/public/storage/health — R2 config check (no secrets).
 */
export const getStorageHealth = (
  _req: Request,
  res: Response
): void => {
  const status = getR2ConfigStatus();
  res.status(status.configured ? 200 : 503).json({
    success: status.configured,
    storage: {
      r2_configured: status.configured,
      missing_env: status.missing,
      bucket: status.bucket || null,
      endpoint: status.endpoint || null,
    },
    hint: status.configured
      ? null
      : "Add the missing R2_* variables to backend/.env and restart the API.",
  });
};

/**
 * GET /api/public/storage/* — stream file from R2 (no public bucket URL required).
 * Example: /api/public/storage/homepage/banner/file.webp
 */
export const getPublicStorageObject = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  let key = "";
  try {
    const prefix = "/api/public/storage";
    const pathOnly = req.originalUrl.split("?")[0];
    if (!pathOnly.startsWith(prefix)) {
      res.status(400).send("Bad path");
      return;
    }
    key = pathOnly.slice(prefix.length).replace(/^\/+/, "");
    if (!key || key.includes("..")) {
      res.status(400).send("Invalid key");
      return;
    }

    if (process.env.DEBUG_STORAGE === "1") {
      console.log("[storage:proxy] GET object key:", key);
    }

    const { stream, contentType } = await getObjectStream(key);
    res.setHeader("Content-Type", contentType);
    res.setHeader("Cache-Control", "public, max-age=86400");
    stream.on("error", (streamErr: Error) => {
      if (!res.headersSent) {
        const meta = getS3ErrorMeta(streamErr);
        console.error("[storage:proxy] stream error", { key, ...meta });
        res.status(502).type("text/plain").send("Upstream stream error");
      }
    });
    stream.pipe(res);
  } catch (err: unknown) {
    const meta = getS3ErrorMeta(err);
    console.error("[storage:proxy] GetObject failed", { key, ...meta });

    const msg = meta.message || "";
    if (msg.includes("R2 storage is not configured") || msg.includes("R2_BUCKET_NAME is not configured")) {
      res.status(503).type("text/plain").send("R2 is not configured on the server (check .env)");
      return;
    }
    if (msg.includes("Invalid object key")) {
      res.status(400).type("text/plain").send("Invalid key");
      return;
    }

    const { name, httpStatusCode } = meta;
    const isNotFound =
      name === "NoSuchKey" ||
      name === "NotFound" ||
      httpStatusCode === 404;
    if (isNotFound) {
      res.status(404).type("text/plain").send("Not found");
      return;
    }

    const isForbidden =
      name === "AccessDenied" ||
      name === "AllAccessDisabled" ||
      httpStatusCode === 403;
    if (isForbidden) {
      res
        .status(403)
        .type("text/plain")
        .send(
          "R2 AccessDenied: API token needs permission to read objects (GetObject) for this bucket."
        );
      return;
    }

    const isAuthError =
      name === "InvalidAccessKeyId" ||
      name === "SignatureDoesNotMatch" ||
      name === "InvalidToken" ||
      httpStatusCode === 401;
    if (isAuthError) {
      res.status(503).type("text/plain").send("R2 credentials are invalid or expired (check R2_ACCESS_KEY_ID / R2_SECRET_ACCESS_KEY).");
      return;
    }

    if (name === "NoSuchBucket" || (httpStatusCode === 404 && msg.toLowerCase().includes("bucket"))) {
      res.status(503).type("text/plain").send("R2 bucket not found (check R2_BUCKET_NAME and account).");
      return;
    }

    next(err);
  }
};
