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
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "No authorization header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { topic_name, topic_link, organization_id } = await req.json();

    if (!topic_name || !organization_id) {
      return new Response(JSON.stringify({ error: "Missing required fields: topic_name, organization_id" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: topicData, error: insertError } = await supabaseClient
      .from("market_watch_topics")
      .upsert({
        organization_id,
        name: topic_name.trim(),
        link: topic_link?.trim() || null,
        created_by: user.id,
        status: "pending",
      }, {
        onConflict: "organization_id,name",
      })
      .select()
      .single();

    if (insertError) {
      console.error("Insert error:", insertError);
      return new Response(JSON.stringify({ error: "Failed to save topic", details: insertError.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const webhookUrl = Deno.env.get("N8N_MARKET_TOPIC_WEBHOOK_URL");
    if (webhookUrl) {
      const payload = {
        topic_id: topicData.id,
        topic_name: topic_name.trim(),
        topic_link: topic_link?.trim() || null,
        organization_id,
        user_id: user.id,
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

    return new Response(
      JSON.stringify({
        success: true,
        message: "Topic added successfully",
        topic: topicData,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Error:", error);
    const message = error instanceof Error ? error.message : "Internal server error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});