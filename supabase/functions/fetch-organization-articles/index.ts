import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SerpApiNewsResult {
  position: number;
  title: string;
  link: string;
  source: {
    name: string;
    icon?: string;
    authors?: string[];
  };
  date?: string;
  iso_date?: string;
  thumbnail?: string;
  thumbnail_small?: string;
  snippet?: string;
}

interface SerpApiResponse {
  news_results?: SerpApiNewsResult[];
  error?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const serpApiKey = Deno.env.get("SERPAPI_API_KEY");

    if (!serpApiKey) {
      console.error("SERPAPI_API_KEY not configured");
      return new Response(
        JSON.stringify({ error: "SERPAPI_API_KEY not configured" }),
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

    console.log("Searching Google News for:", searchQuery);

    const serpApiUrl = new URL("https://serpapi.com/search.json");
    serpApiUrl.searchParams.set("engine", "google_news");
    serpApiUrl.searchParams.set("q", searchQuery);
    serpApiUrl.searchParams.set("hl", "fr");
    serpApiUrl.searchParams.set("gl", "fr");
    serpApiUrl.searchParams.set("api_key", serpApiKey);

    const serpResponse = await fetch(serpApiUrl.toString());
    const serpData: SerpApiResponse = await serpResponse.json();

    if (serpData.error) {
      console.error("SerpAPI error:", serpData.error);
      return new Response(
        JSON.stringify({ error: "SerpAPI error", details: serpData.error }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const newsResults = serpData.news_results || [];
    console.log(`Found ${newsResults.length} news results`);

    const sortedResults = newsResults
      .sort((a, b) => {
        const dateA = a.iso_date ? new Date(a.iso_date).getTime() : 0;
        const dateB = b.iso_date ? new Date(b.iso_date).getTime() : 0;
        return dateB - dateA;
      })
      .slice(0, 20);

    console.log(`Processing ${sortedResults.length} articles for upsert`);

    let insertedCount = 0;
    let updatedCount = 0;
    let errorCount = 0;

    for (const article of sortedResults) {
      if (!article.link || !article.title) {
        console.log("Skipping article without link or title");
        continue;
      }

      const articleData = {
        organization_id,
        link: article.link,
        title: article.title,
        thumbnail: article.thumbnail || null,
        thumbnail_small: article.thumbnail_small || null,
        source_name: article.source?.name || null,
        source_icon: article.source?.icon || null,
        authors: article.source?.authors?.[0] || null,
        article_date: article.date || null,
        article_iso_date: article.iso_date || null,
        snippet: article.snippet || null,
        position: article.position || 0,
        hidden: false,
      };

      const { data: existing } = await supabase
        .from("organization_articles")
        .select("id")
        .eq("organization_id", organization_id)
        .eq("link", article.link)
        .maybeSingle();

      if (existing) {
        const { error: updateError } = await supabase
          .from("organization_articles")
          .update({
            title: articleData.title,
            thumbnail: articleData.thumbnail,
            thumbnail_small: articleData.thumbnail_small,
            source_name: articleData.source_name,
            source_icon: articleData.source_icon,
            authors: articleData.authors,
            article_date: articleData.article_date,
            article_iso_date: articleData.article_iso_date,
            snippet: articleData.snippet,
            position: articleData.position,
          })
          .eq("id", existing.id);

        if (updateError) {
          console.error("Update error for article:", article.link, updateError);
          errorCount++;
        } else {
          updatedCount++;
        }
      } else {
        const { error: insertError } = await supabase
          .from("organization_articles")
          .insert(articleData);

        if (insertError) {
          if (insertError.code === "23505") {
            console.log("Duplicate article skipped:", article.link);
          } else {
            console.error("Insert error for article:", article.link, insertError);
            errorCount++;
          }
        } else {
          insertedCount++;
        }
      }
    }

    console.log(`Completed: ${insertedCount} inserted, ${updatedCount} updated, ${errorCount} errors`);

    return new Response(
      JSON.stringify({
        success: true,
        organization_id,
        organization_name: searchQuery,
        total_found: newsResults.length,
        processed: sortedResults.length,
        inserted: insertedCount,
        updated: updatedCount,
        errors: errorCount,
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
