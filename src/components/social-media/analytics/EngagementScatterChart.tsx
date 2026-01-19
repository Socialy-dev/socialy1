import { useMemo } from "react";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  Tooltip,
  ResponsiveContainer,
  Cell
} from "recharts";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { TrendingUp, Heart, MessageCircle, Share2, Eye } from "lucide-react";
import { EngagementDataPoint } from "@/hooks/useTikTokAnalytics";

interface EngagementScatterChartProps {
  data: EngagementDataPoint[];
}

const getColorByEngagement = (rate: number): string => {
  if (rate >= 5) return "hsl(142, 71%, 45%)";
  if (rate >= 3) return "hsl(252, 85%, 60%)";
  if (rate >= 1) return "hsl(38, 92%, 50%)";
  return "hsl(0, 84%, 60%)";
};

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload || !payload.length) return null;

  const data = payload[0].payload;

  return (
    <div className="bg-card border border-border rounded-xl p-4 shadow-xl min-w-[200px]">
      <p className="text-xs text-muted-foreground mb-2">
        {format(new Date(data.date), "dd MMMM yyyy", { locale: fr })}
      </p>

      <div className="flex items-center gap-2 mb-3">
        <div
          className="w-3 h-3 rounded-full"
          style={{ backgroundColor: getColorByEngagement(data.engagementRate) }}
        />
        <span className="text-lg font-bold text-foreground">{data.engagementRate}%</span>
        <span className="text-sm text-muted-foreground">engagement</span>
      </div>

      <p className="text-sm text-foreground mb-3 line-clamp-2">
        {data.caption || "Pas de légende"}
      </p>

      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <Eye className="w-3.5 h-3.5" />
          <span>{data.views.toLocaleString("fr-FR")}</span>
        </div>
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <Heart className="w-3.5 h-3.5" />
          <span>{data.likes.toLocaleString("fr-FR")}</span>
        </div>
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <MessageCircle className="w-3.5 h-3.5" />
          <span>{data.comments.toLocaleString("fr-FR")}</span>
        </div>
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <Share2 className="w-3.5 h-3.5" />
          <span>{data.shares.toLocaleString("fr-FR")}</span>
        </div>
      </div>
    </div>
  );
};

export const EngagementScatterChart = ({ data }: EngagementScatterChartProps) => {
  const chartData = useMemo(() => {
    return data.map((point) => ({
      ...point,
      x: point.date.getTime(),
      y: point.engagementRate,
      z: Math.max(point.views, 100)
    }));
  }, [data]);

  const avgEngagement = useMemo(() => {
    if (data.length === 0) return 0;
    const total = data.reduce((sum, d) => sum + d.engagementRate, 0);
    return Math.round((total / data.length) * 100) / 100;
  }, [data]);

  if (data.length === 0) {
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
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground">Taux d'engagement par post</h3>
            <p className="text-sm text-muted-foreground">
              Moyenne: <span className="font-semibold text-foreground">{avgEngagement}%</span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-danger" />
            <span className="text-muted-foreground">&lt;1%</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-warning" />
            <span className="text-muted-foreground">1-3%</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-primary" />
            <span className="text-muted-foreground">3-5%</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-success" />
            <span className="text-muted-foreground">&gt;5%</span>
          </div>
        </div>
      </div>

      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
            <XAxis
              dataKey="x"
              type="number"
              domain={["dataMin", "dataMax"]}
              tickFormatter={(value) => format(new Date(value), "dd/MM", { locale: fr })}
              tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
              axisLine={{ stroke: "hsl(var(--border))" }}
              tickLine={false}
            />
            <YAxis
              dataKey="y"
              type="number"
              domain={[0, "auto"]}
              tickFormatter={(value) => `${value}%`}
              tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
              axisLine={{ stroke: "hsl(var(--border))" }}
              tickLine={false}
            />
            <ZAxis
              dataKey="z"
              type="number"
              range={[50, 400]}
            />
            <Tooltip content={<CustomTooltip />} />
            <Scatter data={chartData}>
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={getColorByEngagement(entry.engagementRate)}
                  fillOpacity={0.8}
                  stroke={getColorByEngagement(entry.engagementRate)}
                  strokeWidth={2}
                />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
