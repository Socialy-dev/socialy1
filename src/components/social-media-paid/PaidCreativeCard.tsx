import { useState } from "react";
import { Eye, MousePointer, Wallet, ExternalLink, Copy, Archive, MoreVertical, Play, Image as ImageIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface PaidCreative {
  id: string;
  creative_name: string | null;
  format: string | null;
  status: string | null;
  thumbnail_url: string | null;
  media_url: string | null;
  impressions: number | null;
  clicks: number | null;
  spend: number | null;
  ctr: number | null;
  destination_url: string | null;
  platform: string;
}

interface PaidCreativeCardProps {
  creative: PaidCreative;
}

export const PaidCreativeCard = ({ creative }: PaidCreativeCardProps) => {
  const [imageError, setImageError] = useState(false);

  const formatNumber = (num: number | null) => {
    if (num === null) return "0";
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case "active":
        return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
      case "paused":
        return "bg-amber-500/20 text-amber-400 border-amber-500/30";
      case "archived":
      case "deleted":
        return "bg-muted text-muted-foreground border-border";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  const getStatusLabel = (status: string | null) => {
    switch (status) {
      case "active":
        return "Actif";
      case "paused":
        return "En pause";
      case "archived":
        return "Archivé";
      case "deleted":
        return "Supprimé";
      default:
        return status || "Inconnu";
    }
  };

  const getFormatIcon = () => {
    if (creative.format === "video") {
      return <Play className="w-8 h-8 text-white" />;
    }
    return <ImageIcon className="w-8 h-8 text-white/50" />;
  };

  const handleDuplicate = () => {
    toast.info("Fonctionnalité de duplication à implémenter");
  };

  const handleArchive = () => {
    toast.info("Fonctionnalité d'archivage à implémenter");
  };

  return (
    <Card className="bg-card/50 border-border/50 overflow-hidden hover:bg-card/80 transition-all duration-200 group">
      <div className="relative aspect-square bg-secondary/30 overflow-hidden">
        {creative.thumbnail_url && !imageError ? (
          <img
            src={creative.thumbnail_url}
            alt={creative.creative_name || "Création publicitaire"}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            {getFormatIcon()}
          </div>
        )}

        <div className="absolute top-2 left-2">
          <Badge className={cn("text-xs", getStatusColor(creative.status))}>
            {getStatusLabel(creative.status)}
          </Badge>
        </div>

        {creative.format && (
          <div className="absolute top-2 right-2">
            <Badge variant="outline" className="text-xs bg-background/80 backdrop-blur-sm">
              {creative.format === "video" ? "Vidéo" : creative.format === "carousel" ? "Carrousel" : "Image"}
            </Badge>
          </div>
        )}
      </div>

      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <h4 className="text-sm font-medium text-foreground line-clamp-2">
            {creative.creative_name || "Sans nom"}
          </h4>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {creative.destination_url && (
                <DropdownMenuItem
                  onClick={() => window.open(creative.destination_url!, "_blank")}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Voir sur la plateforme
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={handleDuplicate}>
                <Copy className="w-4 h-4 mr-2" />
                Dupliquer
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleArchive}>
                <Archive className="w-4 h-4 mr-2" />
                Archiver
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Eye className="w-3.5 h-3.5" />
            <span>{formatNumber(creative.impressions)}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <MousePointer className="w-3.5 h-3.5" />
            <span>{formatNumber(creative.clicks)}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Wallet className="w-3.5 h-3.5" />
            <span>{creative.spend?.toFixed(0) || 0}€</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="font-medium">CTR</span>
            <span>{(creative.ctr || 0).toFixed(2)}%</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
