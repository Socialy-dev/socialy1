import { useState, useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell
} from "recharts";
import { Hash, TrendingUp, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";
import { HashtagPerformance } from "@/hooks/useTikTokAnalytics";

interface HashtagBarChartProps {
  data: HashtagPerformance[];
}

type SortBy = "engagement" | "usage";

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload || !payload.length) return null;

  const data = payload[0].payload;

  return (
    <div className="bg-card border border-border rounded-xl p-4 shadow-xl min-w-[180px]">
      <div className="flex items-center gap-2 mb-3">
        <Hash className="w-4 h-4 text-primary" />
        <span className="font-bold text-foreground">#{data.hashtag}</span>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Utilisations</span>
          <span className="font-semibold text-foreground">{data.usageCount}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Engagement moyen</span>
          <span className="font-semibold text-foreground">{data.avgEngagementRate}%</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Vues totales</span>
          <span className="font-semibold text-foreground">
            {data.totalViews.toLocaleString("fr-FR")}
          </span>
        </div>
      </div>
    </div>
  );
};

export const HashtagBarChart = ({ data }: HashtagBarChartProps) => {
  const [sortBy, setSortBy] = useState<SortBy>("engagement");

  const sortedData = useMemo(() => {
    const sorted = [...data];
    if (sortBy === "engagement") {
      sorted.sort((a, b) => b.avgEngagementRate - a.avgEngagementRate);
    } else {
      sorted.sort((a, b) => b.usageCount - a.usageCount);
    }
    return sorted.slice(0, 10);
  }, [data, sortBy]);

  const maxValue = useMemo(() => {
    if (sortBy === "engagement") {
      return Math.max(...sortedData.map((d) => d.avgEngagementRate), 1);
    }
    return Math.max(...sortedData.map((d) => d.usageCount), 1);
  }, [sortedData, sortBy]);

  if (data.length === 0) {
    return (
      <div className="h-[300px] flex items-center justify-center text-muted-foreground">
        Aucun hashtag trouvé pour cette période
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
            <Hash className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground">Performance des hashtags</h3>
            <p className="text-sm text-muted-foreground">Top 10 hashtags</p>
          </div>
        </div>

        <div className="flex items-center gap-1 p-1 bg-muted/50 rounded-lg">
          <button
            onClick={() => setSortBy("engagement")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all",
              sortBy === "engagement"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            Engagement
          </button>
          <button
            onClick={() => setSortBy("usage")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all",
              sortBy === "usage"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            Utilisations
          </button>
        </div>
      </div>

      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={sortedData}
            layout="vertical"
            margin={{ top: 10, right: 30, left: 100, bottom: 10 }}
          >
            <XAxis
              type="number"
              domain={[0, "auto"]}
              tickFormatter={(value) => (sortBy === "engagement" ? `${value}%` : value.toString())}
              tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
              axisLine={{ stroke: "hsl(var(--border))" }}
              tickLine={false}
            />
            <YAxis
              type="category"
              dataKey="hashtag"
              tickFormatter={(value) => `#${value}`}
              tick={{ fontSize: 12, fill: "hsl(var(--foreground))" }}
              axisLine={false}
              tickLine={false}
              width={90}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar
              dataKey={sortBy === "engagement" ? "avgEngagementRate" : "usageCount"}
              radius={[0, 8, 8, 0]}
              maxBarSize={24}
            >
              {sortedData.map((entry, index) => {
                const intensity = sortBy === "engagement"
                  ? entry.avgEngagementRate / maxValue
                  : entry.usageCount / maxValue;
                const hue = 252 + (intensity * 30);
                return (
                  <Cell
                    key={`cell-${index}`}
                    fill={`hsl(${hue}, 85%, ${55 + intensity * 15}%)`}
                  />
                );
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
