import { useState, useEffect, createContext, useContext, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";

type OrgRole = "super_admin" | "org_admin" | "org_user";

interface Organization {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
}

interface OrganizationMembership {
  organization_id: string;
  role: OrgRole;
  organization: Organization;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  currentOrganization: Organization | null;
  organizations: Organization[];
  orgRole: OrgRole | null;
  isSuperAdmin: boolean;
  isOrgAdmin: boolean;
  switchOrganization: (orgId: string) => void;
  signOut: () => Promise<void>;
  viewAsOrgId: string | null;
  setViewAsOrgId: (orgId: string | null) => void;
  effectiveOrgId: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [memberships, setMemberships] = useState<OrganizationMembership[]>([]);
  const [currentOrgId, setCurrentOrgId] = useState<string | null>(null);
  const [viewAsOrgId, setViewAsOrgId] = useState<string | null>(null);

  const fetchUserData = async (userId: string) => {
    try {
      const { data: memberData, error: memberError } = await supabase
        .from("organization_members")
        .select(`
          organization_id,
          role,
          organizations:organization_id (
            id,
            name,
            slug,
            logo_url
          )
        `)
        .eq("user_id", userId);

      if (memberError) throw memberError;

      if (memberData && memberData.length > 0) {
        const formattedMemberships: OrganizationMembership[] = memberData.map((m: any) => ({
          organization_id: m.organization_id,
          role: m.role as OrgRole,
          organization: m.organizations as Organization,
        }));

        setMemberships(formattedMemberships);

        const savedOrgId = localStorage.getItem("currentOrgId");
        const validSavedOrg = formattedMemberships.find(m => m.organization_id === savedOrgId);
        
        if (validSavedOrg) {
          setCurrentOrgId(savedOrgId);
        } else {
          setCurrentOrgId(formattedMemberships[0].organization_id);
        }
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);

        if (session?.user) {
          setTimeout(() => fetchUserData(session.user.id), 0);
        } else {
          setMemberships([]);
          setCurrentOrgId(null);
          setViewAsOrgId(null);
        }
        setLoading(false);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserData(session.user.id);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const currentMembership = memberships.find(m => m.organization_id === currentOrgId);
  const currentOrganization = currentMembership?.organization ?? null;
  const orgRole = currentMembership?.role ?? null;
  const isSuperAdmin = memberships.some(m => m.role === "super_admin");
  const isOrgAdmin = orgRole === "org_admin" || orgRole === "super_admin";
  const organizations = memberships.map(m => m.organization);

  const effectiveOrgId = isSuperAdmin && viewAsOrgId ? viewAsOrgId : currentOrgId;

  const switchOrganization = (orgId: string) => {
    const membership = memberships.find(m => m.organization_id === orgId);
    if (membership) {
      setCurrentOrgId(orgId);
      localStorage.setItem("currentOrgId", orgId);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setMemberships([]);
    setCurrentOrgId(null);
    setViewAsOrgId(null);
    localStorage.removeItem("currentOrgId");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        currentOrganization,
        organizations,
        orgRole,
        isSuperAdmin,
        isOrgAdmin,
        switchOrganization,
        signOut,
        viewAsOrgId,
        setViewAsOrgId,
        effectiveOrgId,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
