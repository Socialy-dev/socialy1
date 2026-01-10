import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Secure CORS: only allow requests from your frontend domain
const getAllowedOrigin = (requestOrigin: string | null): string => {
  const allowedOrigins = [
    Deno.env.get("FRONTEND_URL"),
    "http://localhost:5173",
    "http://localhost:3000",
    "https://lypodfdlpbpjdsswmsni.supabase.co"
  ].filter(Boolean);

  if (requestOrigin && allowedOrigins.includes(requestOrigin)) {
    return requestOrigin;
  }
  return allowedOrigins[0] || "*";
};

serve(async (req) => {
  const origin = req.headers.get("Origin");
  const corsHeaders = {
    "Access-Control-Allow-Origin": getAllowedOrigin(origin),
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  };

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Security: Verify authentication first
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

    const { data: { user }, error: userError } = await supabaseUser.auth.getUser();

    if (userError || !user) {
      console.error("Auth error:", userError);
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Security: Use authenticated user ID, not client-provided authenticatedUserId
    const authenticatedUserId = user.id;

    const { content, document_type, source_id, metadata } = await req.json();

    if (!content || !document_type) {
      return new Response(
        JSON.stringify({ error: "content and document_type are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Store in documents table (without embedding - we'll use full-text search and context injection)
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check if document already exists for this source
    if (source_id) {
      const { data: existing } = await supabase
        .from("documents")
        .select("id")
        .eq("source_id", source_id)
        .eq("authenticatedUserId", authenticatedUserId)
        .single();

      if (existing) {
        // Update existing document
        const { error: updateError } = await supabase
          .from("documents")
          .update({
            content,
            metadata: metadata || {},
            updated_at: new Date().toISOString(),
          })
          .eq("id", existing.id);

        if (updateError) {
          throw updateError;
        }

        return new Response(
          JSON.stringify({ success: true, id: existing.id, action: "updated" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // Insert new document
    const { data: newDoc, error: insertError } = await supabase
      .from("documents")
      .insert({
        authenticatedUserId,
        content,
        document_type,
        source_id: source_id || null,
        metadata: metadata || {},
      })
      .select("id")
      .single();

    if (insertError) {
      throw insertError;
    }

    return new Response(
      JSON.stringify({ success: true, id: newDoc.id, action: "created" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("generate-embedding error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
