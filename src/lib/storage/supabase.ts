import { createClient, SupabaseClient } from "@supabase/supabase-js";

let supabaseAdmin: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient {
  if (!supabaseAdmin) {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error(
        "SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be defined in environment"
      );
    }

    supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }
  return supabaseAdmin;
}

export const DEFAULT_BUCKET = process.env.STORAGE_BUCKET || "freelai-files";

export interface UploadOptions {
  bucket?: string;
  path: string;
  file: Buffer | Uint8Array | Blob;
  contentType?: string;
  upsert?: boolean;
}

export interface StorageResult {
  path: string;
  url: string;
  size?: number;
}

/**
 * Uploads a file to Supabase Storage.
 */
export async function uploadToStorage({
  bucket = DEFAULT_BUCKET,
  path,
  file,
  contentType = "application/octet-stream",
  upsert = true,
}: UploadOptions): Promise<StorageResult> {
  const supabase = getSupabaseAdmin();
  const sanitizedPath = path.replace(/^\/+/, "").replace(/\.\./g, "");

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(sanitizedPath, file, {
      contentType,
      upsert,
    });

  if (error) {
    throw new Error(`Storage upload failed: ${error.message}`);
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(bucket).getPublicUrl(sanitizedPath);

  return {
    path: data.path,
    url: publicUrl,
  };
}

/**
 * Generates a temporary signed download URL (expires in seconds).
 */
export async function getSignedUrl(
  path: string,
  expiresInSeconds = 3600,
  bucket = DEFAULT_BUCKET
): Promise<string> {
  const supabase = getSupabaseAdmin();
  const sanitizedPath = path.replace(/^\/+/, "");

  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(sanitizedPath, expiresInSeconds);

  if (error || !data?.signedUrl) {
    throw new Error(`Failed to create signed URL: ${error?.message}`);
  }

  return data.signedUrl;
}

/**
 * Deletes a file from Supabase Storage.
 */
export async function deleteFromStorage(
  path: string,
  bucket = DEFAULT_BUCKET
): Promise<boolean> {
  const supabase = getSupabaseAdmin();
  const sanitizedPath = path.replace(/^\/+/, "");

  const { error } = await supabase.storage.from(bucket).remove([sanitizedPath]);
  if (error) {
    console.error("[deleteFromStorage] error:", error);
    return false;
  }
  return true;
}
