import { useMemo } from "react";
import { Card } from "@/components/ui/card";
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
import { Eye } from "lucide-react";

interface CrossPlatformViewsChartProps {
  tiktokViews: number;
  facebookViews: number;
  linkedinReactions: number;
  instagramViews: number;
}

const platformColors = {
  TikTok: "#FF0050",
  Facebook: "#1877F2",
  LinkedIn: "#0A66C2",
  Instagram: "#E4405F"
};

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload || !payload.length) return null;

  const data = payload[0].payload;
  return (
    <div className="bg-card/95 backdrop-blur-sm border border-border rounded-xl p-4 shadow-xl">
      <p className="font-bold text-foreground mb-1">{data.platform}</p>
      <p className="text-sm text-muted-foreground">
        {data.views.toLocaleString()} vues/réactions
      </p>
      <p className="text-xs text-muted-foreground mt-1">
        {data.percentage}% du total
      </p>
    </div>
  );
};

export const CrossPlatformViewsChart = ({
  tiktokViews,
  facebookViews,
  linkedinReactions,
  instagramViews
}: CrossPlatformViewsChartProps) => {
  const chartData = useMemo(() => {
    const total = tiktokViews + facebookViews + linkedinReactions + instagramViews;
    if (total === 0) return [];

    return [
      { platform: "TikTok", views: tiktokViews, color: platformColors.TikTok, percentage: ((tiktokViews / total) * 100).toFixed(1) },
      { platform: "Facebook", views: facebookViews, color: platformColors.Facebook, percentage: ((facebookViews / total) * 100).toFixed(1) },
      { platform: "LinkedIn", views: linkedinReactions, color: platformColors.LinkedIn, percentage: ((linkedinReactions / total) * 100).toFixed(1) },
      { platform: "Instagram", views: instagramViews, color: platformColors.Instagram, percentage: ((instagramViews / total) * 100).toFixed(1) }
    ];
  }, [tiktokViews, facebookViews, linkedinReactions, instagramViews]);

  const totalViews = tiktokViews + facebookViews + linkedinReactions + instagramViews;

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  if (totalViews === 0) {
    return (
      <Card className="p-6 bg-card border-border/50">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center shadow-lg">
            <Eye className="w-5 h-5 text-white" />
          </div>
          <h3 className="font-bold text-foreground">Portée totale</h3>
        </div>
        <div className="h-64 flex items-center justify-center text-muted-foreground">
          Aucune donnée de vues disponible
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 bg-card border-border/50">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center shadow-lg">
            <Eye className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-foreground">Portée totale</h3>
            <p className="text-sm text-muted-foreground">Vues & réactions par plateforme</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-foreground">{formatNumber(totalViews)}</p>
          <p className="text-xs text-muted-foreground">Portée totale</p>
        </div>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 80, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} horizontal={true} vertical={false} />
            <XAxis
              type="number"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
              tickFormatter={(v) => formatNumber(v)}
            />
            <YAxis
              type="category"
              dataKey="platform"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12, fontWeight: 500 }}
              width={70}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "hsl(var(--muted))", opacity: 0.3 }} />
            <Bar dataKey="views" radius={[0, 8, 8, 0]} barSize={32}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};