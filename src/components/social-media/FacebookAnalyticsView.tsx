import { useFacebookAnalytics } from "@/hooks/useFacebookAnalytics";
import { TikTokAnalyticsFilters } from "./analytics/TikTokAnalyticsFilters";
import { EngagementScatterChart } from "./analytics/EngagementScatterChart";
import { ContentTypeBarChart } from "./analytics/ContentTypeBarChart";
import { PublishingRegularityChart } from "./analytics/PublishingRegularityChart";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart3, TrendingUp, Layers, Facebook, Image as ImageIcon, Video } from "lucide-react";

export const FacebookAnalyticsView = () => {
  const {
    loading,
    period,
    setPeriod,
    customDateRange,
    setCustomDateRange,
    filteredPosts,
    engagementData,
    contentTypeStats,
    periodDays
  } = useFacebookAnalytics();

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

  const totalViews = filteredPosts.reduce((sum, post) => sum + (post.views_count || 0), 0);
  const totalLikes = filteredPosts.reduce((sum, post) => sum + (post.likes_count || 0), 0);
  const totalComments = filteredPosts.reduce((sum, post) => sum + (post.comments_count || 0), 0);
  const totalShares = filteredPosts.reduce((sum, post) => sum + (post.shares_count || 0), 0);
  const avgEngagement = totalViews > 0 
    ? (((totalLikes + totalComments + totalShares) / totalViews) * 100).toFixed(2)
    : "0.00";

  const videoCount = filteredPosts.filter(p => p.post_type === "video" || p.post_type === "Video").length;
  const photoCount = filteredPosts.filter(p => p.post_type === "photo" || p.post_type === "Photo").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-lg">
            <BarChart3 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">Analyse Facebook</h2>
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
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">{avgEngagement}%</p>
            <p className="text-xs text-muted-foreground">Engagement moyen</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-card border border-border/50 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-pink-600 flex items-center justify-center">
            <Video className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">{videoCount}</p>
            <p className="text-xs text-muted-foreground">Vidéos</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-card border border-border/50 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
            <ImageIcon className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">{photoCount}</p>
            <p className="text-xs text-muted-foreground">Photos</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-card border border-border/50 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
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
          <ContentTypeBarChart 
            data={contentTypeStats.map(s => ({
              type: s.type as "video" | "carousel",
              label: s.label,
              avgViews: s.avgViews,
              avgEngagementRate: s.avgEngagementRate,
              postCount: s.postCount
            }))} 
          />
        </div>
      </div>

      <div className="p-6 rounded-2xl bg-card border border-border/50">
        <PublishingRegularityChart 
          posts={filteredPosts.map(p => ({
            posted_at: p.posted_at,
            created_at: p.created_at,
            views_count: p.views_count,
            likes_count: p.likes_count,
            comments_count: p.comments_count,
            shares_count: p.shares_count
          }))} 
          periodDays={periodDays} 
        />
      </div>
    </div>
  );
};
