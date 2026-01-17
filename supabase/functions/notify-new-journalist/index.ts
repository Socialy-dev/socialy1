import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const ALLOWED_ORIGINS = [
  "https://socialy1.lovable.app",
  "https://id-preview--d652ab17-4466-4f7d-9908-a5f63da4d0fe.lovable.app",
  "http://localhost:5173",
  "http://localhost:3000",
];

const getCorsHeaders = (origin: string | null) => {
  const isAllowed = origin && (
    ALLOWED_ORIGINS.includes(origin) || 
    origin.endsWith(".lovableproject.com") || 
    origin.endsWith(".lovable.app")
  );
  return {
    "Access-Control-Allow-Origin": isAllowed ? origin : ALLOWED_ORIGINS[0],
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };
};

serve(async (req) => {
  const origin = req.headers.get("Origin");
  const corsHeaders = getCorsHeaders(origin);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const body = await req.json();
    const { journalists, organization_id, journalist_id, name, media, email, linkedin } = body;

    // Handle batch enrichment (multiple journalists)
    if (journalists && Array.isArray(journalists) && journalists.length > 0) {
      console.log(`📦 Queueing ${journalists.length} journalists for enrichment`);

      const jobLogIds = [];
      const errors = [];

      for (const journalist of journalists) {
        try {
          const { data: jobLogId, error } = await supabase.rpc('enqueue_job', {
            p_queue_name: 'journalist_enrichment',
            p_job_type: 'enrich_journalist',
            p_organization_id: organization_id || journalist.organization_id,
            p_payload: {
              journalist_id: journalist.id,
              name: journalist.name,
              media: journalist.media || null,
              email: journalist.email || null,
              linkedin: journalist.linkedin || null,
            }
          });

          if (error) {
            console.error(`❌ Failed to enqueue journalist ${journalist.id}:`, error);
            errors.push({ journalist_id: journalist.id, error: error.message });
          } else {
            jobLogIds.push(jobLogId);
            console.log(`✅ Queued journalist ${journalist.id} (job_log_id: ${jobLogId})`);
          }
        } catch (err) {
          console.error(`💥 Exception queueing journalist ${journalist.id}:`, err);
          errors.push({ journalist_id: journalist.id, error: (err as Error).message });
        }
      }

      console.log(`✅ Batch complete: ${jobLogIds.length} queued, ${errors.length} errors`);

      return new Response(
        JSON.stringify({
          success: true,
          queued: jobLogIds.length,
          total: journalists.length,
          job_log_ids: jobLogIds,
          errors: errors.length > 0 ? errors : undefined,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Handle single journalist enrichment
    if (!journalist_id || !name || !organization_id) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: journalist_id, name, organization_id or journalists array" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("🔄 Queueing single journalist:", { journalist_id, name, media, organization_id });

    try {
      const { data: jobLogId, error } = await supabase.rpc('enqueue_job', {
        p_queue_name: 'journalist_enrichment',
        p_job_type: 'enrich_journalist',
        p_organization_id: organization_id,
        p_payload: {
          journalist_id,
          name,
          media: media || null,
          email: email || null,
          linkedin: linkedin || null,
        }
      });

      if (error) {
        console.error("❌ Failed to enqueue job:", error);
        return new Response(
          JSON.stringify({ error: "Failed to queue enrichment job", details: error.message }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      console.log(`✅ Journalist queued successfully (job_log_id: ${jobLogId})`);

      return new Response(
        JSON.stringify({ success: true, job_log_id: jobLogId }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } catch (err) {
      console.error("💥 Exception:", err);
      return new Response(
        JSON.stringify({ error: "Internal server error", details: (err as Error).message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
