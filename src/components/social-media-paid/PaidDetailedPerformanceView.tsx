import { useState } from "react";
import { Eye, MousePointer, Wallet, BarChart3, Zap, Users, Repeat, DollarSign } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { usePaidDetailedInsights, type PeriodType } from "@/hooks/usePaidDetailedInsights";
import { usePaidCampaigns } from "@/hooks/usePaidCampaigns";
import { usePaidClients } from "@/hooks/usePaidClients";
import { PaidClientFilter } from "./PaidClientFilter";
import { PaidPlatformFilter } from "./PaidPlatformFilter";
import { PaidDetailedMetricCard } from "./PaidDetailedMetricCard";
import { PaidDetailedChart } from "./PaidDetailedChart";
import { PaidCampaignsTable } from "./PaidCampaignsTable";
import { PaidPeriodFilter } from "./PaidPeriodFilter";
import type { PaidPlatform } from "./PaidDashboardView";

export const PaidDetailedPerformanceView = () => {
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [selectedPlatform, setSelectedPlatform] = useState<PaidPlatform>("all");
  const [period, setPeriod] = useState<PeriodType>("30d");
  const [customStartDate, setCustomStartDate] = useState<Date | undefined>();
  const [customEndDate, setCustomEndDate] = useState<Date | undefined>();

  const { clients, isLoading: clientsLoading } = usePaidClients();
  const { insights, isLoading: insightsLoading, aggregatedMetrics } = usePaidDetailedInsights(
    selectedClientId,
    selectedPlatform,
    period,
    customStartDate,
    customEndDate
  );
  const { campaigns, isLoading: campaignsLoading } = usePaidCampaigns(
    selectedClientId,
    selectedPlatform,
    period,
    customStartDate,
    customEndDate
  );

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toFixed(0);
  };

  const formatCurrency = (num: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num);
  };

  const formatPercent = (num: number) => `${num.toFixed(2)}%`;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-3">
          <PaidClientFilter
            clients={clients}
            selectedClientId={selectedClientId}
            onSelect={setSelectedClientId}
            isLoading={clientsLoading}
          />
          <PaidPlatformFilter
            selectedPlatform={selectedPlatform}
            onSelect={setSelectedPlatform}
          />
        </div>
        <PaidPeriodFilter
          period={period}
          onPeriodChange={setPeriod}
          customStartDate={customStartDate}
          customEndDate={customEndDate}
          onCustomStartDateChange={setCustomStartDate}
          onCustomEndDateChange={setCustomEndDate}
        />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <PaidDetailedMetricCard
          title="Impressions"
          value={formatNumber(aggregatedMetrics.impressions)}
          change={aggregatedMetrics.impressionsChange}
          icon={Eye}
          isLoading={insightsLoading}
        />
        <PaidDetailedMetricCard
          title="Clics"
          value={formatNumber(aggregatedMetrics.clicks)}
          change={aggregatedMetrics.clicksChange}
          icon={MousePointer}
          isLoading={insightsLoading}
        />
        <PaidDetailedMetricCard
          title="Dépenses"
          value={formatCurrency(aggregatedMetrics.spend)}
          change={aggregatedMetrics.spendChange}
          icon={Wallet}
          isLoading={insightsLoading}
          invertTrend
        />
        <PaidDetailedMetricCard
          title="CTR"
          value={formatPercent(aggregatedMetrics.ctr)}
          change={aggregatedMetrics.ctrChange}
          icon={Zap}
          isLoading={insightsLoading}
        />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <PaidDetailedMetricCard
          title="CPC"
          value={formatCurrency(aggregatedMetrics.cpc)}
          change={aggregatedMetrics.cpcChange}
          icon={DollarSign}
          isLoading={insightsLoading}
          invertTrend
          small
        />
        <PaidDetailedMetricCard
          title="CPM"
          value={formatCurrency(aggregatedMetrics.cpm)}
          change={aggregatedMetrics.cpmChange}
          icon={BarChart3}
          isLoading={insightsLoading}
          invertTrend
          small
        />
        <PaidDetailedMetricCard
          title="Reach"
          value={formatNumber(aggregatedMetrics.reach)}
          change={aggregatedMetrics.reachChange}
          icon={Users}
          isLoading={insightsLoading}
          small
        />
        <PaidDetailedMetricCard
          title="Frequency"
          value={aggregatedMetrics.frequency.toFixed(2)}
          change={aggregatedMetrics.frequencyChange}
          icon={Repeat}
          isLoading={insightsLoading}
          small
        />
      </div>

      <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-primary" />
            Évolution quotidienne
          </CardTitle>
        </CardHeader>
        <CardContent>
          <PaidDetailedChart
            insights={insights}
            isLoading={insightsLoading}
          />
        </CardContent>
      </Card>

      <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-base font-medium">
            Campagnes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <PaidCampaignsTable
            campaigns={campaigns}
            isLoading={campaignsLoading}
          />
        </CardContent>
      </Card>
    </div>
  );
};
