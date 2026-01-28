import { 
  getCorsHeaders, 
  validateAuthAndOrg, 
  createErrorResponse, 
  createSuccessResponse,
  getServiceClient 
} from "../_shared/security-helper.ts";

Deno.serve(async (req) => {
  const origin = req.headers.get("Origin");
  const corsHeaders = getCorsHeaders(origin);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    const { organization_id } = await req.json();

    if (!organization_id) {
      return createErrorResponse("Missing organization_id", 400, corsHeaders);
    }

    const validation = await validateAuthAndOrg(authHeader, organization_id);
    if (!validation.success) {
      return createErrorResponse(validation.error!, validation.status!, corsHeaders);
    }

    const serviceClient = getServiceClient();

    const { data: journalists, error: journalistsError } = await serviceClient
      .from("journalists")
      .select("media")
      .eq("organization_id", organization_id)
      .not("media", "is", null)
      .is("media_specialty", null);

    if (journalistsError) {
      console.error("Error fetching journalists:", journalistsError);
      return createErrorResponse(journalistsError.message, 500, corsHeaders);
    }

    if (!journalists || journalists.length === 0) {
      return createSuccessResponse({ 
        message: "No new media to enrich",
        media_count: 0 
      }, corsHeaders);
    }

    const uniqueMediaSet = new Set<string>();
    journalists.forEach((j: { media: string | null }) => {
      if (j.media && j.media.trim()) {
        uniqueMediaSet.add(j.media.trim());
      }
    });

    const uniqueMedia = Array.from(uniqueMediaSet);

    if (uniqueMedia.length === 0) {
      return createSuccessResponse({ 
        message: "No valid media names found",
        media_count: 0 
      }, corsHeaders);
    }

    console.log(`Found ${uniqueMedia.length} unique media without specialty for org ${organization_id}`);

    const webhookUrl = Deno.env.get("N8N_MEDIA_SPECIALTY_WEBHOOK_URL");
    if (!webhookUrl) {
      console.error("N8N_MEDIA_SPECIALTY_WEBHOOK_URL not configured");
      return createErrorResponse("Webhook URL not configured", 500, corsHeaders);
    }

    const payload = {
      organization_id,
      user_id: validation.user!.id,
      media_names: uniqueMedia,
      total_count: uniqueMedia.length,
      timestamp: new Date().toISOString(),
    };

    console.log(`Sending ${uniqueMedia.length} media names to webhook...`);

    const webhookResponse = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!webhookResponse.ok) {
      const errorText = await webhookResponse.text();
      console.error("Webhook error:", errorText);
      return createErrorResponse("Webhook call failed", 502, corsHeaders);
    }

    const webhookData = await webhookResponse.json().catch(() => ({}));

    return createSuccessResponse({
      success: true,
      message: `Sent ${uniqueMedia.length} unique media names for specialty enrichment`,
      media_count: uniqueMedia.length,
      media_names: uniqueMedia,
      webhook_response: webhookData,
    }, corsHeaders);

  } catch (error: unknown) {
    console.error("Error in notify-media-specialty:", error);
    const message = error instanceof Error ? error.message : "Internal server error";
    return createErrorResponse(message, 500, corsHeaders);
  }
});
