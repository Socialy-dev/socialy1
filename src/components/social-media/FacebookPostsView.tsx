import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import {
  Heart,
  MessageCircle,
  Share2,
  Eye,
  Play,
  Clock,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Users,
  Image as ImageIcon,
  Video,
  RefreshCw,
  Search,
  Facebook
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface FacebookPost {
  id: string;
  organization_id: string;
  post_id: string;
  post_url: string;
  page_url: string | null;
  caption: string | null;
  post_type: string | null;
  likes_count: number | null;
  shares_count: number | null;
  views_count: number | null;
  comments_count: number | null;
  image_url: string | null;
  video_url: string | null;
  page_name: string | null;
  page_id: string | null;
  page_profile_url: string | null;
  page_profile_pic: string | null;
  has_collaborators: boolean | null;
  posted_at: string | null;
  scraped_at: string | null;
  created_at: string;
}

export const FacebookPostsView = () => {
  const { effectiveOrgId, user } = useAuth();
  const [posts, setPosts] = useState<FacebookPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedPost, setExpandedPost] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchPosts = async () => {
      if (!effectiveOrgId) return;

      setLoading(true);
      const { data, error } = await supabase
        .from("organization_social_media_organique_facebook" as any)
        .select("*")
        .eq("organization_id", effectiveOrgId)
        .order("posted_at", { ascending: false });

      if (error) {
        console.error("Error fetching Facebook posts:", error);
      } else {
        setPosts((data || []) as unknown as FacebookPost[]);
      }
      setLoading(false);
    };

    fetchPosts();
  }, [effectiveOrgId]);

  const filteredPosts = posts.filter(post => {
    if (!searchQuery) return true;
    return post.caption?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.page_name?.toLowerCase().includes(searchQuery.toLowerCase());
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

  const calculateTotalStats = () => {
    const totalLikes = posts.reduce((sum, post) => sum + (post.likes_count || 0), 0);
    const totalViews = posts.reduce((sum, post) => sum + (post.views_count || 0), 0);
    const totalShares = posts.reduce((sum, post) => sum + (post.shares_count || 0), 0);
    const totalComments = posts.reduce((sum, post) => sum + (post.comments_count || 0), 0);
    const avgEngagement = totalViews > 0 
      ? (((totalLikes + totalComments + totalShares) / totalViews) * 100).toFixed(2)
      : "0.00";

    return { totalLikes, totalViews, totalShares, totalComments, avgEngagement };
  };

  const stats = calculateTotalStats();

  const getPostTypeIcon = (type: string | null) => {
    switch (type?.toLowerCase()) {
      case "video":
        return <Video className="w-3 h-3" />;
      case "photo":
        return <ImageIcon className="w-3 h-3" />;
      default:
        return <Facebook className="w-3 h-3" />;
    }
  };

  const getPostTypeLabel = (type: string | null) => {
    switch (type?.toLowerCase()) {
      case "video":
        return "Vidéo";
      case "photo":
        return "Photo";
      case "reel":
        return "Reel";
      default:
        return type || "Post";
    }
  };

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
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center mx-auto mb-4">
          <Facebook className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">Aucune publication Facebook</h3>
        <p className="text-sm text-muted-foreground max-w-sm mx-auto">
          Les publications Facebook de votre organisation apparaîtront ici une fois synchronisées
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-card border border-border/50 hover:border-blue-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
              <Eye className="w-5 h-5 text-white" />
            </div>
          </div>
          <p className="text-2xl font-bold text-foreground">{formatNumber(stats.totalViews)}</p>
          <p className="text-sm text-muted-foreground">Vues totales</p>
        </div>

        <div className="p-5 rounded-2xl bg-card border border-border/50 hover:border-blue-400/30 transition-all duration-300 hover:shadow-lg hover:shadow-blue-400/5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
              <Heart className="w-5 h-5 text-white" />
            </div>
          </div>
          <p className="text-2xl font-bold text-foreground">{formatNumber(stats.totalLikes)}</p>
          <p className="text-sm text-muted-foreground">Likes</p>
        </div>

        <div className="p-5 rounded-2xl bg-card border border-border/50 hover:border-cyan-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-white" />
            </div>
          </div>
          <p className="text-2xl font-bold text-foreground">{formatNumber(stats.totalComments)}</p>
          <p className="text-sm text-muted-foreground">Commentaires</p>
        </div>

        <div className="p-5 rounded-2xl bg-card border border-border/50 hover:border-indigo-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <Share2 className="w-5 h-5 text-white" />
            </div>
          </div>
          <p className="text-2xl font-bold text-foreground">{formatNumber(stats.totalShares)}</p>
          <p className="text-sm text-muted-foreground">Partages</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher une publication..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-card border-border"
          />
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => window.location.reload()}
          className="rounded-full"
        >
          <RefreshCw className="w-4 h-4" />
        </Button>
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-foreground">{filteredPosts.length} publications</h2>
        <div className="text-sm text-muted-foreground">
          Taux d'engagement moyen: <span className="font-semibold text-foreground">{stats.avgEngagement}%</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredPosts.map((post) => {
          const isExpanded = expandedPost === post.id;

          return (
            <div
              key={post.id}
              className={cn(
                "group relative rounded-3xl bg-card border border-border/50 overflow-hidden",
                "hover:border-blue-500/30 hover:shadow-xl hover:shadow-blue-500/5",
                "transition-all duration-300"
              )}
            >
              <div className="relative aspect-square bg-muted overflow-hidden">
                {post.image_url || post.video_url ? (
                  <img
                    src={post.image_url || post.video_url || ""}
                    alt="Post media"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500/20 to-indigo-500/20">
                    <Facebook className="w-12 h-12 text-muted-foreground/50" />
                  </div>
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                <div className="absolute top-3 left-3 flex items-center gap-2">
                  <div className="px-2 py-1 rounded-lg bg-blue-500/90 text-white text-xs font-medium flex items-center gap-1">
                    {getPostTypeIcon(post.post_type)}
                    {getPostTypeLabel(post.post_type)}
                  </div>
                  {post.has_collaborators && (
                    <div className="px-2 py-1 rounded-lg bg-purple-500/90 text-white text-xs font-medium flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      Collab
                    </div>
                  )}
                </div>

                <div className="absolute top-3 right-3">
                  <a
                    href={post.post_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-white/70 hover:text-white hover:bg-blue-500/80 transition-colors"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    {post.page_profile_pic ? (
                      <img
                        src={post.page_profile_pic}
                        alt={post.page_name || "Page"}
                        className="w-8 h-8 rounded-full object-cover border-2 border-white/30"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold">
                        {post.page_name?.charAt(0) || "F"}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">
                        {post.page_name || "Page Facebook"}
                      </p>
                      <p className="text-xs text-white/60">
                        {formatDate(post.posted_at)}
                      </p>
                    </div>
                  </div>

                  {post.caption && (
                    <p className="text-sm text-white/90 line-clamp-2">
                      {truncateText(post.caption, 100)}
                    </p>
                  )}
                </div>
              </div>

              <div className="p-4 space-y-3">
                <div className="grid grid-cols-4 gap-2">
                  <div className="text-center">
                    <p className="text-lg font-bold text-foreground">{formatNumber(post.views_count)}</p>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Vues</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-foreground">{formatNumber(post.likes_count)}</p>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Likes</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-foreground">{formatNumber(post.comments_count)}</p>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Comm.</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-foreground">{formatNumber(post.shares_count)}</p>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Partages</p>
                  </div>
                </div>

                <button
                  onClick={() => setExpandedPost(isExpanded ? null : post.id)}
                  className="w-full flex items-center justify-center gap-2 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {isExpanded ? (
                    <>
                      Moins de détails
                      <ChevronUp className="w-4 h-4" />
                    </>
                  ) : (
                    <>
                      Plus de détails
                      <ChevronDown className="w-4 h-4" />
                    </>
                  )}
                </button>

                {isExpanded && (
                  <div className="pt-3 border-t border-border/50 space-y-3 animate-in slide-in-from-top-2 duration-200">
                    {post.caption && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Description complète</p>
                        <p className="text-sm text-foreground">{post.caption}</p>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Page</p>
                        <p className="text-foreground">{post.page_name || "-"}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Type</p>
                        <p className="text-foreground">{getPostTypeLabel(post.post_type)}</p>
                      </div>
                    </div>

                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Taux d'engagement</p>
                      <p className="text-lg font-bold text-foreground">
                        {post.views_count && post.views_count > 0
                          ? (((post.likes_count || 0) + (post.comments_count || 0) + (post.shares_count || 0)) / post.views_count * 100).toFixed(2)
                          : "0.00"}%
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
