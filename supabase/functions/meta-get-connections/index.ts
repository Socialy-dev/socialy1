import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { 
  getCorsHeaders, 
  createErrorResponse 
} from "../_shared/security-helper.ts";

serve(async (req) => {
  const origin = req.headers.get("Origin");
  const corsHeaders = getCorsHeaders(origin);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data: connections, error } = await supabase
      .from("meta_connections")
      .select("organization_id, access_token, ad_account_ids, business_id, user_name, email")
      .eq("is_active", true);

    if (error) {
      console.error("Database error:", error);
      return createErrorResponse("Failed to fetch connections", 500, corsHeaders);
    }

    return new Response(
      JSON.stringify(connections),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Meta get connections error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return createErrorResponse(message, 500, corsHeaders);
  }
});
