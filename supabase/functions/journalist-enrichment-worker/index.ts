import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const BATCH_SIZE = 5; // Process max 5 messages per invocation
const VISIBILITY_TIMEOUT = 300; // 5 minutes

serve(async (req) => {
  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    console.log("🚀 Worker started - polling journalist_enrichment queue...");

    // Read messages from the queue
    const { data: messages, error: readError } = await supabaseAdmin.rpc('pgmq_read', {
      queue_name: 'journalist_enrichment',
      vt: VISIBILITY_TIMEOUT,
      qty: BATCH_SIZE
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

    // Process each message
    let successCount = 0;
    let errorCount = 0;

    for (const message of messages) {
      const { msg_id, message: msgData } = message;
      const { job_log_id, organization_id, payload } = msgData;

      console.log(`🔄 Processing journalist: ${payload.journalist_id} (${payload.name})`);

      try {
        // Update job status to processing
        const { error: updateStatusError } = await supabaseAdmin
          .from('job_logs')
          .update({
            status: 'processing',
            started_at: new Date().toISOString(),
          })
          .eq('id', job_log_id);

        if (updateStatusError) {
          console.error("⚠️ Failed to update job status:", updateStatusError);
        }

        // Increment attempts count
        const { data: jobLog } = await supabaseAdmin
          .from('job_logs')
          .select('attempts')
          .eq('id', job_log_id)
          .single();

        await supabaseAdmin
          .from('job_logs')
          .update({ attempts: (jobLog?.attempts || 0) + 1 })
          .eq('id', job_log_id);

        // ENRICHMENT LOGIC
        const enrichedData = await enrichJournalist(payload);

        // Update journalist in database
        const { error: updateError } = await supabaseAdmin
          .from('journalists')
          .update({
            linkedin: enrichedData.linkedin || payload.linkedin,
            email: enrichedData.email || payload.email,
            job: enrichedData.job,
            phone: enrichedData.phone,
            notes: enrichedData.notes,
            updated_at: new Date().toISOString(),
          })
          .eq('id', payload.journalist_id)
          .eq('organization_id', organization_id);

        if (updateError) {
          throw new Error(`Failed to update journalist: ${updateError.message}`);
        }

        // Log success
        await supabaseAdmin
          .from('job_logs')
          .update({
            status: 'completed',
            result: enrichedData,
            completed_at: new Date().toISOString(),
          })
          .eq('id', job_log_id);

        // Archive message (remove from queue)
        await supabaseAdmin.rpc('pgmq_archive', {
          queue_name: 'journalist_enrichment',
          msg_id: msg_id
        });

        successCount++;
        console.log(`✅ Successfully enriched journalist ${payload.journalist_id}`);

      } catch (error) {
        console.error(`❌ Failed to enrich journalist ${payload.journalist_id}:`, error);

        // Log error
        await supabaseAdmin
          .from('job_logs')
          .update({
            status: 'failed',
            error_message: (error as Error).message,
            completed_at: new Date().toISOString(),
          })
          .eq('id', job_log_id);

        // Archive message (no automatic retry for now)
        // TODO: Implement retry logic with max attempts
        await supabaseAdmin.rpc('pgmq_archive', {
          queue_name: 'journalist_enrichment',
          msg_id: msg_id
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

/**
 * Enrich journalist information using external APIs
 * TODO: Implement real enrichment logic with Perplexity/Apollo/Hunter APIs
 */
async function enrichJournalist(payload: any) {
  console.log(`🔍 Enriching journalist: ${payload.name} from ${payload.media}`);

  // Check if we have Perplexity API key
  const perplexityApiKey = Deno.env.get("PERPLEXITY_API_KEY");

  if (!perplexityApiKey) {
    console.warn("⚠️ PERPLEXITY_API_KEY not set - using mock enrichment");
    return mockEnrichment(payload);
  }

  try {
    // Build enrichment prompt
    const prompt = `Find professional information about ${payload.name}${payload.media ? ` who works at ${payload.media}` : ''}.

Please provide:
1. LinkedIn profile URL
2. Professional email address
3. Phone number (if publicly available)
4. Current job title
5. Brief professional background

Format the response as JSON with keys: linkedin, email, phone, job, background`;

    // Call Perplexity API
    const response = await fetch("https://api.perplexity.ai/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${perplexityApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.1-sonar-small-128k-online",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.2,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      throw new Error(`Perplexity API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;

    // Parse response
    const enrichedInfo = parseEnrichedData(content);

    return {
      linkedin: enrichedInfo.linkedin || null,
      email: enrichedInfo.email || null,
      phone: enrichedInfo.phone || null,
      job: enrichedInfo.job || null,
      notes: `Enriched via Perplexity on ${new Date().toISOString()}\n\n${enrichedInfo.background || ''}`,
    };

  } catch (error) {
    console.error("❌ Enrichment API error:", error);

    // Fallback to mock enrichment
    return mockEnrichment(payload);
  }
}

/**
 * Parse enriched data from API response
 */
function parseEnrichedData(text: string) {
  try {
    // Try to parse as JSON first
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return parsed;
    }

    // Otherwise, try to extract information with regex
    const linkedinMatch = text.match(/linkedin[^\n]*(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/([a-zA-Z0-9-]+)/i);
    const emailMatch = text.match(/email[^\n]*([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i);
    const phoneMatch = text.match(/phone[^\n]*(\+?[\d\s()-]{10,})/i);
    const jobMatch = text.match(/job title[^\n]*:?\s*([^\n]+)/i);

    return {
      linkedin: linkedinMatch ? `https://linkedin.com/in/${linkedinMatch[1]}` : null,
      email: emailMatch ? emailMatch[1] : null,
      phone: phoneMatch ? phoneMatch[1].trim() : null,
      job: jobMatch ? jobMatch[1].trim() : null,
      background: text,
    };

  } catch (error) {
    console.error("Failed to parse enriched data:", error);
    return {
      linkedin: null,
      email: null,
      phone: null,
      job: null,
      background: text,
    };
  }
}

/**
 * Mock enrichment for testing without API key
 */
function mockEnrichment(payload: any) {
  console.log("🎭 Using mock enrichment");

  return {
    linkedin: payload.linkedin || null,
    email: payload.email || null,
    phone: null,
    job: null,
    notes: `Mock enrichment on ${new Date().toISOString()} - Configure PERPLEXITY_API_KEY for real enrichment`,
  };
}
