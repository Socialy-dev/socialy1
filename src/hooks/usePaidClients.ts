import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface PaidClient {
  id: string;
  name: string;
  logo_url: string | null;
  is_active: boolean;
  created_at: string;
}

export const usePaidClients = () => {
  const { effectiveOrgId } = useAuth();
  const queryClient = useQueryClient();

  const { data: clients = [], isLoading, error } = useQuery({
    queryKey: ["paid-clients", effectiveOrgId],
    queryFn: async () => {
      if (!effectiveOrgId) return [];

      const { data, error } = await supabase
        .from("paid_clients")
        .select("*")
        .eq("organization_id", effectiveOrgId)
        .eq("is_active", true)
        .order("name", { ascending: true });

      if (error) throw error;
      return data as PaidClient[];
    },
    enabled: !!effectiveOrgId,
  });

  const refetch = () => {
    queryClient.invalidateQueries({ queryKey: ["paid-clients", effectiveOrgId] });
  };

  return { clients, isLoading, error, refetch };
};
