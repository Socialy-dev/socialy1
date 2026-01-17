import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const BATCH_SIZE = 5;
const VISIBILITY_TIMEOUT = 300;
const APIFY_ACTOR_ID = "CP1SVZfEwWflrmWCX";
const APIFY_API_BASE = "https://api.apify.com/v2";

serve(async (req) => {
  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    console.log("🚀 Worker started - polling journalist_enrichment queue...");

    const { data: messages, error: readError } = await supabaseAdmin.rpc('pgmq_read', {
      p_queue_name: 'journalist_enrichment',
      p_vt: VISIBILITY_TIMEOUT,
      p_qty: BATCH_SIZE
    });

    if (readError) {
      console.error("❌ Error reading queue:", readError);
      return new Response(JSON.stringify({ error: readError.message }), { status: 500 });
    }

    if (!messages || messages.length === 0) {
      console.log("💤 No messages in queue");
      return new Response(JSON.stringify({ processed: 0 }), { status: 200 });
    }

    console.log(`📦 Processing ${messages.length} message(s)...`);

    let successCount = 0;
    let errorCount = 0;

    for (const message of messages) {
      const { msg_id, message: msgData } = message;
      const { job_log_id, organization_id, payload } = msgData;

      console.log(`🔄 Processing journalist: ${payload.journalist_id} (${payload.name})`);

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
          await supabaseAdmin
            .from('job_logs')
            .update({
              status: 'processing',
              started_at: new Date().toISOString(),
            })
            .eq('id', job_log_id);

          const { data: jobLog } = await supabaseAdmin
            .from('job_logs')
            .select('attempts')
            .eq('id', job_log_id)
            .single();

          await supabaseAdmin
            .from('job_logs')
            .update({ attempts: (jobLog?.attempts || 0) + 1 })
            .eq('id', job_log_id);
        }

        const enrichedData = await enrichJournalistWithApify(payload);

        const { error: updateError } = await supabaseAdmin
          .from('journalists')
          .update({
            linkedin: enrichedData.linkedin || payload.linkedin,
            email: enrichedData.email || payload.email,
            job: enrichedData.job || payload.job,
            phone: enrichedData.phone || payload.phone,
            metadata: enrichedData.metadata,
            enrichment_status: 'completed',
            enriched_at: new Date().toISOString(),
            enrichment_error: null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', payload.journalist_id)
          .eq('organization_id', organization_id);

        if (updateError) {
          throw new Error(`Failed to update journalist: ${updateError.message}`);
        }

        if (job_log_id) {
          await supabaseAdmin
            .from('job_logs')
            .update({
              status: 'completed',
              result: enrichedData,
              completed_at: new Date().toISOString(),
            })
            .eq('id', job_log_id);
        }

        await supabaseAdmin.rpc('pgmq_archive', {
          p_queue_name: 'journalist_enrichment',
          p_msg_id: msg_id
        });

        successCount++;
        console.log(`✅ Successfully enriched journalist ${payload.journalist_id}`);

      } catch (error) {
        console.error(`❌ Failed to enrich journalist ${payload.journalist_id}:`, error);

        await supabaseAdmin
          .from('journalists')
          .update({
            enrichment_status: 'failed',
            enrichment_error: (error as Error).message,
            updated_at: new Date().toISOString(),
          })
          .eq('id', payload.journalist_id)
          .eq('organization_id', organization_id);

        if (job_log_id) {
          await supabaseAdmin
            .from('job_logs')
            .update({
              status: 'failed',
              error_message: (error as Error).message,
              completed_at: new Date().toISOString(),
            })
            .eq('id', job_log_id);
        }

        await supabaseAdmin.rpc('pgmq_archive', {
          p_queue_name: 'journalist_enrichment',
          p_msg_id: msg_id
        });

        errorCount++;
      }
    }

    console.log(`✅ Batch complete: ${successCount} success, ${errorCount} errors`);

    return new Response(
      JSON.stringify({
        processed: messages.length,
        success: successCount,
        errors: errorCount,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" }
      }
    );

  } catch (error) {
    console.error("💥 Worker error:", error);
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { status: 500 }
    );
  }
});

