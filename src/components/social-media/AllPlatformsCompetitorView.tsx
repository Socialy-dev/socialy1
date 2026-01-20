import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { Heart, MessageCircle, Share2, Eye, TrendingUp, ChevronLeft, ChevronRight, Play, Video, Facebook } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface CompetitorTikTokPost {
  id: string;
  tiktok_url: string;
  caption: string | null;
  likes_count: number | null;
  shares_count: number | null;
  views_count: number | null;
  comments_count: number | null;
  video_cover_url: string | null;
  competitor_name: string | null;
  posted_at: string | null;
}

interface CompetitorFacebookPost {
  id: string;
  post_url: string;
  caption: string | null;
  likes_count: number | null;
  shares_count: number | null;
  views_count: number | null;
  comments_count: number | null;
  image_url: string | null;
  competitor_name: string | null;
  post_type: string | null;
  posted_at: string | null;
}

interface CompetitorLinkedInPost {
  id: string;
  post_url: string;
  caption: string | null;
  total_reactions: number | null;
  comments_count: number | null;
  reposts_count: number | null;
  media_thumbnail: string | null;
  competitor_name: string | null;
  author_logo_url: string | null;
  posted_at: string | null;
}

interface CompetitorInstagramPost {
  id: string;
  post_url: string;
  caption: string | null;
  likes_count: number | null;
  comments_count: number | null;
  views_count: number | null;
  images: string[] | null;
  competitor_name: string | null;
  content_type: string | null;
  posted_at: string | null;
}

interface AllPlatformsCompetitorViewProps {
  selectedCompetitorId?: string;
}

