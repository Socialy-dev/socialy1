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
    const { keyword, country, media_type, organization_id, user_id } = body;

    const authResult = await validateAuthAndOrg(authHeader, organization_id);
    if (!authResult.success) {
      return createErrorResponse(authResult.error!, authResult.status!, corsHeaders);
    }

    if (!keyword || typeof keyword !== "string" || keyword.trim().length === 0) {
      return createErrorResponse("INVALID_KEYWORD", 400, corsHeaders);
    }

    if (!country || !["FR", "US", "GB", "DE", "ES"].includes(country)) {
      return createErrorResponse("INVALID_COUNTRY", 400, corsHeaders);
    }

    if (!media_type || !["all", "image", "video"].includes(media_type)) {
      return createErrorResponse("INVALID_MEDIA_TYPE", 400, corsHeaders);
    }

    const webhookUrl = Deno.env.get("N8N_SEARCH_CREATIVES_WEBHOOK_URL");
    if (!webhookUrl) {
      console.error("N8N_SEARCH_CREATIVES_WEBHOOK_URL not configured");
      return createErrorResponse("WEBHOOK_NOT_CONFIGURED", 500, corsHeaders);
    }

    const payload = {
      keyword: keyword.trim(),
      country,
      media_type,
      organization_id,
      user_id: user_id || authResult.user!.id,
      requested_at: new Date().toISOString(),
    };

    console.log("Sending search request to webhook:", { keyword: payload.keyword, country, media_type });

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
