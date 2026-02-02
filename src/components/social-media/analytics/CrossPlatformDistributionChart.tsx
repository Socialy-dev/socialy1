import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend
} from "recharts";
import { PieChart as PieChartIcon } from "lucide-react";

interface CrossPlatformDistributionChartProps {
  tiktokPosts: number;
  facebookPosts: number;
  linkedinPosts: number;
  instagramPosts: number;
}

const platformColors = {
  TikTok: "#FF0050",
  Facebook: "#1877F2",
  LinkedIn: "#0A66C2",
  Instagram: "#E4405F"
};

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload || !payload.length) return null;

  const data = payload[0];
  return (
    <div className="bg-card/95 backdrop-blur-sm border border-border rounded-xl p-4 shadow-xl">
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: data.payload.color }} />
        <span className="font-bold text-foreground">{data.name}</span>
      </div>
      <p className="text-sm text-muted-foreground mt-1">
        {data.value} publications ({data.payload.percentage}%)
      </p>
    </div>
  );
};

export const CrossPlatformDistributionChart = ({
  tiktokPosts,
  facebookPosts,
  linkedinPosts,
  instagramPosts
}: CrossPlatformDistributionChartProps) => {
  const chartData = useMemo(() => {
    const total = tiktokPosts + facebookPosts + linkedinPosts + instagramPosts;
    if (total === 0) return [];

    return [
      { name: "TikTok", value: tiktokPosts, color: platformColors.TikTok, percentage: ((tiktokPosts / total) * 100).toFixed(1) },
      { name: "Facebook", value: facebookPosts, color: platformColors.Facebook, percentage: ((facebookPosts / total) * 100).toFixed(1) },
      { name: "LinkedIn", value: linkedinPosts, color: platformColors.LinkedIn, percentage: ((linkedinPosts / total) * 100).toFixed(1) },
      { name: "Instagram", value: instagramPosts, color: platformColors.Instagram, percentage: ((instagramPosts / total) * 100).toFixed(1) }
    ].filter(d => d.value > 0);
  }, [tiktokPosts, facebookPosts, linkedinPosts, instagramPosts]);

  const totalPosts = tiktokPosts + facebookPosts + linkedinPosts + instagramPosts;

  if (totalPosts === 0) {
    return (
      <Card className="p-6 bg-card border-border/50">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg">
            <PieChartIcon className="w-5 h-5 text-white" />
          </div>
          <h3 className="font-bold text-foreground">Distribution des publications</h3>
        </div>
        <div className="h-64 flex items-center justify-center text-muted-foreground">
          Aucune donnée disponible
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 bg-card border-border/50">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg">
            <PieChartIcon className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-foreground">Distribution des publications</h3>
            <p className="text-sm text-muted-foreground">Répartition par réseau</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-foreground">{totalPosts}</p>
          <p className="text-xs text-muted-foreground">Total publications</p>
        </div>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={4}
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend
              formatter={(value) => <span className="text-sm text-foreground">{value}</span>}
              iconType="circle"
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};