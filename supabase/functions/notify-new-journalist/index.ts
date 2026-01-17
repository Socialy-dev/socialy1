import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const ALLOWED_ORIGINS = [
  "https://socialy1.lovable.app",
  "https://id-preview--d652ab17-4466-4f7d-9908-a5f63da4d0fe.lovable.app",
  "http://localhost:5173",
  "http://localhost:3000",
];

const MAX_BATCH_SIZE = 25;

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
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const body = await req.json();
    const { journalists, organization_id, journalist_id, name, media, email, linkedin } = body;

    if (journalists && Array.isArray(journalists) && journalists.length > 0) {
      if (journalists.length > MAX_BATCH_SIZE) {
        console.warn(`⚠️ Batch size ${journalists.length} exceeds limit of ${MAX_BATCH_SIZE}`);
        return new Response(
          JSON.stringify({ 
            success: false,
            error: `Limite dépassée : maximum ${MAX_BATCH_SIZE} journalistes par enrichissement. Vous en avez sélectionné ${journalists.length}.`,
            code: "BATCH_LIMIT_EXCEEDED",
            limit: MAX_BATCH_SIZE,
            requested: journalists.length
          }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      console.log(`📦 Mise en queue de ${journalists.length} journaliste(s) pour enrichissement`);

      const jobLogIds = [];
      const errors = [];

      for (const journalist of journalists) {
        const journalistId = journalist.journalist_id || journalist.id;
        try {
          await supabase
            .from('journalists')
            .update({ enrichment_status: 'pending' })
            .eq('id', journalistId);

          const { data: jobLogId, error } = await supabase.rpc('enqueue_job', {
            p_queue_name: 'journalist_enrichment',
            p_job_type: 'enrich_journalist',
            p_organization_id: organization_id || journalist.organization_id,
            p_payload: {
              journalist_id: journalistId,
              name: journalist.name,
              media: journalist.media || null,
              email: journalist.email || null,
              linkedin: journalist.linkedin || null,
            }
          });

          if (error) {
            console.error(`❌ Échec mise en queue ${journalistId}:`, error);
            await supabase
              .from('journalists')
              .update({ enrichment_status: null, enrichment_error: error.message })
              .eq('id', journalistId);
            errors.push({ journalist_id: journalistId, error: error.message });
          } else {
            jobLogIds.push(jobLogId);
            console.log(`✅ Journaliste ${journalist.name} ajouté à la queue`);
          }
        } catch (err) {
          console.error(`💥 Exception pour ${journalistId}:`, err);
          await supabase
            .from('journalists')
            .update({ enrichment_status: null, enrichment_error: (err as Error).message })
            .eq('id', journalistId);
          errors.push({ journalist_id: journalistId, error: (err as Error).message });
        }
      }

      console.log(`✅ Queue remplie: ${jobLogIds.length} ajoutés, ${errors.length} erreurs`);

      if (jobLogIds.length > 0) {
        console.log("🚀 Démarrage du worker d'enrichissement...");
        
        try {
          const workerResponse = await fetch(`${supabaseUrl}/functions/v1/journalist-enrichment-worker`, {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${supabaseKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ trigger: "batch_enqueue" }),
          });

          if (workerResponse.ok) {
            const workerResult = await workerResponse.json();
            console.log("✅ Worker terminé:", workerResult);

            return new Response(
              JSON.stringify({
                success: true,
                queued: jobLogIds.length,
                total: journalists.length,
                processed: workerResult.processed || 0,
                successCount: workerResult.successCount || 0,
                errorCount: workerResult.errorCount || 0,
                message: workerResult.message || `${jobLogIds.length} journaliste(s) traité(s)`,
                queueErrors: errors.length > 0 ? errors : undefined,
              }),
              { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          } else {
            const errorText = await workerResponse.text();
            console.error("❌ Erreur worker:", errorText);
            
            return new Response(
              JSON.stringify({
                success: true,
                queued: jobLogIds.length,
                total: journalists.length,
                workerError: "Le traitement a été mis en queue mais le worker a rencontré une erreur.",
                message: `${jobLogIds.length} journaliste(s) mis en queue. Traitement en cours...`,
                queueErrors: errors.length > 0 ? errors : undefined,
              }),
              { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          }
        } catch (workerErr) {
          console.error("💥 Exception appel worker:", workerErr);
          
          return new Response(
            JSON.stringify({
              success: true,
              queued: jobLogIds.length,
              total: journalists.length,
              message: `${jobLogIds.length} journaliste(s) mis en queue. Le traitement démarrera automatiquement.`,
              queueErrors: errors.length > 0 ? errors : undefined,
            }),
            { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
      }

      return new Response(
        JSON.stringify({
          success: errors.length < journalists.length,
          queued: jobLogIds.length,
          total: journalists.length,
          errors: errors.length > 0 ? errors : undefined,
          message: jobLogIds.length > 0 
            ? `${jobLogIds.length} journaliste(s) mis en queue`
            : "Aucun journaliste n'a pu être mis en queue",
        }),
        { status: jobLogIds.length > 0 ? 200 : 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!journalist_id || !name || !organization_id) {
      return new Response(
        JSON.stringify({ error: "Champs requis manquants: journalist_id, name, organization_id" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("🔄 Mise en queue journaliste unique:", { journalist_id, name, media, organization_id });

    try {
      const { data: jobLogId, error } = await supabase.rpc('enqueue_job', {
        p_queue_name: 'journalist_enrichment',
        p_job_type: 'enrich_journalist',
        p_organization_id: organization_id,
        p_payload: {
          journalist_id,
          name,
          media: media || null,
          email: email || null,
          linkedin: linkedin || null,
        }
      });

      if (error) {
        console.error("❌ Échec mise en queue:", error);
        return new Response(
          JSON.stringify({ error: "Impossible de mettre en queue l'enrichissement", details: error.message }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      console.log(`✅ Journaliste mis en queue (job_log_id: ${jobLogId})`);
      console.log("🚀 Démarrage du worker...");
      
      fetch(`${supabaseUrl}/functions/v1/journalist-enrichment-worker`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${supabaseKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ trigger: "single_enqueue" }),
      }).catch(err => console.error("Worker trigger error:", err));

      return new Response(
        JSON.stringify({ success: true, job_log_id: jobLogId, message: "Enrichissement en cours..." }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } catch (err) {
      console.error("💥 Exception:", err);
      return new Response(
        JSON.stringify({ error: "Erreur interne du serveur", details: (err as Error).message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: "Erreur interne du serveur" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
