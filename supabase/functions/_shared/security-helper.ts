import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

const ALLOWED_ORIGINS = [
  "https://socialy1.lovable.app",
  "https://id-preview--d652ab17-4466-4f7d-9908-a5f63da4d0fe.lovable.app",
  "http://localhost:5173",
  "http://localhost:3000",
];

export const getCorsHeaders = (origin: string | null) => {
  const isAllowed = origin && (
    ALLOWED_ORIGINS.includes(origin) || 
    origin.endsWith(".lovableproject.com") || 
    origin.endsWith(".lovable.app")
  );
  return {
    "Access-Control-Allow-Origin": isAllowed ? origin : ALLOWED_ORIGINS[0],
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
    "Access-Control-Allow-Credentials": "true",
  };
};

export interface AuthenticatedUser {
  id: string;
  email: string;
}

export interface SecurityValidationResult {
  success: boolean;
  user?: AuthenticatedUser;
  error?: string;
  status?: number;
}

export interface OrgMembershipResult {
  success: boolean;
  error?: string;
  status?: number;
  role?: string;
}

export async function validateAuthentication(authHeader: string | null): Promise<SecurityValidationResult> {
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return {
      success: false,
      error: "UNAUTHORIZED",
      status: 401,
    };
  }

  const userClient = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: authHeader } },
  });

  const { data: { user }, error } = await userClient.auth.getUser();

  if (error || !user) {
    return {
      success: false,
      error: "INVALID_TOKEN",
      status: 401,
    };
  }

  return {
    success: true,
    user: {
      id: user.id,
      email: user.email || "",
    },
  };
}

export async function validateOrganizationMembership(
  userId: string,
  organizationId: string
): Promise<OrgMembershipResult> {
  if (!organizationId || typeof organizationId !== "string") {
    return {
      success: false,
      error: "INVALID_ORGANIZATION_ID",
      status: 400,
    };
  }

  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(organizationId)) {
    return {
      success: false,
      error: "INVALID_ORGANIZATION_ID_FORMAT",
      status: 400,
    };
  }

  const serviceClient = createClient(supabaseUrl, supabaseServiceKey);

  const { data: membership, error } = await serviceClient
    .from("organization_members")
    .select("id, role")
    .eq("user_id", userId)
    .eq("organization_id", organizationId)
    .single();

  if (error || !membership) {
    return {
      success: false,
      error: "NOT_ORGANIZATION_MEMBER",
      status: 403,
    };
  }

  return {
    success: true,
    role: membership.role,
  };
}

export async function validateAuthAndOrg(
  authHeader: string | null,
  organizationId: string
): Promise<{ success: boolean; user?: AuthenticatedUser; role?: string; error?: string; status?: number }> {
  const authResult = await validateAuthentication(authHeader);
  if (!authResult.success) {
    return authResult;
  }

  const orgResult = await validateOrganizationMembership(authResult.user!.id, organizationId);
  if (!orgResult.success) {
    return orgResult;
  }

  return {
    success: true,
    user: authResult.user,
    role: orgResult.role,
  };
}

export function createErrorResponse(
  error: string,
  status: number,
  corsHeaders: Record<string, string>
): Response {
  return new Response(
    JSON.stringify({ error }),
    { status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

export function createSuccessResponse(
  data: unknown,
  corsHeaders: Record<string, string>
): Response {
  return new Response(
    JSON.stringify(data),
    { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

export function getServiceClient() {
  return createClient(supabaseUrl, supabaseServiceKey);
}

export function getUserClient(authHeader: string) {
  return createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: authHeader } },
  });
}
