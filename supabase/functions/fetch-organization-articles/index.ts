import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const n8nWebhookUrl = Deno.env.get("N8N_ORGANIZATION_ARTICLES_WEBHOOK_URL");

    if (!n8nWebhookUrl) {
      console.error("N8N_ORGANIZATION_ARTICLES_WEBHOOK_URL not configured");
      return new Response(
        JSON.stringify({ error: "N8N_ORGANIZATION_ARTICLES_WEBHOOK_URL not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const authHeader = req.headers.get("Authorization");
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    let userId: string | null = null;
    if (authHeader) {
      const token = authHeader.replace("Bearer ", "");
      const { data: { user }, error: authError } = await supabase.auth.getUser(token);
      if (authError) {
        console.error("Auth error:", authError);
        return new Response(
          JSON.stringify({ error: "Unauthorized" }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      userId = user?.id || null;
    }

    const body = await req.json();
    const { organization_id, organization_name, is_cron = false } = body;

    console.log("Fetching articles for organization:", { organization_id, organization_name, is_cron, userId });

    if (!organization_id) {
      return new Response(
        JSON.stringify({ error: "organization_id is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let searchQuery = organization_name;
    if (!searchQuery) {
      const { data: org, error: orgError } = await supabase
        .from("organizations")
        .select("name")
        .eq("id", organization_id)
        .single();

      if (orgError || !org) {
        console.error("Organization not found:", orgError);
        return new Response(
          JSON.stringify({ error: "Organization not found" }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      searchQuery = org.name;
    }

    console.log("Forwarding to n8n for organization:", searchQuery);

    const payload = {
      organization_id,
      organization_name: searchQuery,
      user_id: userId,
      is_cron,
      created_at: new Date().toISOString(),
    };

    const n8nResponse = await fetch(n8nWebhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!n8nResponse.ok) {
      const errorText = await n8nResponse.text();
      console.error("n8n webhook error:", errorText);
      return new Response(
        JSON.stringify({ error: "n8n webhook failed", details: errorText }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const n8nResult = await n8nResponse.json();
    console.log("n8n response:", n8nResult);

    return new Response(
      JSON.stringify({
        success: true,
        organization_id,
        organization_name: searchQuery,
        n8n_response: n8nResult,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error", details: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
