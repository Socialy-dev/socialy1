import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import {
  Heart,
  MessageCircle,
  Share2,
  Eye,
  Facebook,
  Search,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Building2,
  Image,
  Video
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";

interface CompetitorFacebookPost {
  id: string;
  organization_id: string;
  competitor_id: string;
  competitor_name: string | null;
  post_id: string;
  post_url: string;
  caption: string | null;
  likes_count: number | null;
  shares_count: number | null;
  views_count: number | null;
  comments_count: number | null;
  image_url: string | null;
  video_url: string | null;
  page_name: string | null;
  post_type: string | null;
  posted_at: string | null;
  created_at: string;
}

interface CompetitorFacebookPostsViewProps {
  selectedCompetitorId?: string;
}

export const CompetitorFacebookPostsView = ({ selectedCompetitorId }: CompetitorFacebookPostsViewProps) => {
  const { effectiveOrgId } = useAuth();
  const [posts, setPosts] = useState<CompetitorFacebookPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedPost, setExpandedPost] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchPosts = async () => {
      if (!effectiveOrgId) return;

      setLoading(true);
      let query = supabase
        .from("organization_social_media_organique_competitor_facebook")
        .select("*")
        .eq("organization_id", effectiveOrgId)
        .order("posted_at", { ascending: false });

      if (selectedCompetitorId && selectedCompetitorId !== "all") {
        query = query.eq("competitor_id", selectedCompetitorId);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching competitor Facebook posts:", error);
      } else {
        setPosts((data || []) as CompetitorFacebookPost[]);
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

  const filteredPosts = posts.filter(post => {
    if (!searchQuery) return true;
    return post.caption?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.page_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.competitor_name?.toLowerCase().includes(searchQuery.toLowerCase());
  });

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
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center mx-auto mb-4">
          <Facebook className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">Aucun post Facebook concurrent</h3>
        <p className="text-sm text-muted-foreground max-w-sm mx-auto">
          Les posts Facebook de vos concurrents apparaîtront ici une fois synchronisés
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-card border border-border/50 hover:border-blue-500/30 transition-all duration-300">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
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

        <div className="p-5 rounded-2xl bg-card border border-border/50 hover:border-green-500/30 transition-all duration-300">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
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
            placeholder="Rechercher un post..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-card border-border"
          />
        </div>
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
                    alt="Post"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500/20 to-indigo-500/20">
                    <Facebook className="w-12 h-12 text-muted-foreground/50" />
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
                  <div className="px-2 py-1 rounded-lg bg-blue-500/90 text-white text-xs font-medium flex items-center gap-1">
                    {post.post_type === "Video" ? <Video className="w-3 h-3" /> : <Image className="w-3 h-3" />}
                    {post.post_type || "Post"}
                  </div>
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <p className="text-white text-sm font-medium mb-1">{post.page_name}</p>
                  <p className="text-white/80 text-xs mb-2">{formatDate(post.posted_at)}</p>
                  <p className="text-white/90 text-sm line-clamp-2 mb-3">
                    {post.caption || "Publication Facebook"}
                  </p>
                  <div className="flex items-center gap-3 text-white/80 text-xs">
                    <span className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      {formatNumber(post.views_count)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Heart className="w-3 h-3" />
                      {formatNumber(post.likes_count)}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageCircle className="w-3 h-3" />
                      {formatNumber(post.comments_count)}
                    </span>
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
                    <p className="line-clamp-4">{post.caption}</p>
                  </div>
                  <a
                    href={post.post_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-primary hover:underline"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Voir sur Facebook
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
