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
  cpm: number;
  reach: number;
  frequency: number;
  roas: number;
}

interface DetailedMetrics {
  impressions: number;
  impressionsChange: number;
  clicks: number;
  clicksChange: number;
  spend: number;
  spendChange: number;
  ctr: number;
  ctrChange: number;
  cpc: number;
  cpcChange: number;
  cpm: number;
  cpmChange: number;
  reach: number;
  reachChange: number;
  frequency: number;
  frequencyChange: number;
}

const defaultMetrics: DetailedMetrics = {
  impressions: 0,
  impressionsChange: 0,
  clicks: 0,
  clicksChange: 0,
  spend: 0,
  spendChange: 0,
  ctr: 0,
  ctrChange: 0,
  cpc: 0,
  cpcChange: 0,
  cpm: 0,
  cpmChange: 0,
  reach: 0,
  reachChange: 0,
  frequency: 0,
  frequencyChange: 0,
};

export type PeriodType = "7d" | "30d" | "custom";

export const usePaidDetailedInsights = (
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

    const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const prevEndDate = subDays(startDate, 1);
    const prevStartDate = subDays(prevEndDate, daysDiff);

    return { startDate, endDate, prevStartDate, prevEndDate };
  };

  const { data, isLoading, error } = useQuery({
    queryKey: ["paid-detailed-insights", effectiveOrgId, clientId, platform, period, customStartDate?.toISOString(), customEndDate?.toISOString()],
    queryFn: async () => {
      if (!effectiveOrgId) return { current: [], previous: [] };

      const { startDate, endDate, prevStartDate, prevEndDate } = getDates();

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
        currentQuery.order("date", { ascending: true }),
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

  const aggregatedMetrics: DetailedMetrics = (() => {
    if (!data) return defaultMetrics;

    const currentData = data.current;
    const previousData = data.previous;

    const sumCurrent = currentData.reduce(
      (acc, insight) => ({
        impressions: acc.impressions + (Number(insight.impressions) || 0),
        clicks: acc.clicks + (Number(insight.clicks) || 0),
        spend: acc.spend + (Number(insight.spend) || 0),
        reach: acc.reach + (Number(insight.reach) || 0),
      }),
      { impressions: 0, clicks: 0, spend: 0, reach: 0 }
    );

    const sumPrevious = previousData.reduce(
      (acc, insight) => ({
        impressions: acc.impressions + (Number(insight.impressions) || 0),
        clicks: acc.clicks + (Number(insight.clicks) || 0),
        spend: acc.spend + (Number(insight.spend) || 0),
        reach: acc.reach + (Number(insight.reach) || 0),
      }),
      { impressions: 0, clicks: 0, spend: 0, reach: 0 }
    );

    const cpc = sumCurrent.clicks > 0 ? sumCurrent.spend / sumCurrent.clicks : 0;
    const ctr = sumCurrent.impressions > 0 ? (sumCurrent.clicks / sumCurrent.impressions) * 100 : 0;
    const cpm = sumCurrent.impressions > 0 ? (sumCurrent.spend / sumCurrent.impressions) * 1000 : 0;
    const frequency = sumCurrent.reach > 0 ? sumCurrent.impressions / sumCurrent.reach : 0;

    const prevCpc = sumPrevious.clicks > 0 ? sumPrevious.spend / sumPrevious.clicks : 0;
    const prevCtr = sumPrevious.impressions > 0 ? (sumPrevious.clicks / sumPrevious.impressions) * 100 : 0;
    const prevCpm = sumPrevious.impressions > 0 ? (sumPrevious.spend / sumPrevious.impressions) * 1000 : 0;
    const prevFrequency = sumPrevious.reach > 0 ? sumPrevious.impressions / sumPrevious.reach : 0;

    return {
      impressions: sumCurrent.impressions,
      impressionsChange: calculateChange(sumCurrent.impressions, sumPrevious.impressions),
      clicks: sumCurrent.clicks,
      clicksChange: calculateChange(sumCurrent.clicks, sumPrevious.clicks),
      spend: sumCurrent.spend,
      spendChange: calculateChange(sumCurrent.spend, sumPrevious.spend),
      ctr,
      ctrChange: calculateChange(ctr, prevCtr),
      cpc,
      cpcChange: calculateChange(cpc, prevCpc),
      cpm,
      cpmChange: calculateChange(cpm, prevCpm),
      reach: sumCurrent.reach,
      reachChange: calculateChange(sumCurrent.reach, sumPrevious.reach),
      frequency,
      frequencyChange: calculateChange(frequency, prevFrequency),
    };
  })();

  return {
    insights: data?.current || [],
    isLoading,
    error,
    aggregatedMetrics,
  };
};
