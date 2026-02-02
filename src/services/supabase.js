import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const supabase =
  SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY
    ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
    : null;

/**
 * Upload file to Supabase Storage
 * @param {string} bucket - bucket name
 * @param {string} path - file path in storage (e.g., "product/uuid_filename.jpg")
 * @param {Buffer} buffer - file buffer
 * @param {string} contentType - MIME type
 * @returns {Promise<{data, error}>}
 */
export async function uploadFile(bucket, path, buffer, contentType) {
  if (!supabase) throw new Error("Supabase storage not configured");
  return await supabase.storage.from(bucket).upload(path, buffer, { upsert: false, contentType });
}

/**
 * Delete file from Supabase Storage
 * @param {string} bucket - bucket name
 * @param {string[]} paths - array of file paths to delete
 * @returns {Promise<{data, error}>}
 */
export async function deleteFile(bucket, paths) {
  if (!supabase) throw new Error("Supabase storage not configured");
  return await supabase.storage.from(bucket).remove(paths);
}

/**
 * Get public URL for a file
 * @param {string} bucket - bucket name
 * @param {string} path - file path
 * @returns {string}
 */
export function getPublicUrl(bucket, path) {
  if (!supabase) throw new Error("Supabase storage not configured");
  return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;
}
