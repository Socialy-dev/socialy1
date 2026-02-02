import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { 
  getCorsHeaders, 
  validateAuthAndOrg, 
  createErrorResponse 
} from "../_shared/security-helper.ts";

async function createHmacSignature(data: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const dataToSign = encoder.encode(data);
  
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  
  const signature = await crypto.subtle.sign("HMAC", cryptoKey, dataToSign);
  return btoa(String.fromCharCode(...new Uint8Array(signature)));
}

serve(async (req) => {
  const origin = req.headers.get("Origin");
  const corsHeaders = getCorsHeaders(origin);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const metaAppId = Deno.env.get("META_APP_ID");
    const metaAppSecret = Deno.env.get("META_APP_SECRET");

    if (!metaAppId || !metaAppSecret) {
      throw new Error("META_APP_ID or META_APP_SECRET not configured");
    }

    const authHeader = req.headers.get("Authorization");
    const { organization_id } = await req.json();

    if (!organization_id) {
      return createErrorResponse("organization_id required", 400, corsHeaders);
    }

    const validation = await validateAuthAndOrg(authHeader, organization_id);
    if (!validation.success) {
      return createErrorResponse(validation.error!, validation.status!, corsHeaders);
    }

    const statePayload = {
      user_id: validation.user!.id,
      org_id: organization_id,
      timestamp: Date.now(),
      nonce: crypto.randomUUID(),
    };
    
    const stateJson = JSON.stringify(statePayload);
    const signature = await createHmacSignature(stateJson, metaAppSecret);
    
    const signedState = btoa(JSON.stringify({
      payload: statePayload,
      signature: signature,
    }));

    const scopes = [
      "ads_read",
      "ads_management",
      "business_management",
      "public_profile",
    ];

    const redirectUri = `${supabaseUrl}/functions/v1/meta-oauth-callback`;

    const params = new URLSearchParams({
      client_id: metaAppId,
      redirect_uri: redirectUri,
      response_type: "code",
      scope: scopes.join(","),
      state: signedState,
    });

    const authUrl = `https://www.facebook.com/v21.0/dialog/oauth?${params.toString()}`;

    return new Response(
      JSON.stringify({ auth_url: authUrl }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Meta auth init error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return createErrorResponse(message, 500, corsHeaders);
  }
});
