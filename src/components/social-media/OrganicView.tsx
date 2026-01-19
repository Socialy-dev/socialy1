import { cn } from "@/lib/utils";
import {
  TrendingUp,
  TrendingDown,
  Heart,
  MessageCircle,
  Eye,
  Share2,
  ArrowUpRight,
  BarChart3,
  ThumbsUp,
  Repeat2,
  ChevronRight,
  Globe
} from "lucide-react";
import { PlatformDropdown, Platform, platformsConfig } from "./PlatformDropdown";
import { TikTokPostsView } from "./TikTokPostsView";

interface Post {
  id: string;
  platform: Exclude<Platform, "global" | "tiktok">;
  content: string;
  author: string;
  author_avatar: string;
  posted_at: string;
  likes: number;
  comments: number;
  shares: number;
  impressions: number;
  media_type?: "image" | "video" | "text";
}

const mockPosts: Post[] = [
  {
    id: "1",
    platform: "linkedin",
    content: "Excited to share our latest insights on digital transformation and how AI is reshaping the business landscape.",
    author: "Sophie Martin",
    author_avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sophie",
    posted_at: "2024-01-10T10:30:00Z",
    likes: 234,
    comments: 45,
    shares: 28,
    impressions: 5420,
    media_type: "image"
  },
  {
    id: "2",
    platform: "twitter",
    content: "Just launched our new product feature! Check it out and let us know what you think. #ProductLaunch #Innovation",
    author: "Marc Dubois",
    author_avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Marc",
    posted_at: "2024-01-09T15:20:00Z",
    likes: 567,
    comments: 89,
    shares: 123,
    impressions: 12340,
    media_type: "video"
  },
  {
    id: "3",
    platform: "instagram",
    content: "Behind the scenes at our creative studio. Creating magic every day!",
    author: "Emma Laurent",
    author_avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Emma",
    posted_at: "2024-01-08T09:15:00Z",
    likes: 892,
    comments: 67,
    shares: 45,
    impressions: 8920,
    media_type: "image"
  },
  {
    id: "4",
    platform: "facebook",
    content: "Join us for our upcoming webinar on sustainable business practices. Register now!",
    author: "Thomas Bernard",
    author_avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Thomas",
    posted_at: "2024-01-07T14:00:00Z",
    likes: 345,
    comments: 56,
    shares: 78,
    impressions: 6780,
    media_type: "text"
  },
  {
    id: "5",
    platform: "linkedin",
    content: "Proud to announce our team's achievement in winning the Innovation Award 2024! Thank you to everyone who supported us.",
    author: "Julie Rousseau",
    author_avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Julie",
    posted_at: "2024-01-06T11:45:00Z",
    likes: 678,
    comments: 123,
    shares: 234,
    impressions: 15670,
    media_type: "image"
  },
  {
    id: "6",
    platform: "twitter",
    content: "Quick tip: Always test your ideas with real users before full launch. User feedback is gold!",
    author: "Pierre Durand",
    author_avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Pierre",
    posted_at: "2024-01-05T16:30:00Z",
    likes: 423,
    comments: 78,
    shares: 156,
    impressions: 8920,
    media_type: "text"
  }
];

interface OrganicViewProps {
  selectedPlatform: Platform;
  onPlatformChange: (platform: Platform) => void;
}

