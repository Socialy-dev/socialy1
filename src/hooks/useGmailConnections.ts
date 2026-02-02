import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface GmailConnection {
  id: string;
  organization_id: string;
  user_id: string;
  email: string;
  connected_at: string;
  last_synced_at: string | null;
  is_active: boolean;
}

export const useGmailConnections = () => {
  const { effectiveOrgId, user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: connections = [], isLoading, error } = useQuery({
    queryKey: ["gmail-connections", effectiveOrgId],
    queryFn: async () => {
      if (!effectiveOrgId) return [];

      const { data, error } = await supabase
        .from("gmail_connections")
        .select("id, organization_id, user_id, email, connected_at, last_synced_at, is_active")
        .eq("organization_id", effectiveOrgId)
        .eq("is_active", true)
        .order("connected_at", { ascending: false });

      if (error) throw error;
      return data as GmailConnection[];
    },
    enabled: !!effectiveOrgId,
  });

  const connectGmail = useMutation({
    mutationFn: async () => {
      if (!effectiveOrgId) throw new Error("No organization selected");

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const response = await fetch(
        `https://lypodfdlpbpjdsswmsni.supabase.co/functions/v1/gmail-auth-init`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ organization_id: effectiveOrgId }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to initialize Gmail auth");
      }

      return data.auth_url;
    },
    onSuccess: (authUrl) => {
      window.location.href = authUrl;
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const disconnectGmail = useMutation({
    mutationFn: async (connectionId: string) => {
      const { error } = await supabase
        .from("gmail_connections")
        .update({ is_active: false })
        .eq("id", connectionId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gmail-connections", effectiveOrgId] });
      toast({
        title: "Déconnecté",
        description: "Le compte Gmail a été déconnecté",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    connections,
    isLoading,
    error,
    connectGmail: connectGmail.mutate,
    isConnecting: connectGmail.isPending,
    disconnectGmail: disconnectGmail.mutate,
    isDisconnecting: disconnectGmail.isPending,
  };
};
