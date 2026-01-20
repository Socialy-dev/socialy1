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
import { Clock } from "lucide-react";

interface VideoPost {
  video_duration?: number | null;
  views_count?: number | null;
  likes_count?: number | null;
}

interface CrossPlatformVideoDurationChartProps {
  tiktokPosts: VideoPost[];
  instagramPosts: VideoPost[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload || !payload.length) return null;

  return (
    <div className="bg-card/95 backdrop-blur-sm border border-border rounded-xl p-4 shadow-xl">
      <p className="font-bold text-foreground mb-2">{label}</p>
      {payload.map((entry: any, index: number) => (
        <div key={index} className="flex items-center justify-between gap-4 text-sm">
          <span className="text-muted-foreground">{entry.name}:</span>
          <span className="font-semibold" style={{ color: entry.fill || entry.color }}>
            {entry.value.toLocaleString()}
          </span>
        </div>
      ))}
    </div>
  );
};

export const CrossPlatformVideoDurationChart = ({
  tiktokPosts,
  instagramPosts
}: CrossPlatformVideoDurationChartProps) => {
  const chartData = useMemo(() => {
    const categorizeByDuration = (posts: VideoPost[], platform: string) => {
      const categories = {
        "0-15s": { count: 0, views: 0, likes: 0 },
        "15-30s": { count: 0, views: 0, likes: 0 },
        "30-60s": { count: 0, views: 0, likes: 0 },
        "1-3min": { count: 0, views: 0, likes: 0 },
        ">3min": { count: 0, views: 0, likes: 0 }
      };

      posts.forEach(post => {
        const duration = post.video_duration || 0;
        let category: keyof typeof categories;

        if (duration <= 15) category = "0-15s";
        else if (duration <= 30) category = "15-30s";
        else if (duration <= 60) category = "30-60s";
        else if (duration <= 180) category = "1-3min";
        else category = ">3min";

        categories[category].count++;
        categories[category].views += post.views_count || 0;
        categories[category].likes += post.likes_count || 0;
      });

      return categories;
    };

    const tiktokCategories = categorizeByDuration(tiktokPosts.filter(p => p.video_duration), "TikTok");
    const instagramCategories = categorizeByDuration(instagramPosts.filter(p => p.video_duration), "Instagram");

    return Object.keys(tiktokCategories).map(category => ({
      duration: category,
      TikTok: tiktokCategories[category as keyof typeof tiktokCategories].count,
      Instagram: instagramCategories[category as keyof typeof instagramCategories].count,
      "TikTok Vues Moy": tiktokCategories[category as keyof typeof tiktokCategories].count > 0
        ? Math.round(tiktokCategories[category as keyof typeof tiktokCategories].views / tiktokCategories[category as keyof typeof tiktokCategories].count)
        : 0,
      "Instagram Vues Moy": instagramCategories[category as keyof typeof instagramCategories].count > 0
        ? Math.round(instagramCategories[category as keyof typeof instagramCategories].views / instagramCategories[category as keyof typeof instagramCategories].count)
        : 0
    }));
  }, [tiktokPosts, instagramPosts]);

  const hasData = chartData.some(d => d.TikTok > 0 || d.Instagram > 0);

  return (
    <Card className="p-6 bg-card border-border/50">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg">
          <Clock className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="font-bold text-foreground">Performance par durée vidéo</h3>
          <p className="text-sm text-muted-foreground">Nombre de vidéos par tranche de durée</p>
        </div>
      </div>

      {!hasData ? (
        <div className="h-64 flex items-center justify-center text-muted-foreground">
          Aucune donnée de durée vidéo disponible
        </div>
      ) : (
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
              <XAxis
                dataKey="duration"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                allowDecimals={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey="TikTok" fill="#FF0050" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Instagram" fill="#E4405F" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );
};