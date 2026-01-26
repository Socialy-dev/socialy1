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
    const metaAppId = Deno.env.get("META_APP_ID")!;
    const metaAppSecret = Deno.env.get("META_APP_SECRET")!;
    const frontendUrl = Deno.env.get("FRONTEND_URL") || "https://socialy1.lovable.app";

    const errorRedirect = (message: string) => {
      const redirectUrl = `${frontendUrl}/profile?tab=integrations&error=${encodeURIComponent(message)}`;
      return new Response(null, {
        status: 302,
        headers: { Location: redirectUrl },
      });
    };

    const successRedirect = (adAccountCount: number) => {
      const redirectUrl = `${frontendUrl}/profile?tab=integrations&success=meta_connected&accounts=${adAccountCount}`;
      return new Response(null, {
        status: 302,
        headers: { Location: redirectUrl },
      });
    };

    if (error) {
      console.error("OAuth error from Meta:", error);
      return errorRedirect("Authentification Meta annulée");
    }

    if (!code || !state) {
      return errorRedirect("Code d'autorisation ou state manquant");
    }

    let stateData;
    try {
      stateData = JSON.parse(atob(state));
    } catch {
      return errorRedirect("Paramètre state invalide");
    }

    const { payload, signature } = stateData;
    
    if (!payload || !signature) {
      return errorRedirect("Structure state invalide");
    }

    const isValidSignature = await verifyHmacSignature(
      JSON.stringify(payload),
      signature,
      metaAppSecret
    );

    if (!isValidSignature) {
      console.error("Invalid state signature - potential tampering detected");
      return errorRedirect("Validation de sécurité échouée");
    }

    const { user_id, org_id, timestamp, nonce } = payload;

    if (!user_id || !org_id || !timestamp || !nonce) {
      return errorRedirect("Données state invalides");
    }

    const stateAge = Date.now() - timestamp;
    if (stateAge > 10 * 60 * 1000) {
      return errorRedirect("State expiré, veuillez réessayer");
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
      return errorRedirect("Accès refusé");
    }

    const redirectUri = `${supabaseUrl}/functions/v1/meta-oauth-callback`;

    const tokenResponse = await fetch("https://graph.facebook.com/v21.0/oauth/access_token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: metaAppId,
        client_secret: metaAppSecret,
        code: code,
        redirect_uri: redirectUri,
      }),
    });

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok) {
      console.error("Token exchange error:", tokenData);
      return errorRedirect("Échec de l'échange du code d'autorisation");
    }

    const { access_token, expires_in } = tokenData;

    if (!access_token) {
      return errorRedirect("Token d'accès manquant dans la réponse");
    }

    const longLivedResponse = await fetch(
      `https://graph.facebook.com/v21.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${metaAppId}&client_secret=${metaAppSecret}&fb_exchange_token=${access_token}`
    );
    
    const longLivedData = await longLivedResponse.json();
    const longLivedToken = longLivedData.access_token || access_token;
    const longLivedExpiry = longLivedData.expires_in || expires_in || 5184000;

    const userInfoResponse = await fetch(
      `https://graph.facebook.com/v21.0/me?fields=id,name,email&access_token=${longLivedToken}`
    );

    const userInfo = await userInfoResponse.json();

    if (!userInfoResponse.ok) {
      console.error("User info error:", userInfo);
      return errorRedirect("Échec de la récupération des informations utilisateur");
    }

    let adAccountIds: string[] = [];
    let businessId: string | null = null;
    let nextUrl: string | null = `https://graph.facebook.com/v21.0/me/adaccounts?fields=account_id,name,account_status,business_name&limit=100&access_token=${longLivedToken}`;

    while (nextUrl) {
      const response: Response = await fetch(nextUrl);
      const data: { data?: Array<{ account_id: string }>; paging?: { next?: string }; error?: unknown } = await response.json();

      if (response.ok && data.data) {
        const pageIds = data.data.map((acc) => {
          const accountId = acc.account_id;
          return accountId.startsWith("act_") ? accountId : `act_${accountId}`;
        });
        adAccountIds = [...adAccountIds, ...pageIds];
        console.log(`Fetched ${pageIds.length} ad accounts (total: ${adAccountIds.length})`);

        nextUrl = data.paging?.next || null;
      } else {
        console.error("Error fetching ad accounts page:", data);
        break;
      }
    }

    console.log("Total Ad Account IDs fetched:", adAccountIds.length, adAccountIds);

    const tokenExpiry = new Date(Date.now() + longLivedExpiry * 1000).toISOString();

    const { error: upsertError } = await supabase
      .from("meta_connections")
      .upsert(
        {
          organization_id: org_id,
          user_id: user_id,
          access_token: longLivedToken,
          token_expiry: tokenExpiry,
          ad_account_ids: adAccountIds,
          business_id: businessId,
          user_name: userInfo.name,
          email: userInfo.email || `meta_${userInfo.id}@facebook.com`,
          connected_at: new Date().toISOString(),
          is_active: true,
        },
        { onConflict: "organization_id,email" }
      );

    if (upsertError) {
      console.error("Database error:", upsertError);
      return errorRedirect("Échec de la sauvegarde de la connexion");
    }

    console.log(`Meta Ads connected successfully for ${userInfo.name} in org ${org_id} with ${adAccountIds.length} ad accounts`);
    return successRedirect(adAccountIds.length);
  } catch (error) {
    console.error("Meta callback error:", error);
    const frontendUrl = Deno.env.get("FRONTEND_URL") || "https://socialy1.lovable.app";
    return new Response(null, {
      status: 302,
      headers: { Location: `${frontendUrl}/profile?tab=integrations&error=Erreur+interne` },
    });
  }
});
