import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface MediaRecord {
  id: string;
  organization_id: string;
  image_url: string | null;
}

interface TableConfig {
  table: string;
  sourceType: string;
  imageField: string;
}

const TABLES_CONFIG: TableConfig[] = [
  { table: "organization_articles", sourceType: "article", imageField: "thumbnail" },
  { table: "competitor_articles", sourceType: "article", imageField: "thumbnail" },
  { table: "client_articles", sourceType: "article", imageField: "thumbnail" },
  { table: "market_watch_topics", sourceType: "article", imageField: "thumbnail" },
  { table: "organization_social_media_organique_instagram", sourceType: "instagram", imageField: "images" },
  { table: "organization_social_media_organique_facebook", sourceType: "facebook", imageField: "image_url" },
  { table: "organization_social_media_organique_linkedin", sourceType: "linkedin", imageField: "media_url" },
  { table: "organization_social_media_organique_tiktok", sourceType: "tiktok", imageField: "cover_url" },
  { table: "organization_social_media_organique_competitor_instagram", sourceType: "instagram", imageField: "images" },
  { table: "organization_social_media_organique_competitor_facebook", sourceType: "facebook", imageField: "image_url" },
  { table: "organization_social_media_organique_competitor_linkedin", sourceType: "linkedin", imageField: "media_url" },
  { table: "organization_social_media_organique_competitor_tiktok", sourceType: "tiktok", imageField: "cover_url" },
];

const BATCH_SIZE = 20;

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
        Accept: "image/*,video/*,*/*",
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.error(`Failed to download: ${response.status} - ${imageUrl.substring(0, 100)}`);
      return null;
    }

    const contentType = response.headers.get("content-type") || "image/jpeg";
    let extension = "jpg";

    if (contentType.includes("png")) extension = "png";
    else if (contentType.includes("gif")) extension = "gif";
    else if (contentType.includes("webp")) extension = "webp";
    else if (contentType.includes("mp4")) extension = "mp4";

    const arrayBuffer = await response.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    if (uint8Array.length < 100) {
      console.error("Downloaded file too small");
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
      console.error("Upload error:", uploadError.message);
      return null;
    }

    return storagePath;
  } catch (err) {
    const error = err as Error;
    if (error.name === "AbortError") {
      console.error("Download timeout");
    } else {
      console.error("Error:", error.message);
    }
    return null;
  }
}

function extractImageUrl(record: Record<string, unknown>, imageField: string, sourceType: string): string | null {
  const value = record[imageField];
  
  if (value) {
    if (typeof value === "string" && value.startsWith("http")) {
      return value;
    }
    
    if (Array.isArray(value) && value.length > 0) {
      const first = value[0];
      if (typeof first === "string" && first.startsWith("http")) {
        return first;
      }
    }
  }
  
  if (sourceType === "instagram") {
    const fallbacks = ["original_image_url", "video_url", "profile_picture_url"];
    for (const field of fallbacks) {
      const fallbackValue = record[field];
      if (typeof fallbackValue === "string" && fallbackValue.startsWith("http")) {
        return fallbackValue;
      }
    }
  }
  
  if (sourceType === "tiktok") {
    const tiktokFallbacks = ["video_cover_url", "original_cover_url"];
    for (const field of tiktokFallbacks) {
      const fallbackValue = record[field];
      if (typeof fallbackValue === "string" && fallbackValue.startsWith("http")) {
        return fallbackValue;
      }
    }
  }
  
  if (sourceType === "linkedin") {
    const linkedinFallbacks = ["media_thumbnail", "original_media_url"];
    for (const field of linkedinFallbacks) {
      const fallbackValue = record[field];
      if (typeof fallbackValue === "string" && fallbackValue.startsWith("http")) {
        return fallbackValue;
      }
    }
  }

  if (sourceType === "facebook") {
    const facebookFallbacks = ["original_image_url", "video_url"];
    for (const field of facebookFallbacks) {
      const fallbackValue = record[field];
      if (typeof fallbackValue === "string" && fallbackValue.startsWith("http")) {
        return fallbackValue;
      }
    }
  }
  
  return null;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();
  console.log("🚀 Starting media persistence cron job...");

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    let totalProcessed = 0;
    let totalSuccess = 0;
    let totalFailed = 0;

    for (const config of TABLES_CONFIG) {
      const { data: records, error } = await supabase
        .from(config.table)
        .select("*")
        .is("storage_path", null)
        .limit(BATCH_SIZE);

      if (error) {
        console.error(`Error fetching from ${config.table}:`, error.message);
        continue;
      }

      if (!records || records.length === 0) {
        continue;
      }

      console.log(`📦 Processing ${records.length} records from ${config.table}`);

      for (const rec of records) {
        const record = rec as Record<string, unknown>;
        const imageUrl = extractImageUrl(record, config.imageField, config.sourceType);
        
        if (!imageUrl) {
          continue;
        }

        const recordId = record.id as string;
        const orgId = record.organization_id as string;

        const storagePath = await downloadAndUploadImage(
          supabaseUrl,
          serviceRoleKey,
          imageUrl,
          orgId,
          config.sourceType,
          recordId
        );

        if (storagePath) {
          const originalField = config.sourceType === "article" 
            ? "original_thumbnail" 
            : config.sourceType === "tiktok"
            ? "original_cover_url"
            : config.sourceType === "linkedin"
            ? "original_media_url"
            : "original_image_url";

          const { error: updateError } = await supabase
            .from(config.table)
            .update({
              storage_path: storagePath,
              [originalField]: imageUrl,
            })
            .eq("id", recordId);

          if (updateError) {
            console.error(`Update error for ${recordId}:`, updateError.message);
            totalFailed++;
          } else {
            totalSuccess++;
          }
        } else {
          totalFailed++;
        }

        totalProcessed++;
      }
    }

    const duration = Date.now() - startTime;
    console.log(`✅ Cron completed in ${duration}ms: ${totalSuccess} success, ${totalFailed} failed`);

    return new Response(
      JSON.stringify({
        success: true,
        processed: totalProcessed,
        successCount: totalSuccess,
        failCount: totalFailed,
        durationMs: duration,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Cron error:", error);
    return new Response(
      JSON.stringify({ success: false, error: "Internal error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
