import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { 
  getCorsHeaders, 
  validateAuthentication, 
  createErrorResponse, 
  createSuccessResponse,
  getUserClient 
} from "../_shared/security-helper.ts";

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
  organization_id?: string;
}

Deno.serve(async (req) => {
  const origin = req.headers.get("Origin");
  const corsHeaders = getCorsHeaders(origin);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    
    const authResult = await validateAuthentication(authHeader);
    if (!authResult.success) {
      return createErrorResponse(authResult.error!, authResult.status!, corsHeaders);
    }

    const supabase = getUserClient(authHeader!);
    const payload: CommuniquePayload = await req.json();

    if (!payload.clientMarque || !payload.sujetPrincipal || !payload.dateDiffusion ||
      !payload.contactNom || !payload.contactEmail || !payload.contactTelephone) {
      return createErrorResponse("Missing required fields", 400, corsHeaders);
    }

    const cpName = payload.titre?.trim() || `${payload.clientMarque} - ${payload.cpType === "autre" ? payload.cpTypeOther : payload.cpType}`;

    const { data: communique, error: insertError } = await supabase
      .from("communique_presse")
      .insert({
        name: cpName,
        assets_link: payload.lienAssets || payload.imageUrl || null,
        created_by: authResult.user!.id,
        organization_id: payload.organization_id || null,
      })
      .select()
      .single();

    if (insertError) {
      console.error("Insert error:", insertError);
      return createErrorResponse("Failed to create communique", 500, corsHeaders);
    }

    const n8nWebhookUrl = Deno.env.get("N8N_CREATE_CP_WEBHOOK_URL");

    if (n8nWebhookUrl) {
      try {
        const webhookPayload = {
          communique_id: communique.id,
          user_id: authResult.user!.id,
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

    return createSuccessResponse({ success: true, communique }, corsHeaders);
  } catch (error) {
    console.error("Error:", error);
    return createErrorResponse("Internal server error", 500, corsHeaders);
  }
});
