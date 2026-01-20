import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { subDays, subMonths, isAfter, parseISO } from "date-fns";

export type TimePeriod = "7d" | "30d" | "3m" | "6m" | "1y" | "custom";

interface CompetitorTikTokPost {
  id: string;
  organization_id: string;
  competitor_id: string;
  competitor_name: string | null;
  post_id: string;
  tiktok_url: string;
  caption: string | null;
  hashtags: string[] | null;
  likes_count: number | null;
  shares_count: number | null;
  views_count: number | null;
  comments_count: number | null;
  collect_count: number | null;
  followers_at_time: number | null;
  is_slideshow: boolean | null;
  video_cover_url: string | null;
  video_duration: number | null;
  author_name: string | null;
  posted_at: string | null;
  created_at: string;
}

export interface EngagementDataPoint {
  id: string;
  date: Date;
  engagementRate: number;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  caption: string;
  competitorName: string;
}

export interface HashtagPerformance {
  hashtag: string;
  usageCount: number;
  avgEngagementRate: number;
  totalViews: number;
}

export interface FollowersDataPoint {
  date: Date;
  followers: number;
  hasPost: boolean;
}

export interface ContentTypeStats {
  type: "video" | "carousel";
  label: string;
  avgViews: number;
  avgEngagementRate: number;
  postCount: number;
}

export const useCompetitorTikTokAnalytics = (selectedCompetitorId?: string) => {
  const { effectiveOrgId } = useAuth();
  const [posts, setPosts] = useState<CompetitorTikTokPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<TimePeriod>("1y");
  const [customDateRange, setCustomDateRange] = useState<{ start: Date; end: Date } | null>(null);

  useEffect(() => {
    const fetchPosts = async () => {
      if (!effectiveOrgId) return;

      setLoading(true);
      let query = supabase
        .from("organization_social_media_organique_competitor_tiktok")
        .select("*")
        .eq("organization_id", effectiveOrgId)
        .order("posted_at", { ascending: true });

      if (selectedCompetitorId && selectedCompetitorId !== "all") {
        query = query.eq("competitor_id", selectedCompetitorId);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching competitor TikTok posts:", error);
      } else {
        setPosts((data || []) as CompetitorTikTokPost[]);
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
      const views = post.views_count || 1;
      const likes = post.likes_count || 0;
      const comments = post.comments_count || 0;
      const shares = post.shares_count || 0;
      const engagementRate = ((likes + comments + shares) / views) * 100;

      return {
        id: post.id,
        date: post.posted_at ? parseISO(post.posted_at) : parseISO(post.created_at),
        engagementRate: Math.round(engagementRate * 100) / 100,
        views,
        likes,
        comments,
        shares,
        caption: post.caption || "",
        competitorName: post.competitor_name || ""
      };
    }).sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [filteredPosts]);

  const hashtagPerformance: HashtagPerformance[] = useMemo(() => {
    const hashtagMap = new Map<string, { posts: CompetitorTikTokPost[] }>();

    filteredPosts.forEach((post) => {
      if (post.hashtags && Array.isArray(post.hashtags)) {
        post.hashtags.forEach((tag) => {
          const normalizedTag = tag.toLowerCase().replace(/^#/, "");
          if (!hashtagMap.has(normalizedTag)) {
            hashtagMap.set(normalizedTag, { posts: [] });
          }
          hashtagMap.get(normalizedTag)!.posts.push(post);
        });
      }
    });

    const results: HashtagPerformance[] = [];

    hashtagMap.forEach((data, hashtag) => {
      const totalEngagement = data.posts.reduce((sum, post) => {
        const views = post.views_count || 1;
        const likes = post.likes_count || 0;
        const comments = post.comments_count || 0;
        const shares = post.shares_count || 0;
        return sum + ((likes + comments + shares) / views) * 100;
      }, 0);

      const totalViews = data.posts.reduce((sum, post) => sum + (post.views_count || 0), 0);

      results.push({
        hashtag,
        usageCount: data.posts.length,
        avgEngagementRate: Math.round((totalEngagement / data.posts.length) * 100) / 100,
        totalViews
      });
    });

    return results.sort((a, b) => b.avgEngagementRate - a.avgEngagementRate).slice(0, 10);
  }, [filteredPosts]);

  const followersData: FollowersDataPoint[] = useMemo(() => {
    return filteredPosts
      .filter((post) => post.followers_at_time !== null)
      .map((post) => ({
        date: post.posted_at ? parseISO(post.posted_at) : parseISO(post.created_at),
        followers: post.followers_at_time || 0,
        hasPost: true
      }))
      .sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [filteredPosts]);

  const contentTypeStats: ContentTypeStats[] = useMemo(() => {
    const videos = filteredPosts.filter((post) => !post.is_slideshow);
    const carousels = filteredPosts.filter((post) => post.is_slideshow);

    const calculateStats = (postList: CompetitorTikTokPost[], type: "video" | "carousel", label: string): ContentTypeStats => {
      if (postList.length === 0) {
        return { type, label, avgViews: 0, avgEngagementRate: 0, postCount: 0 };
      }

      const totalViews = postList.reduce((sum, post) => sum + (post.views_count || 0), 0);
      const totalEngagement = postList.reduce((sum, post) => {
        const views = post.views_count || 1;
        const likes = post.likes_count || 0;
        const comments = post.comments_count || 0;
        const shares = post.shares_count || 0;
        return sum + ((likes + comments + shares) / views) * 100;
      }, 0);

      return {
        type,
        label,
        avgViews: Math.round(totalViews / postList.length),
        avgEngagementRate: Math.round((totalEngagement / postList.length) * 100) / 100,
        postCount: postList.length
      };
    };

    return [
      calculateStats(videos, "video", "Vidéo"),
      calculateStats(carousels, "carousel", "Carrousel")
    ];
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
    hashtagPerformance,
    followersData,
    contentTypeStats,
    followersDelta,
    periodDays
  };
};
