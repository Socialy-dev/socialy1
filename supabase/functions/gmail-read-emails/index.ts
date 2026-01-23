import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { getValidGmailToken } from "../_shared/gmail-token-helper.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { user_id, organization_id, max_results = 10 } = await req.json();

    if (!user_id) {
      return new Response(
        JSON.stringify({ error: "user_id is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let accessToken: string;
    try {
      accessToken = await getValidGmailToken(user_id, organization_id);
    } catch (err) {
      const error = err as Error;
      if (error.message === "GMAIL_NOT_CONNECTED") {
        return new Response(
          JSON.stringify({ 
            error: "GMAIL_NOT_CONNECTED", 
            message: "No active Gmail connection found. Please connect your Gmail account." 
          }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (error.message === "REFRESH_TOKEN_REVOKED") {
        return new Response(
          JSON.stringify({ 
            error: "REFRESH_TOKEN_REVOKED", 
            message: "Gmail access has been revoked. Please reconnect your account." 
          }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      throw error;
    }

    const messagesResponse = await fetch(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=${max_results}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!messagesResponse.ok) {
      const errorData = await messagesResponse.json();
      console.error("Gmail API error:", errorData);

      if (messagesResponse.status === 401) {
        return new Response(
          JSON.stringify({ 
            error: "GMAIL_AUTH_ERROR", 
            message: "Gmail authentication failed. Please reconnect your account." 
          }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ 
          error: "GMAIL_API_ERROR", 
          message: errorData.error?.message || "Failed to fetch emails" 
        }),
        { status: messagesResponse.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const messagesData = await messagesResponse.json();
    const messages = messagesData.messages || [];

    const emailDetails = await Promise.all(
      messages.slice(0, max_results).map(async (msg: { id: string }) => {
        const detailResponse = await fetch(
          `https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}?format=metadata&metadataHeaders=From&metadataHeaders=Subject&metadataHeaders=Date`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        if (!detailResponse.ok) {
          return { id: msg.id, error: "Failed to fetch details" };
        }

        const detail = await detailResponse.json();
        const headers = detail.payload?.headers || [];

        const getHeader = (name: string) => 
          headers.find((h: { name: string; value: string }) => h.name.toLowerCase() === name.toLowerCase())?.value || null;

        return {
          id: msg.id,
          thread_id: detail.threadId,
          snippet: detail.snippet,
          from: getHeader("From"),
          subject: getHeader("Subject"),
          date: getHeader("Date"),
          label_ids: detail.labelIds,
        };
      })
    );

    return new Response(
      JSON.stringify({ 
        emails: emailDetails,
        result_size_estimate: messagesData.resultSizeEstimate,
        next_page_token: messagesData.nextPageToken 
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