export const AllPlatformsCompetitorView = ({ selectedCompetitorId }: AllPlatformsCompetitorViewProps) => {
  const { effectiveOrgId } = useAuth();
  const [tiktokPosts, setTiktokPosts] = useState<CompetitorTikTokPost[]>([]);
  const [facebookPosts, setFacebookPosts] = useState<CompetitorFacebookPost[]>([]);
  const [linkedinPosts, setLinkedinPosts] = useState<CompetitorLinkedInPost[]>([]);
  const [instagramPosts, setInstagramPosts] = useState<CompetitorInstagramPost[]>([]);
  const [loading, setLoading] = useState(true);

  const tiktokScrollRef = useRef<HTMLDivElement>(null);
  const facebookScrollRef = useRef<HTMLDivElement>(null);
  const linkedinScrollRef = useRef<HTMLDivElement>(null);
  const instagramScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchAllPosts = async () => {
      if (!effectiveOrgId) return;
      setLoading(true);

      const buildQuery = (table: string) => {
        let q = supabase.from(table as any).select("*").eq("organization_id", effectiveOrgId).order("posted_at", { ascending: false }).limit(20);
        if (selectedCompetitorId && selectedCompetitorId !== "all") {
          q = q.eq("competitor_id", selectedCompetitorId);
        }
        return q;
      };

      const [tiktokRes, facebookRes, linkedinRes, instagramRes] = await Promise.all([
        buildQuery("organization_social_media_organique_competitor_tiktok"),
        buildQuery("organization_social_media_organique_competitor_facebook"),
        buildQuery("organization_social_media_organique_competitor_linkedin"),
        buildQuery("organization_social_media_organique_competitor_instagram")
      ]);

      if (tiktokRes.data) setTiktokPosts(tiktokRes.data as any);
      if (facebookRes.data) setFacebookPosts(facebookRes.data as any);
      if (linkedinRes.data) setLinkedinPosts(linkedinRes.data as any);
      if (instagramRes.data) setInstagramPosts(instagramRes.data as any);
      setLoading(false);
    };

    fetchAllPosts();
  }, [effectiveOrgId, selectedCompetitorId]);

  const formatNumber = (num: number | null) => {
    if (num === null || num === undefined) return "0";
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const scroll = (ref: React.RefObject<HTMLDivElement>, direction: "left" | "right") => {
    if (ref.current) {
      ref.current.scrollBy({ left: direction === "left" ? -320 : 320, behavior: "smooth" });
    }
  };

  const getInstagramImage = (post: CompetitorInstagramPost): string | null => {
    if (post.images) {
      let arr: string[] = [];
      if (typeof post.images === 'string') { try { arr = JSON.parse(post.images); } catch { arr = [post.images]; } }
      else if (Array.isArray(post.images)) { arr = post.images; }
      if (arr.length > 0) return arr[0];
    }
    return null;
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-40 rounded-2xl" />)}
        </div>
      </div>
    );
  }

  const totalPosts = tiktokPosts.length + facebookPosts.length + linkedinPosts.length + instagramPosts.length;

  if (totalPosts === 0) {
    return (
      <div className="text-center py-16 rounded-3xl bg-card border border-dashed border-border">
        <Video className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-foreground mb-2">Aucun contenu concurrent</h3>
        <p className="text-sm text-muted-foreground">Les publications de vos concurrents apparaîtront ici</p>
      </div>
    );
  }

  const renderCarousel = (
    title: string,
    posts: any[],
    scrollRef: React.RefObject<HTMLDivElement>,
    gradient: string,
    icon: React.ReactNode,
    renderCard: (post: any, index: number) => React.ReactNode
  ) => {
    if (posts.length === 0) return null;
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shadow-lg bg-gradient-to-br", gradient)}>{icon}</div>
            <div>
              <h2 className="text-xl font-bold text-foreground">{title}</h2>
              <p className="text-sm text-muted-foreground">{posts.length} publications</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => scroll(scrollRef, "left")} className="w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"><ChevronLeft className="w-5 h-5" /></button>
            <button onClick={() => scroll(scrollRef, "right")} className="w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"><ChevronRight className="w-5 h-5" /></button>
          </div>
        </div>
        <div ref={scrollRef} className="flex gap-4 overflow-x-auto scrollbar-hide pb-4 -mx-2 px-2" style={{ scrollbarWidth: "none" }}>
          {posts.map(renderCard)}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {renderCarousel("TikTok Concurrents", tiktokPosts, tiktokScrollRef, "from-pink-500 via-red-500 to-yellow-500", <Video className="w-5 h-5 text-white" />, (post, i) => (
        <a key={post.id} href={post.tiktok_url} target="_blank" rel="noopener noreferrer" className="relative flex-shrink-0 w-52 rounded-2xl overflow-hidden bg-card border border-border/50 hover:border-pink-500/30 transition-all duration-300 hover:shadow-xl">
          <div className="relative aspect-[9/16]">
            {post.video_cover_url ? <img src={post.video_cover_url} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full bg-gradient-to-br from-pink-500/20 to-purple-500/20 flex items-center justify-center"><Video className="w-12 h-12 text-muted-foreground/50" /></div>}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
            <div className="absolute top-3 left-3 px-3 py-1.5 bg-black/60 backdrop-blur-sm rounded-lg text-white font-bold text-2xl">{i + 1}</div>
            <div className="absolute bottom-0 left-0 right-0 p-3">
              <p className="text-white/60 text-xs mb-1">{post.competitor_name}</p>
              <p className="text-white text-sm font-medium line-clamp-2 mb-2">{post.caption || "Vidéo TikTok"}</p>
              <div className="flex items-center gap-3 text-white/80 text-xs">
                <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{formatNumber(post.views_count)}</span>
                <span className="flex items-center gap-1"><Heart className="w-3 h-3" />{formatNumber(post.likes_count)}</span>
              </div>
            </div>
          </div>
        </a>
      ))}

      {renderCarousel("Facebook Concurrents", facebookPosts, facebookScrollRef, "from-blue-500 to-blue-700", <Facebook className="w-5 h-5 text-white" />, (post, i) => (
        <a key={post.id} href={post.post_url} target="_blank" rel="noopener noreferrer" className="relative flex-shrink-0 w-72 rounded-2xl overflow-hidden bg-card border border-border/50 hover:border-blue-500/30 transition-all duration-300 hover:shadow-xl">
          <div className="relative aspect-square">
            {post.image_url ? <img src={post.image_url} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full bg-gradient-to-br from-blue-500/20 to-indigo-500/20 flex items-center justify-center"><Facebook className="w-12 h-12 text-muted-foreground/50" /></div>}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
            <div className="absolute top-3 left-3 px-3 py-1.5 bg-black/60 backdrop-blur-sm rounded-lg text-white font-bold text-2xl">{i + 1}</div>
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <p className="text-white/60 text-xs mb-1">{post.competitor_name}</p>
              <p className="text-white/80 text-xs line-clamp-2 mb-3">{post.caption || "Publication Facebook"}</p>
              <div className="flex items-center gap-4 text-white/80 text-xs">
                <span className="flex items-center gap-1"><Heart className="w-3 h-3" />{formatNumber(post.likes_count)}</span>
                <span className="flex items-center gap-1"><MessageCircle className="w-3 h-3" />{formatNumber(post.comments_count)}</span>
              </div>
            </div>
          </div>
        </a>
      ))}

      {renderCarousel("LinkedIn Concurrents", linkedinPosts, linkedinScrollRef, "from-[#0A66C2] to-[#004182]", <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-white"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>, (post, i) => (
        <a key={post.id} href={post.post_url} target="_blank" rel="noopener noreferrer" className="relative flex-shrink-0 w-72 rounded-2xl overflow-hidden bg-card border border-border/50 hover:border-[#0A66C2]/30 transition-all duration-300 hover:shadow-xl">
          <div className="relative aspect-video">
            {post.media_thumbnail ? <img src={post.media_thumbnail} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full bg-gradient-to-br from-[#0A66C2]/20 to-blue-500/20 flex items-center justify-center"><svg viewBox="0 0 24 24" fill="currentColor" className="w-12 h-12 text-muted-foreground/50"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg></div>}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
            <div className="absolute top-3 left-3 px-3 py-1.5 bg-black/60 backdrop-blur-sm rounded-lg text-white font-bold text-2xl">{i + 1}</div>
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <p className="text-white/60 text-xs mb-1">{post.competitor_name}</p>
              <p className="text-white/80 text-xs line-clamp-2 mb-3">{post.caption || "Publication LinkedIn"}</p>
              <div className="flex items-center gap-4 text-white/80 text-xs">
                <span className="flex items-center gap-1"><Heart className="w-3 h-3" />{formatNumber(post.total_reactions)}</span>
                <span className="flex items-center gap-1"><MessageCircle className="w-3 h-3" />{formatNumber(post.comments_count)}</span>
              </div>
            </div>
          </div>
        </a>
      ))}

      {renderCarousel("Instagram Concurrents", instagramPosts, instagramScrollRef, "from-purple-600 via-pink-500 to-orange-400", <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-white"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>, (post, i) => {
        const img = getInstagramImage(post);
        return (
          <a key={post.id} href={post.post_url} target="_blank" rel="noopener noreferrer" className="relative flex-shrink-0 w-64 rounded-2xl overflow-hidden bg-card border border-border/50 hover:border-pink-500/30 transition-all duration-300 hover:shadow-xl">
            <div className="relative aspect-square">
              {img ? <img src={img} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full bg-gradient-to-br from-purple-500/20 via-pink-500/20 to-orange-500/20 flex items-center justify-center"><svg viewBox="0 0 24 24" fill="currentColor" className="w-12 h-12 text-muted-foreground/50"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg></div>}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
              <div className="absolute top-3 left-3 px-3 py-1.5 bg-black/60 backdrop-blur-sm rounded-lg text-white font-bold text-2xl">{i + 1}</div>
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <p className="text-white/60 text-xs mb-1">{post.competitor_name}</p>
                <p className="text-white/80 text-xs line-clamp-2 mb-3">{post.caption || "Publication Instagram"}</p>
                <div className="flex items-center gap-4 text-white/80 text-xs">
                  <span className="flex items-center gap-1"><Heart className="w-3 h-3" />{formatNumber(post.likes_count)}</span>
                  <span className="flex items-center gap-1"><MessageCircle className="w-3 h-3" />{formatNumber(post.comments_count)}</span>
                </div>
              </div>
            </div>
          </a>
        );
      })}
    </div>
  );
};
