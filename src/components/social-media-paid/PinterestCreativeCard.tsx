import { useState, useEffect } from "react";
import { Heart, ExternalLink, Play, Trash2, User, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { ImageWithFallback } from "@/components/ui/image-with-fallback";
import type { PinterestCreative } from "@/hooks/usePinterestCreatives";

interface PinterestCreativeCardProps {
  creative: PinterestCreative;
  onDelete?: (id: string) => void;
}

export const PinterestCreativeCard = ({ creative, onDelete }: PinterestCreativeCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [signedUrl, setSignedUrl] = useState<string | null>(null);

  useEffect(() => {
    const getSignedUrl = async () => {
      if (creative.storage_path) {
        const { data } = await supabase.storage
          .from("pinterest_creatives")
          .createSignedUrl(creative.storage_path, 3600);
        if (data?.signedUrl) {
          setSignedUrl(data.signedUrl);
        }
      }
    };
    getSignedUrl();
  }, [creative.storage_path]);

  const imageUrl = signedUrl || creative.thumbnail_url || creative.download_url;
  const isVideo = creative.type === "video";

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <Card
      className="group relative overflow-hidden bg-card/50 border-border/50 backdrop-blur-sm transition-all duration-300 hover:shadow-xl hover:shadow-primary/10 hover:border-primary/30 hover:-translate-y-1"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div 
        className="relative aspect-[3/4] overflow-hidden bg-muted/30"
        style={creative.dominant_color ? { backgroundColor: creative.dominant_color } : undefined}
      >
        <ImageWithFallback
          src={imageUrl}
          alt={creative.alt_text || creative.title || "Pinterest creative"}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          isVideo={isVideo}
          dominantColor={creative.dominant_color}
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
            variant="secondary"
            className="text-xs font-medium backdrop-blur-sm bg-background/80 capitalize"
          >
            {creative.type}
          </Badge>
          {creative.is_promoted && (
            <Badge className="text-xs bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0">
              <Sparkles className="w-3 h-3 mr-1" />
              Sponsorisé
            </Badge>
          )}
        </div>

        <div
          className={cn(
            "absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent transition-opacity duration-300",
            isHovered ? "opacity-100" : "opacity-0"
          )}
        />

        <div
          className={cn(
            "absolute bottom-3 left-3 right-3 flex gap-2 transition-all duration-300",
            isHovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
          )}
        >
          <Button
            size="sm"
            variant="secondary"
            className="flex-1 backdrop-blur-sm bg-background/80 hover:bg-background"
            onClick={() => window.open(creative.pinterest_link, "_blank")}
          >
            <ExternalLink className="w-4 h-4 mr-1" />
            Voir sur Pinterest
          </Button>
          {onDelete && (
            <Button
              size="sm"
              variant="destructive"
              className="backdrop-blur-sm"
              onClick={() => onDelete(creative.id)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      <div className="p-4 space-y-3">
        {creative.title && (
          <h3 className="font-semibold text-sm text-foreground line-clamp-2 leading-tight">
            {creative.title}
          </h3>
        )}

        {creative.description && (
          <p className="text-xs text-muted-foreground line-clamp-2">
            {creative.description}
          </p>
        )}

        <div className="flex items-center justify-between pt-2 border-t border-border/50">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 text-muted-foreground">
              <Heart className="w-4 h-4 text-rose-500" />
              <span className="text-xs font-medium">{formatNumber(creative.likes)}</span>
            </div>
          </div>

          {creative.creator_name && (
            <a
              href={creative.creator_url || "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors max-w-[120px]"
            >
              <User className="w-3 h-3 flex-shrink-0" />
              <span className="truncate">{creative.creator_name}</span>
            </a>
          )}
        </div>
      </div>
    </Card>
  );
};