async function enrichJournalistWithApify(payload: any) {
  console.log(`🔍 Enriching journalist via Apify: ${payload.name}`);

  const apifyApiToken = Deno.env.get("APIFY_API_TOKEN");

  if (!apifyApiToken) {
    console.warn("⚠️ APIFY_API_TOKEN not set - skipping enrichment");
    throw new Error("APIFY_API_TOKEN not configured");
  }

  const nameParts = payload.name.trim().split(/\s+/);
  const firstName = nameParts[0] || "";
  const lastName = nameParts.slice(1).join(" ") || "";

  if (!firstName) {
    throw new Error("Cannot extract first name from journalist name");
  }

  console.log(`👤 Searching LinkedIn for: ${firstName} ${lastName}`);

  const actorInput = {
    firstName: firstName,
    lastName: lastName,
    profileScraperMode: "Full + email search",
    maxItems: 5
  };

  const runActorUrl = `${APIFY_API_BASE}/acts/${APIFY_ACTOR_ID}/run-sync-get-dataset-items?token=${apifyApiToken}`;

  console.log(`🚀 Calling Apify actor...`);

  const response = await fetch(runActorUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(actorInput),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`❌ Apify API error: ${response.status} - ${errorText}`);
    throw new Error(`Apify API error: ${response.status} ${response.statusText}`);
  }

  const results = await response.json();

  console.log(`📦 Apify returned ${results.length} result(s)`);

  if (!results || results.length === 0) {
    console.warn(`⚠️ No LinkedIn profile found for ${payload.name}`);
    return {
      linkedin: null,
      email: null,
      phone: null,
      job: null,
      metadata: { apify_search: { firstName, lastName, found: false, searched_at: new Date().toISOString() } }
    };
  }

  const relevantKeywords = [
    'journalist', 'journaliste', 'reporter', 'editor', 'rédacteur', 'rédactrice',
    'writer', 'copywriter', 'content', 'blogger', 'blogueur', 'bloggeur',
    'freelance', 'author', 'auteur', 'columnist', 'chroniqueur', 'correspondent',
    'press', 'presse', 'media', 'médias', 'news', 'editorial', 'éditorial',
    'communication', 'pr ', 'public relations', 'relations publiques',
    'influencer', 'influenceur', 'créateur', 'creator', 'storyteller',
    'podcast', 'vidéaste', 'youtuber', 'social media', 'community manager'
  ];

  let bestProfile = null;
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
    
    console.log(`📊 Profile "${profile.fullName || profile.firstName}" score: ${score} (headline: ${headline.substring(0, 50)}...)`);
    
    if (score > bestScore) {
      bestScore = score;
      bestProfile = profile;
    }
  }

  if (!bestProfile) {
    bestProfile = results[0];
    console.log(`⚠️ No relevant profile found, using first result`);
  } else {
    console.log(`✅ Selected best profile with score ${bestScore}: ${bestProfile.fullName || bestProfile.firstName}`);
  }

  const profile = bestProfile;

  console.log(`✅ Found profile: ${profile.profileUrl || profile.linkedinUrl || 'N/A'}`);

  const linkedinUrl = profile.profileUrl || profile.linkedinUrl || profile.url || null;
  
  let email: string | null = null;
  const rawEmail = profile.email || (profile.emails && profile.emails[0]);
  if (rawEmail) {
    if (typeof rawEmail === 'string') {
      email = rawEmail;
    } else if (typeof rawEmail === 'object') {
      if (rawEmail.email && typeof rawEmail.email === 'string') {
        email = rawEmail.email;
      } else if (rawEmail.value && typeof rawEmail.value === 'string') {
        email = rawEmail.value;
      }
    }
  }
  
  let phone: string | null = null;
  const rawPhone = profile.phone || profile.phoneNumber || (profile.phones && profile.phones[0]);
  if (rawPhone) {
    if (typeof rawPhone === 'string') {
      phone = rawPhone;
    } else if (typeof rawPhone === 'object') {
      if (rawPhone.phone && typeof rawPhone.phone === 'string') {
        phone = rawPhone.phone;
      } else if (rawPhone.value && typeof rawPhone.value === 'string') {
        phone = rawPhone.value;
      } else if (rawPhone.number && typeof rawPhone.number === 'string') {
        phone = rawPhone.number;
      }
    }
  }
  
  const job = profile.headline || profile.title || profile.currentPosition?.title || null;
  const company = profile.company || profile.currentPosition?.company || null;
  
  let locationText: string | null = null;
  if (profile.location) {
    if (typeof profile.location === 'string') {
      locationText = profile.location;
    } else if (typeof profile.location === 'object') {
      locationText = profile.location.linkedinText || profile.location.text || profile.location.city || null;
    }
  }

  return {
    linkedin: linkedinUrl,
    email: email,
    phone: phone,
    job: job,
    metadata: {
      apify_enrichment: {
        enriched_at: new Date().toISOString(),
        fullName: profile.fullName || null,
        headline: profile.headline || null,
        company: company,
        location: locationText,
        connections: profile.connections || null,
        summary: profile.about || profile.summary || null
      }
    }
  };
}
