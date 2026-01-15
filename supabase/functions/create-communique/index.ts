import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Domaines autorisés pour CORS
const ALLOWED_ORIGINS = [
  "https://lypodfdlpbpjdsswmsni.supabase.co",
  "http://localhost:5173",
  "http://localhost:3000",
];

const getCorsHeaders = (origin: string | null) => {
  const allowedOrigin = origin && ALLOWED_ORIGINS.some(allowed => origin.startsWith(allowed.replace(/:\d+$/, '')))
    ? origin
    : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Credentials": "true",
  };
};

interface CommuniquePayload {
  cpType: string;
  cpTypeOther?: string;
  clientMarque: string;
  titre?: string;
  sousTitre?: string;
  sujetPrincipal: string;
  angleCreatif?: string;
  messagesCles?: string;
  dateDiffusion: string;
  lienAssets?: string;
  imageUrl?: string;
  equipeClient?: string;
  equipeSocialy?: string;
  contactNom: string;
  contactFonction?: string;
  contactEmail: string;
  contactTelephone: string;
  infosSupplementaires?: string;
}

Deno.serve(async (req) => {
  const origin = req.headers.get("Origin");
  const corsHeaders = getCorsHeaders(origin);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing authorization header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const payload: CommuniquePayload = await req.json();

    if (!payload.clientMarque || !payload.sujetPrincipal || !payload.dateDiffusion ||
      !payload.contactNom || !payload.contactEmail || !payload.contactTelephone) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const cpName = payload.titre?.trim() || `${payload.clientMarque} - ${payload.cpType === "autre" ? payload.cpTypeOther : payload.cpType}`;

    const { data: communique, error: insertError } = await supabase
      .from("communique_presse")
      .insert({
        name: cpName,
        assets_link: payload.lienAssets || payload.imageUrl || null,
        created_by: user.id,
      })
      .select()
      .single();

    if (insertError) {
      console.error("Insert error:", insertError);
      return new Response(JSON.stringify({ error: "Failed to create communique" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const n8nWebhookUrl = Deno.env.get("N8N_CREATE_CP_WEBHOOK_URL");

    if (n8nWebhookUrl) {
      try {
        const webhookPayload = {
          communique_id: communique.id,
          user_id: user.id,
          organization_id: communique.organization_id,
          ...payload,
          created_at: new Date().toISOString(),
        };

        await fetch(n8nWebhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(webhookPayload),
        });
      } catch (webhookError) {
        console.error("Webhook error:", webhookError);
      }
    }

    return new Response(JSON.stringify({ success: true, communique }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
