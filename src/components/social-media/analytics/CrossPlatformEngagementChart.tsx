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
  Cell,
  Legend
} from "recharts";
import { TrendingUp, Facebook, Video } from "lucide-react";

interface PlatformData {
  platform: string;
  posts: number;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  engagementRate: number;
  color: string;
  gradient: string;
}

interface CrossPlatformEngagementChartProps {
  tiktokData: { posts: number; views: number; likes: number; comments: number; shares: number };
  facebookData: { posts: number; views: number; likes: number; comments: number; shares: number };
  linkedinData: { posts: number; reactions: number; comments: number; reposts: number };
  instagramData: { posts: number; views: number; likes: number; comments: number };
}

const platformColors = {
  TikTok: "#FF0050",
  Facebook: "#1877F2",
  LinkedIn: "#0A66C2",
  Instagram: "#E4405F"
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload || !payload.length) return null;

  return (
    <div className="bg-card/95 backdrop-blur-sm border border-border rounded-xl p-4 shadow-xl">
      <p className="font-bold text-foreground mb-2">{label}</p>
      {payload.map((entry: any, index: number) => (
        <div key={index} className="flex items-center justify-between gap-4 text-sm">
          <span className="text-muted-foreground">{entry.name}:</span>
          <span className="font-semibold" style={{ color: entry.color }}>
            {entry.name === "Taux d'engagement" ? `${entry.value.toFixed(2)}%` : entry.value.toLocaleString()}
          </span>
        </div>
      ))}
    </div>
  );
};

export const CrossPlatformEngagementChart = ({
  tiktokData,
  facebookData,
  linkedinData,
  instagramData
}: CrossPlatformEngagementChartProps) => {
  const chartData = useMemo(() => {
    const calculateEngagement = (likes: number, comments: number, shares: number, views: number) => {
      if (views === 0) return 0;
      return ((likes + comments + shares) / views) * 100;
    };

    return [
      {
        platform: "TikTok",
        Posts: tiktokData.posts,
        Engagement: tiktokData.likes + tiktokData.comments + tiktokData.shares,
        "Taux d'engagement": calculateEngagement(tiktokData.likes, tiktokData.comments, tiktokData.shares, tiktokData.views),
        color: platformColors.TikTok
      },
      {
        platform: "Facebook",
        Posts: facebookData.posts,
        Engagement: facebookData.likes + facebookData.comments + facebookData.shares,
        "Taux d'engagement": calculateEngagement(facebookData.likes, facebookData.comments, facebookData.shares, facebookData.views),
        color: platformColors.Facebook
      },
      {
        platform: "LinkedIn",
        Posts: linkedinData.posts,
        Engagement: linkedinData.reactions + linkedinData.comments + linkedinData.reposts,
        "Taux d'engagement": linkedinData.posts > 0 ? ((linkedinData.reactions + linkedinData.comments + linkedinData.reposts) / linkedinData.posts) : 0,
        color: platformColors.LinkedIn
      },
      {
        platform: "Instagram",
        Posts: instagramData.posts,
        Engagement: instagramData.likes + instagramData.comments,
        "Taux d'engagement": calculateEngagement(instagramData.likes, instagramData.comments, 0, instagramData.views),
        color: platformColors.Instagram
      }
    ];
  }, [tiktokData, facebookData, linkedinData, instagramData]);

  const totalEngagement = chartData.reduce((sum, d) => sum + d.Engagement, 0);
  const avgEngagementRate = chartData.reduce((sum, d) => sum + d["Taux d'engagement"], 0) / 4;

  return (
    <Card className="p-6 bg-card border-border/50">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-foreground">Engagement par plateforme</h3>
            <p className="text-sm text-muted-foreground">Comparaison cross-platform</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-foreground">{totalEngagement.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground">Engagement total</p>
        </div>
      </div>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
            <XAxis
              dataKey="platform"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
              tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}K` : v}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="Engagement" radius={[8, 8, 0, 0]}>
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