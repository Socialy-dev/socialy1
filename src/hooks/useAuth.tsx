import { useState, useEffect, createContext, useContext, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";

type AppRole = "admin" | "user";
type AppPage = "dashboard" | "relations-presse" | "social-media" | "profile";

interface AuthContextType {
  user: User | null;
  role: AppRole | null;
  permissions: AppPage[];
  loading: boolean;
  isAdmin: boolean;
  hasPageAccess: (page: AppPage) => boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);
  const [permissions, setPermissions] = useState<AppPage[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUserData = async (userId: string) => {
    try {
      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .single();
      
      if (roleData) {
        setRole(roleData.role as AppRole);
      }

      const { data: permData } = await supabase
        .from("user_permissions")
        .select("page")
        .eq("user_id", userId);
      
      if (permData) {
        setPermissions(permData.map((p) => p.page as AppPage));
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);
        
        if (session?.user) {
          await fetchUserData(session.user.id);
        } else {
          setRole(null);
          setPermissions([]);
          setLoading(false);
        }
      }
    );

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        await fetchUserData(session.user.id);
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const isAdmin = role === "admin";

  const hasPageAccess = (page: AppPage): boolean => {
    if (isAdmin) return true;
    return permissions.includes(page);
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setRole(null);
    setPermissions([]);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        permissions,
        loading,
        isAdmin,
        hasPageAccess,
        signOut,
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
