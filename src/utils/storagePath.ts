/**
 * Resolve object key from media file_url for storage delete / migration.
 * Supports: relative keys, Supabase public/signed URLs, R2 public URLs (r2.dev / custom domain).
 */
export function extractObjectKeyFromMediaUrl(fileUrl: string): string | null {
  if (!fileUrl) return null;
  const trimmed = fileUrl.trim();
  if (!trimmed) return null;

  if (!trimmed.includes("://")) {
    return trimmed.replace(/^\/+/, "");
  }

  try {
    const u = new URL(trimmed);
    const supabaseMatch = u.pathname.match(
      /\/storage\/v1\/object\/(?:public|sign)\/[^/]+\/(.+)/
    );
    if (supabaseMatch?.[1]) {
      return supabaseMatch[1];
    }
    const path = u.pathname.replace(/^\/+/, "");
    return path || null;
  } catch {
    return null;
  }
}
