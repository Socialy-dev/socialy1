import { useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceDot
} from "recharts";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Users, TrendingUp, TrendingDown, Video } from "lucide-react";
import { FollowersDataPoint } from "@/hooks/useTikTokAnalytics";
import { cn } from "@/lib/utils";

interface FollowersAreaChartProps {
  data: FollowersDataPoint[];
  delta: number;
}

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload || !payload.length) return null;

  const data = payload[0].payload;

  return (
    <div className="bg-card border border-border rounded-xl p-4 shadow-xl min-w-[160px]">
      <p className="text-xs text-muted-foreground mb-2">
        {format(new Date(data.date), "dd MMMM yyyy", { locale: fr })}
      </p>

      <div className="flex items-center gap-2">
        <Users className="w-4 h-4 text-primary" />
        <span className="text-lg font-bold text-foreground">
          {data.followers.toLocaleString("fr-FR")}
        </span>
        <span className="text-sm text-muted-foreground">abonnés</span>
      </div>

      {data.hasPost && (
        <div className="flex items-center gap-1.5 mt-2 text-xs text-muted-foreground">
          <Video className="w-3.5 h-3.5" />
          <span>Publication ce jour</span>
        </div>
      )}
    </div>
  );
};

export const FollowersAreaChart = ({ data, delta }: FollowersAreaChartProps) => {
  const chartData = useMemo(() => {
    return data.map((point) => ({
      ...point,
      date: point.date.getTime()
    }));
  }, [data]);

  const currentFollowers = data.length > 0 ? data[data.length - 1].followers : 0;
  const deltaPercent = data.length > 1 && data[0].followers > 0
    ? ((delta / data[0].followers) * 100).toFixed(1)
    : "0";

  if (data.length === 0) {
    return (
      <div className="h-[300px] flex items-center justify-center text-muted-foreground">
        Aucune donnée de followers disponible
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
            <Users className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground">Croissance des abonnés</h3>
            <p className="text-sm text-muted-foreground">
              Actuel: <span className="font-semibold text-foreground">
                {currentFollowers.toLocaleString("fr-FR")}
              </span>
            </p>
          </div>
        </div>

        <div className={cn(
          "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold",
          delta >= 0
            ? "bg-success/10 text-success"
            : "bg-danger/10 text-danger"
        )}>
          {delta >= 0 ? (
            <TrendingUp className="w-4 h-4" />
          ) : (
            <TrendingDown className="w-4 h-4" />
          )}
          <span>{delta >= 0 ? "+" : ""}{delta.toLocaleString("fr-FR")}</span>
          <span className="text-xs opacity-70">({deltaPercent}%)</span>
        </div>
      </div>

      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
            <defs>
              <linearGradient id="followersGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(252, 85%, 60%)" stopOpacity={0.4} />
                <stop offset="50%" stopColor="hsl(199, 89%, 48%)" stopOpacity={0.2} />
                <stop offset="100%" stopColor="hsl(199, 89%, 48%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="date"
              type="number"
              domain={["dataMin", "dataMax"]}
              tickFormatter={(value) => format(new Date(value), "dd/MM", { locale: fr })}
              tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
              axisLine={{ stroke: "hsl(var(--border))" }}
              tickLine={false}
            />
            <YAxis
              domain={["auto", "auto"]}
              tickFormatter={(value) => {
                if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
                if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
                return value.toString();
              }}
              tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
              axisLine={{ stroke: "hsl(var(--border))" }}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="followers"
              stroke="hsl(252, 85%, 60%)"
              strokeWidth={2.5}
              fill="url(#followersGradient)"
            />
            {chartData.filter((d) => d.hasPost).map((point, i) => (
              <ReferenceDot
                key={i}
                x={point.date}
                y={point.followers}
                r={5}
                fill="hsl(252, 85%, 60%)"
                stroke="white"
                strokeWidth={2}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
