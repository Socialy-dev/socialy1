import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import {
  Heart,
  MessageCircle,
  Share2,
  Eye,
  Bookmark,
  Play,
  Clock,
  Music2,
  Hash,
  MapPin,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Users,
  Video,
  Sparkles,
  Pin,
  Megaphone,
  Star,
  RefreshCw,
  Search
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { ImageWithFallback } from "@/components/ui/image-with-fallback";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface TikTokFavorite {
  id: string;
  tiktok_post_id: string;
  status: string;
}

interface TikTokPost {
  id: string;
  organization_id: string;
  post_id: string;
  tiktok_url: string;
  caption: string | null;
  text_language: string | null;
  hashtags: string[] | null;
  likes_count: number | null;
  shares_count: number | null;
  views_count: number | null;
  comments_count: number | null;
  collect_count: number | null;
  author_id: string | null;
  author_name: string | null;
  followers_at_time: number | null;
  author_total_likes: number | null;
  author_total_videos: number | null;
  video_duration: number | null;
  video_height: number | null;
  video_width: number | null;
  video_cover_url: string | null;
  music_name: string | null;
  music_author: string | null;
  music_id: string | null;
  effects_used: unknown;
  is_slideshow: boolean | null;
  is_pinned: boolean | null;
  is_sponsored: boolean | null;
  is_ad: boolean | null;
  location_created: string | null;
  posted_at: string | null;
  scraped_at: string | null;
  created_at: string;
  updated_at: string;
}

export const TikTokPostsView = () => {
  const { effectiveOrgId, user } = useAuth();
  const [posts, setPosts] = useState<TikTokPost[]>([]);
  const [favorites, setFavorites] = useState<TikTokFavorite[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedPost, setExpandedPost] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"all" | "favorites">("all");
  const [searchQuery, setSearchQuery] = useState("");

  const fetchFavorites = async () => {
    if (!effectiveOrgId || !user?.id) return;
    
    try {
      const { data, error } = await supabase
        .from("user_tiktok_favorites" as any)
        .select("id, tiktok_post_id, status")
        .eq("user_id", user.id)
        .eq("organization_id", effectiveOrgId);

      if (error) throw error;
      setFavorites((data || []) as unknown as TikTokFavorite[]);
    } catch (error) {
      console.error("Error fetching favorites:", error);
    }
  };

  useEffect(() => {
    const fetchPosts = async () => {
      if (!effectiveOrgId) return;

      setLoading(true);
      const { data, error } = await supabase
        .from("organization_social_media_organique_tiktok")
        .select("*")
        .eq("organization_id", effectiveOrgId)
        .order("posted_at", { ascending: false });

      if (error) {
        console.error("Error fetching TikTok posts:", error);
      } else {
        setPosts(data || []);
      }
      setLoading(false);
    };

    fetchPosts();
    fetchFavorites();
  }, [effectiveOrgId, user?.id]);

  const toggleFavorite = async (postId: string) => {
    if (!effectiveOrgId || !user?.id) return;

    const existingFavorite = favorites.find(f => f.tiktok_post_id === postId);
    
    try {
      if (existingFavorite) {
        const { error } = await supabase
          .from("user_tiktok_favorites" as any)
          .delete()
          .eq("id", existingFavorite.id);
        
        if (error) throw error;
        setFavorites(prev => prev.filter(f => f.id !== existingFavorite.id));
        toast.success("Retiré des favoris");
      } else {
        const { data, error } = await supabase
          .from("user_tiktok_favorites" as any)
          .insert({
            user_id: user.id,
            organization_id: effectiveOrgId,
            tiktok_post_id: postId,
            status: "favorite"
          } as any)
          .select()
          .single();
        
        if (error) throw error;
        setFavorites(prev => [...prev, data as unknown as TikTokFavorite]);
        toast.success("Ajouté aux favoris");
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
      toast.error("Erreur lors de la modification");
    }
  };

  const isFavorite = (postId: string): boolean => {
    return favorites.some(f => f.tiktok_post_id === postId);
  };

  const favoritesCount = favorites.length;

  const filteredPosts = posts.filter(post => {
    const matchesSearch = !searchQuery || 
      post.caption?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.author_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.hashtags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    if (viewMode === "favorites") {
      return matchesSearch && isFavorite(post.id);
    }
    return matchesSearch;
  });

  const formatNumber = (num: number | null) => {
    if (num === null || num === undefined) return "0";
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
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
    const totalCollects = posts.reduce((sum, post) => sum + (post.collect_count || 0), 0);
    const avgEngagement = totalViews > 0 
      ? (((totalLikes + totalComments + totalShares) / totalViews) * 100).toFixed(2)
      : "0.00";

    return { totalLikes, totalViews, totalShares, totalComments, totalCollects, avgEngagement };
  };

  const stats = calculateTotalStats();

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
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
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-500 via-red-500 to-yellow-500 flex items-center justify-center mx-auto mb-4">
          <Video className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">Aucune vidéo TikTok</h3>
        <p className="text-sm text-muted-foreground max-w-sm mx-auto">
          Les vidéos TikTok de votre organisation apparaîtront ici une fois synchronisées
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="p-5 rounded-2xl bg-card border border-border/50 hover:border-pink-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-pink-500/5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center">
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
              <Share2 className="w-5 h-5 text-white" />
            </div>
          </div>
          <p className="text-2xl font-bold text-foreground">{formatNumber(stats.totalShares)}</p>
          <p className="text-sm text-muted-foreground">Partages</p>
        </div>

        <div className="p-5 rounded-2xl bg-card border border-border/50 hover:border-yellow-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-yellow-500/5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-600 flex items-center justify-center">
              <Bookmark className="w-5 h-5 text-white" />
            </div>
          </div>
          <p className="text-2xl font-bold text-foreground">{formatNumber(stats.totalCollects)}</p>
          <p className="text-sm text-muted-foreground">Enregistrements</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher une vidéo..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-card border-border"
          />
        </div>
        
        <div className="flex gap-2 flex-wrap">
          <Button
            variant={viewMode === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("all")}
            className="rounded-full"
          >
            Toutes ({posts.length})
          </Button>
          <Button
            variant={viewMode === "favorites" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("favorites")}
            className={cn(
              "rounded-full gap-1",
              viewMode === "favorites" && "bg-amber-500 hover:bg-amber-600"
            )}
          >
            <Star className="w-3 h-3" />
            Favoris ({favoritesCount})
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => { fetchFavorites(); }}
            className="rounded-full"
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-foreground">{filteredPosts.length} vidéos</h2>
        <div className="text-sm text-muted-foreground">
          Taux d'engagement moyen: <span className="font-semibold text-foreground">{stats.avgEngagement}%</span>
        </div>
      </div>

      {filteredPosts.length === 0 ? (
        <div className="text-center py-16 bg-secondary/20 rounded-2xl">
          <Video className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-muted-foreground font-medium">
            {viewMode === "favorites" 
              ? "Aucune vidéo en favoris" 
              : "Aucune vidéo trouvée"}
          </p>
          <p className="text-sm text-muted-foreground/70 mt-1">
            {viewMode === "favorites" 
              ? "Cliquez sur l'étoile pour ajouter des vidéos en favoris" 
              : "Les vidéos apparaîtront ici une fois synchronisées"}
          </p>
        </div>
      ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredPosts.map((post) => {
          const isExpanded = expandedPost === post.id;
          const postIsFavorite = isFavorite(post.id);

          return (
            <div
              key={post.id}
              className={cn(
                "group relative rounded-3xl bg-card border border-border/50 overflow-hidden",
                "hover:border-pink-500/30 hover:shadow-xl hover:shadow-pink-500/5",
                "transition-all duration-300"
              )}
            >
              <div className="relative aspect-[9/12] bg-muted overflow-hidden">
                <ImageWithFallback
                  src={post.video_cover_url}
                  alt="Video cover"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  isVideo={true}
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                <div className="absolute top-3 left-3 flex items-center gap-2">
                  {post.is_pinned && (
                    <div className="px-2 py-1 rounded-lg bg-yellow-500/90 text-white text-xs font-medium flex items-center gap-1">
                      <Pin className="w-3 h-3" />
                      Épinglé
                    </div>
                  )}
                  {post.is_sponsored && (
                    <div className="px-2 py-1 rounded-lg bg-blue-500/90 text-white text-xs font-medium flex items-center gap-1">
                      <Megaphone className="w-3 h-3" />
                      Sponsorisé
                    </div>
                  )}
                  {post.is_ad && (
                    <div className="px-2 py-1 rounded-lg bg-purple-500/90 text-white text-xs font-medium">
                      Pub
                    </div>
                  )}
                  {post.is_slideshow && (
                    <div className="px-2 py-1 rounded-lg bg-white/20 backdrop-blur-sm text-white text-xs font-medium flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      Carrousel
                    </div>
                  )}
                </div>

                <div className="absolute top-3 right-3 flex flex-col items-end gap-2">
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleFavorite(post.id); }}
                    className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200",
                      postIsFavorite
                        ? "bg-amber-500 text-white shadow-lg shadow-amber-500/30"
                        : "bg-black/50 backdrop-blur-sm text-white/70 hover:bg-amber-500/80 hover:text-white"
                    )}
                  >
                    <Star className={cn("w-4 h-4", postIsFavorite && "fill-current")} />
                  </button>
                  {post.video_duration && (
                    <div className="px-2 py-1 rounded-lg bg-black/50 backdrop-blur-sm text-white text-xs font-medium flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDuration(post.video_duration)}
                    </div>
                  )}
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                      {post.author_name?.charAt(0).toUpperCase() || "?"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-semibold truncate">@{post.author_name || "inconnu"}</p>
                      {post.followers_at_time && (
                        <p className="text-white/70 text-xs flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {formatNumber(post.followers_at_time)} abonnés
                        </p>
                      )}
                    </div>
                  </div>

                  <p className="text-white/90 text-sm leading-relaxed line-clamp-2 mb-2">
                    {truncateText(post.caption, 100)}
                  </p>

                  {post.hashtags && post.hashtags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-2">
                      {post.hashtags.slice(0, 3).map((tag, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded-full bg-white/10 backdrop-blur-sm text-white/90 text-xs"
                        >
                          #{tag}
                        </span>
                      ))}
                      {post.hashtags.length > 3 && (
                        <span className="px-2 py-0.5 rounded-full bg-white/10 backdrop-blur-sm text-white/70 text-xs">
                          +{post.hashtags.length - 3}
                        </span>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-between text-white/80 text-xs">
                    <span>{formatDate(post.posted_at)}</span>
                    <a
                      href={post.tiktok_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 hover:text-white transition-colors"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <ExternalLink className="w-3 h-3" />
                      Voir
                    </a>
                  </div>
                </div>

                <button
                  className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  onClick={() => window.open(post.tiktok_url, "_blank")}
                >
                  <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <Play className="w-6 h-6 text-white ml-1" />
                  </div>
                </button>
              </div>

              <div className="p-4">
                <div className="grid grid-cols-5 gap-2 mb-3">
                  <div className="text-center">
                    <p className="text-sm font-bold text-foreground">{formatNumber(post.views_count)}</p>
                    <p className="text-xs text-muted-foreground">Vues</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-bold text-foreground">{formatNumber(post.likes_count)}</p>
                    <p className="text-xs text-muted-foreground">Likes</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-bold text-foreground">{formatNumber(post.comments_count)}</p>
                    <p className="text-xs text-muted-foreground">Com.</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-bold text-foreground">{formatNumber(post.shares_count)}</p>
                    <p className="text-xs text-muted-foreground">Part.</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-bold text-foreground">{formatNumber(post.collect_count)}</p>
                    <p className="text-xs text-muted-foreground">Enr.</p>
                  </div>
                </div>

                <button
                  onClick={() => setExpandedPost(isExpanded ? null : post.id)}
                  className="w-full flex items-center justify-center gap-1 py-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  {isExpanded ? (
                    <>
                      <ChevronUp className="w-4 h-4" />
                      Moins de détails
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-4 h-4" />
                      Plus de détails
                    </>
                  )}
                </button>

                {isExpanded && (
                  <div className="pt-3 border-t border-border/50 space-y-3 animate-in slide-in-from-top-2 duration-200">
                    {post.music_name && (
                      <div className="flex items-start gap-2">
                        <Music2 className="w-4 h-4 text-pink-500 mt-0.5 flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="text-xs text-muted-foreground">Musique</p>
                          <p className="text-sm text-foreground truncate">{post.music_name}</p>
                          {post.music_author && (
                            <p className="text-xs text-muted-foreground">par {post.music_author}</p>
                          )}
                        </div>
                      </div>
                    )}

                    {post.location_created && (
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-xs text-muted-foreground">Localisation</p>
                          <p className="text-sm text-foreground">{post.location_created}</p>
                        </div>
                      </div>
                    )}

                    {post.video_width && post.video_height && (
                      <div className="flex items-start gap-2">
                        <Video className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-xs text-muted-foreground">Dimensions</p>
                          <p className="text-sm text-foreground">{post.video_width} x {post.video_height}px</p>
                        </div>
                      </div>
                    )}

                    {post.author_total_likes !== null && post.author_total_videos !== null && (
                      <div className="flex items-start gap-2">
                        <Users className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-xs text-muted-foreground">Auteur</p>
                          <p className="text-sm text-foreground">
                            {formatNumber(post.author_total_likes)} likes • {formatNumber(post.author_total_videos)} vidéos
                          </p>
                        </div>
                      </div>
                    )}

                    {post.hashtags && post.hashtags.length > 0 && (
                      <div className="flex items-start gap-2">
                        <Hash className="w-4 h-4 text-cyan-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Hashtags</p>
                          <div className="flex flex-wrap gap-1">
                            {post.hashtags.map((tag, i) => (
                              <span
                                key={i}
                                className="px-2 py-0.5 rounded-full bg-secondary text-xs text-foreground"
                              >
                                #{tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {post.text_language && (
                      <div className="text-xs text-muted-foreground">
                        Langue: <span className="text-foreground uppercase">{post.text_language}</span>
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
