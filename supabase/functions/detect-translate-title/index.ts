import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const VALID_TABLES = ["competitor_articles", "client_articles", "market_watch_topics"];

interface RequestPayload {
  record_id: string;
  title: string;
  table_name: string;
  organization_id: string;
}

interface OpenAIResponse {
  detected_language: "fr" | "en" | "other";
  title_fr: string | null;
}

async function detectAndTranslate(title: string, apiKey: string): Promise<OpenAIResponse> {
  const systemPrompt = `Tu es un assistant de détection de langue et traduction.
Analyse le titre fourni et retourne un JSON avec:
- "detected_language": "fr" si français, "en" si anglais, "other" sinon
- "title_fr": la traduction française SI le titre est en anglais, sinon null

Réponds UNIQUEMENT avec le JSON, sans markdown ni explication.`;

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Titre: "${title}"` },
      ],
      temperature: 0.1,
      max_tokens: 500,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("OpenAI API error:", response.status, errorText);
    throw new Error(`OpenAI API error: ${response.status}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content?.trim();

  if (!content) {
    throw new Error("Empty response from OpenAI");
  }

  try {
    const cleanedContent = content.replace(/```json\n?|\n?```/g, "").trim();
    const parsed = JSON.parse(cleanedContent);
    
    return {
      detected_language: parsed.detected_language || "other",
      title_fr: parsed.title_fr || null,
    };
  } catch (parseError) {
    console.error("Failed to parse OpenAI response:", content);
    throw new Error("Invalid JSON response from OpenAI");
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const payload: RequestPayload = await req.json();
    const { record_id, title, table_name, organization_id } = payload;

    console.log(`📝 Processing: ${table_name} - ${record_id} - "${title?.substring(0, 50)}..."`);

    if (!record_id || !title || !table_name || !organization_id) {
      console.error("Missing required fields:", { record_id: !!record_id, title: !!title, table_name: !!table_name, organization_id: !!organization_id });
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!VALID_TABLES.includes(table_name)) {
      console.error("Invalid table name:", table_name);
      return new Response(
        JSON.stringify({ error: "Invalid table name" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const openaiApiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openaiApiKey) {
      console.error("OPENAI_API_KEY not configured");
      return new Response(
        JSON.stringify({ error: "OpenAI API key not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const result = await detectAndTranslate(title, openaiApiKey);
    console.log(`🔍 Detection result for ${record_id}:`, result);

    const updateData: Record<string, string | null> = {
      detected_language: result.detected_language,
    };

    if (result.detected_language === "en" && result.title_fr) {
      updateData.title_fr = result.title_fr;
    }

    const { error: updateError } = await supabase
      .from(table_name)
      .update(updateData)
      .eq("id", record_id)
      .eq("organization_id", organization_id);

    if (updateError) {
      console.error("Database update error:", updateError);
      return new Response(
        JSON.stringify({ error: "Failed to update record", details: updateError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`✅ Successfully processed ${record_id}: ${result.detected_language}${result.title_fr ? " (translated)" : ""}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        detected_language: result.detected_language,
        translated: !!result.title_fr 
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("detect-translate-title error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
