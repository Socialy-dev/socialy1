import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import {
  Linkedin,
  Clock,
  ThumbsUp,
  MessageCircle,
  Share2,
  Eye,
  ExternalLink,
  Check,
  Image as ImageIcon,
  Play,
  FileText,
  Loader2
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface MediaItem {
  type: string;
  url?: string;
  thumbnail?: string;
}

interface OrganizationLinkedInPost {
  id: string;
  post_url: string;
  text: string | null;
  posted_at_date: string | null;
  author_name: string | null;
  author_headline: string | null;
  author_profile_url: string | null;
  author_avatar_url: string | null;
  likes_count: number;
  comments_count: number;
  reposts_count: number;
  impressions: number;
  engagement_rate: number;
  media_items: MediaItem[] | null;
}

interface OrganizationLinkedInPostsProps {
  organizationId: string | null;
  selectedPost: OrganizationLinkedInPost | null;
  onSelectPost: (post: OrganizationLinkedInPost) => void;
}

export const OrganizationLinkedInPosts = ({
  organizationId,
  selectedPost,
  onSelectPost
}: OrganizationLinkedInPostsProps) => {
  const [posts, setPosts] = useState<OrganizationLinkedInPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (organizationId) {
      fetchPosts();
    }
  }, [organizationId]);

  const fetchPosts = async () => {
    if (!organizationId) return;
    
    setLoading(true);
    const { data, error } = await supabase
      .from("organization_linkedin_posts")
      .select("*")
      .eq("organization_id", organizationId)
      .order("posted_at_date", { ascending: false });

    if (error) {
      console.error("Error fetching organization posts:", error);
    } else {
      const typedData = (data || []).map(post => ({
        ...post,
        media_items: (post.media_items as unknown) as MediaItem[] | null
      }));
      setPosts(typedData);
    }
    setLoading(false);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Date inconnue";
    try {
      return format(new Date(dateString), "d MMM yyyy", { locale: fr });
    } catch {
      return "Date inconnue";
    }
  };

  const truncateText = (text: string | null, maxLength: number = 180) => {
    if (!text) return "Aucun contenu";
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  const getMediaPreview = (mediaItems: MediaItem[] | null) => {
    if (!mediaItems || mediaItems.length === 0) return null;
    const first = mediaItems[0];
    return first;
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "k";
    return num.toString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-16 bg-secondary/20 rounded-3xl border border-border/50">
        <Linkedin className="w-16 h-16 text-muted-foreground/20 mx-auto mb-4" />
        <p className="text-lg font-medium text-foreground">Aucun post LinkedIn</p>
        <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">
          Les posts de votre organisation apparaîtront ici une fois synchronisés
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {posts.map((post) => {
        const media = getMediaPreview(post.media_items);
        const isSelected = selectedPost?.id === post.id;

        return (
          <button
            key={post.id}
            onClick={() => onSelectPost(post)}
            className={cn(
              "group relative w-full text-left rounded-3xl border-2 transition-all duration-300 overflow-hidden",
              isSelected
                ? "border-primary bg-primary/5 shadow-lg ring-4 ring-primary/10"
                : "border-border bg-card hover:border-primary/40 hover:shadow-md hover:bg-card/80"
            )}
          >
            {media && media.url && (
              <div className="relative h-48 w-full overflow-hidden bg-secondary/30">
                {media.type === "video" ? (
                  <div className="relative w-full h-full">
                    <img
                      src={media.thumbnail || media.url}
                      alt="Video thumbnail"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                      <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
                        <Play className="w-6 h-6 text-foreground ml-1" />
                      </div>
                    </div>
                  </div>
                ) : (
                  <img
                    src={media.url}
                    alt="Post media"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                )}
                {post.media_items && post.media_items.length > 1 && (
                  <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-sm text-white text-xs font-medium">
                    +{post.media_items.length - 1}
                  </div>
                )}
              </div>
            )}

            {!media && (
              <div className="h-24 w-full bg-gradient-to-br from-secondary/40 to-secondary/20 flex items-center justify-center">
                <FileText className="w-10 h-10 text-muted-foreground/30" />
              </div>
            )}

            <div className="p-5 space-y-4">
              {post.author_name && (
                <div className="flex items-center gap-3">
                  {post.author_avatar_url ? (
                    <img
                      src={post.author_avatar_url}
                      alt={post.author_name}
                      className="w-10 h-10 rounded-full object-cover ring-2 ring-border"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Linkedin className="w-5 h-5 text-primary" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">
                      {post.author_name}
                    </p>
                    {post.author_headline && (
                      <p className="text-xs text-muted-foreground truncate">
                        {post.author_headline}
                      </p>
                    )}
                  </div>
                </div>
              )}

              <p className="text-sm text-foreground/90 leading-relaxed line-clamp-3">
                {truncateText(post.text)}
              </p>

              <div className="flex items-center gap-1 flex-wrap">
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary/50 text-xs font-medium text-muted-foreground">
                  <ThumbsUp className="w-3.5 h-3.5" />
                  {formatNumber(post.likes_count)}
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary/50 text-xs font-medium text-muted-foreground">
                  <MessageCircle className="w-3.5 h-3.5" />
                  {formatNumber(post.comments_count)}
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary/50 text-xs font-medium text-muted-foreground">
                  <Share2 className="w-3.5 h-3.5" />
                  {formatNumber(post.reposts_count)}
                </div>
                {post.impressions > 0 && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary/50 text-xs font-medium text-muted-foreground">
                    <Eye className="w-3.5 h-3.5" />
                    {formatNumber(post.impressions)}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-border/50">
                <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Clock className="w-3.5 h-3.5" />
                  {formatDate(post.posted_at_date)}
                </span>
                <a
                  href={post.post_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="flex items-center gap-1.5 text-xs text-primary hover:underline font-medium"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Voir le post
                </a>
              </div>
            </div>

            <div className={cn(
              "absolute top-4 left-4 w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all z-10",
              isSelected
                ? "border-primary bg-primary shadow-md"
                : "border-white/80 bg-white/60 backdrop-blur-sm group-hover:border-primary/50"
            )}>
              {isSelected && <Check className="w-4 h-4 text-primary-foreground" />}
            </div>
          </button>
        );
      })}
    </div>
  );
};
