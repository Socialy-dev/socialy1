import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from "recharts";
import { format, startOfWeek, eachWeekOfInterval, subDays, parseISO, isWithinInterval } from "date-fns";
import { fr } from "date-fns/locale";
import { CalendarDays, TrendingUp, TrendingDown, Minus } from "lucide-react";

interface PublishingDataPoint {
  weekStart: Date;
  weekLabel: string;
  postCount: number;
  avgEngagement: number;
}

interface PublishingRegularityChartProps {
  posts: Array<{
    posted_at: string | null;
    created_at: string;
    views_count: number | null;
    likes_count: number | null;
    comments_count: number | null;
    shares_count: number | null;
  }>;
  periodDays: number;
}

export const PublishingRegularityChart = ({ posts, periodDays }: PublishingRegularityChartProps) => {
  const chartData = useMemo(() => {
    const now = new Date();
    const startDate = subDays(now, periodDays);
    
    const weeks = eachWeekOfInterval(
      { start: startDate, end: now },
      { weekStartsOn: 1 }
    );

    const data: PublishingDataPoint[] = weeks.map((weekStart) => {
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);

      const weekPosts = posts.filter((post) => {
        const postDate = post.posted_at ? parseISO(post.posted_at) : parseISO(post.created_at);
        return isWithinInterval(postDate, { start: weekStart, end: weekEnd });
      });

      const totalEngagement = weekPosts.reduce((sum, post) => {
        const views = post.views_count || 1;
        const likes = post.likes_count || 0;
        const comments = post.comments_count || 0;
        const shares = post.shares_count || 0;
        return sum + ((likes + comments + shares) / views) * 100;
      }, 0);

      return {
        weekStart,
        weekLabel: format(weekStart, "d MMM", { locale: fr }),
        postCount: weekPosts.length,
        avgEngagement: weekPosts.length > 0 ? Math.round((totalEngagement / weekPosts.length) * 100) / 100 : 0
      };
    });

    return data;
  }, [posts, periodDays]);

  const stats = useMemo(() => {
    const totalPosts = chartData.reduce((sum, d) => sum + d.postCount, 0);
    const avgPostsPerWeek = chartData.length > 0 ? totalPosts / chartData.length : 0;
    
    const nonZeroWeeks = chartData.filter((d) => d.postCount > 0);
    const regularity = chartData.length > 0 ? (nonZeroWeeks.length / chartData.length) * 100 : 0;

    const maxPosts = Math.max(...chartData.map((d) => d.postCount));
    const bestWeek = chartData.find((d) => d.postCount === maxPosts);

    const recentWeeks = chartData.slice(-4);
    const olderWeeks = chartData.slice(0, -4);
    
    const recentAvg = recentWeeks.length > 0 
      ? recentWeeks.reduce((sum, d) => sum + d.postCount, 0) / recentWeeks.length 
      : 0;
    const olderAvg = olderWeeks.length > 0 
      ? olderWeeks.reduce((sum, d) => sum + d.postCount, 0) / olderWeeks.length 
      : 0;

    let trend: "up" | "down" | "stable" = "stable";
    if (recentAvg > olderAvg * 1.2) trend = "up";
    else if (recentAvg < olderAvg * 0.8) trend = "down";

    return {
      totalPosts,
      avgPostsPerWeek: Math.round(avgPostsPerWeek * 10) / 10,
      regularity: Math.round(regularity),
      bestWeek: bestWeek?.weekLabel || "-",
      maxPosts,
      trend
    };
  }, [chartData]);

  const getBarColor = (postCount: number) => {
    if (postCount === 0) return "hsl(var(--muted))";
    if (postCount >= 3) return "hsl(142, 76%, 36%)";
    if (postCount >= 2) return "hsl(173, 80%, 40%)";
    return "hsl(199, 89%, 48%)";
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-card border border-border rounded-xl p-3 shadow-xl">
          <p className="text-sm font-semibold text-foreground mb-2">
            Semaine du {data.weekLabel}
          </p>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">
              Publications: <span className="font-medium text-foreground">{data.postCount}</span>
            </p>
            {data.postCount > 0 && (
              <p className="text-sm text-muted-foreground">
                Engagement moyen: <span className="font-medium text-foreground">{data.avgEngagement}%</span>
              </p>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
          <CalendarDays className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-base font-semibold text-foreground">Régularité des publications</h3>
          <p className="text-xs text-muted-foreground">Publications par semaine</p>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3 mb-6">
        <div className="p-3 rounded-xl bg-muted/30">
          <p className="text-lg font-bold text-foreground">{stats.avgPostsPerWeek}</p>
          <p className="text-xs text-muted-foreground">Moy./semaine</p>
        </div>
        <div className="p-3 rounded-xl bg-muted/30">
          <p className="text-lg font-bold text-foreground">{stats.regularity}%</p>
          <p className="text-xs text-muted-foreground">Régularité</p>
        </div>
        <div className="p-3 rounded-xl bg-muted/30">
          <p className="text-lg font-bold text-foreground">{stats.maxPosts}</p>
          <p className="text-xs text-muted-foreground">Max/semaine</p>
        </div>
        <div className="p-3 rounded-xl bg-muted/30 flex items-center gap-2">
          {stats.trend === "up" && <TrendingUp className="w-4 h-4 text-emerald-500" />}
          {stats.trend === "down" && <TrendingDown className="w-4 h-4 text-red-500" />}
          {stats.trend === "stable" && <Minus className="w-4 h-4 text-muted-foreground" />}
          <div>
            <p className="text-xs font-medium text-foreground capitalize">{stats.trend === "up" ? "En hausse" : stats.trend === "down" ? "En baisse" : "Stable"}</p>
            <p className="text-xs text-muted-foreground">Tendance</p>
          </div>
        </div>
      </div>

      <div className="h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
            <XAxis 
              dataKey="weekLabel" 
              tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
              axisLine={{ stroke: "hsl(var(--border))" }}
              tickLine={false}
            />
            <YAxis 
              tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
              axisLine={false}
              tickLine={false}
              allowDecimals={false}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "hsl(var(--muted))", opacity: 0.3 }} />
            <Bar dataKey="postCount" radius={[6, 6, 0, 0]} maxBarSize={40}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getBarColor(entry.postCount)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center justify-center gap-4 mt-4 text-xs">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-[hsl(199,89%,48%)]" />
          <span className="text-muted-foreground">1 post</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-[hsl(173,80%,40%)]" />
          <span className="text-muted-foreground">2 posts</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-[hsl(142,76%,36%)]" />
          <span className="text-muted-foreground">3+ posts</span>
        </div>
      </div>
    </div>
  );
};
