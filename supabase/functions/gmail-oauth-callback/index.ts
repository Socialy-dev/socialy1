import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

async function verifyHmacSignature(data: string, signature: string, secret: string): Promise<boolean> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const dataToVerify = encoder.encode(data);
  
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["verify"]
  );
  
  const signatureBytes = Uint8Array.from(atob(signature), c => c.charCodeAt(0));
  
  return await crypto.subtle.verify("HMAC", cryptoKey, signatureBytes, dataToVerify);
}

serve(async (req) => {
  try {
    const url = new URL(req.url);
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");
    const error = url.searchParams.get("error");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const googleClientId = Deno.env.get("GOOGLE_CLIENT_ID")!;
    const googleClientSecret = Deno.env.get("GOOGLE_CLIENT_SECRET")!;
    const frontendUrl = Deno.env.get("FRONTEND_URL") || "https://socialy1.lovable.app";

    const errorRedirect = (message: string) => {
      const redirectUrl = `${frontendUrl}/profile?tab=integrations&error=${encodeURIComponent(message)}`;
      return new Response(null, {
        status: 302,
        headers: { Location: redirectUrl },
      });
    };

    const successRedirect = () => {
      const redirectUrl = `${frontendUrl}/profile?tab=integrations&success=gmail_connected`;
      return new Response(null, {
        status: 302,
        headers: { Location: redirectUrl },
      });
    };

    if (error) {
      console.error("OAuth error from Google:", error);
      return errorRedirect("Google authentication cancelled");
    }

    if (!code || !state) {
      return errorRedirect("Missing authorization code or state");
    }

    let stateData;
    try {
      stateData = JSON.parse(atob(state));
    } catch {
      return errorRedirect("Invalid state parameter");
    }

    const { payload, signature } = stateData;
    
    if (!payload || !signature) {
      return errorRedirect("Invalid state structure");
    }

    const isValidSignature = await verifyHmacSignature(
      JSON.stringify(payload),
      signature,
      googleClientSecret
    );

    if (!isValidSignature) {
      console.error("Invalid state signature - potential tampering detected");
      return errorRedirect("Security validation failed");
    }

    const { user_id, org_id, timestamp, nonce } = payload;

    if (!user_id || !org_id || !timestamp || !nonce) {
      return errorRedirect("Invalid state data");
    }

    const stateAge = Date.now() - timestamp;
    if (stateAge > 10 * 60 * 1000) {
      return errorRedirect("State expired, please try again");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data: membership, error: memberError } = await supabase
      .from("organization_members")
      .select("id")
      .eq("user_id", user_id)
      .eq("organization_id", org_id)
      .single();

    if (memberError || !membership) {
      console.error("User not member of organization:", user_id, org_id);
      return errorRedirect("Access denied");
    }

    const redirectUri = `${supabaseUrl}/functions/v1/gmail-oauth-callback`;

    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: googleClientId,
        client_secret: googleClientSecret,
        code: code,
        grant_type: "authorization_code",
        redirect_uri: redirectUri,
      }),
    });

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok) {
      console.error("Token exchange error:", tokenData);
      return errorRedirect("Failed to exchange authorization code");
    }

    const { access_token, refresh_token, expires_in } = tokenData;

    if (!access_token || !refresh_token) {
      return errorRedirect("Missing tokens in response");
    }

    const userInfoResponse = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    const userInfo = await userInfoResponse.json();

    if (!userInfoResponse.ok || !userInfo.email) {
      console.error("User info error:", userInfo);
      return errorRedirect("Failed to get user email");
    }

    const tokenExpiry = new Date(Date.now() + expires_in * 1000).toISOString();

    const { error: upsertError } = await supabase
      .from("gmail_connections")
      .upsert(
        {
          organization_id: org_id,
          user_id: user_id,
          access_token: access_token,
          refresh_token: refresh_token,
          token_expiry: tokenExpiry,
          email: userInfo.email,
          scopes: [
            "https://www.googleapis.com/auth/gmail.readonly",
            "https://www.googleapis.com/auth/userinfo.email",
          ],
          connected_at: new Date().toISOString(),
          is_active: true,
        },
        { onConflict: "organization_id,email" }
      );

    if (upsertError) {
      console.error("Database error:", upsertError);
      return errorRedirect("Failed to save connection");
    }

    console.log(`Gmail connected successfully for ${userInfo.email} in org ${org_id}`);
    return successRedirect();
  } catch (error) {
    console.error("Gmail callback error:", error);
    const frontendUrl = Deno.env.get("FRONTEND_URL") || "https://socialy1.lovable.app";
    return new Response(null, {
      status: 302,
      headers: { Location: `${frontendUrl}/profile?tab=integrations&error=Internal+error` },
    });
  }
});
