import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: userError } = await userClient.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { organization_id } = await req.json();
    if (!organization_id) {
      return new Response(
        JSON.stringify({ error: "Missing organization_id" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const serviceClient = createClient(supabaseUrl, supabaseServiceKey);

    const { data: membership, error: membershipError } = await serviceClient
      .from("organization_members")
      .select("id")
      .eq("user_id", user.id)
      .eq("organization_id", organization_id)
      .single();

    if (membershipError || !membership) {
      return new Response(
        JSON.stringify({ error: "User is not a member of this organization" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data: selections, error: selectionsError } = await serviceClient
      .from("user_marche_selections")
      .select("id, user_id, marche_public_id, status")
      .eq("organization_id", organization_id)
      .eq("status", "selected")
      .neq("user_id", user.id);

    if (selectionsError) {
      return new Response(
        JSON.stringify({ error: selectionsError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!selections || selections.length === 0) {
      return new Response(
        JSON.stringify({ teamSelections: [] }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userIds = [...new Set(selections.map((s: any) => s.user_id))];

    const { data: profiles, error: profilesError } = await serviceClient
      .from("profiles")
      .select("user_id, first_name, last_name")
      .in("user_id", userIds);

    if (profilesError) {
      return new Response(
        JSON.stringify({ error: profilesError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const profileMap = new Map<string, { name: string; initials: string }>();
    (profiles || []).forEach((p: any) => {
      const firstName = p.first_name || "";
      const lastName = p.last_name || "";
      const fullName = [firstName, lastName].filter(Boolean).join(" ");
      const initials = ((firstName[0] || "") + (lastName[0] || "")).toUpperCase() || "U";
      profileMap.set(String(p.user_id), { name: fullName || "Utilisateur", initials });
    });

    const teamSelections = selections.map((s: any) => {
      const profile = profileMap.get(String(s.user_id));
      return {
        id: s.id,
        user_id: s.user_id,
        marche_public_id: s.marche_public_id,
        status: s.status,
        user_name: profile?.name || "Utilisateur",
        user_initials: profile?.initials || "U",
      };
    });

    return new Response(
      JSON.stringify({ teamSelections }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
