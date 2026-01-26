import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import {
  getCorsHeaders,
  validateAuthAndOrg,
  createErrorResponse,
  createSuccessResponse,
} from "../_shared/security-helper.ts";

serve(async (req) => {
  const origin = req.headers.get("origin");
  const corsHeaders = getCorsHeaders(origin);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("authorization");
    const body = await req.json();
    const { search_term, search_type, organization_id, user_id } = body;

    const authResult = await validateAuthAndOrg(authHeader, organization_id);
    if (!authResult.success) {
      return createErrorResponse(authResult.error!, authResult.status!, corsHeaders);
    }

    if (!search_term || typeof search_term !== "string" || search_term.trim().length < 2) {
      return createErrorResponse("INVALID_SEARCH_TERM", 400, corsHeaders);
    }

    const webhookUrl = Deno.env.get("N8N_SEARCH_CREATIVES_WEBHOOK_URL");
    if (!webhookUrl) {
      console.error("N8N_SEARCH_CREATIVES_WEBHOOK_URL not configured");
      return createErrorResponse("WEBHOOK_NOT_CONFIGURED", 500, corsHeaders);
    }

    const detectedType = search_term.includes("pinterest.com") ? "url" : "keyword";

    const payload = {
      search_term: search_term.trim(),
      search_type: search_type || detectedType,
      organization_id,
      user_id: user_id || authResult.user!.id,
      requested_at: new Date().toISOString(),
    };

    console.log("Sending Pinterest search request to webhook:", { 
      search_term: payload.search_term, 
      search_type: payload.search_type 
    });

    const webhookResponse = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!webhookResponse.ok) {
      const errorText = await webhookResponse.text();
      console.error("Webhook error:", webhookResponse.status, errorText);
      return createErrorResponse("WEBHOOK_FAILED", 502, corsHeaders);
    }

    return createSuccessResponse({ success: true, message: "Search request sent" }, corsHeaders);
  } catch (error) {
    console.error("search-creatives error:", error);
    return createErrorResponse("INTERNAL_ERROR", 500, corsHeaders);
  }
});
