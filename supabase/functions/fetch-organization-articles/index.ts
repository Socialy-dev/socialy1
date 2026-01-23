import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { 
  getCorsHeaders, 
  validateAuthAndOrg, 
  createErrorResponse, 
  createSuccessResponse,
  getServiceClient 
} from "../_shared/security-helper.ts";

serve(async (req) => {
  const origin = req.headers.get("Origin");
  const corsHeaders = getCorsHeaders(origin);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const n8nWebhookUrl = Deno.env.get("N8N_ORGANIZATION_ARTICLES_WEBHOOK_URL");
    if (!n8nWebhookUrl) {
      console.error("N8N_ORGANIZATION_ARTICLES_WEBHOOK_URL not configured");
      return createErrorResponse("Webhook URL not configured", 500, corsHeaders);
    }

    const authHeader = req.headers.get("Authorization");
    const body = await req.json();
    const { organization_id, organization_name, is_cron = false } = body;

    if (!organization_id) {
      return createErrorResponse("organization_id is required", 400, corsHeaders);
    }

    const validation = await validateAuthAndOrg(authHeader, organization_id);
    if (!validation.success) {
      return createErrorResponse(validation.error!, validation.status!, corsHeaders);
    }

    console.log("Fetching articles for organization:", { organization_id, organization_name, is_cron, userId: validation.user!.id });

    let searchQuery = organization_name;
    if (!searchQuery) {
      const supabase = getServiceClient();
      const { data: org, error: orgError } = await supabase
        .from("organizations")
        .select("name")
        .eq("id", organization_id)
        .single();

      if (orgError || !org) {
        console.error("Organization not found:", orgError);
        return createErrorResponse("Organization not found", 404, corsHeaders);
      }
      searchQuery = org.name;
    }

    console.log("Forwarding to n8n for organization:", searchQuery);

    const payload = {
      organization_id,
      organization_name: searchQuery,
      user_id: validation.user!.id,
      is_cron,
      created_at: new Date().toISOString(),
    };

    const n8nResponse = await fetch(n8nWebhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!n8nResponse.ok) {
      const errorText = await n8nResponse.text();
      console.error("n8n webhook error:", errorText);
      return createErrorResponse("n8n webhook failed", 500, corsHeaders);
    }

    const n8nResult = await n8nResponse.json();
    console.log("n8n response:", n8nResult);

    return createSuccessResponse({
      success: true,
      organization_id,
      organization_name: searchQuery,
      n8n_response: n8nResult,
    }, corsHeaders);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Unexpected error:", error);
    return createErrorResponse(errorMessage, 500, corsHeaders);
  }
});
