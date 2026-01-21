import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import type { PaidPlatform } from "@/components/social-media-paid/PaidDashboardView";

interface CreativeWithInsights {
  id: string;
  creative_id: string;
  creative_name: string | null;
  status: string | null;
  format: string | null;
  media_url: string | null;
  thumbnail_url: string | null;
  platform: string;
  impressions: number;
  clicks: number;
  spend: number;
  ctr: number;
}

export const useCreativesWithInsights = (
  clientId: string | null,
  platform: PaidPlatform,
  statusFilter: string,
  sortBy: string
) => {
  const { effectiveOrgId } = useAuth();

  const { data: creatives = [], isLoading, error } = useQuery({
    queryKey: ["creatives-with-insights", effectiveOrgId, clientId, platform, statusFilter, sortBy],
    queryFn: async () => {
      if (!effectiveOrgId) return [];

      let creativesQuery = supabase
        .from("paid_ad_creatives")
        .select("id, creative_id, creative_name, status, format, media_url, thumbnail_url, platform")
        .eq("organization_id", effectiveOrgId);

      if (clientId) {
        creativesQuery = creativesQuery.eq("client_id", clientId);
      }

      if (platform !== "all") {
        creativesQuery = creativesQuery.eq("platform", platform);
      }

      if (statusFilter !== "all") {
        creativesQuery = creativesQuery.ilike("status", statusFilter);
      }

      const { data: creativesData, error: creativesError } = await creativesQuery;
      if (creativesError) throw creativesError;

      if (!creativesData || creativesData.length === 0) return [];

      const creativeIds = creativesData.map((c) => c.creative_id);

      let insightsQuery = supabase
        .from("paid_ad_insights")
        .select("ad_id, impressions, clicks, spend, ctr")
        .in("ad_id", creativeIds);

      if (clientId) {
        insightsQuery = insightsQuery.eq("client_id", clientId);
      }

      if (platform !== "all") {
        insightsQuery = insightsQuery.eq("platform", platform);
      }

      const { data: insightsData, error: insightsError } = await insightsQuery;
      if (insightsError) throw insightsError;

      const insightsMap = new Map<string, { impressions: number; clicks: number; spend: number }>();
      
      (insightsData || []).forEach((insight) => {
        const adId = insight.ad_id;
        const existing = insightsMap.get(adId) || { impressions: 0, clicks: 0, spend: 0 };
        insightsMap.set(adId, {
          impressions: existing.impressions + (Number(insight.impressions) || 0),
          clicks: existing.clicks + (Number(insight.clicks) || 0),
          spend: existing.spend + (Number(insight.spend) || 0),
        });
      });

      const creativesWithMetrics = creativesData.map((creative) => {
        const metrics = insightsMap.get(creative.creative_id) || { impressions: 0, clicks: 0, spend: 0 };
        const ctr = metrics.impressions > 0 ? (metrics.clicks / metrics.impressions) * 100 : 0;

        return {
          id: creative.id,
          creative_id: creative.creative_id,
          creative_name: creative.creative_name,
          status: creative.status,
          format: creative.format,
          media_url: creative.media_url,
          thumbnail_url: creative.thumbnail_url,
          platform: creative.platform,
          impressions: metrics.impressions,
          clicks: metrics.clicks,
          spend: metrics.spend,
          ctr,
        } as CreativeWithInsights;
      });

      if (sortBy === "ctr_desc") {
        creativesWithMetrics.sort((a, b) => b.ctr - a.ctr);
      } else if (sortBy === "ctr_asc") {
        creativesWithMetrics.sort((a, b) => a.ctr - b.ctr);
      } else if (sortBy === "impressions") {
        creativesWithMetrics.sort((a, b) => b.impressions - a.impressions);
      } else if (sortBy === "clicks") {
        creativesWithMetrics.sort((a, b) => b.clicks - a.clicks);
      } else if (sortBy === "spend") {
        creativesWithMetrics.sort((a, b) => b.spend - a.spend);
      }

      return creativesWithMetrics;
    },
    enabled: !!effectiveOrgId,
  });

  return { creatives, isLoading, error };
};
