import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const authHeader = req.headers.get("Authorization");
    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.replace("Bearer ", "");
      const { data: claimsData, error: claimsError } = await supabaseAdmin.auth.getUser(token);
      
      if (claimsError || !claimsData?.user) {
        return new Response(
          JSON.stringify({ error: "Unauthorized" }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    let organizationId: string | null = null;

    const contentType = req.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      const body = await req.json().catch(() => ({}));
      if (body.organization_id) {
        organizationId = body.organization_id;
      }
    }

    if (!organizationId) {
      return new Response(
        JSON.stringify({ error: "organization_id is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Processing organization: ${organizationId}`);

    const { data: journalists, error: journalistsError } = await supabaseAdmin
      .from("journalists")
      .select("media")
      .eq("organization_id", organizationId)
      .not("media", "is", null)
      .is("media_specialty", null);

    if (journalistsError) {
      console.error("Error fetching journalists:", journalistsError);
      return new Response(
        JSON.stringify({ error: journalistsError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const uniqueMediaSet = new Set<string>();
    (journalists || []).forEach((j: { media: string | null }) => {
      if (j.media && j.media.trim()) {
        uniqueMediaSet.add(j.media.trim());
      }
    });

    const uniqueMedia = Array.from(uniqueMediaSet);

    if (uniqueMedia.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          message: "No media without specialty found",
          media_count: 0,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Found ${uniqueMedia.length} unique media without specialty`);

    const webhookUrl = Deno.env.get("N8N_MEDIA_SPECIALTY_WEBHOOK_URL");
    if (!webhookUrl) {
      console.error("N8N_MEDIA_SPECIALTY_WEBHOOK_URL not configured");
      return new Response(
        JSON.stringify({ error: "Webhook not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const payload = {
      organization_id: organizationId,
      media_names: uniqueMedia,
      total_count: uniqueMedia.length,
      timestamp: new Date().toISOString(),
    };

    const webhookResponse = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!webhookResponse.ok) {
      const errorText = await webhookResponse.text();
      console.error("Webhook error:", errorText);
      return new Response(
        JSON.stringify({ error: "Webhook call failed" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`✅ Sent ${uniqueMedia.length} media names to webhook`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Sent ${uniqueMedia.length} media names for enrichment`,
        media_count: uniqueMedia.length,
        media_names: uniqueMedia,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: unknown) {
    console.error("Error in notify-media-specialty:", error);
    const message = error instanceof Error ? error.message : "Internal server error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
