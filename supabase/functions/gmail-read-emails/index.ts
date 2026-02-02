import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { 
  getCorsHeaders, 
  validateAuthAndOrg, 
  createErrorResponse, 
  createSuccessResponse 
} from "../_shared/security-helper.ts";
import { getValidGmailToken } from "../_shared/gmail-token-helper.ts";

serve(async (req) => {
  const origin = req.headers.get("Origin");
  const corsHeaders = getCorsHeaders(origin);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    const { user_id, organization_id, max_results = 10 } = await req.json();

    if (!user_id) {
      return createErrorResponse("user_id is required", 400, corsHeaders);
    }

    if (!organization_id) {
      return createErrorResponse("organization_id is required", 400, corsHeaders);
    }

    const validation = await validateAuthAndOrg(authHeader, organization_id);
    if (!validation.success) {
      return createErrorResponse(validation.error!, validation.status!, corsHeaders);
    }

    if (validation.user!.id !== user_id) {
      return createErrorResponse("Cannot read emails for another user", 403, corsHeaders);
    }

    let accessToken: string;
    try {
      accessToken = await getValidGmailToken(user_id, organization_id);
    } catch (err) {
      const error = err as Error;
      if (error.message === "GMAIL_NOT_CONNECTED") {
        return createErrorResponse("Gmail not connected", 404, corsHeaders);
      }
      if (error.message === "REFRESH_TOKEN_REVOKED") {
        return createErrorResponse("Gmail access revoked, please reconnect", 401, corsHeaders);
      }
      throw error;
    }

    const messagesResponse = await fetch(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=${max_results}`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    if (!messagesResponse.ok) {
      const errorData = await messagesResponse.json();
      console.error("Gmail API error:", errorData);

      if (messagesResponse.status === 401) {
        return createErrorResponse("Gmail authentication failed", 401, corsHeaders);
      }

      return new Response(
        JSON.stringify({ error: "Failed to fetch emails", details: errorData }),
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
            headers: { Authorization: `Bearer ${accessToken}` },
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

    return createSuccessResponse({
      emails: emailDetails,
      result_size_estimate: messagesData.resultSizeEstimate,
      next_page_token: messagesData.nextPageToken,
    }, corsHeaders);
  } catch (err) {
    const error = err as Error;
    console.error("Unexpected error:", error);
    return createErrorResponse(error.message, 500, corsHeaders);
  }
});
