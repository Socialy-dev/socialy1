import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import {
  Heart,
  MessageCircle,
  Share2,
  Eye,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Video,
  Facebook,
  Play
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Platform, platformsConfig } from "./PlatformDropdown";

interface TikTokPost {
  id: string;
  post_id: string;
  tiktok_url: string;
  caption: string | null;
  likes_count: number | null;
  shares_count: number | null;
  views_count: number | null;
  comments_count: number | null;
  video_cover_url: string | null;
  author_name: string | null;
  posted_at: string | null;
}

interface FacebookPost {
  id: string;
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
  posted_at: string | null;
  post_type: string | null;
}

interface LinkedInPost {
  id: string;
  post_id: string;
  post_url: string;
  caption: string | null;
  total_reactions: number | null;
  comments_count: number | null;
  reposts_count: number | null;
  media_thumbnail: string | null;
  media_url: string | null;
  author_name: string | null;
  author_logo_url: string | null;
  posted_at: string | null;
}

interface InstagramPost {
  id: string;
  post_id: string | null;
  post_url: string;
  caption: string | null;
  likes_count: number | null;
  comments_count: number | null;
  views_count: number | null;
  video_play_count: number | null;
  images: string[] | null;
  profile_picture_url: string | null;
  company_name: string | null;
  content_type: string | null;
  posted_at: string | null;
}

interface PlatformStats {
  platform: Platform;
  totalPosts: number;
  totalViews: number;
  totalLikes: number;
  totalComments: number;
  totalShares: number;
  engagementRate: string;
}

const SiBigTiktok = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
  </svg>
);

