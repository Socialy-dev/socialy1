import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { subDays, format } from "date-fns";
import type { PaidPlatform } from "@/components/social-media-paid/PaidDashboardView";
import type { PeriodType } from "./usePaidDetailedInsights";

interface CampaignWithMetrics {
  id: string;
  campaign_id: string;
  campaign_name: string | null;
  status: string | null;
  platform: string;
  impressions: number;
  clicks: number;
  spend: number;
  ctr: number;
  cpc: number;
}

export const usePaidCampaigns = (
  clientId: string | null,
  platform: PaidPlatform,
  period: PeriodType,
  customStartDate?: Date,
  customEndDate?: Date
) => {
  const { effectiveOrgId } = useAuth();

  const getDates = () => {
    const endDate = customEndDate || new Date();
    let startDate: Date;
    
    if (period === "custom" && customStartDate) {
      startDate = customStartDate;
    } else if (period === "7d") {
      startDate = subDays(endDate, 7);
    } else {
      startDate = subDays(endDate, 30);
    }

    return { startDate, endDate };
  };

  const { data: campaigns = [], isLoading, error } = useQuery({
    queryKey: ["paid-campaigns-with-metrics", effectiveOrgId, clientId, platform, period, customStartDate?.toISOString(), customEndDate?.toISOString()],
    queryFn: async () => {
      if (!effectiveOrgId) return [];

      const { startDate, endDate } = getDates();

      let campaignsQuery = supabase
        .from("paid_campaigns")
        .select("id, campaign_id, campaign_name, status, platform")
        .eq("organization_id", effectiveOrgId);

      if (clientId) {
        campaignsQuery = campaignsQuery.eq("client_id", clientId);
      }

      if (platform !== "all") {
        campaignsQuery = campaignsQuery.eq("platform", platform);
      }

      const { data: campaignsData, error: campaignsError } = await campaignsQuery;
      if (campaignsError) throw campaignsError;

      if (!campaignsData || campaignsData.length === 0) return [];

      let insightsQuery = supabase
        .from("paid_insights")
        .select("campaign_id, impressions, clicks, spend")
        .eq("organization_id", effectiveOrgId)
        .gte("date", format(startDate, "yyyy-MM-dd"))
        .lte("date", format(endDate, "yyyy-MM-dd"));

      if (clientId) {
        insightsQuery = insightsQuery.eq("client_id", clientId);
      }

      if (platform !== "all") {
        insightsQuery = insightsQuery.eq("platform", platform);
      }

      const { data: insightsData, error: insightsError } = await insightsQuery;
      if (insightsError) throw insightsError;

      const campaignInsightsMap = new Map<string, { impressions: number; clicks: number; spend: number }>();
      
      (insightsData || []).forEach((insight) => {
        const campaignId = insight.campaign_id;
        if (!campaignId) return;
        
        const existing = campaignInsightsMap.get(campaignId) || { impressions: 0, clicks: 0, spend: 0 };
        campaignInsightsMap.set(campaignId, {
          impressions: existing.impressions + (Number(insight.impressions) || 0),
          clicks: existing.clicks + (Number(insight.clicks) || 0),
          spend: existing.spend + (Number(insight.spend) || 0),
        });
      });

      return campaignsData.map((campaign) => {
        const metrics = campaignInsightsMap.get(campaign.campaign_id) || { impressions: 0, clicks: 0, spend: 0 };
        const ctr = metrics.impressions > 0 ? (metrics.clicks / metrics.impressions) * 100 : 0;
        const cpc = metrics.clicks > 0 ? metrics.spend / metrics.clicks : 0;

        return {
          id: campaign.id,
          campaign_id: campaign.campaign_id,
          campaign_name: campaign.campaign_name,
          status: campaign.status,
          platform: campaign.platform,
          impressions: metrics.impressions,
          clicks: metrics.clicks,
          spend: metrics.spend,
          ctr,
          cpc,
        } as CampaignWithMetrics;
      });
    },
    enabled: !!effectiveOrgId,
  });

  return { campaigns, isLoading, error };
};
