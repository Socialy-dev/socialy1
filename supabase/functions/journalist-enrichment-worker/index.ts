import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const BATCH_SIZE = 5;
const VISIBILITY_TIMEOUT = 300;
const MAX_TOTAL_PROCESSING = 30;
const APIFY_ACTOR_ID = "CP1SVZfEwWflrmWCX";
const APIFY_API_BASE = "https://api.apify.com/v2";

interface EnrichmentResult {
  linkedin: string | null;
  email: string | null;
  phone: string | null;
  job: string | null;
  firstName: string | null;
  lastName: string | null;
  found: boolean;
  errorCode?: string;
  errorMessage?: string;
}

const ERROR_CODES = {
  APIFY_TOKEN_MISSING: {
    code: "APIFY_CONFIG_001",
    message: "Configuration Apify manquante. Contactez l'administrateur système.",
  },
  APIFY_API_ERROR: {
    code: "APIFY_API_001", 
    message: "Erreur de communication avec le service d'enrichissement.",
  },
  NO_PROFILE_FOUND: {
    code: "ENRICH_001",
    message: "Aucun profil LinkedIn correspondant trouvé.",
  },
  INVALID_NAME: {
    code: "ENRICH_002",
    message: "Nom du journaliste invalide ou incomplet.",
  },
  PARSE_ERROR: {
    code: "PARSE_001",
    message: "Erreur lors du traitement des données récupérées.",
  },
  UPDATE_FAILED: {
    code: "DB_001",
    message: "Échec de la mise à jour en base de données.",
  },
} as const;

function formatErrorForUser(errorCode: keyof typeof ERROR_CODES, details?: string): string {
  const error = ERROR_CODES[errorCode];
  return details ? `[${error.code}] ${error.message} (${details})` : `[${error.code}] ${error.message}`;
}

