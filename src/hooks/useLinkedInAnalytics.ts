import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { subDays, subMonths, isAfter, parseISO } from "date-fns";

export type TimePeriod = "7d" | "30d" | "3m" | "6m" | "1y" | "custom";

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

export interface EngagementDataPoint {
  id: string;
  date: Date;
  engagementRate: number;
  reactions: number;
  likes: number;
  comments: number;
  reposts: number;
  caption: string;
}

export interface ContentTypeStats {
  type: string;
  label: string;
  avgReactions: number;
  avgEngagementRate: number;
  postCount: number;
}

export interface ReactionBreakdown {
  type: string;
  label: string;
  count: number;
  color: string;
}

export const useLinkedInAnalytics = () => {
  const { effectiveOrgId } = useAuth();
  const [posts, setPosts] = useState<LinkedInPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<TimePeriod>("1y");
  const [customDateRange, setCustomDateRange] = useState<{ start: Date; end: Date } | null>(null);

  useEffect(() => {
    const fetchPosts = async () => {
      if (!effectiveOrgId) return;

      setLoading(true);
      const { data, error } = await supabase
        .from("organization_social_media_organique_linkedin")
        .select("*")
        .eq("organization_id", effectiveOrgId)
        .order("posted_at", { ascending: true });

      if (error) {
        console.error("Error fetching LinkedIn posts:", error);
      } else {
        setPosts((data || []) as unknown as LinkedInPost[]);
      }
      setLoading(false);
    };

    fetchPosts();
  }, [effectiveOrgId]);

  const getDateThreshold = (periodValue: TimePeriod): Date => {
    const now = new Date();
    switch (periodValue) {
      case "7d":
        return subDays(now, 7);
      case "30d":
        return subDays(now, 30);
      case "3m":
        return subMonths(now, 3);
      case "6m":
        return subMonths(now, 6);
      case "1y":
        return subMonths(now, 12);
      case "custom":
        return customDateRange?.start || subDays(now, 30);
      default:
        return subDays(now, 30);
    }
  };

  const filteredPosts = useMemo(() => {
    const threshold = getDateThreshold(period);
    const endDate = period === "custom" && customDateRange ? customDateRange.end : new Date();

    return posts.filter((post) => {
      const postDate = post.posted_at ? parseISO(post.posted_at) : parseISO(post.created_at);
      return isAfter(postDate, threshold) && postDate <= endDate;
    });
  }, [posts, period, customDateRange]);

  const engagementData: EngagementDataPoint[] = useMemo(() => {
    return filteredPosts.map((post) => {
      const reactions = post.total_reactions || 0;
      const likes = post.likes_count || 0;
      const comments = post.comments_count || 0;
      const reposts = post.reposts_count || 0;
      const followers = post.author_followers || 1;
      const engagementRate = ((reactions + comments + reposts) / followers) * 100;

      return {
        id: post.id,
        date: post.posted_at ? parseISO(post.posted_at) : parseISO(post.created_at),
        engagementRate: Math.round(engagementRate * 100) / 100,
        reactions,
        likes,
        comments,
        reposts,
        caption: post.caption || ""
      };
    }).sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [filteredPosts]);

  const contentTypeStats: ContentTypeStats[] = useMemo(() => {
    const typeGroups = new Map<string, LinkedInPost[]>();

    filteredPosts.forEach((post) => {
      const type = post.media_type || post.post_type || "text";
      if (!typeGroups.has(type)) {
        typeGroups.set(type, []);
      }
      typeGroups.get(type)!.push(post);
    });

    const stats: ContentTypeStats[] = [];

    const labelMap: Record<string, string> = {
      video: "Vidéo",
      image: "Image",
      document: "Document",
      article: "Article",
      text: "Texte",
      carousel: "Carrousel",
      poll: "Sondage"
    };

    typeGroups.forEach((postList, type) => {
      if (postList.length === 0) return;

      const totalReactions = postList.reduce((sum, post) => sum + (post.total_reactions || 0), 0);
      const totalEngagement = postList.reduce((sum, post) => {
        const followers = post.author_followers || 1;
        const reactions = post.total_reactions || 0;
        const comments = post.comments_count || 0;
        const reposts = post.reposts_count || 0;
        return sum + ((reactions + comments + reposts) / followers) * 100;
      }, 0);

      stats.push({
        type,
        label: labelMap[type.toLowerCase()] || type,
        avgReactions: Math.round(totalReactions / postList.length),
        avgEngagementRate: Math.round((totalEngagement / postList.length) * 100) / 100,
        postCount: postList.length
      });
    });

    return stats.sort((a, b) => b.postCount - a.postCount);
  }, [filteredPosts]);

  const reactionBreakdown: ReactionBreakdown[] = useMemo(() => {
    const totalLikes = filteredPosts.reduce((sum, post) => sum + (post.likes_count || 0), 0);
    const totalLove = filteredPosts.reduce((sum, post) => sum + (post.love_count || 0), 0);
    const totalCelebrate = filteredPosts.reduce((sum, post) => sum + (post.celebrate_count || 0), 0);
    const totalSupport = filteredPosts.reduce((sum, post) => sum + (post.support_count || 0), 0);
    const totalInsight = filteredPosts.reduce((sum, post) => sum + (post.insight_count || 0), 0);

    return [
      { type: "like", label: "J'aime", count: totalLikes, color: "#0A66C2" },
      { type: "love", label: "J'adore", count: totalLove, color: "#DF704D" },
      { type: "celebrate", label: "Bravo", count: totalCelebrate, color: "#7FC15E" },
      { type: "support", label: "Soutien", count: totalSupport, color: "#A872E8" },
      { type: "insight", label: "Instructif", count: totalInsight, color: "#F5BB5C" }
    ].filter(r => r.count > 0);
  }, [filteredPosts]);

  const followersDelta = useMemo(() => {
    if (filteredPosts.length < 2) return 0;
    const sortedByDate = [...filteredPosts]
      .filter(p => p.author_followers)
      .sort((a, b) => {
        const dateA = a.posted_at ? parseISO(a.posted_at) : parseISO(a.created_at);
        const dateB = b.posted_at ? parseISO(b.posted_at) : parseISO(b.created_at);
        return dateA.getTime() - dateB.getTime();
      });
    
    if (sortedByDate.length < 2) return 0;
    return (sortedByDate[sortedByDate.length - 1].author_followers || 0) - (sortedByDate[0].author_followers || 0);
  }, [filteredPosts]);

  const periodDays = useMemo(() => {
    switch (period) {
      case "7d": return 7;
      case "30d": return 30;
      case "3m": return 90;
      case "6m": return 180;
      case "1y": return 365;
      case "custom":
        if (customDateRange) {
          return Math.ceil((customDateRange.end.getTime() - customDateRange.start.getTime()) / (1000 * 60 * 60 * 24));
        }
        return 30;
      default: return 30;
    }
  }, [period, customDateRange]);

  return {
    loading,
    posts,
    period,
    setPeriod,
    customDateRange,
    setCustomDateRange,
    filteredPosts,
    engagementData,
    contentTypeStats,
    reactionBreakdown,
    followersDelta,
    periodDays
  };
};
