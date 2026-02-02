import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export const ProtectedRoute = ({
  children,
  requireAdmin = false,
}: ProtectedRouteProps) => {
  const { user, loading, isOrgAdmin, currentOrganization } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (!currentOrganization) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">Aucune organisation</h1>
          <p className="text-muted-foreground mb-4">
            Vous n'êtes membre d'aucune organisation.
          </p>
        </div>
      </div>
    );
  }

  if (requireAdmin && !isOrgAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};
