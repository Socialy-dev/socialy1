import { useTikTokAnalytics } from "@/hooks/useTikTokAnalytics";
import { TikTokAnalyticsFilters } from "./analytics/TikTokAnalyticsFilters";
import { EngagementScatterChart } from "./analytics/EngagementScatterChart";
import { HashtagBarChart } from "./analytics/HashtagBarChart";
import { FollowersAreaChart } from "./analytics/FollowersAreaChart";
import { ContentTypeBarChart } from "./analytics/ContentTypeBarChart";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart3, TrendingUp, Users, Hash, Layers } from "lucide-react";

export const TikTokAnalyticsView = () => {
  const {
    loading,
    period,
    setPeriod,
    customDateRange,
    setCustomDateRange,
    filteredPosts,
    engagementData,
    hashtagPerformance,
    followersData,
    contentTypeStats,
    followersDelta
  } = useTikTokAnalytics();

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-14 rounded-2xl" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-[380px] rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-500 via-red-500 to-yellow-500 flex items-center justify-center shadow-lg">
            <BarChart3 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">Analyse TikTok</h2>
            <p className="text-sm text-muted-foreground">
              {filteredPosts.length} publications analysées
            </p>
          </div>
        </div>
      </div>

      <TikTokAnalyticsFilters
        period={period}
        onPeriodChange={setPeriod}
        customDateRange={customDateRange}
        onCustomDateRangeChange={setCustomDateRange}
      />

      <div className="grid grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-card border border-border/50 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">
              {engagementData.length > 0
                ? (engagementData.reduce((sum, d) => sum + d.engagementRate, 0) / engagementData.length).toFixed(2)
                : "0"}%
            </p>
            <p className="text-xs text-muted-foreground">Engagement moyen</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-card border border-border/50 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
            <Hash className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">{hashtagPerformance.length}</p>
            <p className="text-xs text-muted-foreground">Hashtags utilisés</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-card border border-border/50 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
            <Users className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">
              {followersDelta >= 0 ? "+" : ""}{followersDelta.toLocaleString("fr-FR")}
            </p>
            <p className="text-xs text-muted-foreground">Évolution abonnés</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-card border border-border/50 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
            <Layers className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">{filteredPosts.length}</p>
            <p className="text-xs text-muted-foreground">Publications</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl bg-card border border-border/50">
          <EngagementScatterChart data={engagementData} />
        </div>

        <div className="p-6 rounded-2xl bg-card border border-border/50">
          <HashtagBarChart data={hashtagPerformance} />
        </div>

        <div className="p-6 rounded-2xl bg-card border border-border/50">
          <FollowersAreaChart data={followersData} delta={followersDelta} />
        </div>

        <div className="p-6 rounded-2xl bg-card border border-border/50">
          <ContentTypeBarChart data={contentTypeStats} />
        </div>
      </div>
    </div>
  );
};
