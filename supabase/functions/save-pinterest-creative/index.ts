import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import {
  getCorsHeaders,
  createErrorResponse,
  createSuccessResponse,
} from "../_shared/security-helper.ts";

interface PinterestCreativePayload {
  organization_id: string;
  pinterest_id: string;
  pinterest_link: string;
  type: string;
  download_url: string;
  thumbnail_url?: string;
  title?: string;
  description?: string;
  alt_text?: string;
  likes?: number;
  is_promoted?: boolean;
  creator_name?: string;
  creator_url?: string;
  dominant_color?: string;
  pinterest_created_at?: string;
}

async function downloadAndUploadImage(
  supabaseUrl: string,
  serviceRoleKey: string,
  imageUrl: string,
  organizationId: string,
  pinterestId: string
): Promise<string | null> {
  try {
    const supabase = createClient(supabaseUrl, serviceRoleKey);
    
    const response = await fetch(imageUrl);
    if (!response.ok) {
      console.error(`Failed to download image: ${response.status}`);
      return null;
    }

    const contentType = response.headers.get("content-type") || "image/jpeg";
    const extension = contentType.includes("png") ? "png" : contentType.includes("gif") ? "gif" : "jpg";
    const arrayBuffer = await response.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    const storagePath = `${organizationId}/${pinterestId}.${extension}`;

    const { error: uploadError } = await supabase.storage
      .from("pinterest_creatives")
      .upload(storagePath, uint8Array, {
        contentType,
        upsert: true,
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      return null;
    }

    return storagePath;
  } catch (error) {
    console.error("Error downloading/uploading image:", error);
    return null;
  }
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
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const body = await req.json();
    const creatives: PinterestCreativePayload[] = Array.isArray(body) ? body : [body];

    if (!creatives.length) {
      return createErrorResponse("NO_CREATIVES_PROVIDED", 400, corsHeaders);
    }

    const results = [];

    for (const creative of creatives) {
      if (!creative.organization_id || !creative.pinterest_link) {
        console.error("Missing required fields:", creative);
        continue;
      }

      let storagePath: string | null = null;
      const imageUrl = creative.thumbnail_url || creative.download_url;

      if (imageUrl && creative.type === "image") {
        storagePath = await downloadAndUploadImage(
          supabaseUrl,
          serviceRoleKey,
          imageUrl,
          creative.organization_id,
          creative.pinterest_id
        );
      }

      const { data, error } = await supabase
        .from("pinterest_creatives")
        .upsert(
          {
            organization_id: creative.organization_id,
            pinterest_id: creative.pinterest_id,
            pinterest_link: creative.pinterest_link,
            type: creative.type || "image",
            download_url: creative.download_url,
            thumbnail_url: creative.thumbnail_url,
            title: creative.title,
            description: creative.description,
            alt_text: creative.alt_text,
            likes: creative.likes || 0,
            is_promoted: creative.is_promoted || false,
            creator_name: creative.creator_name,
            creator_url: creative.creator_url,
            dominant_color: creative.dominant_color,
            pinterest_created_at: creative.pinterest_created_at,
            storage_path: storagePath,
          },
          {
            onConflict: "organization_id,pinterest_link",
          }
        )
        .select()
        .single();

      if (error) {
        console.error("Upsert error:", error);
        results.push({ pinterest_id: creative.pinterest_id, success: false, error: error.message });
      } else {
        results.push({ pinterest_id: creative.pinterest_id, success: true, id: data.id });
      }
    }

    return createSuccessResponse(
      { 
        success: true, 
        processed: results.length,
        results 
      },
      corsHeaders
    );
  } catch (error) {
    console.error("save-pinterest-creative error:", error);
    return createErrorResponse("INTERNAL_ERROR", 500, corsHeaders);
  }
});
