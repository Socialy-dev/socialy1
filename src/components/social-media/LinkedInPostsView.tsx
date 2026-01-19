import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import {
  Heart,
  MessageCircle,
  Share2,
  ThumbsUp,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Users,
  FileText,
  Video,
  Image as ImageIcon,
  RefreshCw,
  Search,
  Linkedin,
  PartyPopper,
  Lightbulb,
  HandHeart,
  Repeat2
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface LinkedInPost {
  id: string;
  organization_id: string;
  post_id: string;
  post_url: string;
  caption: string | null;
  post_type: string | null;
  likes_count: number | null;
  comments_count: number | null;
  reposts_count: number | null;
  total_reactions: number | null;
  love_count: number | null;
  celebrate_count: number | null;
  support_count: number | null;
  insight_count: number | null;
  author_name: string | null;
  author_followers: number | null;
  author_logo_url: string | null;
  author_company_url: string | null;
  media_type: string | null;
  media_url: string | null;
  media_thumbnail: string | null;
  video_duration: string | null;
  document_title: string | null;
  document_url: string | null;
  document_page_count: number | null;
  posted_at: string | null;
  scraped_at: string | null;
  created_at: string;
  is_edited: boolean | null;
  language: string | null;
}

export const LinkedInPostsView = () => {
  const { effectiveOrgId } = useAuth();
  const [posts, setPosts] = useState<LinkedInPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedPost, setExpandedPost] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchPosts = async () => {
      if (!effectiveOrgId) return;

      setLoading(true);
      const { data, error } = await supabase
        .from("organization_social_media_organique_linkedin")
        .select("*")
        .eq("organization_id", effectiveOrgId)
        .order("posted_at", { ascending: false });

      if (error) {
        console.error("Error fetching LinkedIn posts:", error);
      } else {
        setPosts((data || []) as unknown as LinkedInPost[]);
      }
      setLoading(false);
    };

    fetchPosts();
  }, [effectiveOrgId]);

  const filteredPosts = posts.filter(post => {
    if (!searchQuery) return true;
    return post.caption?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.author_name?.toLowerCase().includes(searchQuery.toLowerCase());
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
    const totalReactions = posts.reduce((sum, post) => sum + (post.total_reactions || 0), 0);
    const totalComments = posts.reduce((sum, post) => sum + (post.comments_count || 0), 0);
    const totalReposts = posts.reduce((sum, post) => sum + (post.reposts_count || 0), 0);
    const totalLikes = posts.reduce((sum, post) => sum + (post.likes_count || 0), 0);
    const avgFollowers = posts.length > 0
      ? posts.reduce((sum, post) => sum + (post.author_followers || 0), 0) / posts.length
      : 0;
    const avgEngagement = avgFollowers > 0 
      ? (((totalReactions + totalComments + totalReposts) / posts.length) / avgFollowers * 100).toFixed(2)
      : "0.00";

    return { totalReactions, totalComments, totalReposts, totalLikes, avgEngagement };
  };

  const stats = calculateTotalStats();

  const getMediaTypeIcon = (type: string | null) => {
    switch (type?.toLowerCase()) {
      case "video":
        return <Video className="w-3 h-3" />;
      case "image":
        return <ImageIcon className="w-3 h-3" />;
      case "document":
        return <FileText className="w-3 h-3" />;
      default:
        return <Linkedin className="w-3 h-3" />;
    }
  };

  const getMediaTypeLabel = (type: string | null) => {
    switch (type?.toLowerCase()) {
      case "video":
        return "Vidéo";
      case "image":
        return "Image";
      case "document":
        return "Document";
      case "article":
        return "Article";
      case "carousel":
        return "Carrousel";
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
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#0A66C2] to-[#004182] flex items-center justify-center mx-auto mb-4">
          <Linkedin className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">Aucune publication LinkedIn</h3>
        <p className="text-sm text-muted-foreground max-w-sm mx-auto">
          Les publications LinkedIn de votre organisation apparaîtront ici une fois synchronisées
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-card border border-border/50 hover:border-[#0A66C2]/30 transition-all duration-300 hover:shadow-lg hover:shadow-[#0A66C2]/5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0A66C2] to-[#004182] flex items-center justify-center">
              <ThumbsUp className="w-5 h-5 text-white" />
            </div>
          </div>
          <p className="text-2xl font-bold text-foreground">{formatNumber(stats.totalReactions)}</p>
          <p className="text-sm text-muted-foreground">Réactions totales</p>
        </div>

        <div className="p-5 rounded-2xl bg-card border border-border/50 hover:border-[#0A66C2]/30 transition-all duration-300 hover:shadow-lg hover:shadow-[#0A66C2]/5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-400 to-[#0A66C2] flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-white" />
            </div>
          </div>
          <p className="text-2xl font-bold text-foreground">{formatNumber(stats.totalComments)}</p>
          <p className="text-sm text-muted-foreground">Commentaires</p>
        </div>

        <div className="p-5 rounded-2xl bg-card border border-border/50 hover:border-cyan-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
              <Repeat2 className="w-5 h-5 text-white" />
            </div>
          </div>
          <p className="text-2xl font-bold text-foreground">{formatNumber(stats.totalReposts)}</p>
          <p className="text-sm text-muted-foreground">Repartages</p>
        </div>

        <div className="p-5 rounded-2xl bg-card border border-border/50 hover:border-emerald-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
              <Users className="w-5 h-5 text-white" />
            </div>
          </div>
          <p className="text-2xl font-bold text-foreground">{stats.avgEngagement}%</p>
          <p className="text-sm text-muted-foreground">Taux d'engagement</p>
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
                {post.media_url || post.media_thumbnail ? (
                  <img
                    src={post.media_thumbnail || post.media_url || ""}
                    alt="Post media"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#0A66C2]/20 to-blue-500/20">
                    <Linkedin className="w-12 h-12 text-muted-foreground/50" />
                  </div>
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                <div className="absolute top-3 left-3 flex items-center gap-2">
                  <div className="px-2 py-1 rounded-lg bg-[#0A66C2]/90 text-white text-xs font-medium flex items-center gap-1">
                    {getMediaTypeIcon(post.media_type || post.post_type)}
                    {getMediaTypeLabel(post.media_type || post.post_type)}
                  </div>
                  {post.is_edited && (
                    <div className="px-2 py-1 rounded-lg bg-gray-500/90 text-white text-xs font-medium">
                      Modifié
                    </div>
                  )}
                </div>

                <div className="absolute top-3 right-3">
                  <a
                    href={post.post_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-white/70 hover:text-white hover:bg-[#0A66C2]/80 transition-colors"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    {post.author_logo_url ? (
                      <img
                        src={post.author_logo_url}
                        alt={post.author_name || "Auteur"}
                        className="w-8 h-8 rounded-full object-cover border-2 border-white/30"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#0A66C2] to-[#004182] flex items-center justify-center text-white text-xs font-bold">
                        {post.author_name?.charAt(0) || "L"}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">
                        {post.author_name || "LinkedIn"}
                      </p>
                      <p className="text-xs text-white/60">
                        {formatDate(post.posted_at)}
                        {post.author_followers && ` • ${formatNumber(post.author_followers)} abonnés`}
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
                    <p className="text-lg font-bold text-foreground">{formatNumber(post.total_reactions)}</p>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Réactions</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-foreground">{formatNumber(post.comments_count)}</p>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Comm.</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-foreground">{formatNumber(post.reposts_count)}</p>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Repartages</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-foreground">{formatNumber(post.likes_count)}</p>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wide">J'aime</p>
                  </div>
                </div>

                {(post.love_count || post.celebrate_count || post.support_count || post.insight_count) && (
                  <div className="flex items-center justify-center gap-3 pt-2 border-t border-border/30">
                    {post.love_count && post.love_count > 0 && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Heart className="w-3 h-3 text-[#DF704D]" />
                        {formatNumber(post.love_count)}
                      </div>
                    )}
                    {post.celebrate_count && post.celebrate_count > 0 && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <PartyPopper className="w-3 h-3 text-[#7FC15E]" />
                        {formatNumber(post.celebrate_count)}
                      </div>
                    )}
                    {post.support_count && post.support_count > 0 && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <HandHeart className="w-3 h-3 text-[#A872E8]" />
                        {formatNumber(post.support_count)}
                      </div>
                    )}
                    {post.insight_count && post.insight_count > 0 && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Lightbulb className="w-3 h-3 text-[#F5BB5C]" />
                        {formatNumber(post.insight_count)}
                      </div>
                    )}
                  </div>
                )}

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
                        <p className="text-sm text-foreground whitespace-pre-wrap">{post.caption}</p>
                      </div>
                    )}

                    {post.document_title && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Document</p>
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-[#0A66C2]" />
                          <span className="text-sm text-foreground">{post.document_title}</span>
                          {post.document_page_count && (
                            <Badge variant="secondary" className="text-xs">
                              {post.document_page_count} pages
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Auteur</p>
                        <p className="text-foreground">{post.author_name || "-"}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Abonnés</p>
                        <p className="text-foreground">{formatNumber(post.author_followers)}</p>
                      </div>
                    </div>

                    {post.video_duration && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Durée vidéo</p>
                        <p className="text-foreground">{post.video_duration}</p>
                      </div>
                    )}

                    {post.language && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Langue</p>
                        <p className="text-foreground uppercase">{post.language}</p>
                      </div>
                    )}
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
