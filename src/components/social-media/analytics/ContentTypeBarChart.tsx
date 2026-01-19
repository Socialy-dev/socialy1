import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts";
import { Layers, Video, ImageIcon, Eye, TrendingUp, FileStack } from "lucide-react";
import { ContentTypeStats } from "@/hooks/useTikTokAnalytics";

interface ContentTypeBarChartProps {
  data: ContentTypeStats[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload || !payload.length) return null;

  return (
    <div className="bg-card border border-border rounded-xl p-4 shadow-xl min-w-[180px]">
      <p className="font-bold text-foreground mb-3">{label}</p>

      <div className="space-y-2 text-sm">
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-muted-foreground">{entry.name}</span>
            </div>
            <span className="font-semibold text-foreground">
              {entry.name === "Taux d'engagement"
                ? `${entry.value}%`
                : entry.value.toLocaleString("fr-FR")}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

const CustomLegend = ({ payload }: any) => {
  return (
    <div className="flex items-center justify-center gap-6 mt-4">
      {payload?.map((entry: any, index: number) => (
        <div key={index} className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-sm text-muted-foreground">{entry.value}</span>
        </div>
      ))}
    </div>
  );
};

export const ContentTypeBarChart = ({ data }: ContentTypeBarChartProps) => {
  const chartData = useMemo(() => {
    return data.map((item) => ({
      name: item.label,
      type: item.type,
      avgViews: item.avgViews,
      avgEngagement: item.avgEngagementRate,
      postCount: item.postCount
    }));
  }, [data]);

  const totalPosts = data.reduce((sum, d) => sum + d.postCount, 0);

  if (data.every((d) => d.postCount === 0)) {
    return (
      <div className="h-[300px] flex items-center justify-center text-muted-foreground">
        Aucune donnée disponible pour cette période
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
            <Layers className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground">Carrousel vs Vidéo</h3>
            <p className="text-sm text-muted-foreground">
              {totalPosts} publications analysées
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        {data.map((item) => (
          <div
            key={item.type}
            className="p-4 rounded-xl bg-muted/30 border border-border/50"
          >
            <div className="flex items-center gap-2 mb-3">
              {item.type === "video" ? (
                <Video className="w-5 h-5 text-pink-500" />
              ) : (
                <ImageIcon className="w-5 h-5 text-violet-500" />
              )}
              <span className="font-semibold text-foreground">{item.label}</span>
              <span className="ml-auto text-xs bg-muted px-2 py-0.5 rounded-full text-muted-foreground">
                {item.postCount} posts
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                  <Eye className="w-3.5 h-3.5" />
                  Vues moyennes
                </div>
                <p className="text-lg font-bold text-foreground">
                  {item.avgViews >= 1000
                    ? `${(item.avgViews / 1000).toFixed(1)}K`
                    : item.avgViews}
                </p>
              </div>
              <div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                  <TrendingUp className="w-3.5 h-3.5" />
                  Engagement
                </div>
                <p className="text-lg font-bold text-foreground">
                  {item.avgEngagementRate}%
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <XAxis
              dataKey="name"
              tick={{ fontSize: 12, fill: "hsl(var(--foreground))" }}
              axisLine={{ stroke: "hsl(var(--border))" }}
              tickLine={false}
            />
            <YAxis
              yAxisId="left"
              orientation="left"
              tickFormatter={(value) => {
                if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
                return value.toString();
              }}
              tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
              axisLine={{ stroke: "hsl(var(--border))" }}
              tickLine={false}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              tickFormatter={(value) => `${value}%`}
              tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
              axisLine={{ stroke: "hsl(var(--border))" }}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend content={<CustomLegend />} />
            <Bar
              yAxisId="left"
              dataKey="avgViews"
              name="Vues moyennes"
              fill="hsl(252, 85%, 60%)"
              radius={[8, 8, 0, 0]}
              maxBarSize={60}
            />
            <Bar
              yAxisId="right"
              dataKey="avgEngagement"
              name="Taux d'engagement"
              fill="hsl(142, 70%, 45%)"
              radius={[8, 8, 0, 0]}
              maxBarSize={60}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
