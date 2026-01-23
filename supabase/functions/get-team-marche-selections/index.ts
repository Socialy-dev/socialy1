import { 
  getCorsHeaders, 
  validateAuthAndOrg, 
  createErrorResponse, 
  createSuccessResponse,
  getServiceClient 
} from "../_shared/security-helper.ts";

Deno.serve(async (req) => {
  const origin = req.headers.get("Origin");
  const corsHeaders = getCorsHeaders(origin);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    const { organization_id } = await req.json();

    if (!organization_id) {
      return createErrorResponse("Missing organization_id", 400, corsHeaders);
    }

    const validation = await validateAuthAndOrg(authHeader, organization_id);
    if (!validation.success) {
      return createErrorResponse(validation.error!, validation.status!, corsHeaders);
    }

    const serviceClient = getServiceClient();

    const { data: selections, error: selectionsError } = await serviceClient
      .from("user_marche_selections")
      .select("id, user_id, marche_public_id, status")
      .eq("organization_id", organization_id)
      .eq("status", "selected")
      .neq("user_id", validation.user!.id);

    if (selectionsError) {
      return createErrorResponse(selectionsError.message, 500, corsHeaders);
    }

    if (!selections || selections.length === 0) {
      return createSuccessResponse({ teamSelections: [] }, corsHeaders);
    }

    const userIds = [...new Set(selections.map((s: { user_id: string }) => s.user_id))];

    const { data: profiles, error: profilesError } = await serviceClient
      .from("profiles")
      .select("user_id, first_name, last_name")
      .in("user_id", userIds);

    if (profilesError) {
      return createErrorResponse(profilesError.message, 500, corsHeaders);
    }

    const profileMap = new Map<string, { name: string; initials: string }>();
    (profiles || []).forEach((p: { user_id: string; first_name: string | null; last_name: string | null }) => {
      const firstName = p.first_name || "";
      const lastName = p.last_name || "";
      const fullName = [firstName, lastName].filter(Boolean).join(" ");
      const initials = ((firstName[0] || "") + (lastName[0] || "")).toUpperCase() || "U";
      profileMap.set(String(p.user_id), { name: fullName || "Utilisateur", initials });
    });

    const teamSelections = selections.map((s: { id: string; user_id: string; marche_public_id: string; status: string }) => {
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

    return createSuccessResponse({ teamSelections }, corsHeaders);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return createErrorResponse(message, 500, corsHeaders);
  }
});
