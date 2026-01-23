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
    const googleClientId = Deno.env.get("GOOGLE_CLIENT_ID");
    const googleClientSecret = Deno.env.get("GOOGLE_CLIENT_SECRET");

    if (!googleClientId || !googleClientSecret) {
      throw new Error("GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET not configured");
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
    const signature = await createHmacSignature(stateJson, googleClientSecret);
    
    const signedState = btoa(JSON.stringify({
      payload: statePayload,
      signature: signature,
    }));

    const scopes = [
      "https://www.googleapis.com/auth/gmail.readonly",
      "https://www.googleapis.com/auth/userinfo.email",
    ];

    const redirectUri = `${supabaseUrl}/functions/v1/gmail-oauth-callback`;

    const params = new URLSearchParams({
      client_id: googleClientId,
      redirect_uri: redirectUri,
      response_type: "code",
      scope: scopes.join(" "),
      state: signedState,
      access_type: "offline",
      prompt: "consent",
    });

    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;

    return new Response(
      JSON.stringify({ auth_url: authUrl }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Gmail auth init error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return createErrorResponse(message, 500, corsHeaders);
  }
});
