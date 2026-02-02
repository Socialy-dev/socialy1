import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = "https://lypodfdlpbpjdsswmsni.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const GOOGLE_CLIENT_ID = Deno.env.get("GOOGLE_CLIENT_ID")!;
const GOOGLE_CLIENT_SECRET = Deno.env.get("GOOGLE_CLIENT_SECRET")!;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { user_id, organization_id } = await req.json();

    if (!user_id) {
      return new Response(
        JSON.stringify({ error: "user_id is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    let query = supabase
      .from("gmail_connections")
      .select("*")
      .eq("user_id", user_id)
      .eq("is_active", true);

    if (organization_id) {
      query = query.eq("organization_id", organization_id);
    }

    const { data: connection, error: fetchError } = await query.limit(1).single();

    if (fetchError || !connection) {
      return new Response(
        JSON.stringify({ error: "GMAIL_NOT_CONNECTED", message: "No active Gmail connection found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const tokenExpiry = new Date(connection.token_expiry);
    const now = new Date();
    const fiveMinutesFromNow = new Date(now.getTime() + 5 * 60 * 1000);

    if (tokenExpiry > fiveMinutesFromNow) {
      return new Response(
        JSON.stringify({ 
          access_token: connection.access_token,
          token_expiry: connection.token_expiry,
          refreshed: false 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Refreshing token for user ${user_id}...`);

    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        refresh_token: connection.refresh_token,
        grant_type: "refresh_token",
      }),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json();
      console.error("Token refresh error:", errorData);

      if (errorData.error === "invalid_grant") {
        await supabase
          .from("gmail_connections")
          .update({ is_active: false })
          .eq("id", connection.id);

        return new Response(
          JSON.stringify({ 
            error: "REFRESH_TOKEN_REVOKED", 
            message: "Gmail access has been revoked. Please reconnect your account." 
          }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ 
          error: "TOKEN_REFRESH_FAILED", 
          message: errorData.error_description || errorData.error 
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const tokenData = await tokenResponse.json();
    const newTokenExpiry = new Date(Date.now() + tokenData.expires_in * 1000);

    const { error: updateError } = await supabase
      .from("gmail_connections")
      .update({
        access_token: tokenData.access_token,
        token_expiry: newTokenExpiry.toISOString(),
      })
      .eq("id", connection.id);

    if (updateError) {
      console.error("Failed to update token:", updateError);
      return new Response(
        JSON.stringify({ error: "DB_UPDATE_FAILED", message: updateError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Token refreshed successfully for user ${user_id}`);

    return new Response(
      JSON.stringify({ 
        access_token: tokenData.access_token,
        token_expiry: newTokenExpiry.toISOString(),
        refreshed: true 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (err) {
    const error = err as Error;
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({ error: "INTERNAL_ERROR", message: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
