import { createClient, SupabaseClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL || "";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

let supabaseClient: SupabaseClient | null = null;

export const getSupabaseClient = (): SupabaseClient => {
  if (!supabaseClient) {
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Supabase credentials not configured");
    }
    supabaseClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
  }
  return supabaseClient;
};

/**
 * Upload file to Supabase Storage
 */
export const uploadFile = async (
  bucket: string,
  path: string,
  buffer: Buffer,
  contentType: string
): Promise<{ data: any; error: any }> => {
  const client = getSupabaseClient();
  return await client.storage
    .from(bucket)
    .upload(path, buffer, { upsert: false, contentType });
};

/**
 * Delete file from Supabase Storage
 */
export const deleteFile = async (
  bucket: string,
  paths: string[]
): Promise<{ data: any; error: any }> => {
  const client = getSupabaseClient();
  return await client.storage.from(bucket).remove(paths);
};

/**
 * Get public URL for a file
 */
export const getPublicUrl = (bucket: string, path: string): string => {
  const client = getSupabaseClient();
  return client.storage.from(bucket).getPublicUrl(path).data.publicUrl;
};

