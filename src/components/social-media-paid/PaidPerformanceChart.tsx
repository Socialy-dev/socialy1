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
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import { Skeleton } from "@/components/ui/skeleton";

interface PaidInsight {
  date: string;
  impressions: number;
  clicks: number;
  spend: number;
}

interface PaidPerformanceChartProps {
  insights: PaidInsight[];
  isLoading?: boolean;
}

export const PaidPerformanceChart = ({
  insights,
  isLoading,
}: PaidPerformanceChartProps) => {
  const chartData = useMemo(() => {
    if (!insights.length) return [];

    const groupedByDate = insights.reduce((acc, insight) => {
      const dateKey = insight.date;
      if (!acc[dateKey]) {
        acc[dateKey] = { impressions: 0, clicks: 0, spend: 0 };
      }
      acc[dateKey].impressions += Number(insight.impressions) || 0;
      acc[dateKey].clicks += Number(insight.clicks) || 0;
      acc[dateKey].spend += Number(insight.spend) || 0;
      return acc;
    }, {} as Record<string, { impressions: number; clicks: number; spend: number }>);

    return Object.entries(groupedByDate)
      .map(([date, data]) => ({
        date,
        formattedDate: format(parseISO(date), "dd MMM", { locale: fr }),
        ...data,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [insights]);

  if (isLoading) {
    return <Skeleton className="h-80 w-full" />;
  }

  if (!chartData.length) {
    return (
      <div className="h-80 flex items-center justify-center text-muted-foreground">
        Aucune donnée disponible pour la période sélectionnée
      </div>
    );
  }

  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
          <XAxis
            dataKey="formattedDate"
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
            axisLine={{ stroke: "hsl(var(--border))" }}
          />
          <YAxis
            yAxisId="left"
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
            axisLine={{ stroke: "hsl(var(--border))" }}
            tickFormatter={(value) =>
              value >= 1000 ? `${(value / 1000).toFixed(0)}K` : value
            }
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
            axisLine={{ stroke: "hsl(var(--border))" }}
            tickFormatter={(value) => `${value}€`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "8px",
              color: "hsl(var(--foreground))",
            }}
            formatter={(value: number, name: string) => {
              if (name === "Dépenses") return [`${value.toFixed(2)}€`, name];
              return [value.toLocaleString("fr-FR"), name];
            }}
          />
          <Legend />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="impressions"
            name="Impressions"
            stroke="hsl(var(--primary))"
            strokeWidth={2}
            dot={false}
          />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="clicks"
            name="Clics"
            stroke="hsl(142 76% 36%)"
            strokeWidth={2}
            dot={false}
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="spend"
            name="Dépenses"
            stroke="hsl(346 77% 50%)"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
