import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { subDays, format } from "date-fns";
import type { PaidPlatform } from "@/components/social-media-paid/PaidDashboardView";

interface PaidInsight {
  id: string;
  date: string;
  platform: string;
  impressions: number;
  clicks: number;
  spend: number;
  conversions: number;
  cpc: number;
  ctr: number;
  roas: number;
}

interface AggregatedMetrics {
  impressions: number;
  impressionsChange: number;
  clicks: number;
  clicksChange: number;
  spend: number;
  spendChange: number;
  conversions: number;
  conversionsChange: number;
  cpc: number;
  cpcChange: number;
  ctr: number;
  ctrChange: number;
  roas: number;
  roasChange: number;
}

const defaultMetrics: AggregatedMetrics = {
  impressions: 0,
  impressionsChange: 0,
  clicks: 0,
  clicksChange: 0,
  spend: 0,
  spendChange: 0,
  conversions: 0,
  conversionsChange: 0,
  cpc: 0,
  cpcChange: 0,
  ctr: 0,
  ctrChange: 0,
  roas: 0,
  roasChange: 0,
};

export const usePaidInsights = (
  clientId: string | null,
  platform: PaidPlatform
) => {
  const { effectiveOrgId } = useAuth();

  const endDate = new Date();
  const startDate = subDays(endDate, 30);
  const prevEndDate = subDays(startDate, 1);
  const prevStartDate = subDays(prevEndDate, 30);

  const { data, isLoading, error } = useQuery({
    queryKey: ["paid-insights", effectiveOrgId, clientId, platform],
    queryFn: async () => {
      if (!effectiveOrgId) return { current: [], previous: [] };

      let currentQuery = supabase
        .from("paid_insights")
        .select("*")
        .eq("organization_id", effectiveOrgId)
        .gte("date", format(startDate, "yyyy-MM-dd"))
        .lte("date", format(endDate, "yyyy-MM-dd"));

      let previousQuery = supabase
        .from("paid_insights")
        .select("*")
        .eq("organization_id", effectiveOrgId)
        .gte("date", format(prevStartDate, "yyyy-MM-dd"))
        .lte("date", format(prevEndDate, "yyyy-MM-dd"));

      if (clientId) {
        currentQuery = currentQuery.eq("client_id", clientId);
        previousQuery = previousQuery.eq("client_id", clientId);
      }

      if (platform !== "all") {
        currentQuery = currentQuery.eq("platform", platform);
        previousQuery = previousQuery.eq("platform", platform);
      }

      const [currentResult, previousResult] = await Promise.all([
        currentQuery,
        previousQuery,
      ]);

      if (currentResult.error) throw currentResult.error;
      if (previousResult.error) throw previousResult.error;

      return {
        current: currentResult.data as PaidInsight[],
        previous: previousResult.data as PaidInsight[],
      };
    },
    enabled: !!effectiveOrgId,
  });

  const calculateChange = (current: number, previous: number): number => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  };

  const aggregatedMetrics: AggregatedMetrics = (() => {
    if (!data) return defaultMetrics;

    const currentData = data.current;
    const previousData = data.previous;

    const sumCurrent = currentData.reduce(
      (acc, insight) => ({
        impressions: acc.impressions + (Number(insight.impressions) || 0),
        clicks: acc.clicks + (Number(insight.clicks) || 0),
        spend: acc.spend + (Number(insight.spend) || 0),
        conversions: acc.conversions + (Number(insight.conversions) || 0),
      }),
      { impressions: 0, clicks: 0, spend: 0, conversions: 0 }
    );

    const sumPrevious = previousData.reduce(
      (acc, insight) => ({
        impressions: acc.impressions + (Number(insight.impressions) || 0),
        clicks: acc.clicks + (Number(insight.clicks) || 0),
        spend: acc.spend + (Number(insight.spend) || 0),
        conversions: acc.conversions + (Number(insight.conversions) || 0),
      }),
      { impressions: 0, clicks: 0, spend: 0, conversions: 0 }
    );

    const cpc = sumCurrent.clicks > 0 ? sumCurrent.spend / sumCurrent.clicks : 0;
    const ctr = sumCurrent.impressions > 0 ? (sumCurrent.clicks / sumCurrent.impressions) * 100 : 0;
    const roas = sumCurrent.spend > 0 ? (sumCurrent.conversions * 50) / sumCurrent.spend : 0;

    const prevCpc = sumPrevious.clicks > 0 ? sumPrevious.spend / sumPrevious.clicks : 0;
    const prevCtr = sumPrevious.impressions > 0 ? (sumPrevious.clicks / sumPrevious.impressions) * 100 : 0;
    const prevRoas = sumPrevious.spend > 0 ? (sumPrevious.conversions * 50) / sumPrevious.spend : 0;

    return {
      impressions: sumCurrent.impressions,
      impressionsChange: calculateChange(sumCurrent.impressions, sumPrevious.impressions),
      clicks: sumCurrent.clicks,
      clicksChange: calculateChange(sumCurrent.clicks, sumPrevious.clicks),
      spend: sumCurrent.spend,
      spendChange: calculateChange(sumCurrent.spend, sumPrevious.spend),
      conversions: sumCurrent.conversions,
      conversionsChange: calculateChange(sumCurrent.conversions, sumPrevious.conversions),
      cpc,
      cpcChange: calculateChange(cpc, prevCpc),
      ctr,
      ctrChange: calculateChange(ctr, prevCtr),
      roas,
      roasChange: calculateChange(roas, prevRoas),
    };
  })();

  return {
    insights: data?.current || [],
    isLoading,
    error,
    aggregatedMetrics,
  };
};
