import { useState } from "react";
import { Plus, TrendingUp, TrendingDown, Eye, MousePointer, Wallet, Target, BarChart3, Zap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { usePaidClients } from "@/hooks/usePaidClients";
import { usePaidInsights } from "@/hooks/usePaidInsights";
import { AddPaidClientModal } from "./AddPaidClientModal";
import { PaidClientFilter } from "./PaidClientFilter";
import { PaidPlatformFilter } from "./PaidPlatformFilter";
import { PaidMetricCard } from "./PaidMetricCard";
import { PaidPerformanceChart } from "./PaidPerformanceChart";

export type PaidPlatform = "all" | "meta" | "google" | "linkedin" | "pinterest" | "tiktok";

export const PaidDashboardView = () => {
  const [isAddClientModalOpen, setIsAddClientModalOpen] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [selectedPlatform, setSelectedPlatform] = useState<PaidPlatform>("all");

  const { clients, isLoading: clientsLoading } = usePaidClients();
  const { insights, isLoading: insightsLoading, aggregatedMetrics } = usePaidInsights(
    selectedClientId,
    selectedPlatform
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
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  };

  const formatPercent = (num: number) => `${num.toFixed(2)}%`;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex gap-3">
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

        <Button
          onClick={() => setIsAddClientModalOpen(true)}
          className="bg-primary hover:bg-primary/90"
        >
          <Plus className="w-4 h-4 mr-2" />
          Ajouter un client
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <PaidMetricCard
          title="Impressions"
          value={formatNumber(aggregatedMetrics.impressions)}
          change={aggregatedMetrics.impressionsChange}
          icon={Eye}
          isLoading={insightsLoading}
        />
        <PaidMetricCard
          title="Clics"
          value={formatNumber(aggregatedMetrics.clicks)}
          change={aggregatedMetrics.clicksChange}
          icon={MousePointer}
          isLoading={insightsLoading}
        />
        <PaidMetricCard
          title="Dépenses"
          value={formatCurrency(aggregatedMetrics.spend)}
          change={aggregatedMetrics.spendChange}
          icon={Wallet}
          isLoading={insightsLoading}
          invertTrend
        />
        <PaidMetricCard
          title="Conversions"
          value={formatNumber(aggregatedMetrics.conversions)}
          change={aggregatedMetrics.conversionsChange}
          icon={Target}
          isLoading={insightsLoading}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <PaidMetricCard
          title="CPC Moyen"
          value={formatCurrency(aggregatedMetrics.cpc)}
          change={aggregatedMetrics.cpcChange}
          icon={BarChart3}
          isLoading={insightsLoading}
          invertTrend
          small
        />
        <PaidMetricCard
          title="CTR Moyen"
          value={formatPercent(aggregatedMetrics.ctr)}
          change={aggregatedMetrics.ctrChange}
          icon={Zap}
          isLoading={insightsLoading}
          small
        />
        <PaidMetricCard
          title="ROAS"
          value={`${aggregatedMetrics.roas.toFixed(2)}x`}
          change={aggregatedMetrics.roasChange}
          icon={TrendingUp}
          isLoading={insightsLoading}
          small
        />
      </div>

      <Card className="bg-card/50 border-border/50">
        <CardHeader>
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-primary" />
            Évolution des performances
          </CardTitle>
        </CardHeader>
        <CardContent>
          <PaidPerformanceChart
            insights={insights}
            isLoading={insightsLoading}
          />
        </CardContent>
      </Card>

      <AddPaidClientModal
        isOpen={isAddClientModalOpen}
        onClose={() => setIsAddClientModalOpen(false)}
      />
    </div>
  );
};
