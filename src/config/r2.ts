import {
  DeleteObjectsCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import type { Readable } from "stream";
import { ENV, getStoragePublicBaseUrl } from "@config/env";

let client: S3Client | null = null;

function getS3Client(): S3Client {
  if (!ENV.R2_ENDPOINT || !ENV.R2_ACCESS_KEY_ID || !ENV.R2_SECRET_ACCESS_KEY) {
    throw new Error(
      "R2 storage is not configured. Set R2_ENDPOINT, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY."
    );
  }
  if (!client) {
    client = new S3Client({
      region: "auto",
      endpoint: ENV.R2_ENDPOINT,
      credentials: {
        accessKeyId: ENV.R2_ACCESS_KEY_ID,
        secretAccessKey: ENV.R2_SECRET_ACCESS_KEY,
      },
      forcePathStyle: true,
    });
  }
  return client;
}

/** For logging / mapping AWS SDK v3 errors from GetObject, PutObject, etc. */
export function getS3ErrorMeta(err: unknown): {
  name: string;
  message: string;
  httpStatusCode?: number;
} {
  if (!err || typeof err !== "object") {
    return { name: "Unknown", message: String(err) };
  }
  const e = err as {
    name?: string;
    message?: string;
    $metadata?: { httpStatusCode?: number };
  };
  return {
    name: e.name || "Error",
    message: e.message || String(err),
    httpStatusCode: e.$metadata?.httpStatusCode,
  };
}

function normalizeKeys(paths: string[]): string[] {
  return paths
    .map((p) => p.replace(/^\/+/, "").trim())
    .filter((p) => p.length > 0);
}

/**
 * Upload buffer to R2 (single public bucket).
 */
export async function putObject(
  key: string,
  body: Buffer,
  contentType: string
): Promise<void> {
  if (!ENV.R2_BUCKET_NAME) {
    throw new Error("R2_BUCKET_NAME is not configured");
  }
  const normalized = key.replace(/^\/+/, "");
  const s3 = getS3Client();
  await s3.send(
    new PutObjectCommand({
      Bucket: ENV.R2_BUCKET_NAME,
      Key: normalized,
      Body: body,
      ContentType: contentType,
    })
  );
}

/**
 * Delete objects by key. Legacy signature kept for CategoryService / ProductService.
 * @param _bucket Ignored (single R2 bucket); kept for call-site compatibility.
 */
export async function deleteFile(
  _bucket: string,
  paths: string[]
): Promise<{ data: null; error: Error | null }> {
  const keys = normalizeKeys(paths);
  if (keys.length === 0) {
    return { data: null, error: null };
  }

  try {
    const s3 = getS3Client();
    await s3.send(
      new DeleteObjectsCommand({
        Bucket: ENV.R2_BUCKET_NAME,
        Delete: {
          Objects: keys.map((Key) => ({ Key })),
          Quiet: true,
        },
      })
    );
    return { data: null, error: null };
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    return { data: null, error };
  }
}

/**
 * Public URL for an object key (R2 CDN or `/api/public/storage` proxy).
 */
export function getPublicUrlForKey(key: string): string {
  const base = getStoragePublicBaseUrl().replace(/\/+$/, "");
  const path = key.replace(/^\/+/, "");
  return `${base}/${path}`;
}

/**
 * Stream object from R2 (for public proxy).
 */
export async function getObjectStream(key: string): Promise<{
  stream: Readable;
  contentType: string;
}> {
  const normalized = key.replace(/^\/+/, "");
  if (!normalized || normalized.includes("..")) {
    throw new Error("Invalid object key");
  }
  if (!ENV.R2_BUCKET_NAME) {
    throw new Error("R2_BUCKET_NAME is not configured");
  }
  const s3 = getS3Client();
  const out = await s3.send(
    new GetObjectCommand({
      Bucket: ENV.R2_BUCKET_NAME,
      Key: normalized,
    })
  );
  const body = out.Body;
  if (!body) {
    throw new Error("Empty object body");
  }
  const stream = body as Readable;
  const contentType = out.ContentType || "application/octet-stream";
  return { stream, contentType };
}
