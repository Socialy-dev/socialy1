import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import {
  getCorsHeaders,
  createErrorResponse,
  createSuccessResponse,
} from "../_shared/security-helper.ts";

interface PersistMediaRequest {
  organization_id: string;
  source_url: string;
  source_type: "article" | "instagram" | "facebook" | "linkedin" | "tiktok" | "pinterest";
  source_table: string;
  record_id: string;
}

interface BatchPersistRequest {
  items: PersistMediaRequest[];
}

async function downloadAndUploadImage(
  supabaseUrl: string,
  serviceRoleKey: string,
  imageUrl: string,
  organizationId: string,
  sourceType: string,
  recordId: string
): Promise<string | null> {
  try {
    const supabase = createClient(supabaseUrl, serviceRoleKey);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);
    
    const response = await fetch(imageUrl, {
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; MediaBot/1.0)",
        "Accept": "image/*,video/*,*/*",
      },
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      console.error(`Failed to download: ${response.status} - ${imageUrl}`);
      return null;
    }

    const contentType = response.headers.get("content-type") || "image/jpeg";
    let extension = "jpg";
    
    if (contentType.includes("png")) extension = "png";
    else if (contentType.includes("gif")) extension = "gif";
    else if (contentType.includes("webp")) extension = "webp";
    else if (contentType.includes("svg")) extension = "svg";
    else if (contentType.includes("mp4")) extension = "mp4";
    else if (contentType.includes("webm")) extension = "webm";
    
    const arrayBuffer = await response.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    if (uint8Array.length < 100) {
      console.error("Downloaded file too small, likely an error page");
      return null;
    }

    const storagePath = `${organizationId}/${sourceType}/${recordId}.${extension}`;

    const { error: uploadError } = await supabase.storage
      .from("media_assets")
      .upload(storagePath, uint8Array, {
        contentType,
        upsert: true,
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      return null;
    }

    return storagePath;
  } catch (err) {
    const error = err as Error;
    if (error.name === "AbortError") {
      console.error("Download timeout:", imageUrl);
    } else {
      console.error("Error downloading/uploading:", error);
    }
    return null;
  }
}

async function updateRecordWithStoragePath(
  supabaseUrl: string,
  serviceRoleKey: string,
  tableName: string,
  recordId: string,
  storagePath: string,
  originalUrl: string,
  sourceType: string
): Promise<boolean> {
  const supabase = createClient(supabaseUrl, serviceRoleKey);
  
  let originalColumn: string;
  switch (sourceType) {
    case "article":
      originalColumn = "original_thumbnail";
      break;
    case "instagram":
    case "facebook":
      originalColumn = "original_image_url";
      break;
    case "linkedin":
      originalColumn = "original_media_url";
      break;
    case "tiktok":
      originalColumn = "original_cover_url";
      break;
    default:
      originalColumn = "original_thumbnail";
  }
  
  const { error } = await supabase
    .from(tableName)
    .update({
      storage_path: storagePath,
      [originalColumn]: originalUrl,
    })
    .eq("id", recordId);

  if (error) {
    console.error(`Error updating ${tableName}:`, error);
    return false;
  }
  
  return true;
}

serve(async (req) => {
  const origin = req.headers.get("origin");
  const corsHeaders = getCorsHeaders(origin);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const body = await req.json();
    
    const items: PersistMediaRequest[] = body.items || [body];
    
    if (!items.length) {
      return createErrorResponse("NO_ITEMS_PROVIDED", 400, corsHeaders);
    }

    const results = [];
    let successCount = 0;
    let failCount = 0;

    for (const item of items) {
      const { organization_id, source_url, source_type, source_table, record_id } = item;

      if (!organization_id || !source_url || !source_type || !source_table || !record_id) {
        console.error("Missing required fields:", item);
        results.push({ record_id, success: false, error: "MISSING_FIELDS" });
        failCount++;
        continue;
      }

      if (!source_url.startsWith("http")) {
        console.log("Skipping non-HTTP URL:", source_url);
        results.push({ record_id, success: false, error: "INVALID_URL" });
        failCount++;
        continue;
      }

      const storagePath = await downloadAndUploadImage(
        supabaseUrl,
        serviceRoleKey,
        source_url,
        organization_id,
        source_type,
        record_id
      );

      if (!storagePath) {
        results.push({ record_id, success: false, error: "DOWNLOAD_FAILED" });
        failCount++;
        continue;
      }

      const updated = await updateRecordWithStoragePath(
        supabaseUrl,
        serviceRoleKey,
        source_table,
        record_id,
        storagePath,
        source_url,
        source_type
      );

      if (updated) {
        results.push({ record_id, success: true, storage_path: storagePath });
        successCount++;
      } else {
        results.push({ record_id, success: false, error: "UPDATE_FAILED" });
        failCount++;
      }
    }

    console.log(`Processed ${items.length} items: ${successCount} success, ${failCount} failed`);

    return createSuccessResponse(
      {
        success: true,
        processed: items.length,
        successCount,
        failCount,
        results,
      },
      corsHeaders
    );
  } catch (error) {
    console.error("persist-media-asset error:", error);
    return createErrorResponse("INTERNAL_ERROR", 500, corsHeaders);
  }
});
