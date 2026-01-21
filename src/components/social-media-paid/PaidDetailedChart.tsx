import { useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";

interface PaidInsight {
  date: string;
  impressions: number;
  clicks: number;
  spend: number;
}

interface PaidDetailedChartProps {
  insights: PaidInsight[];
  isLoading?: boolean;
}

export const PaidDetailedChart = ({ insights, isLoading }: PaidDetailedChartProps) => {
  const chartData = useMemo(() => {
    const grouped = insights.reduce((acc, insight) => {
      const date = insight.date;
      if (!acc[date]) {
        acc[date] = { impressions: 0, clicks: 0, spend: 0 };
      }
      acc[date].impressions += Number(insight.impressions) || 0;
      acc[date].clicks += Number(insight.clicks) || 0;
      acc[date].spend += Number(insight.spend) || 0;
      return acc;
    }, {} as Record<string, { impressions: number; clicks: number; spend: number }>);

    return Object.entries(grouped)
      .map(([date, metrics]) => ({
        date,
        formattedDate: format(parseISO(date), "dd MMM", { locale: fr }),
        ...metrics,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [insights]);

  if (isLoading) {
    return <Skeleton className="h-80 w-full rounded-xl" />;
  }

  if (chartData.length === 0) {
    return (
      <div className="h-80 flex items-center justify-center text-muted-foreground">
        <div className="text-center">
          <p className="text-sm">Aucune donnée disponible</p>
          <p className="text-xs mt-1">Les données apparaîtront une fois synchronisées</p>
        </div>
      </div>
    );
  }

  const formatYAxis = (value: number) => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(0)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
    return value.toString();
  };

  const formatSpend = (value: number) => `${value.toFixed(0)}€`;

  return (
    <ResponsiveContainer width="100%" height={320}>
      <LineChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="impressionsGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="clicksGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="hsl(var(--success))" stopOpacity={0.3} />
            <stop offset="95%" stopColor="hsl(var(--success))" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
        <XAxis
          dataKey="formattedDate"
          stroke="hsl(var(--muted-foreground))"
          fontSize={11}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          yAxisId="left"
          stroke="hsl(var(--muted-foreground))"
          fontSize={11}
          tickFormatter={formatYAxis}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          yAxisId="right"
          orientation="right"
          stroke="hsl(var(--muted-foreground))"
          fontSize={11}
          tickFormatter={formatSpend}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "hsl(var(--card))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "12px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
          }}
          formatter={(value: number, name: string) => {
            if (name === "spend") return [`${value.toFixed(2)}€`, "Dépenses"];
            if (name === "impressions") return [formatYAxis(value), "Impressions"];
            if (name === "clicks") return [formatYAxis(value), "Clics"];
            return [value, name];
          }}
        />
        <Legend
          wrapperStyle={{ paddingTop: "20px" }}
          formatter={(value) => {
            const labels: Record<string, string> = {
              impressions: "Impressions",
              clicks: "Clics",
              spend: "Dépenses",
            };
            return <span className="text-sm text-muted-foreground">{labels[value] || value}</span>;
          }}
        />
        <Line
          yAxisId="left"
          type="monotone"
          dataKey="impressions"
          stroke="hsl(var(--primary))"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 6, strokeWidth: 2 }}
        />
        <Line
          yAxisId="left"
          type="monotone"
          dataKey="clicks"
          stroke="hsl(var(--success))"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 6, strokeWidth: 2 }}
        />
        <Line
          yAxisId="right"
          type="monotone"
          dataKey="spend"
          stroke="hsl(var(--warning))"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 6, strokeWidth: 2 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};
