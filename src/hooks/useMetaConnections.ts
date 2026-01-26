import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface AdAccountDetail {
  id: string;
  name: string;
  business_name: string;
}

interface MetaConnection {
  id: string;
  organization_id: string;
  user_id: string;
  user_name: string | null;
  email: string | null;
  ad_account_ids: string[] | null;
  ad_account_details: AdAccountDetail[] | null;
  business_id: string | null;
  connected_at: string;
  last_synced_at: string | null;
  is_active: boolean;
}

export const useMetaConnections = () => {
  const { effectiveOrgId } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: connections = [], isLoading, error } = useQuery({
    queryKey: ["meta-connections", effectiveOrgId],
    queryFn: async () => {
      if (!effectiveOrgId) return [];

      const { data, error } = await supabase
        .from("meta_connections")
        .select("id, organization_id, user_id, user_name, email, ad_account_ids, ad_account_details, business_id, connected_at, last_synced_at, is_active")
        .eq("organization_id", effectiveOrgId)
        .eq("is_active", true)
        .order("connected_at", { ascending: false });

      if (error) throw error;
      return (data || []).map((conn) => ({
        ...conn,
        ad_account_details: (conn.ad_account_details as unknown as AdAccountDetail[]) || [],
      })) as MetaConnection[];
    },
    enabled: !!effectiveOrgId,
  });

  const connectMeta = useMutation({
    mutationFn: async () => {
      if (!effectiveOrgId) throw new Error("Aucune organisation sélectionnée");

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Non authentifié");

      const response = await fetch(
        `https://lypodfdlpbpjdsswmsni.supabase.co/functions/v1/meta-auth-init`,
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
        throw new Error(data.error || "Échec de l'initialisation de l'auth Meta");
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

  const disconnectMeta = useMutation({
    mutationFn: async (connectionId: string) => {
      const { error } = await supabase
        .from("meta_connections")
        .update({ is_active: false })
        .eq("id", connectionId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["meta-connections", effectiveOrgId] });
      toast({
        title: "Déconnecté",
        description: "Le compte Meta Ads a été déconnecté",
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

  const refetch = () => {
    queryClient.invalidateQueries({ queryKey: ["meta-connections", effectiveOrgId] });
  };

  return {
    connections,
    isLoading,
    error,
    connectMeta: connectMeta.mutate,
    isConnecting: connectMeta.isPending,
    disconnectMeta: disconnectMeta.mutate,
    isDisconnecting: disconnectMeta.isPending,
    refetch,
  };
};
