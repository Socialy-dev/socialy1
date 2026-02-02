import { useLinkedInAnalytics } from "@/hooks/useLinkedInAnalytics";
import { TikTokAnalyticsFilters } from "./analytics/TikTokAnalyticsFilters";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart3, TrendingUp, Users, Layers, MessageCircle, Repeat2, ThumbsUp, Heart, PartyPopper, HandHeart, Lightbulb } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  ScatterChart,
  Scatter,
  ZAxis,
  AreaChart,
  Area
} from "recharts";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export const LinkedInAnalyticsView = () => {
  const {
    loading,
    period,
    setPeriod,
    customDateRange,
    setCustomDateRange,
    filteredPosts,
    engagementData,
    contentTypeStats,
    reactionBreakdown,
    followersDelta,
    periodDays
  } = useLinkedInAnalytics();

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

  const totalReactions = filteredPosts.reduce((sum, post) => sum + (post.total_reactions || 0), 0);
  const totalComments = filteredPosts.reduce((sum, post) => sum + (post.comments_count || 0), 0);
  const totalReposts = filteredPosts.reduce((sum, post) => sum + (post.reposts_count || 0), 0);
  const avgEngagement = engagementData.length > 0
    ? engagementData.reduce((sum, d) => sum + d.engagementRate, 0) / engagementData.length
    : 0;

  const formatNumber = (num: number | null) => {
    if (num === null || num === undefined) return "0";
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const reactionColors: Record<string, string> = {
    like: "#0A66C2",
    love: "#DF704D",
    celebrate: "#7FC15E",
    support: "#A872E8",
    insight: "#F5BB5C"
  };

  const scatterData = engagementData.map(d => ({
    x: d.date.getTime(),
    y: d.engagementRate,
    z: d.reactions,
    name: format(d.date, "dd MMM", { locale: fr }),
    caption: d.caption.substring(0, 50) + "..."
  }));

  const publishingData = engagementData.reduce((acc, item) => {
    const weekKey = format(item.date, "wo 'sem'", { locale: fr });
    if (!acc[weekKey]) {
      acc[weekKey] = { week: weekKey, posts: 0, totalEngagement: 0 };
    }
    acc[weekKey].posts++;
    acc[weekKey].totalEngagement += item.engagementRate;
    return acc;
  }, {} as Record<string, { week: string; posts: number; totalEngagement: number }>);

  const publishingChartData = Object.values(publishingData).map(d => ({
    week: d.week,
    posts: d.posts,
    avgEngagement: (d.totalEngagement / d.posts).toFixed(2)
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#0A66C2] to-[#004182] flex items-center justify-center shadow-lg">
            <BarChart3 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">Analyse LinkedIn</h2>
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
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0A66C2] to-[#004182] flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">{avgEngagement.toFixed(2)}%</p>
            <p className="text-xs text-muted-foreground">Engagement moyen</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-card border border-border/50 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
            <ThumbsUp className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">{formatNumber(totalReactions)}</p>
            <p className="text-xs text-muted-foreground">Réactions</p>
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
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-[#0A66C2]" />
            <h3 className="font-semibold text-foreground">Engagement par publication</h3>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  type="number" 
                  dataKey="x" 
                  domain={["auto", "auto"]}
                  tickFormatter={(val) => format(new Date(val), "dd/MM", { locale: fr })}
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <YAxis 
                  type="number" 
                  dataKey="y" 
                  name="Engagement"
                  unit="%"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <ZAxis type="number" dataKey="z" range={[50, 400]} name="Réactions" />
                <Tooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
                          <p className="font-medium text-foreground">{data.name}</p>
                          <p className="text-sm text-muted-foreground">Engagement: {data.y}%</p>
                          <p className="text-sm text-muted-foreground">Réactions: {data.z}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Scatter 
                  data={scatterData} 
                  fill="#0A66C2"
                  fillOpacity={0.7}
                />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-card border border-border/50">
          <div className="flex items-center gap-2 mb-4">
            <Heart className="w-5 h-5 text-[#DF704D]" />
            <h3 className="font-semibold text-foreground">Répartition des réactions</h3>
          </div>
          <div className="h-[300px]">
            {reactionBreakdown.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={reactionBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="count"
                    nameKey="label"
                  >
                    {reactionBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
                            <p className="font-medium text-foreground">{data.label}</p>
                            <p className="text-sm text-muted-foreground">{formatNumber(data.count)}</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                Pas de données de réactions
              </div>
            )}
          </div>
          <div className="flex flex-wrap justify-center gap-4 mt-4">
            {reactionBreakdown.map((reaction) => (
              <div key={reaction.type} className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: reaction.color }}
                />
                <span className="text-xs text-muted-foreground">
                  {reaction.label} ({formatNumber(reaction.count)})
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-card border border-border/50">
          <div className="flex items-center gap-2 mb-4">
            <Layers className="w-5 h-5 text-[#0A66C2]" />
            <h3 className="font-semibold text-foreground">Performance par type de contenu</h3>
          </div>
          <div className="h-[300px]">
            {contentTypeStats.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={contentTypeStats} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis 
                    type="category" 
                    dataKey="label" 
                    width={80}
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
                            <p className="font-medium text-foreground">{data.label}</p>
                            <p className="text-sm text-muted-foreground">{data.postCount} publications</p>
                            <p className="text-sm text-muted-foreground">Engagement: {data.avgEngagementRate}%</p>
                            <p className="text-sm text-muted-foreground">Réactions moy.: {formatNumber(data.avgReactions)}</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="postCount" fill="#0A66C2" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                Pas de données disponibles
              </div>
            )}
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-card border border-border/50">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-5 h-5 text-[#0A66C2]" />
            <h3 className="font-semibold text-foreground">Régularité de publication</h3>
          </div>
          <div className="h-[300px]">
            {publishingChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={publishingChartData}>
                  <defs>
                    <linearGradient id="colorPosts" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0A66C2" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#0A66C2" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="week" 
                    stroke="hsl(var(--muted-foreground))" 
                    fontSize={12}
                  />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
                            <p className="font-medium text-foreground">{data.week}</p>
                            <p className="text-sm text-muted-foreground">{data.posts} publications</p>
                            <p className="text-sm text-muted-foreground">Engagement moy.: {data.avgEngagement}%</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="posts" 
                    stroke="#0A66C2" 
                    fillOpacity={1} 
                    fill="url(#colorPosts)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                Pas de données disponibles
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
