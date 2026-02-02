import { cn } from "@/lib/utils";
import {
  TrendingUp,
  TrendingDown,
  Heart,
  MessageCircle,
  Share2,
  Eye,
  ExternalLink,
  MoreVertical
} from "lucide-react";

interface CompetitorCardProps {
  competitor: {
    id: string;
    name: string;
    logo?: string;
    type: "personal" | "company";
    website?: string;
    stats: {
      followers: number;
      engagement: number;
      posts: number;
      trend: number;
    };
    platforms: string[];
  };
}

const formatNumber = (num: number) => {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
};

export const CompetitorCard = ({ competitor }: CompetitorCardProps) => {
  const isPositiveTrend = competitor.stats.trend >= 0;

  return (
    <div className="group relative overflow-hidden rounded-2xl bg-card border border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-xl hover:shadow-primary/5">
      <div className={cn(
        "h-24 bg-gradient-to-br relative overflow-hidden",
        competitor.type === "personal"
          ? "from-emerald-400 via-teal-500 to-cyan-600"
          : "from-slate-700 via-slate-800 to-slate-900"
      )}>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAgTSAwIDIwIEwgNDAgMjAgTSAyMCAwIEwgMjAgNDAgTSAwIDMwIEwgNDAgMzAgTSAzMCAwIEwgMzAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjA1KSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-50" />
        
        <div className="absolute top-3 right-3">
          <span className={cn(
            "px-2.5 py-1 rounded-full text-xs font-medium",
            competitor.type === "personal"
              ? "bg-emerald-500/80 text-white"
              : "bg-slate-600/80 text-white"
          )}>
            {competitor.type === "personal" ? "personal" : "company"}
          </span>
        </div>

        <div className="absolute bottom-3 left-4 right-4">
          <h3 className="text-lg font-bold text-white truncate drop-shadow-lg">
            {competitor.name}
          </h3>
        </div>
      </div>

      <div className="p-4">
        {competitor.website && (
          <div className="flex items-center gap-2 mb-4">
            <div className="w-4 h-4 rounded bg-muted flex items-center justify-center">
              <span className="text-[10px]">🌐</span>
            </div>
            <a 
              href={competitor.website.startsWith("http") ? competitor.website : `https://${competitor.website}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-muted-foreground hover:text-primary truncate max-w-[180px] transition-colors"
            >
              {competitor.website}
            </a>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="p-2.5 rounded-xl bg-secondary/30">
            <p className="text-xs text-muted-foreground mb-0.5">Followers</p>
            <p className="text-sm font-bold text-foreground">{formatNumber(competitor.stats.followers)}</p>
          </div>
          <div className="p-2.5 rounded-xl bg-secondary/30">
            <p className="text-xs text-muted-foreground mb-0.5">Engagement</p>
            <div className="flex items-center gap-1">
              <p className="text-sm font-bold text-foreground">{competitor.stats.engagement}%</p>
              {isPositiveTrend ? (
                <TrendingUp className="w-3 h-3 text-success" />
              ) : (
                <TrendingDown className="w-3 h-3 text-danger" />
              )}
            </div>
          </div>
        </div>

        <button className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-secondary/50 hover:bg-primary/10 text-sm font-medium text-muted-foreground hover:text-primary transition-all duration-200">
          <ExternalLink className="w-3.5 h-3.5" />
          Voir les analyses
        </button>
      </div>
    </div>
  );
};
