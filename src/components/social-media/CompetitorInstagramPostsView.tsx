import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import {
  Heart,
  MessageCircle,
  Eye,
  Search,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Building2,
  Image,
  Video,
  Hash
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";

const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
  </svg>
);

interface CompetitorInstagramPost {
  id: string;
  organization_id: string;
  competitor_id: string;
  competitor_name: string | null;
  post_id: string | null;
  post_url: string;
  caption: string | null;
  hashtags: string[] | null;
  likes_count: number | null;
  comments_count: number | null;
  views_count: number | null;
  video_play_count: number | null;
  followers_count: number | null;
  content_type: string | null;
  images: string[] | null;
  profile_picture_url: string | null;
  company_name: string | null;
  posted_at: string | null;
  created_at: string;
}

interface CompetitorInstagramPostsViewProps {
  selectedCompetitorId?: string;
}

export const CompetitorInstagramPostsView = ({ selectedCompetitorId }: CompetitorInstagramPostsViewProps) => {
  const { effectiveOrgId } = useAuth();
  const [posts, setPosts] = useState<CompetitorInstagramPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedPost, setExpandedPost] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchPosts = async () => {
      if (!effectiveOrgId) return;

      setLoading(true);
      let query = supabase
        .from("organization_social_media_organique_competitor_instagram")
        .select("*")
        .eq("organization_id", effectiveOrgId)
        .order("posted_at", { ascending: false });

      if (selectedCompetitorId && selectedCompetitorId !== "all") {
        query = query.eq("competitor_id", selectedCompetitorId);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching competitor Instagram posts:", error);
      } else {
        setPosts((data || []) as CompetitorInstagramPost[]);
      }
      setLoading(false);
    };

    fetchPosts();
  }, [effectiveOrgId, selectedCompetitorId]);

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

  const getInstagramImage = (post: CompetitorInstagramPost): string | null => {
    if (post.images) {
      let imagesArray: string[] = [];
      if (typeof post.images === 'string') {
        try {
          imagesArray = JSON.parse(post.images as string);
        } catch {
          imagesArray = [post.images as string];
        }
      } else if (Array.isArray(post.images)) {
        imagesArray = post.images;
      }
      if (imagesArray.length > 0) {
        return imagesArray[0];
      }
    }
    if (post.profile_picture_url) return post.profile_picture_url;
    return null;
  };

  const filteredPosts = posts.filter(post => {
    if (!searchQuery) return true;
    return post.caption?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.company_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.competitor_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.hashtags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
  });

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
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 flex items-center justify-center mx-auto mb-4 text-white">
          <InstagramIcon />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">Aucun post Instagram concurrent</h3>
        <p className="text-sm text-muted-foreground max-w-sm mx-auto">
          Les posts Instagram de vos concurrents apparaîtront ici une fois synchronisés
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-card border border-border/50 hover:border-pink-500/30 transition-all duration-300">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 flex items-center justify-center">
              <Eye className="w-5 h-5 text-white" />
            </div>
          </div>
          <p className="text-2xl font-bold text-foreground">{formatNumber(stats.totalViews)}</p>
          <p className="text-sm text-muted-foreground">Vues totales</p>
        </div>

        <div className="p-5 rounded-2xl bg-card border border-border/50 hover:border-red-500/30 transition-all duration-300">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-pink-600 flex items-center justify-center">
              <Heart className="w-5 h-5 text-white" />
            </div>
          </div>
          <p className="text-2xl font-bold text-foreground">{formatNumber(stats.totalLikes)}</p>
          <p className="text-sm text-muted-foreground">Likes</p>
        </div>

        <div className="p-5 rounded-2xl bg-card border border-border/50 hover:border-cyan-500/30 transition-all duration-300">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-white" />
            </div>
          </div>
          <p className="text-2xl font-bold text-foreground">{formatNumber(stats.totalComments)}</p>
          <p className="text-sm text-muted-foreground">Commentaires</p>
        </div>

        <div className="p-5 rounded-2xl bg-card border border-border/50 hover:border-orange-500/30 transition-all duration-300">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
              <Hash className="w-5 h-5 text-white" />
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
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-foreground">{filteredPosts.length} publications</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredPosts.map((post) => {
          const isExpanded = expandedPost === post.id;
          const postImage = getInstagramImage(post);

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
                    alt="Post"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-500/20 via-pink-500/20 to-orange-500/20 text-muted-foreground/50">
                    <InstagramIcon />
                  </div>
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                <div className="absolute top-3 left-3 flex items-center gap-2">
                  <div className="px-2 py-1 rounded-lg bg-black/60 backdrop-blur-sm text-white text-xs font-medium flex items-center gap-1">
                    <Building2 className="w-3 h-3" />
                    {post.competitor_name || "Concurrent"}
                  </div>
                </div>

                <div className="absolute top-3 right-3">
                  <div className="px-2 py-1 rounded-lg bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 text-white text-xs font-medium flex items-center gap-1">
                    {post.content_type === "video" || post.content_type === "reel" ? <Video className="w-3 h-3" /> : <Image className="w-3 h-3" />}
                    {post.content_type || "Post"}
                  </div>
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <p className="text-white text-sm font-medium mb-1 truncate">{post.company_name || "Instagram"}</p>
                  <p className="text-white/80 text-xs mb-2">{formatDate(post.posted_at)}</p>
                  <p className="text-white/90 text-sm line-clamp-2 mb-3">
                    {post.caption || "Publication Instagram"}
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
                    {(post.views_count || post.video_play_count) && (
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {formatNumber(post.views_count || post.video_play_count)}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <button
                onClick={() => setExpandedPost(isExpanded ? null : post.id)}
                className="w-full px-4 py-3 flex items-center justify-between text-sm text-muted-foreground hover:bg-muted/50 transition-colors"
              >
                <span>Plus de détails</span>
                {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {isExpanded && (
                <div className="px-4 pb-4 space-y-3 border-t border-border/50">
                  <div className="pt-3 text-sm text-muted-foreground">
                    <p className="line-clamp-6">{post.caption}</p>
                  </div>
                  {post.hashtags && post.hashtags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {post.hashtags.slice(0, 5).map((tag, i) => (
                        <span key={i} className="px-2 py-0.5 rounded-full bg-muted text-xs text-muted-foreground">
                          #{tag.replace(/^#/, "")}
                        </span>
                      ))}
                    </div>
                  )}
                  <a
                    href={post.post_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-primary hover:underline"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Voir sur Instagram
                  </a>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
