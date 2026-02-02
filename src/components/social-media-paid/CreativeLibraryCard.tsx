import { Eye, MousePointer, Zap, ExternalLink, Play } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ImageWithFallback } from "@/components/ui/image-with-fallback";

interface Creative {
  id: string;
  creative_id: string;
  creative_name: string | null;
  status: string | null;
  format: string | null;
  media_url: string | null;
  thumbnail_url: string | null;
  platform: string;
  impressions: number;
  clicks: number;
  spend: number;
  ctr: number;
}

interface CreativeLibraryCardProps {
  creative: Creative;
}

export const CreativeLibraryCard = ({ creative }: CreativeLibraryCardProps) => {
  const isVideo = creative.format?.toLowerCase().includes("video");

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toFixed(0);
  };

  const getStatusColor = (status: string | null) => {
    const s = status?.toLowerCase();
    if (s === "active" || s === "enabled") return "bg-success/10 text-success border-success/20";
    if (s === "paused") return "bg-warning/10 text-warning border-warning/20";
    return "bg-muted text-muted-foreground border-border";
  };

  const getStatusLabel = (status: string | null) => {
    const s = status?.toLowerCase();
    if (s === "active" || s === "enabled") return "Active";
    if (s === "paused") return "En pause";
    return status || "Inconnu";
  };

  const imageUrl = creative.thumbnail_url || creative.media_url;

  return (
    <Card className="group relative overflow-hidden bg-card/50 border-border/50 backdrop-blur-sm transition-all duration-300 hover:shadow-xl hover:shadow-primary/10 hover:border-primary/30 hover:-translate-y-1">
      <div className="relative aspect-square overflow-hidden bg-muted/30">
        <ImageWithFallback
          src={imageUrl}
          alt={creative.creative_name || "Creative"}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          isVideo={isVideo}
        />
        {isVideo && imageUrl && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-14 h-14 rounded-full bg-background/90 backdrop-blur-sm flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <Play className="w-6 h-6 text-primary ml-1" />
            </div>
          </div>
        )}
        
        <div className="absolute top-3 left-3 right-3 flex justify-between items-start">
          <Badge
            variant="outline"
            className={cn(
              "text-xs font-medium backdrop-blur-sm",
              getStatusColor(creative.status)
            )}
          >
            {getStatusLabel(creative.status)}
          </Badge>
          {creative.format && (
            <Badge variant="secondary" className="text-xs backdrop-blur-sm bg-background/80">
              {creative.format}
            </Badge>
          )}
        </div>

        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      <div className="p-4 space-y-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-sm text-foreground line-clamp-2 leading-tight">
            {creative.creative_name || `Créa ${creative.creative_id.slice(0, 8)}...`}
          </h3>
          <ExternalLink className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="text-center p-2 rounded-lg bg-muted/30 group-hover:bg-muted/50 transition-colors">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Eye className="w-3 h-3 text-muted-foreground" />
            </div>
            <p className="text-xs font-bold text-foreground">{formatNumber(creative.impressions)}</p>
            <p className="text-[10px] text-muted-foreground">Impr.</p>
          </div>
          <div className="text-center p-2 rounded-lg bg-muted/30 group-hover:bg-muted/50 transition-colors">
            <div className="flex items-center justify-center gap-1 mb-1">
              <MousePointer className="w-3 h-3 text-muted-foreground" />
            </div>
            <p className="text-xs font-bold text-foreground">{formatNumber(creative.clicks)}</p>
            <p className="text-[10px] text-muted-foreground">Clics</p>
          </div>
          <div className="text-center p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Zap className="w-3 h-3 text-primary" />
            </div>
            <p className="text-xs font-bold text-primary">{creative.ctr.toFixed(2)}%</p>
            <p className="text-[10px] text-primary/70">CTR</p>
          </div>
        </div>
      </div>
    </Card>
  );
};