export const AllPlatformsView = () => {
  const { effectiveOrgId } = useAuth();
  const [tiktokPosts, setTiktokPosts] = useState<TikTokPost[]>([]);
  const [facebookPosts, setFacebookPosts] = useState<FacebookPost[]>([]);
  const [linkedinPosts, setLinkedinPosts] = useState<LinkedInPost[]>([]);
  const [instagramPosts, setInstagramPosts] = useState<InstagramPost[]>([]);
  const [loading, setLoading] = useState(true);

  const tiktokScrollRef = useRef<HTMLDivElement>(null);
  const facebookScrollRef = useRef<HTMLDivElement>(null);
  const linkedinScrollRef = useRef<HTMLDivElement>(null);
  const instagramScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchAllPosts = async () => {
      if (!effectiveOrgId) return;

      setLoading(true);

      const [tiktokRes, facebookRes, linkedinRes, instagramRes] = await Promise.all([
        supabase
          .from("organization_social_media_organique_tiktok")
          .select("id, post_id, tiktok_url, caption, likes_count, shares_count, views_count, comments_count, video_cover_url, author_name, posted_at")
          .eq("organization_id", effectiveOrgId)
          .order("posted_at", { ascending: false })
          .limit(20),
        supabase
          .from("organization_social_media_organique_facebook" as any)
          .select("id, post_id, post_url, caption, likes_count, shares_count, views_count, comments_count, image_url, video_url, page_name, posted_at, post_type")
          .eq("organization_id", effectiveOrgId)
          .order("posted_at", { ascending: false })
          .limit(20),
        supabase
          .from("organization_social_media_organique_linkedin")
          .select("id, post_id, post_url, caption, total_reactions, comments_count, reposts_count, media_thumbnail, media_url, author_name, author_logo_url, posted_at")
          .eq("organization_id", effectiveOrgId)
          .order("posted_at", { ascending: false })
          .limit(20),
        supabase
          .from("organization_social_media_organique_instagram")
          .select("id, post_id, post_url, caption, likes_count, comments_count, views_count, video_play_count, images, profile_picture_url, company_name, content_type, posted_at")
          .eq("organization_id", effectiveOrgId)
          .order("posted_at", { ascending: false })
          .limit(20)
      ]);

      if (tiktokRes.data) setTiktokPosts(tiktokRes.data);
      if (facebookRes.data) setFacebookPosts(facebookRes.data as unknown as FacebookPost[]);
      if (linkedinRes.data) setLinkedinPosts(linkedinRes.data as unknown as LinkedInPost[]);
      if (instagramRes.data) setInstagramPosts(instagramRes.data as unknown as InstagramPost[]);

      setLoading(false);
    };

    fetchAllPosts();
  }, [effectiveOrgId]);

  const formatNumber = (num: number | null) => {
    if (num === null || num === undefined) return "0";
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const calculateStats = (posts: { likes_count: number | null; comments_count: number | null; shares_count: number | null; views_count: number | null }[]): Omit<PlatformStats, 'platform'> => {
    const totalPosts = posts.length;
    const totalViews = posts.reduce((sum, p) => sum + (p.views_count || 0), 0);
    const totalLikes = posts.reduce((sum, p) => sum + (p.likes_count || 0), 0);
    const totalComments = posts.reduce((sum, p) => sum + (p.comments_count || 0), 0);
    const totalShares = posts.reduce((sum, p) => sum + (p.shares_count || 0), 0);
    const engagementRate = totalViews > 0 
      ? (((totalLikes + totalComments + totalShares) / totalViews) * 100).toFixed(2)
      : "0.00";

    return { totalPosts, totalViews, totalLikes, totalComments, totalShares, engagementRate };
  };

  const calculateLinkedInStats = (): Omit<PlatformStats, 'platform'> => {
    const totalPosts = linkedinPosts.length;
    const totalReactions = linkedinPosts.reduce((sum, p) => sum + (p.total_reactions || 0), 0);
    const totalComments = linkedinPosts.reduce((sum, p) => sum + (p.comments_count || 0), 0);
    const totalReposts = linkedinPosts.reduce((sum, p) => sum + (p.reposts_count || 0), 0);
    const engagementRate = totalPosts > 0 
      ? (((totalReactions + totalComments + totalReposts) / totalPosts) / 100).toFixed(2)
      : "0.00";

    return { 
      totalPosts, 
      totalViews: totalReactions, 
      totalLikes: totalReactions, 
      totalComments, 
      totalShares: totalReposts, 
      engagementRate 
    };
  };

  const calculateInstagramStats = (): Omit<PlatformStats, 'platform'> => {
    const totalPosts = instagramPosts.length;
    const totalViews = instagramPosts.reduce((sum, p) => sum + (p.views_count || p.video_play_count || 0), 0);
    const totalLikes = instagramPosts.reduce((sum, p) => sum + (p.likes_count || 0), 0);
    const totalComments = instagramPosts.reduce((sum, p) => sum + (p.comments_count || 0), 0);
    const engagementRate = totalViews > 0 
      ? (((totalLikes + totalComments) / totalViews) * 100).toFixed(2)
      : "0.00";

    return { totalPosts, totalViews, totalLikes, totalComments, totalShares: 0, engagementRate };
  };

  const getInstagramImage = (post: InstagramPost): string | null => {
    if (post.images) {
      let imagesArray: string[] = [];
      if (typeof post.images === 'string') {
        try {
          imagesArray = JSON.parse(post.images);
        } catch {
          imagesArray = [post.images];
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

  const tiktokStats = calculateStats(tiktokPosts);
  const facebookStats = calculateStats(facebookPosts);
  const linkedinStats = calculateLinkedInStats();
  const instagramStats = calculateInstagramStats();

  const scroll = (ref: React.RefObject<HTMLDivElement>, direction: "left" | "right") => {
    if (ref.current) {
      const scrollAmount = 320;
      ref.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth"
      });
    }
  };

  const LinkedInIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
    </svg>
  );

  const InstagramIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
    </svg>
  );

  const platformCards = [
    {
      platform: "linkedin" as Platform,
      label: "LinkedIn",
      icon: LinkedInIcon,
      gradient: "from-[#0A66C2] to-[#004182]",
      stats: linkedinStats
    },
    {
      platform: "instagram" as Platform,
      label: "Instagram",
      icon: InstagramIcon,
      gradient: "from-purple-600 via-pink-500 to-orange-400",
      stats: instagramStats
    },
    {
      platform: "tiktok" as Platform,
      label: "TikTok",
      icon: SiBigTiktok,
      gradient: "from-pink-500 via-red-500 to-yellow-500",
      stats: tiktokStats
    },
    {
      platform: "facebook" as Platform,
      label: "Facebook",
      icon: Facebook,
      gradient: "from-blue-500 to-blue-700",
      stats: facebookStats
    }
  ];

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-40 rounded-2xl" />
          ))}
        </div>
        <div className="space-y-6">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="h-8 w-48" />
              <div className="flex gap-4">
                {[...Array(4)].map((_, j) => (
                  <Skeleton key={j} className="w-72 h-80 rounded-2xl flex-shrink-0" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {platformCards.map((card) => {
          const IconComponent = card.icon;
          return (
            <div
              key={card.platform}
              className={cn(
                "group relative p-5 rounded-2xl bg-card border border-border/50 overflow-hidden",
                "hover:shadow-xl transition-all duration-300 cursor-pointer",
                card.stats.totalPosts > 0 && "hover:border-primary/30"
              )}
            >
              <div className={cn(
                "absolute inset-0 opacity-5 bg-gradient-to-br",
                card.gradient
              )} />
              
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br shadow-lg",
                    card.gradient
                  )}>
                    <div className="text-white">
                      <IconComponent />
                    </div>
                  </div>
                  {card.stats.totalPosts > 0 && (
                    <div className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold bg-success/10 text-success">
                      <TrendingUp className="w-3 h-3" />
                      {card.stats.engagementRate}%
                    </div>
                  )}
                </div>

                <h3 className="text-lg font-bold text-foreground mb-3">{card.label}</h3>

                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-xl font-bold text-foreground">{formatNumber(card.stats.totalViews)}</p>
                    <p className="text-xs text-muted-foreground">Vues</p>
                  </div>
                  <div>
                    <p className="text-xl font-bold text-foreground">{card.stats.totalPosts}</p>
                    <p className="text-xs text-muted-foreground">Posts</p>
                  </div>
                </div>

                {card.stats.totalPosts === 0 && (
                  <div className="absolute inset-0 flex items-center justify-center bg-card/80 backdrop-blur-sm rounded-2xl">
                    <p className="text-sm text-muted-foreground font-medium">Bientôt disponible</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {tiktokPosts.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 via-red-500 to-yellow-500 flex items-center justify-center shadow-lg">
                <SiBigTiktok />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">TikTok</h2>
                <p className="text-sm text-muted-foreground">{tiktokPosts.length} publications récentes</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => scroll(tiktokScrollRef, "left")}
                className="w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => scroll(tiktokScrollRef, "right")}
                className="w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div
            ref={tiktokScrollRef}
            className="flex gap-4 overflow-x-auto scrollbar-hide pb-4 -mx-2 px-2"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {tiktokPosts.map((post, index) => (
              <a
                key={post.id}
                href={post.tiktok_url}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  "relative flex-shrink-0 w-52 rounded-2xl overflow-hidden group cursor-pointer",
                  "bg-card border border-border/50 hover:border-pink-500/30",
                  "transition-all duration-300 hover:shadow-xl hover:shadow-pink-500/10 hover:scale-[1.02]"
                )}
              >
                <div className="relative aspect-[9/16]">
                  {post.video_cover_url ? (
                    <img
                      src={post.video_cover_url}
                      alt="TikTok"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-pink-500/20 to-purple-500/20 flex items-center justify-center">
                      <Video className="w-12 h-12 text-muted-foreground/50" />
                    </div>
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

                  <div className="absolute top-3 left-3 px-3 py-1.5 bg-black/60 backdrop-blur-sm rounded-lg text-white font-bold text-2xl">
                    {index + 1}
                  </div>

                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center">
                      <Play className="w-8 h-8 text-white ml-1" />
                    </div>
                  </div>

                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <p className="text-white text-sm font-medium line-clamp-2 mb-2">
                      {post.caption || "Vidéo TikTok"}
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
                    </div>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

      {facebookPosts.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-lg">
                <Facebook className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">Facebook</h2>
                <p className="text-sm text-muted-foreground">{facebookPosts.length} publications récentes</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => scroll(facebookScrollRef, "left")}
                className="w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => scroll(facebookScrollRef, "right")}
                className="w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div
            ref={facebookScrollRef}
            className="flex gap-4 overflow-x-auto scrollbar-hide pb-4 -mx-2 px-2"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {facebookPosts.map((post, index) => (
              <a
                key={post.id}
                href={post.post_url}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  "relative flex-shrink-0 w-72 rounded-2xl overflow-hidden group cursor-pointer",
                  "bg-card border border-border/50 hover:border-blue-500/30",
                  "transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10 hover:scale-[1.02]"
                )}
              >
                <div className="relative aspect-square">
                  {post.image_url || post.video_url ? (
                    <img
                      src={post.image_url || post.video_url || ""}
                      alt="Facebook"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-500/20 to-indigo-500/20 flex items-center justify-center">
                      <Facebook className="w-12 h-12 text-muted-foreground/50" />
                    </div>
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

                  <div className="absolute top-3 left-3 px-3 py-1.5 bg-black/60 backdrop-blur-sm rounded-lg text-white font-bold text-2xl">
                    {index + 1}
                  </div>

                  <div className="absolute top-3 right-3">
                    <div className="px-2 py-1 rounded-lg bg-blue-500/90 text-white text-xs font-medium">
                      {post.post_type || "Post"}
                    </div>
                  </div>

                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <p className="text-white text-sm font-medium mb-1">{post.page_name}</p>
                    <p className="text-white/80 text-xs line-clamp-2 mb-3">
                      {post.caption || "Publication Facebook"}
                    </p>
                    <div className="flex items-center gap-4 text-white/80 text-xs">
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
              </a>
            ))}
          </div>
        </div>
      )}

      {linkedinPosts.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0A66C2] to-[#004182] flex items-center justify-center shadow-lg">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-white">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">LinkedIn</h2>
                <p className="text-sm text-muted-foreground">{linkedinPosts.length} publications récentes</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => scroll(linkedinScrollRef, "left")}
                className="w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => scroll(linkedinScrollRef, "right")}
                className="w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div
            ref={linkedinScrollRef}
            className="flex gap-4 overflow-x-auto scrollbar-hide pb-4 -mx-2 px-2"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {linkedinPosts.map((post, index) => (
              <a
                key={post.id}
                href={post.post_url}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  "relative flex-shrink-0 w-72 rounded-2xl overflow-hidden group cursor-pointer",
                  "bg-card border border-border/50 hover:border-[#0A66C2]/30",
                  "transition-all duration-300 hover:shadow-xl hover:shadow-[#0A66C2]/10 hover:scale-[1.02]"
                )}
              >
                <div className="relative aspect-video">
                  {post.media_thumbnail || post.media_url ? (
                    <img
                      src={post.media_thumbnail || post.media_url || ""}
                      alt="LinkedIn"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-[#0A66C2]/20 to-blue-500/20 flex items-center justify-center">
                      <svg viewBox="0 0 24 24" fill="currentColor" className="w-12 h-12 text-muted-foreground/50">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                      </svg>
                    </div>
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

                  <div className="absolute top-3 left-3 px-3 py-1.5 bg-black/60 backdrop-blur-sm rounded-lg text-white font-bold text-2xl">
                    {index + 1}
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
                    <p className="text-white/80 text-xs line-clamp-2 mb-3">
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
              </a>
            ))}
          </div>
        </div>
      )}

      {instagramPosts.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 flex items-center justify-center shadow-lg">
                <InstagramIcon />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">Instagram</h2>
                <p className="text-sm text-muted-foreground">{instagramPosts.length} publications récentes</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => scroll(instagramScrollRef, "left")}
                className="w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => scroll(instagramScrollRef, "right")}
                className="w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div
            ref={instagramScrollRef}
            className="flex gap-4 overflow-x-auto scrollbar-hide pb-4 -mx-2 px-2"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {instagramPosts.map((post, index) => {
              const postImage = getInstagramImage(post);
              return (
                <a
                  key={post.id}
                  href={post.post_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    "relative flex-shrink-0 w-64 rounded-2xl overflow-hidden group cursor-pointer",
                    "bg-card border border-border/50 hover:border-pink-500/30",
                    "transition-all duration-300 hover:shadow-xl hover:shadow-pink-500/10 hover:scale-[1.02]"
                  )}
                >
                  <div className="relative aspect-square">
                    {postImage ? (
                      <img
                        src={postImage}
                        alt="Instagram"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-purple-500/20 via-pink-500/20 to-orange-500/20 flex items-center justify-center">
                        <InstagramIcon />
                      </div>
                    )}

                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

                    <div className="absolute top-3 left-3 px-3 py-1.5 bg-black/60 backdrop-blur-sm rounded-lg text-white font-bold text-2xl">
                      {index + 1}
                    </div>

                    <div className="absolute top-3 right-3">
                      <div className="px-2 py-1 rounded-lg bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 text-white text-xs font-medium">
                        {post.content_type || "Post"}
                      </div>
                    </div>

                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <p className="text-white text-sm font-medium mb-1 truncate">{post.company_name || "Instagram"}</p>
                      <p className="text-white/80 text-xs line-clamp-2 mb-3">
                        {post.caption || "Publication Instagram"}
                      </p>
                      <div className="flex items-center gap-4 text-white/80 text-xs">
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
                </a>
              );
            })}
          </div>
        </div>
      )}

      {tiktokPosts.length === 0 && facebookPosts.length === 0 && linkedinPosts.length === 0 && instagramPosts.length === 0 && (
        <div className="text-center py-16 rounded-3xl bg-card border border-dashed border-border">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center mx-auto mb-4">
            <Video className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">Aucun contenu disponible</h3>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto">
            Les publications de vos réseaux sociaux apparaîtront ici une fois synchronisées
          </p>
        </div>
      )}
    </div>
  );
};
