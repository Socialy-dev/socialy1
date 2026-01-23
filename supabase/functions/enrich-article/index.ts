import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { 
  getCorsHeaders, 
  validateAuthAndOrg, 
  createErrorResponse, 
  createSuccessResponse 
} from "../_shared/security-helper.ts";

serve(async (req) => {
  const origin = req.headers.get("Origin");
  const corsHeaders = getCorsHeaders(origin);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    const body = await req.json();
    const { link, type, competitor_id, competitor_name, client_id, client_name, organization_id } = body;

    if (!link || !type) {
      return createErrorResponse("Missing required fields: link, type", 400, corsHeaders);
    }

    if (type !== "socialy" && type !== "competitor" && type !== "client") {
      return createErrorResponse("Invalid type. Must be 'socialy', 'competitor', or 'client'", 400, corsHeaders);
    }

    if (!organization_id) {
      return createErrorResponse("Missing required field: organization_id", 400, corsHeaders);
    }

    const validation = await validateAuthAndOrg(authHeader, organization_id);
    if (!validation.success) {
      return createErrorResponse(validation.error!, validation.status!, corsHeaders);
    }

    const webhookUrl = Deno.env.get("N8N_WEBHOOK_URL");
    if (!webhookUrl) {
      return createErrorResponse("Webhook URL not configured", 500, corsHeaders);
    }

    const payload = {
      link,
      type,
      user_id: validation.user!.id,
      competitor_id: competitor_id || null,
      competitor_name: competitor_name || null,
      client_id: client_id || null,
      client_name: client_name || null,
      organization_id,
      timestamp: new Date().toISOString(),
    };

    const webhookResponse = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!webhookResponse.ok) {
      console.error("Webhook error:", await webhookResponse.text());
      return createErrorResponse("Webhook call failed", 502, corsHeaders);
    }

    const webhookData = await webhookResponse.json().catch(() => ({}));

    return createSuccessResponse({
      success: true,
      message: "Article sent for enrichment",
      webhook_response: webhookData,
    }, corsHeaders);
  } catch (error: unknown) {
    console.error("Error:", error);
    const message = error instanceof Error ? error.message : "Internal server error";
    return createErrorResponse(message, 500, corsHeaders);
  }
});
