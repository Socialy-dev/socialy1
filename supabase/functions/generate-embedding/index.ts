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

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Generate embedding using Lovable AI Gateway
    const embeddingResponse = await fetch("https://ai.gateway.lovable.dev/v1/embeddings", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "openai/text-embedding-3-small",
        input: content,
      }),
    });

    if (!embeddingResponse.ok) {
      const errorText = await embeddingResponse.text();
      console.error("Embedding API error:", embeddingResponse.status, errorText);
      
      if (embeddingResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded, please try again later" }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (embeddingResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required, please add credits" }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      throw new Error(`Embedding API error: ${embeddingResponse.status}`);
    }

    const embeddingData = await embeddingResponse.json();
    const embedding = embeddingData.data?.[0]?.embedding;

    if (!embedding) {
      throw new Error("No embedding returned from API");
    }

    // Store in documents table
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
            embedding: JSON.stringify(embedding),
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
        embedding: JSON.stringify(embedding),
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
