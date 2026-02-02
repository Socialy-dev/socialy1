import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { 
  getCorsHeaders, 
  validateAuthAndOrg, 
  createErrorResponse, 
  createSuccessResponse,
  getServiceClient 
} from "../_shared/security-helper.ts";

serve(async (req) => {
  const origin = req.headers.get("Origin");
  const corsHeaders = getCorsHeaders(origin);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const n8nWebhookUrl = Deno.env.get("N8N_MARKET_WATCH_DOCUMENT_WEBHOOK_URL");
    if (!n8nWebhookUrl) {
      console.error("N8N_MARKET_WATCH_DOCUMENT_WEBHOOK_URL not configured");
      return createErrorResponse("Webhook URL not configured", 500, corsHeaders);
    }

    const authHeader = req.headers.get("Authorization");
    const body = await req.json();
    const { organization_id, force_regenerate = false } = body;

    if (!organization_id) {
      return createErrorResponse("organization_id is required", 400, corsHeaders);
    }

    const validation = await validateAuthAndOrg(authHeader, organization_id);
    if (!validation.success) {
      return createErrorResponse(validation.error!, validation.status!, corsHeaders);
    }

    console.log("Generating market watch document for organization:", { organization_id, force_regenerate, userId: validation.user!.id });

    const supabase = getServiceClient();

    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    const { data: existingDoc, error: existingError } = await supabase
      .from("market_watch_documents")
      .select("*")
      .eq("organization_id", organization_id)
      .eq("month", currentMonth)
      .maybeSingle();

    if (existingDoc && existingDoc.status === 'completed' && !force_regenerate) {
      console.log("Document already exists and is completed:", existingDoc.id);
      return createSuccessResponse({
        success: true,
        document: existingDoc,
        already_exists: true,
      }, corsHeaders);
    }

    const { data: org, error: orgError } = await supabase
      .from("organizations")
      .select("name")
      .eq("id", organization_id)
      .single();

    if (orgError || !org) {
      console.error("Organization not found:", orgError);
      return createErrorResponse("Organization not found", 404, corsHeaders);
    }

    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const { data: topics, error: topicsError } = await supabase
      .from("market_watch_topics")
      .select("search_topic, title, snippet, source_name, link, article_date")
      .eq("organization_id", organization_id)
      .eq("hidden", false)
      .not("title", "is", null)
      .gte("created_at", monthStart.toISOString())
      .lte("created_at", monthEnd.toISOString())
      .order("article_iso_date", { ascending: false });

    if (topicsError) {
      console.error("Error fetching topics:", topicsError);
      return createErrorResponse("Failed to fetch topics", 500, corsHeaders);
    }

    const monthNames = [
      "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
      "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
    ];
    const documentTitle = `Veille ${monthNames[now.getMonth()]} ${now.getFullYear()} - ${org.name}`;

    let documentRecord;

    if (existingDoc) {
      const { data: updatedDoc, error: updateError } = await supabase
        .from("market_watch_documents")
        .update({
          status: 'pending',
          title: documentTitle,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingDoc.id)
        .select()
        .single();

      if (updateError) {
        console.error("Error updating document:", updateError);
        return createErrorResponse("Failed to update document", 500, corsHeaders);
      }
      documentRecord = updatedDoc;
    } else {
      const { data: newDoc, error: insertError } = await supabase
        .from("market_watch_documents")
        .insert({
          organization_id,
          title: documentTitle,
          month: currentMonth,
          status: 'pending',
        })
        .select()
        .single();

      if (insertError) {
        console.error("Error creating document:", insertError);
        return createErrorResponse("Failed to create document", 500, corsHeaders);
      }
      documentRecord = newDoc;
    }

    const payload = {
      document_id: documentRecord.id,
      organization_id,
      organization_name: org.name,
      month: currentMonth,
      topics: topics || [],
      user_id: validation.user!.id,
      created_at: new Date().toISOString(),
    };

    console.log("Forwarding to n8n for document generation:", { document_id: documentRecord.id, topics_count: topics?.length || 0 });

    const n8nResponse = await fetch(n8nWebhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!n8nResponse.ok) {
      const errorText = await n8nResponse.text();
      console.error("n8n webhook error:", errorText);
      
      await supabase
        .from("market_watch_documents")
        .update({ status: 'error' })
        .eq("id", documentRecord.id);

      return createErrorResponse("n8n webhook failed", 500, corsHeaders);
    }

    const n8nResult = await n8nResponse.json();
    console.log("n8n response:", n8nResult);

    return createSuccessResponse({
      success: true,
      document: documentRecord,
      n8n_response: n8nResult,
    }, corsHeaders);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Unexpected error:", error);
    return createErrorResponse(errorMessage, 500, corsHeaders);
  }
});
