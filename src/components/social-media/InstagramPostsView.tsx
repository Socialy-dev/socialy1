import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import {
  Heart,
  MessageCircle,
  Eye,
  Bookmark,
  Play,
  Clock,
  Hash,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Users,
  Image as ImageIcon,
  Film,
  Grid3X3,
  Search,
  RefreshCw,
  AtSign
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface InstagramPost {
  id: string;
  organization_id: string;
  post_id: string | null;
  post_url: string;
  caption: string | null;
  hashtags: string[] | null;
  mentions: string[] | null;
  likes_count: number | null;
  comments_count: number | null;
  views_count: number | null;
  video_url: string | null;
  video_duration: string | null;
  video_play_count: number | null;
  is_video: boolean | null;
  images: string[] | null;
  content_type: string | null;
  profile_picture_url: string | null;
  logo_url: string | null;
  company_name: string | null;
  followers_count: number | null;
  following_count: number | null;
  posts_count: number | null;
  posted_at: string | null;
  created_at: string;
  updated_at: string;
}

export const InstagramPostsView = () => {
  const { effectiveOrgId } = useAuth();
  const [posts, setPosts] = useState<InstagramPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedPost, setExpandedPost] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [contentFilter, setContentFilter] = useState<"all" | "video" | "image" | "carousel">("all");

  useEffect(() => {
    const fetchPosts = async () => {
      if (!effectiveOrgId) return;

      setLoading(true);
      const { data, error } = await supabase
        .from("organization_social_media_organique_instagram")
        .select("*")
        .eq("organization_id", effectiveOrgId)
        .order("posted_at", { ascending: false });

      if (error) {
        console.error("Error fetching Instagram posts:", error);
      } else {
        setPosts(data || []);
      }
      setLoading(false);
    };

    fetchPosts();
  }, [effectiveOrgId]);

  const filteredPosts = posts.filter(post => {
    const matchesSearch = !searchQuery || 
      post.caption?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.company_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.hashtags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    if (contentFilter === "video") {
      return matchesSearch && (post.is_video || post.content_type === 'video' || post.content_type === 'Reel');
    }
    if (contentFilter === "image") {
      return matchesSearch && !post.is_video && post.content_type !== 'Sidecar';
    }
    if (contentFilter === "carousel") {
      return matchesSearch && post.content_type === 'Sidecar';
    }
    return matchesSearch;
  });

  const formatNumber = (num: number | null) => {
    if (num === null || num === undefined) return "0";
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR", { 
      day: "numeric", 
      month: "short",
      year: "numeric"
    });
  };

  const truncateText = (text: string | null, maxLength: number) => {
    if (!text) return "";
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + "...";
  };

  const getPostImage = (post: InstagramPost): string | null => {
    if (post.images && Array.isArray(post.images) && post.images.length > 0) {
      return post.images[0];
    }
    return null;
  };

  const getContentTypeIcon = (post: InstagramPost) => {
    if (post.content_type === 'Sidecar') return Grid3X3;
    if (post.is_video || post.content_type === 'video' || post.content_type === 'Reel') return Film;
    return ImageIcon;
  };

  const getContentTypeLabel = (post: InstagramPost) => {
    if (post.content_type === 'Sidecar') return "Carrousel";
    if (post.content_type === 'Reel') return "Reel";
    if (post.is_video || post.content_type === 'video') return "Vidéo";
    return "Image";
  };

  const calculateTotalStats = () => {
    const totalLikes = posts.reduce((sum, post) => sum + (post.likes_count || 0), 0);
    const totalViews = posts.reduce((sum, post) => sum + (post.views_count || post.video_play_count || 0), 0);
    const totalComments = posts.reduce((sum, post) => sum + (post.comments_count || 0), 0);
    const avgEngagement = totalViews > 0 
      ? (((totalLikes + totalComments) / totalViews) * 100).toFixed(2)
      : "0.00";

    return { totalLikes, totalViews, totalComments, avgEngagement };
  };

  const stats = calculateTotalStats();

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-2xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-80 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-16 rounded-3xl bg-card border border-dashed border-border">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 flex items-center justify-center mx-auto mb-4">
          <ImageIcon className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">Aucun post Instagram</h3>
        <p className="text-sm text-muted-foreground max-w-sm mx-auto">
          Les posts Instagram de votre organisation apparaîtront ici une fois synchronisés
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-card border border-border/50 hover:border-pink-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-pink-500/5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 flex items-center justify-center">
              <Eye className="w-5 h-5 text-white" />
            </div>
          </div>
          <p className="text-2xl font-bold text-foreground">{formatNumber(stats.totalViews)}</p>
          <p className="text-sm text-muted-foreground">Vues totales</p>
        </div>

        <div className="p-5 rounded-2xl bg-card border border-border/50 hover:border-red-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-red-500/5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-pink-600 flex items-center justify-center">
              <Heart className="w-5 h-5 text-white" />
            </div>
          </div>
          <p className="text-2xl font-bold text-foreground">{formatNumber(stats.totalLikes)}</p>
          <p className="text-sm text-muted-foreground">Likes</p>
        </div>

        <div className="p-5 rounded-2xl bg-card border border-border/50 hover:border-blue-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-white" />
            </div>
          </div>
          <p className="text-2xl font-bold text-foreground">{formatNumber(stats.totalComments)}</p>
          <p className="text-sm text-muted-foreground">Commentaires</p>
        </div>

        <div className="p-5 rounded-2xl bg-card border border-border/50 hover:border-green-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-green-500/5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
              <Users className="w-5 h-5 text-white" />
            </div>
          </div>
          <p className="text-2xl font-bold text-foreground">{stats.avgEngagement}%</p>
          <p className="text-sm text-muted-foreground">Engagement</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher un post..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-card border-border"
          />
        </div>
        
        <div className="flex gap-2 flex-wrap">
          <Button
            variant={contentFilter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setContentFilter("all")}
            className="rounded-full"
          >
            Tous ({posts.length})
          </Button>
          <Button
            variant={contentFilter === "video" ? "default" : "outline"}
            size="sm"
            onClick={() => setContentFilter("video")}
            className={cn(
              "rounded-full gap-1",
              contentFilter === "video" && "bg-purple-500 hover:bg-purple-600"
            )}
          >
            <Film className="w-3 h-3" />
            Vidéos
          </Button>
          <Button
            variant={contentFilter === "carousel" ? "default" : "outline"}
            size="sm"
            onClick={() => setContentFilter("carousel")}
            className={cn(
              "rounded-full gap-1",
              contentFilter === "carousel" && "bg-pink-500 hover:bg-pink-600"
            )}
          >
            <Grid3X3 className="w-3 h-3" />
            Carrousels
          </Button>
          <Button
            variant={contentFilter === "image" ? "default" : "outline"}
            size="sm"
            onClick={() => setContentFilter("image")}
            className={cn(
              "rounded-full gap-1",
              contentFilter === "image" && "bg-orange-500 hover:bg-orange-600"
            )}
          >
            <ImageIcon className="w-3 h-3" />
            Images
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-foreground">{filteredPosts.length} publications</h2>
        <div className="text-sm text-muted-foreground">
          Taux d'engagement moyen: <span className="font-semibold text-foreground">{stats.avgEngagement}%</span>
        </div>
      </div>

      {filteredPosts.length === 0 ? (
        <div className="text-center py-16 bg-secondary/20 rounded-2xl">
          <ImageIcon className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-muted-foreground font-medium">Aucun post trouvé</p>
          <p className="text-sm text-muted-foreground/70 mt-1">
            Les posts apparaîtront ici une fois synchronisés
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredPosts.map((post) => {
            const isExpanded = expandedPost === post.id;
            const ContentIcon = getContentTypeIcon(post);
            const postImage = getPostImage(post);

            return (
              <div
                key={post.id}
                className={cn(
                  "group relative rounded-3xl bg-card border border-border/50 overflow-hidden",
                  "hover:border-pink-500/30 hover:shadow-xl hover:shadow-pink-500/5",
                  "transition-all duration-300"
                )}
              >
                <div className="relative aspect-square bg-muted overflow-hidden">
                  {postImage ? (
                    <img
                      src={postImage}
                      alt="Instagram post"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-500/20 via-pink-500/20 to-orange-500/20">
                      <ImageIcon className="w-12 h-12 text-muted-foreground/50" />
                    </div>
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    <div className="px-2 py-1 rounded-lg bg-white/20 backdrop-blur-sm text-white text-xs font-medium flex items-center gap-1">
                      <ContentIcon className="w-3 h-3" />
                      {getContentTypeLabel(post)}
                    </div>
                  </div>

                  {(post.is_video || post.content_type === 'video' || post.content_type === 'Reel') && (
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center">
                        <Play className="w-8 h-8 text-white ml-1" />
                      </div>
                    </div>
                  )}

                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <div className="flex items-center gap-2 mb-2">
                      {post.profile_picture_url || post.logo_url ? (
                        <img
                          src={post.profile_picture_url || post.logo_url || ""}
                          alt={post.company_name || ""}
                          className="w-8 h-8 rounded-full border-2 border-white/30"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white text-xs font-bold">
                          {(post.company_name || "IG")[0]}
                        </div>
                      )}
                      <span className="text-white text-sm font-semibold truncate">
                        {post.company_name || "Instagram"}
                      </span>
                    </div>
                    <p className="text-white/90 text-sm line-clamp-2 mb-2">
                      {truncateText(post.caption, 80)}
                    </p>
                    <div className="flex items-center gap-3 text-white/80 text-xs">
                      <span className="flex items-center gap-1">
                        <Heart className="w-3 h-3" />
                        {formatNumber(post.likes_count)}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageCircle className="w-3 h-3" />
                        {formatNumber(post.comments_count)}
                      </span>
                      {(post.views_count || post.video_play_count) ? (
                        <span className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          {formatNumber(post.views_count || post.video_play_count)}
                        </span>
                      ) : null}
                    </div>
                  </div>
                </div>

                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs text-muted-foreground">
                      {formatDate(post.posted_at)}
                    </span>
                    <a
                      href={post.post_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-xs text-primary hover:underline"
                    >
                      Voir sur Instagram
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>

                  <button
                    onClick={() => setExpandedPost(isExpanded ? null : post.id)}
                    className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors w-full justify-center py-2 rounded-xl bg-secondary/50 hover:bg-secondary"
                  >
                    {isExpanded ? "Moins de détails" : "Plus de détails"}
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </button>

                  {isExpanded && (
                    <div className="mt-4 pt-4 border-t border-border space-y-3 animate-in slide-in-from-top-2 duration-200">
                      {post.hashtags && post.hashtags.length > 0 && (
                        <div>
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2">
                            <Hash className="w-3.5 h-3.5" />
                            Hashtags
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {(Array.isArray(post.hashtags) ? post.hashtags : []).slice(0, 6).map((tag, i) => (
                              <Badge
                                key={i}
                                variant="secondary"
                                className="text-xs bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-500/20"
                              >
                                #{typeof tag === 'string' ? tag.replace(/^#/, '') : tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {post.mentions && post.mentions.length > 0 && (
                        <div>
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2">
                            <AtSign className="w-3.5 h-3.5" />
                            Mentions
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {(Array.isArray(post.mentions) ? post.mentions : []).slice(0, 6).map((mention, i) => (
                              <Badge
                                key={i}
                                variant="secondary"
                                className="text-xs bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border-blue-500/20"
                              >
                                @{typeof mention === 'string' ? mention.replace(/^@/, '') : mention}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {post.followers_count && (
                        <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary/30">
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                            <Users className="w-4 h-4 text-white" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-foreground">
                              {formatNumber(post.followers_count)} abonnés
                            </p>
                            <p className="text-xs text-muted-foreground">au moment du post</p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
