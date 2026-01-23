import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { 
  getCorsHeaders, 
  validateAuthAndOrg, 
  createErrorResponse, 
  createSuccessResponse,
  getUserClient 
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
    const { topic_name, topic_link, organization_id } = body;

    if (!topic_name || !organization_id) {
      return createErrorResponse("Missing required fields: topic_name, organization_id", 400, corsHeaders);
    }

    const validation = await validateAuthAndOrg(authHeader, organization_id);
    if (!validation.success) {
      return createErrorResponse(validation.error!, validation.status!, corsHeaders);
    }

    const supabaseClient = getUserClient(authHeader!);

    const { data: topicData, error: insertError } = await supabaseClient
      .from("market_watch_topics")
      .upsert({
        organization_id,
        title: topic_name.trim(),
        search_topic: topic_name.trim(),
        link: topic_link?.trim() || `https://veille-${Date.now()}`,
        created_by: validation.user!.id,
        status: "pending",
      }, {
        onConflict: "organization_id,link",
      })
      .select()
      .single();

    if (insertError) {
      console.error("Insert error:", insertError);
      return createErrorResponse("Failed to save topic", 500, corsHeaders);
    }

    const webhookUrl = Deno.env.get("N8N_MARKET_TOPIC_WEBHOOK_URL");
    if (webhookUrl) {
      const payload = {
        topic_id: topicData.id,
        topic_name: topic_name.trim(),
        topic_link: topic_link?.trim() || null,
        organization_id,
        user_id: validation.user!.id,
        timestamp: new Date().toISOString(),
      };

      try {
        const webhookResponse = await fetch(webhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!webhookResponse.ok) {
          console.error("Webhook error:", await webhookResponse.text());
        }
      } catch (webhookError) {
        console.error("Webhook call failed:", webhookError);
      }
    }

    return createSuccessResponse({
      success: true,
      message: "Topic added successfully",
      topic: topicData,
    }, corsHeaders);
  } catch (error: unknown) {
    console.error("Error:", error);
    const message = error instanceof Error ? error.message : "Internal server error";
    return createErrorResponse(message, 500, corsHeaders);
  }
});
