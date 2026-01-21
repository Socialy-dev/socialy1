import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface PaidCreative {
  id: string;
  creative_name: string | null;
  format: string | null;
  status: string | null;
  thumbnail_url: string | null;
  media_url: string | null;
  impressions: number | null;
  clicks: number | null;
  spend: number | null;
  ctr: number | null;
  destination_url: string | null;
  platform: string;
}

export const usePaidCreatives = (
  platform: string,
  clientId: string | null,
  statusFilter: string,
  formatFilter: string,
  sortBy: string
) => {
  const { effectiveOrgId } = useAuth();

  const { data: creatives = [], isLoading, error } = useQuery({
    queryKey: ["paid-creatives", effectiveOrgId, platform, clientId, statusFilter, formatFilter, sortBy],
    queryFn: async () => {
      if (!effectiveOrgId) return [];

      let query = supabase
        .from("paid_ad_creatives")
        .select("*")
        .eq("organization_id", effectiveOrgId)
        .eq("platform", platform);

      if (clientId) {
        query = query.eq("client_id", clientId);
      }

      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }

      if (formatFilter !== "all") {
        query = query.eq("format", formatFilter);
      }

      switch (sortBy) {
        case "impressions":
          query = query.order("impressions", { ascending: false, nullsFirst: false });
          break;
        case "clicks":
          query = query.order("clicks", { ascending: false, nullsFirst: false });
          break;
        case "spend":
          query = query.order("spend", { ascending: false, nullsFirst: false });
          break;
        case "recent":
          query = query.order("created_at", { ascending: false });
          break;
        case "performance":
        default:
          query = query.order("ctr", { ascending: false, nullsFirst: false });
          break;
      }

      const { data, error } = await query.limit(100);

      if (error) throw error;
      return data as PaidCreative[];
    },
    enabled: !!effectiveOrgId,
  });

  return { creatives, isLoading, error };
};
