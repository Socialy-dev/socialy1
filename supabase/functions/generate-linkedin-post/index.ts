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
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    
    const supabaseUser = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    const { data: { user }, error: userError } = await supabaseUser.auth.getUser();

    if (userError || !user) {
      console.error("Auth error:", userError);
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userId = user.id;

    const body = await req.json();
    const { subject, objective, tone } = body;

    if (!subject || typeof subject !== "string" || subject.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: "Subject is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const sanitizedSubject = subject.trim().slice(0, 2000);
    const sanitizedObjective = objective ? String(objective).trim().slice(0, 500) : "";
    const sanitizedTone = tone ? String(tone).trim().slice(0, 200) : "";

    const { data: userPosts, error: postsError } = await supabaseUser
      .from("documents")
      .select("content, metadata")
      .eq("user_id", userId)
      .eq("document_type", "linkedin_post")
      .order("created_at", { ascending: false })
      .limit(10);

    if (postsError) {
      console.error("Error fetching user posts:", postsError);
    }

    const postsContext = userPosts && userPosts.length > 0
      ? userPosts.map((p) => p.content).join("\n\n---\n\n")
      : "";

    const { data: insertedPost, error: insertError } = await supabaseAdmin
      .from("generated_posts_linkedin")
      .insert({
        user_id: userId,
        subject: sanitizedSubject,
        objective: sanitizedObjective,
        tone: sanitizedTone,
        status: "pending",
      })
      .select("id, request_id")
      .single();

    if (insertError || !insertedPost) {
      console.error("Error creating generation record:", insertError);
      return new Response(
        JSON.stringify({ error: "Failed to initiate generation" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const webhookPayload = {
      request_id: insertedPost.request_id,
      user_id: userId,
      subject: sanitizedSubject,
      objective: sanitizedObjective,
      tone: sanitizedTone,
      existing_posts_context: postsContext,
      timestamp: new Date().toISOString(),
    };

    const n8nWebhookUrl = Deno.env.get("N8N_WEBHOOK_URL");
    if (!n8nWebhookUrl) {
      console.error("N8N_WEBHOOK_URL secret is not configured");
      await supabaseAdmin
        .from("generated_posts_linkedin")
        .update({ status: "error" })
        .eq("id", insertedPost.id);
      return new Response(
        JSON.stringify({ error: "Webhook not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Calling n8n webhook for user:", userId, "request_id:", insertedPost.request_id);

    const webhookResponse = await fetch(n8nWebhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(webhookPayload),
    });

    if (!webhookResponse.ok) {
      const errorText = await webhookResponse.text();
      console.error("n8n webhook error:", webhookResponse.status, errorText);
      
      await supabaseAdmin
        .from("generated_posts_linkedin")
        .update({ status: "error" })
        .eq("id", insertedPost.id);
      
      return new Response(
        JSON.stringify({ error: "Failed to generate post" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const webhookResult = await webhookResponse.json();

    return new Response(
      JSON.stringify({ 
        success: true,
        request_id: insertedPost.request_id,
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
