import { useState } from "react";
import { ExternalLink, Trash2, MoreVertical, Play, Image as ImageIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import type { CreativeInspiration } from "@/hooks/useCreativeLibraryInspirations";

interface InspirationCardProps {
  inspiration: CreativeInspiration;
  onDelete?: (id: string) => void;
}

const platformColors: Record<string, string> = {
  meta: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  google: "bg-green-500/10 text-green-500 border-green-500/20",
  linkedin: "bg-sky-500/10 text-sky-500 border-sky-500/20",
  tiktok: "bg-pink-500/10 text-pink-500 border-pink-500/20",
  pinterest: "bg-red-500/10 text-red-500 border-red-500/20",
};

const platformLabels: Record<string, string> = {
  meta: "Meta Ads",
  google: "Google Ads",
  linkedin: "LinkedIn Ads",
  tiktok: "TikTok Ads",
  pinterest: "Pinterest Ads",
};

export function InspirationCard({ inspiration, onDelete }: InspirationCardProps) {
  const [imageError, setImageError] = useState(false);
  const hasMedia = inspiration.image_url || inspiration.video_url;
  const isVideo = !!inspiration.video_url;

  return (
    <Card className="bg-card/50 border-border/50 overflow-hidden hover:bg-card/80 transition-all duration-200 group">
      <div className="relative aspect-[4/5] bg-secondary/30 overflow-hidden">
        {hasMedia && !imageError ? (
          <>
            <img
              src={inspiration.image_url || inspiration.video_url || ""}
              alt={inspiration.title || "Inspiration créative"}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              onError={() => setImageError(true)}
            />
            {isVideo && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center">
                  <Play className="w-6 h-6 text-foreground fill-current ml-1" />
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ImageIcon className="w-12 h-12 text-muted-foreground/30" />
          </div>
        )}

        <div className="absolute top-3 left-3 right-3 flex items-start justify-between">
          <Badge 
            variant="outline" 
            className={`${platformColors[inspiration.platform] || "bg-secondary text-foreground"} backdrop-blur-sm`}
          >
            {platformLabels[inspiration.platform] || inspiration.platform}
          </Badge>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 bg-background/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-popover border-border">
              {inspiration.source_url && (
                <DropdownMenuItem asChild>
                  <a
                    href={inspiration.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Voir la source
                  </a>
                </DropdownMenuItem>
              )}
              {onDelete && (
                <DropdownMenuItem
                  onClick={() => onDelete(inspiration.id)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Supprimer
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {inspiration.format && (
          <Badge
            variant="secondary"
            className="absolute bottom-3 left-3 bg-background/80 backdrop-blur-sm text-xs"
          >
            {inspiration.format}
          </Badge>
        )}
      </div>

      <div className="p-4 space-y-2">
        {inspiration.title && (
          <h3 className="font-semibold text-foreground line-clamp-1">{inspiration.title}</h3>
        )}
        {inspiration.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">{inspiration.description}</p>
        )}
        {inspiration.tags && inspiration.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 pt-1">
            {inspiration.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 bg-secondary/50 text-muted-foreground text-xs rounded-full"
              >
                {tag}
              </span>
            ))}
            {inspiration.tags.length > 3 && (
              <span className="px-2 py-0.5 text-muted-foreground text-xs">
                +{inspiration.tags.length - 3}
              </span>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}
