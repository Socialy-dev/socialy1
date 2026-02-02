import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { 
  getCorsHeaders, 
  validateAuthAndOrg, 
  createErrorResponse, 
  createSuccessResponse,
  getServiceClient 
} from "../_shared/security-helper.ts";

const MAX_BATCH_SIZE = 25;

serve(async (req) => {
  const origin = req.headers.get("Origin");
  const corsHeaders = getCorsHeaders(origin);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    const body = await req.json();
    const { journalists, organization_id, journalist_id, name, media, email, linkedin } = body;

    const orgIdToValidate = organization_id || (journalists && journalists[0]?.organization_id);
    
    if (!orgIdToValidate) {
      return createErrorResponse("organization_id is required", 400, corsHeaders);
    }

    const validation = await validateAuthAndOrg(authHeader, orgIdToValidate);
    if (!validation.success) {
      return createErrorResponse(validation.error!, validation.status!, corsHeaders);
    }

    const supabase = getServiceClient();
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    if (journalists && Array.isArray(journalists) && journalists.length > 0) {
      if (journalists.length > MAX_BATCH_SIZE) {
        console.warn(`⚠️ Batch size ${journalists.length} exceeds limit of ${MAX_BATCH_SIZE}`);
        return createErrorResponse(
          `Limite dépassée : maximum ${MAX_BATCH_SIZE} journalistes par enrichissement. Vous en avez sélectionné ${journalists.length}.`,
          400,
          corsHeaders
        );
      }

      console.log(`📦 Mise en queue de ${journalists.length} journaliste(s) pour enrichissement`);

      const jobLogIds: string[] = [];
      const errors: { journalist_id: string; error: string }[] = [];

      for (const journalist of journalists) {
        const journalistId = journalist.journalist_id || journalist.id;
        const journalistOrgId = journalist.organization_id || organization_id;

        if (journalistOrgId !== orgIdToValidate) {
          errors.push({ journalist_id: journalistId, error: "Invalid organization" });
          continue;
        }

        try {
          await supabase
            .from('journalists')
            .update({ enrichment_status: 'pending' })
            .eq('id', journalistId);

          const { data: jobLogId, error } = await supabase.rpc('enqueue_job', {
            p_queue_name: 'journalist_enrichment',
            p_job_type: 'enrich_journalist',
            p_organization_id: journalistOrgId,
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
            jobLogIds.push(jobLogId as string);
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

            return createSuccessResponse({
              success: true,
              queued: jobLogIds.length,
              total: journalists.length,
              processed: workerResult.processed || 0,
              successCount: workerResult.successCount || 0,
              errorCount: workerResult.errorCount || 0,
              message: workerResult.message || `${jobLogIds.length} journaliste(s) traité(s)`,
              queueErrors: errors.length > 0 ? errors : undefined,
            }, corsHeaders);
          } else {
            const errorText = await workerResponse.text();
            console.error("❌ Erreur worker:", errorText);
            
            return createSuccessResponse({
              success: true,
              queued: jobLogIds.length,
              total: journalists.length,
              workerError: "Le traitement a été mis en queue mais le worker a rencontré une erreur.",
              message: `${jobLogIds.length} journaliste(s) mis en queue. Traitement en cours...`,
              queueErrors: errors.length > 0 ? errors : undefined,
            }, corsHeaders);
          }
        } catch (workerErr) {
          console.error("💥 Exception appel worker:", workerErr);
          
          return createSuccessResponse({
            success: true,
            queued: jobLogIds.length,
            total: journalists.length,
            message: `${jobLogIds.length} journaliste(s) mis en queue. Le traitement démarrera automatiquement.`,
            queueErrors: errors.length > 0 ? errors : undefined,
          }, corsHeaders);
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
      return createErrorResponse("Champs requis manquants: journalist_id, name, organization_id", 400, corsHeaders);
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
        return createErrorResponse("Impossible de mettre en queue l'enrichissement", 500, corsHeaders);
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

      return createSuccessResponse({ success: true, job_log_id: jobLogId, message: "Enrichissement en cours..." }, corsHeaders);
    } catch (err) {
      console.error("💥 Exception:", err);
      return createErrorResponse("Erreur interne du serveur", 500, corsHeaders);
    }
  } catch (error) {
    console.error("Error:", error);
    return createErrorResponse("Erreur interne du serveur", 500, corsHeaders);
  }
});