serve(async (req) => {
  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    console.log("🚀 Worker démarré - traitement complet de la queue journalist_enrichment...");

    let totalProcessed = 0;
    let totalSuccess = 0;
    let totalErrors = 0;
    const allResults: Array<{journalist_id: string, status: string, error?: string}> = [];

    while (totalProcessed < MAX_TOTAL_PROCESSING) {
      const { data: messages, error: readError } = await supabaseAdmin.rpc('pgmq_read', {
        p_queue_name: 'journalist_enrichment',
        p_vt: VISIBILITY_TIMEOUT,
        p_qty: BATCH_SIZE
      });

      if (readError) {
        console.error("❌ Erreur lecture queue:", readError);
        if (totalProcessed === 0) {
          return new Response(JSON.stringify({ 
            success: false,
            error: formatErrorForUser("APIFY_API_ERROR", readError.message)
          }), { status: 500 });
        }
        break;
      }

      if (!messages || messages.length === 0) {
        console.log("✅ Queue vide - traitement terminé");
        break;
      }

      console.log(`📦 Batch ${Math.floor(totalProcessed / BATCH_SIZE) + 1}: ${messages.length} message(s)...`);

      for (const message of messages) {
        if (totalProcessed >= MAX_TOTAL_PROCESSING) {
          console.log(`⚠️ Limite de ${MAX_TOTAL_PROCESSING} atteinte - arrêt du traitement`);
          break;
        }

        const { msg_id, message: msgData } = message;
        const { job_log_id, organization_id, payload } = msgData;

        if (!payload?.journalist_id) {
          console.error("❌ Message invalide - journalist_id manquant");
          await supabaseAdmin.rpc('pgmq_archive', {
            p_queue_name: 'journalist_enrichment',
            p_msg_id: msg_id
          });
          totalErrors++;
          totalProcessed++;
          continue;
        }

        console.log(`🔄 [${totalProcessed + 1}/${MAX_TOTAL_PROCESSING}] Enrichissement: ${payload.name}`);

        try {
          await supabaseAdmin
            .from('journalists')
            .update({
              enrichment_status: 'processing',
              updated_at: new Date().toISOString(),
            })
            .eq('id', payload.journalist_id)
            .eq('organization_id', organization_id);

          if (job_log_id) {
            const { data: jobLog } = await supabaseAdmin
              .from('job_logs')
              .select('attempts')
              .eq('id', job_log_id)
              .single();

            await supabaseAdmin
              .from('job_logs')
              .update({
                status: 'processing',
                started_at: new Date().toISOString(),
                attempts: (jobLog?.attempts || 0) + 1
              })
              .eq('id', job_log_id);
          }

          const enrichedData = await enrichJournalistWithApify(payload);

          const updatePayload: Record<string, any> = {
            enrichment_status: enrichedData.found ? 'completed' : 'not_found',
            enriched_at: new Date().toISOString(),
            enrichment_error: enrichedData.found ? null : enrichedData.errorMessage,
            updated_at: new Date().toISOString(),
          };

          if (enrichedData.linkedin) {
            updatePayload.linkedin = enrichedData.linkedin;
          }
          if (enrichedData.email) {
            updatePayload.email = enrichedData.email;
          }
          if (enrichedData.phone) {
            updatePayload.phone = enrichedData.phone;
          }
          if (enrichedData.job) {
            updatePayload.job = enrichedData.job;
          }

          const { error: updateError } = await supabaseAdmin
            .from('journalists')
            .update(updatePayload)
            .eq('id', payload.journalist_id)
            .eq('organization_id', organization_id);

          if (updateError) {
            throw new Error(formatErrorForUser("UPDATE_FAILED", updateError.message));
          }

          if (job_log_id) {
            await supabaseAdmin
              .from('job_logs')
              .update({
                status: enrichedData.found ? 'completed' : 'completed_no_result',
                result: {
                  found: enrichedData.found,
                  linkedin: enrichedData.linkedin,
                  email: enrichedData.email,
                  job: enrichedData.job
                },
                completed_at: new Date().toISOString(),
              })
              .eq('id', job_log_id);
          }

          await supabaseAdmin.rpc('pgmq_archive', {
            p_queue_name: 'journalist_enrichment',
            p_msg_id: msg_id
          });

          totalSuccess++;
          allResults.push({
            journalist_id: payload.journalist_id,
            status: enrichedData.found ? 'enriched' : 'not_found'
          });
          console.log(`✅ ${payload.name} traité avec succès`);

        } catch (error) {
          const errorMessage = (error as Error).message;
          console.error(`❌ Échec ${payload.name}:`, errorMessage);

          await supabaseAdmin
            .from('journalists')
            .update({
              enrichment_status: 'failed',
              enrichment_error: errorMessage,
              updated_at: new Date().toISOString(),
            })
            .eq('id', payload.journalist_id)
            .eq('organization_id', organization_id);

          if (job_log_id) {
            await supabaseAdmin
              .from('job_logs')
              .update({
                status: 'failed',
                error_message: errorMessage,
                completed_at: new Date().toISOString(),
              })
              .eq('id', job_log_id);
          }

          await supabaseAdmin.rpc('pgmq_archive', {
            p_queue_name: 'journalist_enrichment',
            p_msg_id: msg_id
          });

          totalErrors++;
          allResults.push({
            journalist_id: payload.journalist_id,
            status: 'failed',
            error: errorMessage
          });
        }

        totalProcessed++;
      }
    }

    const summary = totalProcessed === 0 
      ? "Aucune tâche d'enrichissement en attente."
      : `${totalSuccess} journaliste(s) enrichi(s), ${totalErrors} erreur(s) sur ${totalProcessed} traité(s).`;

    console.log(`🏁 Traitement terminé: ${summary}`);

    return new Response(
      JSON.stringify({
        success: true,
        processed: totalProcessed,
        successCount: totalSuccess,
        errorCount: totalErrors,
        results: allResults,
        message: summary
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" }
      }
    );

  } catch (error) {
    console.error("💥 Erreur worker:", error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: formatErrorForUser("APIFY_API_ERROR", (error as Error).message)
      }),
      { status: 500 }
    );
  }
});

async function enrichJournalistWithApify(payload: any): Promise<EnrichmentResult> {
  console.log(`🔍 Recherche Apify pour: ${payload.name}`);

  const apifyApiToken = Deno.env.get("APIFY_API_TOKEN");

  if (!apifyApiToken) {
    console.error("⚠️ APIFY_API_TOKEN non configuré");
    throw new Error(formatErrorForUser("APIFY_TOKEN_MISSING"));
  }

  const nameParts = (payload.name || "").trim().split(/\s+/).filter(Boolean);
  
  if (nameParts.length === 0) {
    throw new Error(formatErrorForUser("INVALID_NAME", payload.name));
  }

  const firstName = nameParts[0];
  const lastName = nameParts.slice(1).join(" ") || "";

  console.log(`👤 Recherche LinkedIn: prénom="${firstName}" nom="${lastName}"`);

  const actorInput = {
    firstName: firstName,
    lastName: lastName,
    profileScraperMode: "Full + email search",
    maxItems: 2
  };

  const runActorUrl = `${APIFY_API_BASE}/acts/${APIFY_ACTOR_ID}/run-sync-get-dataset-items?token=${apifyApiToken}`;

  console.log(`🚀 Appel API Apify...`);

  let response: Response;
  try {
    response = await fetch(runActorUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(actorInput),
    });
  } catch (fetchError) {
    console.error("❌ Erreur réseau Apify:", fetchError);
    throw new Error(formatErrorForUser("APIFY_API_ERROR", "Erreur de connexion"));
  }

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`❌ Erreur API Apify: ${response.status} - ${errorText}`);
    throw new Error(formatErrorForUser("APIFY_API_ERROR", `HTTP ${response.status}`));
  }

  let results: any[];
  try {
    results = await response.json();
  } catch (parseError) {
    console.error("❌ Erreur parsing réponse Apify:", parseError);
    throw new Error(formatErrorForUser("PARSE_ERROR", "Réponse JSON invalide"));
  }

  console.log(`📦 Apify a retourné ${results?.length || 0} résultat(s)`);

  if (!results || results.length === 0) {
    console.warn(`⚠️ Aucun profil trouvé pour ${payload.name}`);
    return {
      linkedin: null,
      email: null,
      phone: null,
      job: null,
      firstName,
      lastName,
      found: false,
      errorCode: ERROR_CODES.NO_PROFILE_FOUND.code,
      errorMessage: ERROR_CODES.NO_PROFILE_FOUND.message
    };
  }

  const profile = selectBestProfile(results, firstName, lastName);
  
  console.log(`✅ Profil sélectionné: ${profile.fullName || profile.firstName || 'N/A'}`);

  return parseApifyProfile(profile, firstName, lastName);
}

