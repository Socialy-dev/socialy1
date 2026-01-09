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
    const { content, document_type, source_id, user_id, metadata } = await req.json();

    if (!content || !document_type || !user_id) {
      return new Response(
        JSON.stringify({ error: "content, document_type, and user_id are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Store in documents table (without embedding - we'll use full-text search and context injection)
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check if document already exists for this source
    if (source_id) {
      const { data: existing } = await supabase
        .from("documents")
        .select("id")
        .eq("source_id", source_id)
        .eq("user_id", user_id)
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
        user_id,
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
