import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Secured n8n webhook URL - stored server-side only
const N8N_WEBHOOK_URL = "https://n8n.srv870433.hstgr.cloud/webhook/05a83f28-50c2-4c39-868e-2e018921153b";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify authentication
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    // Verify the JWT token
    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);

    if (claimsError || !claimsData?.claims) {
      console.error("Auth error:", claimsError);
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userId = claimsData.claims.sub;
    if (!userId) {
      return new Response(
        JSON.stringify({ error: "User ID not found" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse and validate request body
    const body = await req.json();
    const { subject, objective, tone } = body;

    // Validate required fields
    if (!subject || typeof subject !== "string" || subject.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: "Subject is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Sanitize inputs - limit length and remove potentially harmful characters
    const sanitizedSubject = subject.trim().slice(0, 2000);
    const sanitizedObjective = objective ? String(objective).trim().slice(0, 500) : "";
    const sanitizedTone = tone ? String(tone).trim().slice(0, 200) : "";

    // Fetch user's existing LinkedIn posts for RAG context
    const { data: userPosts, error: postsError } = await supabase
      .from("documents")
      .select("content, metadata")
      .eq("user_id", userId)
      .eq("document_type", "linkedin_post")
      .order("created_at", { ascending: false })
      .limit(10);

    if (postsError) {
      console.error("Error fetching user posts:", postsError);
    }

    // Prepare RAG context
    const postsContext = userPosts && userPosts.length > 0
      ? userPosts.map((p) => p.content).join("\n\n---\n\n")
      : "";

    // Call n8n webhook with the data
    const webhookPayload = {
      user_id: userId,
      subject: sanitizedSubject,
      objective: sanitizedObjective,
      tone: sanitizedTone,
      existing_posts_context: postsContext,
      timestamp: new Date().toISOString(),
    };

    console.log("Calling n8n webhook for user:", userId);

    const webhookResponse = await fetch(N8N_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(webhookPayload),
    });

    if (!webhookResponse.ok) {
      const errorText = await webhookResponse.text();
      console.error("n8n webhook error:", webhookResponse.status, errorText);
      return new Response(
        JSON.stringify({ error: "Failed to generate post" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const webhookResult = await webhookResponse.json();

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: webhookResult 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("generate-linkedin-post error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
