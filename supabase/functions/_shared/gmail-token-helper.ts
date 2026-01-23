import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = "https://lypodfdlpbpjdsswmsni.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const GOOGLE_CLIENT_ID = Deno.env.get("GOOGLE_CLIENT_ID")!;
const GOOGLE_CLIENT_SECRET = Deno.env.get("GOOGLE_CLIENT_SECRET")!;

interface GmailConnection {
  id: string;
  user_id: string;
  organization_id: string;
  access_token: string;
  refresh_token: string;
  token_expiry: string;
  email: string;
  is_active: boolean;
}

interface TokenRefreshResult {
  access_token: string;
  expires_in: number;
  token_type: string;
  scope?: string;
}

export async function refreshGmailToken(connectionId: string, refreshToken: string): Promise<{ access_token: string; token_expiry: Date }> {
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    if (errorData.error === "invalid_grant") {
      const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
      await supabase
        .from("gmail_connections")
        .update({ is_active: false })
        .eq("id", connectionId);
      throw new Error("REFRESH_TOKEN_REVOKED");
    }
    throw new Error(`Token refresh failed: ${errorData.error_description || errorData.error}`);
  }

  const tokenData: TokenRefreshResult = await response.json();
  const tokenExpiry = new Date(Date.now() + tokenData.expires_in * 1000);

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
  const { error: updateError } = await supabase
    .from("gmail_connections")
    .update({
      access_token: tokenData.access_token,
      token_expiry: tokenExpiry.toISOString(),
    })
    .eq("id", connectionId);

  if (updateError) {
    throw new Error(`Failed to update token: ${updateError.message}`);
  }

  return {
    access_token: tokenData.access_token,
    token_expiry: tokenExpiry,
  };
}

export async function getValidGmailToken(userId: string, organizationId?: string): Promise<string> {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  let query = supabase
    .from("gmail_connections")
    .select("*")
    .eq("user_id", userId)
    .eq("is_active", true);

  if (organizationId) {
    query = query.eq("organization_id", organizationId);
  }

  const { data: connections, error } = await query.limit(1).single();

  if (error || !connections) {
    throw new Error("GMAIL_NOT_CONNECTED");
  }

  const connection = connections as GmailConnection;
  const tokenExpiry = new Date(connection.token_expiry);
  const now = new Date();
  const fiveMinutesFromNow = new Date(now.getTime() + 5 * 60 * 1000);

  if (tokenExpiry > fiveMinutesFromNow) {
    return connection.access_token;
  }

  console.log(`Token expiring soon for user ${userId}, refreshing...`);
  const refreshResult = await refreshGmailToken(connection.id, connection.refresh_token);
  return refreshResult.access_token;
}
