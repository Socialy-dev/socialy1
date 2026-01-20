import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts";
import { Activity } from "lucide-react";
import { format, subDays, parseISO, startOfDay } from "date-fns";
import { fr } from "date-fns/locale";

interface PostWithDate {
  posted_at: string | null;
  likes_count?: number | null;
  views_count?: number | null;
  comments_count?: number | null;
  shares_count?: number | null;
  total_reactions?: number | null;
  reposts_count?: number | null;
}

interface CrossPlatformTrendsChartProps {
  tiktokPosts: PostWithDate[];
  facebookPosts: PostWithDate[];
  linkedinPosts: PostWithDate[];
  instagramPosts: PostWithDate[];
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
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-muted-foreground">{entry.name}:</span>
          </div>
          <span className="font-semibold text-foreground">{entry.value} posts</span>
        </div>
      ))}
    </div>
  );
};

export const CrossPlatformTrendsChart = ({
  tiktokPosts,
  facebookPosts,
  linkedinPosts,
  instagramPosts
}: CrossPlatformTrendsChartProps) => {
  const chartData = useMemo(() => {
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = startOfDay(subDays(new Date(), 29 - i));
      return format(date, "yyyy-MM-dd");
    });

    const countByDate = (posts: PostWithDate[], date: string) => {
      return posts.filter(p => {
        if (!p.posted_at) return false;
        try {
          const postDate = format(startOfDay(parseISO(p.posted_at)), "yyyy-MM-dd");
          return postDate === date;
        } catch {
          return false;
        }
      }).length;
    };

    return last30Days.map(date => ({
      date: format(parseISO(date), "dd MMM", { locale: fr }),
      TikTok: countByDate(tiktokPosts, date),
      Facebook: countByDate(facebookPosts, date),
      LinkedIn: countByDate(linkedinPosts, date),
      Instagram: countByDate(instagramPosts, date)
    }));
  }, [tiktokPosts, facebookPosts, linkedinPosts, instagramPosts]);

  const hasData = chartData.some(d => d.TikTok > 0 || d.Facebook > 0 || d.LinkedIn > 0 || d.Instagram > 0);

  return (
    <Card className="p-6 bg-card border-border/50">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg">
          <Activity className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="font-bold text-foreground">Tendances de publication</h3>
          <p className="text-sm text-muted-foreground">Activité des 30 derniers jours</p>
        </div>
      </div>

      {!hasData ? (
        <div className="h-64 flex items-center justify-center text-muted-foreground">
          Pas assez de données pour afficher les tendances
        </div>
      ) : (
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
                interval="preserveStartEnd"
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                allowDecimals={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend iconType="circle" />
              <Line
                type="monotone"
                dataKey="TikTok"
                stroke={platformColors.TikTok}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="Facebook"
                stroke={platformColors.Facebook}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="LinkedIn"
                stroke={platformColors.LinkedIn}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="Instagram"
                stroke={platformColors.Instagram}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );
};