export const OrganicView = ({ selectedPlatform, onPlatformChange }: OrganicViewProps) => {
  if (selectedPlatform === "tiktok") {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <PlatformDropdown value={selectedPlatform} onChange={onPlatformChange} />
        </div>
        <TikTokPostsView />
      </div>
    );
  }

  const filteredPosts = selectedPlatform === "global"
    ? mockPosts
    : mockPosts.filter(post => post.platform === selectedPlatform);

  const calculateKPIs = () => {
    const posts = selectedPlatform === "global" ? mockPosts : filteredPosts;

    const totalLikes = posts.reduce((sum, post) => sum + post.likes, 0);
    const totalComments = posts.reduce((sum, post) => sum + post.comments, 0);
    const totalShares = posts.reduce((sum, post) => sum + post.shares, 0);
    const totalImpressions = posts.reduce((sum, post) => sum + post.impressions, 0);
    const totalEngagement = totalLikes + totalComments + totalShares;
    const engagementRate = totalImpressions > 0
      ? ((totalEngagement / totalImpressions) * 100).toFixed(2)
      : "0.00";

    return {
      likes: totalLikes,
      comments: totalComments,
      shares: totalShares,
      impressions: totalImpressions,
      engagement: totalEngagement,
      engagementRate,
      posts: posts.length
    };
  };

  const kpis = calculateKPIs();

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <PlatformDropdown value={selectedPlatform} onChange={onPlatformChange} />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="group relative p-5 rounded-2xl bg-card border border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 cursor-pointer">
          <div className="flex items-start justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <div className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold bg-success/10 text-success">
              <TrendingUp className="w-3 h-3" />
              +12%
            </div>
          </div>
          <div className="flex items-baseline gap-1 mb-1">
            <span className="text-2xl font-bold text-foreground tracking-tight">{formatNumber(kpis.engagement)}</span>
          </div>
          <p className="text-sm text-muted-foreground font-medium">Engagement total</p>
          <div className="absolute top-5 right-5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <ArrowUpRight className="w-4 h-4 text-primary" />
          </div>
        </div>

        <div className="group relative p-5 rounded-2xl bg-card border border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 cursor-pointer">
          <div className="flex items-start justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center shadow-lg">
              <Eye className="w-5 h-5 text-white" />
            </div>
            <div className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold bg-danger/10 text-danger">
              <TrendingDown className="w-3 h-3" />
              -2%
            </div>
          </div>
          <div className="flex items-baseline gap-1 mb-1">
            <span className="text-2xl font-bold text-foreground tracking-tight">{formatNumber(kpis.impressions)}</span>
          </div>
          <p className="text-sm text-muted-foreground font-medium">Impressions</p>
        </div>

        <div className="group relative p-5 rounded-2xl bg-card border border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 cursor-pointer">
          <div className="flex items-start justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold bg-success/10 text-success">
              <TrendingUp className="w-3 h-3" />
              +15%
            </div>
          </div>
          <div className="flex items-baseline gap-1 mb-1">
            <span className="text-2xl font-bold text-foreground tracking-tight">{kpis.engagementRate}</span>
            <span className="text-sm font-medium text-muted-foreground">%</span>
          </div>
          <p className="text-sm text-muted-foreground font-medium">Taux d'engagement</p>
        </div>

        <div className="group relative p-5 rounded-2xl bg-card border border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 cursor-pointer">
          <div className="flex items-start justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <div className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold bg-success/10 text-success">
              <TrendingUp className="w-3 h-3" />
              +8%
            </div>
          </div>
          <div className="flex items-baseline gap-1 mb-1">
            <span className="text-2xl font-bold text-foreground tracking-tight">{kpis.posts}</span>
            <span className="text-sm font-medium text-muted-foreground">posts</span>
          </div>
          <p className="text-sm text-muted-foreground font-medium">Publications</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="flex items-center gap-3 p-4 rounded-xl bg-card border border-border/50">
          <div className="w-9 h-9 rounded-lg bg-red-100 dark:bg-red-950/50 flex items-center justify-center">
            <ThumbsUp className="w-4 h-4 text-red-500" />
          </div>
          <div>
            <p className="text-lg font-bold text-foreground">{formatNumber(kpis.likes)}</p>
            <p className="text-xs text-muted-foreground">Likes</p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-4 rounded-xl bg-card border border-border/50">
          <div className="w-9 h-9 rounded-lg bg-blue-100 dark:bg-blue-950/50 flex items-center justify-center">
            <MessageCircle className="w-4 h-4 text-blue-500" />
          </div>
          <div>
            <p className="text-lg font-bold text-foreground">{formatNumber(kpis.comments)}</p>
            <p className="text-xs text-muted-foreground">Commentaires</p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-4 rounded-xl bg-card border border-border/50">
          <div className="w-9 h-9 rounded-lg bg-green-100 dark:bg-green-950/50 flex items-center justify-center">
            <Repeat2 className="w-4 h-4 text-green-500" />
          </div>
          <div>
            <p className="text-lg font-bold text-foreground">{formatNumber(kpis.shares)}</p>
            <p className="text-xs text-muted-foreground">Partages</p>
          </div>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-foreground">Posts recents</h2>
          <button className="flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary/80 transition-colors">
            Voir tout
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPosts.map((post) => {
            const PlatformIcon = platformsConfig[post.platform].icon;
            const platformConfig = platformsConfig[post.platform];

            return (
              <div
                key={post.id}
                className="group p-4 rounded-2xl bg-card border border-border/50 hover:border-primary/20 hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={post.author_avatar}
                      alt={post.author}
                      className="w-8 h-8 rounded-full"
                    />
                    <div>
                      <p className="text-sm font-medium text-foreground">{post.author}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(post.posted_at)}</p>
                    </div>
                  </div>
                  <div className={cn(
                    "w-7 h-7 rounded-lg flex items-center justify-center bg-gradient-to-br",
                    platformConfig.gradient
                  )}>
                    <PlatformIcon className="w-3.5 h-3.5 text-white" />
                  </div>
                </div>

                <p className="text-sm text-foreground/80 leading-relaxed mb-3 line-clamp-2">
                  {post.content}
                </p>

                <div className="flex items-center gap-4 pt-3 border-t border-border/50">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Heart className="w-3.5 h-3.5" />
                    <span>{formatNumber(post.likes)}</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>{formatNumber(post.comments)}</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Share2 className="w-3.5 h-3.5" />
                    <span>{formatNumber(post.shares)}</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground ml-auto">
                    <Eye className="w-3.5 h-3.5" />
                    <span>{formatNumber(post.impressions)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredPosts.length === 0 && (
          <div className="text-center py-12 rounded-2xl bg-card border border-dashed border-border">
            <Globe className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm font-medium text-muted-foreground mb-1">
              Aucun post disponible
            </p>
            <p className="text-xs text-muted-foreground">
              Aucun contenu trouvé pour cette plateforme
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
