import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Award, Eye, Heart, MessageCircle, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

interface TopPost {
  id: string;
  platform: "tiktok" | "facebook" | "linkedin" | "instagram";
  url: string;
  caption: string | null;
  views: number;
  likes: number;
  comments: number;
  thumbnail?: string | null;
  author?: string | null;
}

interface CrossPlatformBestPerformingChartProps {
  tiktokPosts: any[];
  facebookPosts: any[];
  linkedinPosts: any[];
  instagramPosts: any[];
}

const platformStyles = {
  tiktok: {
    gradient: "from-pink-500 via-red-500 to-yellow-500",
    label: "TikTok",
    border: "border-pink-500/20"
  },
  facebook: {
    gradient: "from-blue-500 to-blue-700",
    label: "Facebook",
    border: "border-blue-500/20"
  },
  linkedin: {
    gradient: "from-[#0A66C2] to-[#004182]",
    label: "LinkedIn",
    border: "border-[#0A66C2]/20"
  },
  instagram: {
    gradient: "from-purple-600 via-pink-500 to-orange-400",
    label: "Instagram",
    border: "border-pink-500/20"
  }
};

export const CrossPlatformBestPerformingChart = ({
  tiktokPosts,
  facebookPosts,
  linkedinPosts,
  instagramPosts
}: CrossPlatformBestPerformingChartProps) => {
  const topPosts = useMemo(() => {
    const allPosts: TopPost[] = [];

    tiktokPosts.forEach(p => {
      allPosts.push({
        id: p.id,
        platform: "tiktok",
        url: p.tiktok_url,
        caption: p.caption,
        views: p.views_count || 0,
        likes: p.likes_count || 0,
        comments: p.comments_count || 0,
        thumbnail: p.video_cover_url,
        author: p.author_name || p.competitor_name
      });
    });

    facebookPosts.forEach(p => {
      allPosts.push({
        id: p.id,
        platform: "facebook",
        url: p.post_url,
        caption: p.caption,
        views: p.views_count || 0,
        likes: p.likes_count || 0,
        comments: p.comments_count || 0,
        thumbnail: p.image_url,
        author: p.page_name || p.competitor_name
      });
    });

    linkedinPosts.forEach(p => {
      allPosts.push({
        id: p.id,
        platform: "linkedin",
        url: p.post_url,
        caption: p.caption,
        views: p.total_reactions || 0,
        likes: p.total_reactions || 0,
        comments: p.comments_count || 0,
        thumbnail: p.media_thumbnail,
        author: p.author_name || p.competitor_name
      });
    });

    instagramPosts.forEach(p => {
      let thumbnail = null;
      if (p.images) {
        if (Array.isArray(p.images) && p.images.length > 0) {
          thumbnail = p.images[0];
        } else if (typeof p.images === "string") {
          try { thumbnail = JSON.parse(p.images)[0]; } catch { thumbnail = p.images; }
        }
      }
      allPosts.push({
        id: p.id,
        platform: "instagram",
        url: p.post_url,
        caption: p.caption,
        views: p.views_count || p.video_play_count || 0,
        likes: p.likes_count || 0,
        comments: p.comments_count || 0,
        thumbnail,
        author: p.company_name || p.competitor_name
      });
    });

    return allPosts
      .sort((a, b) => (b.views + b.likes + b.comments) - (a.views + a.likes + a.comments))
      .slice(0, 5);
  }, [tiktokPosts, facebookPosts, linkedinPosts, instagramPosts]);

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  if (topPosts.length === 0) {
    return (
      <Card className="p-6 bg-card border-border/50">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-500 to-amber-600 flex items-center justify-center shadow-lg">
            <Award className="w-5 h-5 text-white" />
          </div>
          <h3 className="font-bold text-foreground">Meilleures performances</h3>
        </div>
        <div className="h-48 flex items-center justify-center text-muted-foreground">
          Aucune donnée disponible
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 bg-card border-border/50">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-500 to-amber-600 flex items-center justify-center shadow-lg">
          <Award className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="font-bold text-foreground">Top 5 des publications</h3>
          <p className="text-sm text-muted-foreground">Meilleures performances cross-platform</p>
        </div>
      </div>

      <div className="space-y-3">
        {topPosts.map((post, index) => {
          const style = platformStyles[post.platform];
          return (
            <a
              key={post.id}
              href={post.url}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                "flex items-center gap-4 p-3 rounded-xl bg-muted/30 border transition-all duration-200",
                "hover:bg-muted/50 hover:shadow-md group",
                style.border
              )}
            >
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-yellow-400 to-amber-500 text-white font-bold text-sm">
                {index + 1}
              </div>

              {post.thumbnail && (
                <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                  <img src={post.thumbnail} alt="" className="w-full h-full object-cover" />
                </div>
              )}

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={cn(
                    "text-xs font-semibold px-2 py-0.5 rounded-full bg-gradient-to-r text-white",
                    style.gradient
                  )}>
                    {style.label}
                  </span>
                  {post.author && (
                    <span className="text-xs text-muted-foreground truncate">{post.author}</span>
                  )}
                </div>
                <p className="text-sm text-foreground line-clamp-1">
                  {post.caption || "Publication sans caption"}
                </p>
              </div>

              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Eye className="w-3.5 h-3.5" />
                  <span>{formatNumber(post.views)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Heart className="w-3.5 h-3.5" />
                  <span>{formatNumber(post.likes)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>{formatNumber(post.comments)}</span>
                </div>
                <ExternalLink className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity text-primary" />
              </div>
            </a>
          );
        })}
      </div>
    </Card>
  );
};