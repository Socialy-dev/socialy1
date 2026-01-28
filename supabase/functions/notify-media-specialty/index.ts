import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const MIN_MEDIA_THRESHOLD = 10;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    let organizationIds: string[] = [];

    const contentType = req.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      const body = await req.json().catch(() => ({}));
      if (body.organization_id) {
        organizationIds = [body.organization_id];
      }
    }

    if (organizationIds.length === 0) {
      const { data: orgs, error: orgsError } = await supabaseAdmin
        .from("organizations")
        .select("id");

      if (orgsError) {
        console.error("Error fetching organizations:", orgsError);
        return new Response(
          JSON.stringify({ error: orgsError.message }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      organizationIds = (orgs || []).map((o: { id: string }) => o.id);
    }

    console.log(`Processing ${organizationIds.length} organization(s)...`);

    const results: Array<{ organization_id: string; status: string; media_count?: number }> = [];

    for (const orgId of organizationIds) {
      const { data: journalists, error: journalistsError } = await supabaseAdmin
        .from("journalists")
        .select("media")
        .eq("organization_id", orgId)
        .not("media", "is", null)
        .is("media_specialty", null);

      if (journalistsError) {
        console.error(`Error for org ${orgId}:`, journalistsError);
        results.push({ organization_id: orgId, status: "error" });
        continue;
      }

      const uniqueMediaSet = new Set<string>();
      (journalists || []).forEach((j: { media: string | null }) => {
        if (j.media && j.media.trim()) {
          uniqueMediaSet.add(j.media.trim());
        }
      });

      const uniqueMedia = Array.from(uniqueMediaSet);

      if (uniqueMedia.length < MIN_MEDIA_THRESHOLD) {
        console.log(`Org ${orgId}: ${uniqueMedia.length} media < ${MIN_MEDIA_THRESHOLD} threshold, skipping`);
        results.push({ 
          organization_id: orgId, 
          status: "below_threshold", 
          media_count: uniqueMedia.length 
        });
        continue;
      }

      console.log(`Org ${orgId}: ${uniqueMedia.length} media >= ${MIN_MEDIA_THRESHOLD}, sending to webhook...`);

      const webhookUrl = Deno.env.get("N8N_MEDIA_SPECIALTY_WEBHOOK_URL");
      if (!webhookUrl) {
        console.error("N8N_MEDIA_SPECIALTY_WEBHOOK_URL not configured");
        results.push({ organization_id: orgId, status: "webhook_not_configured" });
        continue;
      }

      const payload = {
        organization_id: orgId,
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
        console.error(`Webhook error for org ${orgId}:`, errorText);
        results.push({ organization_id: orgId, status: "webhook_failed" });
        continue;
      }

      console.log(`✅ Org ${orgId}: sent ${uniqueMedia.length} media names to webhook`);
      results.push({ 
        organization_id: orgId, 
        status: "sent", 
        media_count: uniqueMedia.length 
      });
    }

    const sentCount = results.filter(r => r.status === "sent").length;
    const skippedCount = results.filter(r => r.status === "below_threshold").length;

    return new Response(
      JSON.stringify({
        success: true,
        message: `Processed ${organizationIds.length} org(s): ${sentCount} sent, ${skippedCount} below threshold`,
        threshold: MIN_MEDIA_THRESHOLD,
        results,
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
