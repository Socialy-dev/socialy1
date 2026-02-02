import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import {
  Heart,
  MessageCircle,
  Share2,
  Search,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Building2,
  Users,
  ThumbsUp
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";

const LinkedInIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
  </svg>
);

interface CompetitorLinkedInPost {
  id: string;
  organization_id: string;
  competitor_id: string;
  competitor_name: string | null;
  post_id: string;
  post_url: string;
  caption: string | null;
  likes_count: number | null;
  love_count: number | null;
  celebrate_count: number | null;
  support_count: number | null;
  insight_count: number | null;
  total_reactions: number | null;
  comments_count: number | null;
  reposts_count: number | null;
  author_followers: number | null;
  author_name: string | null;
  author_logo_url: string | null;
  media_thumbnail: string | null;
  media_url: string | null;
  media_type: string | null;
  posted_at: string | null;
  created_at: string;
}

interface CompetitorLinkedInPostsViewProps {
  selectedCompetitorId?: string;
}

export const CompetitorLinkedInPostsView = ({ selectedCompetitorId }: CompetitorLinkedInPostsViewProps) => {
  const { effectiveOrgId } = useAuth();
  const [posts, setPosts] = useState<CompetitorLinkedInPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedPost, setExpandedPost] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchPosts = async () => {
      if (!effectiveOrgId) return;

      setLoading(true);
      let query = supabase
        .from("organization_social_media_organique_competitor_linkedin")
        .select("*")
        .eq("organization_id", effectiveOrgId)
        .order("posted_at", { ascending: false });

      if (selectedCompetitorId && selectedCompetitorId !== "all") {
        query = query.eq("competitor_id", selectedCompetitorId);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching competitor LinkedIn posts:", error);
      } else {
        setPosts((data || []) as CompetitorLinkedInPost[]);
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
      post.author_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.competitor_name?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const calculateTotalStats = () => {
    const totalReactions = posts.reduce((sum, post) => sum + (post.total_reactions || 0), 0);
    const totalComments = posts.reduce((sum, post) => sum + (post.comments_count || 0), 0);
    const totalReposts = posts.reduce((sum, post) => sum + (post.reposts_count || 0), 0);
    const avgFollowers = posts.length > 0
      ? Math.round(posts.reduce((sum, post) => sum + (post.author_followers || 0), 0) / posts.length)
      : 0;

    return { totalReactions, totalComments, totalReposts, avgFollowers };
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
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#0A66C2] to-[#004182] flex items-center justify-center mx-auto mb-4">
          <LinkedInIcon />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">Aucun post LinkedIn concurrent</h3>
        <p className="text-sm text-muted-foreground max-w-sm mx-auto">
          Les posts LinkedIn de vos concurrents apparaîtront ici une fois synchronisés
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-card border border-border/50 hover:border-[#0A66C2]/30 transition-all duration-300">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0A66C2] to-[#004182] flex items-center justify-center">
              <ThumbsUp className="w-5 h-5 text-white" />
            </div>
          </div>
          <p className="text-2xl font-bold text-foreground">{formatNumber(stats.totalReactions)}</p>
          <p className="text-sm text-muted-foreground">Réactions totales</p>
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
          <p className="text-2xl font-bold text-foreground">{formatNumber(stats.totalReposts)}</p>
          <p className="text-sm text-muted-foreground">Reposts</p>
        </div>

        <div className="p-5 rounded-2xl bg-card border border-border/50 hover:border-violet-500/30 transition-all duration-300">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
              <Users className="w-5 h-5 text-white" />
            </div>
          </div>
          <p className="text-2xl font-bold text-foreground">{formatNumber(stats.avgFollowers)}</p>
          <p className="text-sm text-muted-foreground">Followers moyen</p>
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

          return (
            <div
              key={post.id}
              className={cn(
                "group relative rounded-3xl bg-card border border-border/50 overflow-hidden",
                "hover:border-[#0A66C2]/30 hover:shadow-xl hover:shadow-[#0A66C2]/5",
                "transition-all duration-300"
              )}
            >
              <div className="relative aspect-video bg-muted overflow-hidden">
                {post.media_thumbnail || post.media_url ? (
                  <img
                    src={post.media_thumbnail || post.media_url || ""}
                    alt="Post"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#0A66C2]/20 to-blue-500/20">
                    <div className="text-muted-foreground/50">
                      <LinkedInIcon />
                    </div>
                  </div>
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                <div className="absolute top-3 left-3 flex items-center gap-2">
                  <div className="px-2 py-1 rounded-lg bg-black/60 backdrop-blur-sm text-white text-xs font-medium flex items-center gap-1">
                    <Building2 className="w-3 h-3" />
                    {post.competitor_name || "Concurrent"}
                  </div>
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    {post.author_logo_url ? (
                      <img
                        src={post.author_logo_url}
                        alt={post.author_name || ""}
                        className="w-6 h-6 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-[#0A66C2] flex items-center justify-center text-white text-xs font-bold">
                        {post.author_name?.charAt(0) || "L"}
                      </div>
                    )}
                    <p className="text-white text-sm font-medium truncate">{post.author_name}</p>
                  </div>
                  <p className="text-white/80 text-xs mb-2">{formatDate(post.posted_at)}</p>
                  <p className="text-white/90 text-sm line-clamp-2 mb-3">
                    {post.caption || "Publication LinkedIn"}
                  </p>
                  <div className="flex items-center gap-4 text-white/80 text-xs">
                    <span className="flex items-center gap-1">
                      <Heart className="w-3 h-3" />
                      {formatNumber(post.total_reactions)}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageCircle className="w-3 h-3" />
                      {formatNumber(post.comments_count)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Share2 className="w-3 h-3" />
                      {formatNumber(post.reposts_count)}
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
                    <p className="line-clamp-6">{post.caption}</p>
                  </div>
                  {post.author_followers && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Users className="w-4 h-4" />
                      <span>{formatNumber(post.author_followers)} followers</span>
                    </div>
                  )}
                  <a
                    href={post.post_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-primary hover:underline"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Voir sur LinkedIn
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
