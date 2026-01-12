import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

type AppPage = "dashboard" | "relations-presse" | "social-media" | "profile";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPage?: AppPage;
  requireAdmin?: boolean;
}

export const ProtectedRoute = ({
  children,
  requiredPage,
  requireAdmin = false,
}: ProtectedRouteProps) => {
  const { user, loading, isOrgAdmin, hasPageAccess } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  // Not authenticated
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Admin required but user is not admin
  if (requireAdmin && !isOrgAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  // Page access required but user doesn't have permission
  if (requiredPage && !hasPageAccess(requiredPage)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">Accès refusé</h1>
          <p className="text-muted-foreground mb-4">
            Vous n'avez pas accès à cette page.
          </p>
          <a href="/dashboard" className="text-primary hover:underline">
            Retour au dashboard
          </a>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
