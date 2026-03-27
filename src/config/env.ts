import fs from "fs";
import path from "path";
import dotenv from "dotenv";

/**
 * Load `.env` from the backend package root even when `process.cwd()` is the monorepo root
 * or another folder (e.g. `node dist/index.js` from wrong directory).
 */
function loadDotenv(): void {
  const fromConfigDir = path.resolve(__dirname, "../../.env");
  const fromCwd = path.resolve(process.cwd(), ".env");
  const fromBackendSibling = path.resolve(process.cwd(), "backend", ".env");

  if (fs.existsSync(fromConfigDir)) {
    dotenv.config({ path: fromConfigDir });
  } else if (fs.existsSync(fromCwd)) {
    dotenv.config({ path: fromCwd });
  } else if (fs.existsSync(fromBackendSibling)) {
    dotenv.config({ path: fromBackendSibling });
  } else {
    dotenv.config();
  }
}

loadDotenv();

const t = (v: string | undefined): string => (v ?? "").trim();

export const ENV = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: parseInt(process.env.PORT || "4000"),
  
  // Database
  DB_HOST: process.env.DB_HOST || "localhost",
  DB_PORT: parseInt(process.env.DB_PORT || "5432"),
  DB_USER: process.env.DB_USER || "postgres",
  DB_PASSWORD: process.env.DB_PASSWORD || "postgres",
  DB_NAME: process.env.DB_NAME || "dien_tu_nam_tong",
  DB_SSL: process.env.DB_SSL === "true",
  
  // JWT
  JWT_SECRET: process.env.JWT_SECRET || "your-secret-key-change-in-production",
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "7d",
  
  // Cloudflare R2 (S3-compatible) — trim to avoid BOM/whitespace breaking keys
  R2_ACCOUNT_ID: t(process.env.R2_ACCOUNT_ID),
  R2_ENDPOINT:
    t(process.env.R2_ENDPOINT) ||
    (t(process.env.R2_ACCOUNT_ID)
      ? `https://${t(process.env.R2_ACCOUNT_ID)}.r2.cloudflarestorage.com`
      : ""),
  R2_ACCESS_KEY_ID: t(process.env.R2_ACCESS_KEY_ID),
  R2_SECRET_ACCESS_KEY: t(process.env.R2_SECRET_ACCESS_KEY),
  R2_BUCKET_NAME: t(process.env.R2_BUCKET_NAME),
  /** Base URL for public reads (R2 public bucket URL or custom domain, no trailing slash) */
  R2_PUBLIC_URL: t(process.env.R2_PUBLIC_URL),
  /** Optional public origin of this API (e.g. https://api.example.com). Used to build storage proxy URL when R2_PUBLIC_URL is unset. */
  APP_PUBLIC_URL: t(process.env.APP_PUBLIC_URL),

  // Upload
  STORAGE_BUCKET: process.env.STORAGE_BUCKET || "content",
  MAX_FILE_SIZE: parseInt(process.env.MAX_FILE_SIZE || "5242880"), // 5MB default
} as const;

/**
 * Direct R2 public URL if set; otherwise same-origin proxy: `{origin}/api/public/storage`
 * so the browser always gets an absolute http(s) URL (works without Cloudflare public bucket URL).
 */
export function getStoragePublicBaseUrl(): string {
  const direct = (ENV.R2_PUBLIC_URL || "").trim().replace(/\/+$/, "");
  if (direct) return direct;
  const origin = (
    ENV.APP_PUBLIC_URL || `http://localhost:${ENV.PORT}`
  )
    .trim()
    .replace(/\/+$/, "");
  return `${origin}/api/public/storage`;
}

/** Safe diagnostics for GET /api/public/storage/health (no secrets). */
export function getR2ConfigStatus(): {
  configured: boolean;
  missing: string[];
  bucket: string;
  endpoint: string;
} {
  const missing: string[] = [];
  if (!ENV.R2_ENDPOINT) missing.push("R2_ENDPOINT or R2_ACCOUNT_ID");
  if (!ENV.R2_ACCESS_KEY_ID) missing.push("R2_ACCESS_KEY_ID");
  if (!ENV.R2_SECRET_ACCESS_KEY) missing.push("R2_SECRET_ACCESS_KEY");
  if (!ENV.R2_BUCKET_NAME) missing.push("R2_BUCKET_NAME");
  return {
    configured: missing.length === 0,
    missing,
    bucket: ENV.R2_BUCKET_NAME,
    endpoint: ENV.R2_ENDPOINT,
  };
}

