import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { subDays, subMonths, isAfter, parseISO } from "date-fns";

export type TimePeriod = "7d" | "30d" | "3m" | "6m" | "1y" | "custom";

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

export interface ContentTypeStats {
  type: string;
  label: string;
  avgViews: number;
  avgEngagementRate: number;
  postCount: number;
}

export const useCompetitorFacebookAnalytics = (selectedCompetitorId?: string) => {
  const { effectiveOrgId } = useAuth();
  const [posts, setPosts] = useState<CompetitorFacebookPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<TimePeriod>("1y");
  const [customDateRange, setCustomDateRange] = useState<{ start: Date; end: Date } | null>(null);

  useEffect(() => {
    const fetchPosts = async () => {
      if (!effectiveOrgId) return;

      setLoading(true);
      let query = supabase
        .from("organization_social_media_organique_competitor_facebook")
        .select("*")
        .eq("organization_id", effectiveOrgId)
        .order("posted_at", { ascending: true });

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

  const contentTypeStats: ContentTypeStats[] = useMemo(() => {
    const typeMap = new Map<string, CompetitorFacebookPost[]>();

    filteredPosts.forEach((post) => {
      const type = post.post_type || "post";
      if (!typeMap.has(type)) {
        typeMap.set(type, []);
      }
      typeMap.get(type)!.push(post);
    });

    const results: ContentTypeStats[] = [];

    typeMap.forEach((postList, type) => {
      const totalViews = postList.reduce((sum, post) => sum + (post.views_count || 0), 0);
      const totalEngagement = postList.reduce((sum, post) => {
        const views = post.views_count || 1;
        const likes = post.likes_count || 0;
        const comments = post.comments_count || 0;
        const shares = post.shares_count || 0;
        return sum + ((likes + comments + shares) / views) * 100;
      }, 0);

      results.push({
        type,
        label: type.charAt(0).toUpperCase() + type.slice(1),
        avgViews: postList.length > 0 ? Math.round(totalViews / postList.length) : 0,
        avgEngagementRate: postList.length > 0 ? Math.round((totalEngagement / postList.length) * 100) / 100 : 0,
        postCount: postList.length
      });
    });

    return results.sort((a, b) => b.postCount - a.postCount);
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
    posts: filteredPosts,
    period,
    setPeriod,
    customDateRange,
    setCustomDateRange,
    filteredPosts,
    engagementData,
    contentTypeStats,
    periodDays
  };
};