function selectBestProfile(results: any[], firstName: string, lastName: string): any {
  const relevantKeywords = [
    'journalist', 'journaliste', 'reporter', 'editor', 'rédacteur', 'rédactrice',
    'writer', 'copywriter', 'content', 'blogger', 'blogueur', 'bloggeur',
    'freelance', 'author', 'auteur', 'columnist', 'chroniqueur', 'correspondent',
    'press', 'presse', 'media', 'médias', 'news', 'editorial', 'éditorial',
    'communication', 'pr ', 'public relations', 'relations publiques',
    'influencer', 'influenceur', 'créateur', 'creator', 'storyteller',
    'podcast', 'vidéaste', 'youtuber', 'social media', 'community manager'
  ];

  let bestProfile = results[0];
  let bestScore = 0;

  for (const profile of results) {
    const headline = (profile.headline || profile.title || '').toLowerCase();
    const about = (profile.about || profile.summary || '').toLowerCase();
    const searchText = `${headline} ${about}`;
    
    let score = 0;
    for (const keyword of relevantKeywords) {
      if (searchText.includes(keyword)) {
        score += headline.includes(keyword) ? 2 : 1;
      }
    }
    
    if (score > bestScore) {
      bestScore = score;
      bestProfile = profile;
    }
  }

  if (bestScore > 0) {
    console.log(`✅ Meilleur profil (score ${bestScore}): ${bestProfile.fullName || bestProfile.firstName}`);
  }

  return bestProfile;
}

function parseApifyProfile(profile: any, firstName: string, lastName: string): EnrichmentResult {
  const linkedinUrl = extractString(profile.linkedinUrl) 
    || extractString(profile.profileUrl) 
    || extractString(profile.url) 
    || null;

  const email = extractEmail(profile);
  const phone = extractPhone(profile);
  const job = extractString(profile.headline) 
    || extractString(profile.title) 
    || null;

  const profileFirstName = extractString(profile.firstName) || firstName;
  const profileLastName = extractString(profile.lastName) || lastName;

  console.log(`📋 Données extraites: LinkedIn=${linkedinUrl ? 'oui' : 'non'}, Email=${email ? 'oui' : 'non'}, Job=${job ? 'oui' : 'non'}`);

  return {
    linkedin: linkedinUrl,
    email,
    phone,
    job,
    firstName: profileFirstName,
    lastName: profileLastName,
    found: true
  };
}

function extractString(value: any): string | null {
  if (!value) return null;
  if (typeof value === 'string') return value.trim() || null;
  if (typeof value === 'object' && value.text) return extractString(value.text);
  return null;
}

function extractEmail(profile: any): string | null {
  const sources = [
    profile.email,
    profile.emails?.[0],
    profile.emails?.[0]?.email,
    profile.emails?.[0]?.value,
  ];

  for (const source of sources) {
    if (!source) continue;
    
    if (typeof source === 'string' && source.includes('@')) {
      return source.trim();
    }
    
    if (typeof source === 'object') {
      const email = source.email || source.value || source.address;
      if (typeof email === 'string' && email.includes('@')) {
        return email.trim();
      }
    }
  }

  return null;
}

function extractPhone(profile: any): string | null {
  const sources = [
    profile.phone,
    profile.phoneNumber,
    profile.phones?.[0],
    profile.phones?.[0]?.phone,
    profile.phones?.[0]?.number,
    profile.phones?.[0]?.value,
  ];

  for (const source of sources) {
    if (!source) continue;
    
    if (typeof source === 'string' && source.length >= 6) {
      return source.trim();
    }
    
    if (typeof source === 'object') {
      const phone = source.phone || source.number || source.value;
      if (typeof phone === 'string' && phone.length >= 6) {
        return phone.trim();
      }
    }
  }

  return null;
}
