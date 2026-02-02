import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { subDays, subMonths, isAfter, parseISO } from "date-fns";

export type TimePeriod = "7d" | "30d" | "3m" | "6m" | "1y" | "custom";

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
  post_type: string | null;
  posted_at: string | null;
  created_at: string;
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
  competitorName: string;
}

export interface ContentTypeStats {
  type: string;
  label: string;
  avgReactions: number;
  avgEngagementRate: number;
  postCount: number;
}

export interface ReactionBreakdown {
  like: number;
  love: number;
  celebrate: number;
  support: number;
  insight: number;
}

export interface FollowersDataPoint {
  date: Date;
  followers: number;
  hasPost: boolean;
}

export const useCompetitorLinkedInAnalytics = (selectedCompetitorId?: string) => {
  const { effectiveOrgId } = useAuth();
  const [posts, setPosts] = useState<CompetitorLinkedInPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<TimePeriod>("1y");
  const [customDateRange, setCustomDateRange] = useState<{ start: Date; end: Date } | null>(null);

  useEffect(() => {
    const fetchPosts = async () => {
      if (!effectiveOrgId) return;

      setLoading(true);
      let query = supabase
        .from("organization_social_media_organique_competitor_linkedin")
        .select("*")
        .eq("organization_id", effectiveOrgId)
        .order("posted_at", { ascending: true });

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
      const comments = post.comments_count || 0;
      const reposts = post.reposts_count || 0;
      const followers = post.author_followers || 1;
      const engagementRate = ((reactions + comments + reposts) / followers) * 100;

      return {
        id: post.id,
        date: post.posted_at ? parseISO(post.posted_at) : parseISO(post.created_at),
        engagementRate: Math.round(engagementRate * 100) / 100,
        reactions,
        likes: post.likes_count || 0,
        comments,
        reposts,
        caption: post.caption || "",
        competitorName: post.competitor_name || ""
      };
    }).sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [filteredPosts]);

  const contentTypeStats: ContentTypeStats[] = useMemo(() => {
    const typeMap = new Map<string, CompetitorLinkedInPost[]>();

    filteredPosts.forEach((post) => {
      const type = post.media_type || post.post_type || "text";
      if (!typeMap.has(type)) {
        typeMap.set(type, []);
      }
      typeMap.get(type)!.push(post);
    });

    const results: ContentTypeStats[] = [];

    typeMap.forEach((postList, type) => {
      const totalReactions = postList.reduce((sum, post) => sum + (post.total_reactions || 0), 0);
      const totalEngagement = postList.reduce((sum, post) => {
        const reactions = post.total_reactions || 0;
        const comments = post.comments_count || 0;
        const reposts = post.reposts_count || 0;
        const followers = post.author_followers || 1;
        return sum + ((reactions + comments + reposts) / followers) * 100;
      }, 0);

      results.push({
        type,
        label: type.charAt(0).toUpperCase() + type.slice(1),
        avgReactions: postList.length > 0 ? Math.round(totalReactions / postList.length) : 0,
        avgEngagementRate: postList.length > 0 ? Math.round((totalEngagement / postList.length) * 100) / 100 : 0,
        postCount: postList.length
      });
    });

    return results.sort((a, b) => b.postCount - a.postCount);
  }, [filteredPosts]);

  const reactionBreakdown: ReactionBreakdown = useMemo(() => {
    return filteredPosts.reduce((acc, post) => ({
      like: acc.like + (post.likes_count || 0),
      love: acc.love + (post.love_count || 0),
      celebrate: acc.celebrate + (post.celebrate_count || 0),
      support: acc.support + (post.support_count || 0),
      insight: acc.insight + (post.insight_count || 0)
    }), { like: 0, love: 0, celebrate: 0, support: 0, insight: 0 });
  }, [filteredPosts]);

  const followersData: FollowersDataPoint[] = useMemo(() => {
    return filteredPosts
      .filter((post) => post.author_followers !== null)
      .map((post) => ({
        date: post.posted_at ? parseISO(post.posted_at) : parseISO(post.created_at),
        followers: post.author_followers || 0,
        hasPost: true
      }))
      .sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [filteredPosts]);

  const followersDelta = useMemo(() => {
    if (followersData.length < 2) return 0;
    return followersData[followersData.length - 1].followers - followersData[0].followers;
  }, [followersData]);

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
    posts: filteredPosts,
    period,
    setPeriod,
    customDateRange,
    setCustomDateRange,
    filteredPosts,
    engagementData,
    contentTypeStats,
    reactionBreakdown,
    followersData,
    followersDelta,
    periodDays
  };
};
