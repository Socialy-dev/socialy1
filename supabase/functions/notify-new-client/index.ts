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
    const { client_id, client_name, organization_id } = body;

    if (!client_id || !client_name || !organization_id) {
      return createErrorResponse("Missing required fields", 400, corsHeaders);
    }

    const validation = await validateAuthAndOrg(authHeader, organization_id);
    if (!validation.success) {
      return createErrorResponse(validation.error!, validation.status!, corsHeaders);
    }

    const webhookUrl = Deno.env.get("N8N_CLIENT_WEBHOOK_URL");
    if (!webhookUrl) {
      console.error("N8N_CLIENT_WEBHOOK_URL not configured");
      return createErrorResponse("Webhook not configured", 500, corsHeaders);
    }

    const webhookResponse = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id,
        client_name,
        organization_id,
        user_id: validation.user!.id,
        created_at: new Date().toISOString(),
      }),
    });

    if (!webhookResponse.ok) {
      console.error("Webhook failed:", await webhookResponse.text());
      return createErrorResponse("Webhook delivery failed", 500, corsHeaders);
    }

    return createSuccessResponse({ success: true }, corsHeaders);
  } catch (error) {
    console.error("Error:", error);
    return createErrorResponse("Internal server error", 500, corsHeaders);
  }
});
