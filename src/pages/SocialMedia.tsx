import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Header } from "@/components/dashboard/Header";
import { cn } from "@/lib/utils";
import {
  TrendingUp,
  Heart,
  MessageCircle,
  Users,
  Eye,
  Share2,
  BarChart3,
  Linkedin,
  Twitter,
  Instagram,
  Facebook,
  Globe,
  ArrowUp,
  ArrowDown,
  Image as ImageIcon,
  Video,
  FileText,
  ExternalLink,
  ThumbsUp,
  Repeat2,
  Bookmark
} from "lucide-react";

type Platform = "global" | "linkedin" | "twitter" | "instagram" | "facebook";

interface Post {
  id: string;
  platform: Platform;
  content: string;
  author: string;
  author_avatar: string;
  posted_at: string;
  likes: number;
  comments: number;
  shares: number;
  impressions: number;
  media_type?: "image" | "video" | "text";
  media_url?: string;
}

const platformsConfig = {
  global: {
    name: "Global",
    icon: Globe,
    color: "from-purple-500 to-pink-500",
    bgColor: "bg-gradient-to-br from-purple-500/10 to-pink-500/10",
    borderColor: "border-purple-500/20"
  },
  linkedin: {
    name: "LinkedIn",
    icon: Linkedin,
    color: "from-blue-600 to-blue-400",
    bgColor: "bg-gradient-to-br from-blue-500/10 to-blue-400/10",
    borderColor: "border-blue-500/20"
  },
  twitter: {
    name: "X (Twitter)",
    icon: Twitter,
    color: "from-gray-800 to-gray-600",
    bgColor: "bg-gradient-to-br from-gray-800/10 to-gray-600/10",
    borderColor: "border-gray-700/20"
  },
  instagram: {
    name: "Instagram",
    icon: Instagram,
    color: "from-pink-500 via-purple-500 to-orange-500",
    bgColor: "bg-gradient-to-br from-pink-500/10 via-purple-500/10 to-orange-500/10",
    borderColor: "border-pink-500/20"
  },
  facebook: {
    name: "Facebook",
    icon: Facebook,
    color: "from-blue-700 to-blue-500",
    bgColor: "bg-gradient-to-br from-blue-700/10 to-blue-500/10",
    borderColor: "border-blue-600/20"
  }
};

// Mock data for posts
const mockPosts: Post[] = [
  {
    id: "1",
    platform: "linkedin",
    content: "Excited to share our latest insights on digital transformation and how AI is reshaping the business landscape. 🚀",
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
    content: "Just launched our new product feature! Check it out and let us know what you think. 🎉 #ProductLaunch #Innovation",
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
    content: "Behind the scenes at our creative studio ✨ Creating magic every day!",
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
    content: "Join us for our upcoming webinar on sustainable business practices. Register now! 🌱",
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
    content: "Proud to announce our team's achievement in winning the Innovation Award 2024! 🏆 Thank you to everyone who supported us.",
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
    content: "Quick tip: Always test your ideas with real users before full launch. User feedback is gold! 💡",
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

const SocialMedia = () => {
  const [searchParams] = useSearchParams();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<Platform>("global");

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab === "paid") {
      // Handle paid tab
      return;
    }
  }, [searchParams]);

  // Filter posts based on selected platform
  const filteredPosts = selectedPlatform === "global"
    ? mockPosts
    : mockPosts.filter(post => post.platform === selectedPlatform);

  // Calculate KPIs
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
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Aujourd'hui";
    if (diffDays === 1) return "Hier";
    if (diffDays < 7) return `il y a ${diffDays} jours`;
    if (diffDays < 30) return `il y a ${Math.floor(diffDays / 7)} sem.`;
    return date.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
  };

  const getMediaIcon = (type?: string) => {
    switch (type) {
      case "image": return ImageIcon;
      case "video": return Video;
      default: return FileText;
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      <div
        className={cn(
          "flex-1 flex flex-col min-h-screen content-transition",
          sidebarCollapsed ? "ml-20" : "ml-72"
        )}
      >
        <Header showTitle={false} sidebarCollapsed={sidebarCollapsed} />

        <main className="flex-1 p-8 overflow-y-auto bg-gradient-to-br from-background via-background to-primary/5">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2 bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
              Social Media Organique
            </h1>
            <p className="text-muted-foreground">
              Suivez et analysez vos performances organiques sur les réseaux sociaux
            </p>
          </div>

          {/* Platform Switcher */}
          <div className="mb-8 flex items-center gap-3 flex-wrap">
            {Object.entries(platformsConfig).map(([key, config]) => {
              const Icon = config.icon;
              const isActive = selectedPlatform === key;

              return (
                <button
                  key={key}
                  onClick={() => setSelectedPlatform(key as Platform)}
                  className={cn(
                    "group relative px-6 py-3.5 rounded-2xl font-medium transition-all duration-300 border-2",
                    "hover:scale-105 hover:shadow-xl",
                    isActive
                      ? `${config.bgColor} ${config.borderColor} shadow-lg`
                      : "bg-card/50 border-border/50 hover:border-primary/30"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                      isActive
                        ? `bg-gradient-to-br ${config.color}`
                        : "bg-secondary"
                    )}>
                      <Icon className={cn(
                        "w-5 h-5",
                        isActive ? "text-white" : "text-muted-foreground"
                      )} />
                    </div>
                    <span className={cn(
                      "text-sm font-semibold",
                      isActive ? "text-foreground" : "text-muted-foreground"
                    )}>
                      {config.name}
                    </span>
                  </div>

                  {isActive && (
                    <div className={cn(
                      "absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-12 h-1 rounded-full",
                      `bg-gradient-to-r ${config.color}`
                    )} />
                  )}
                </button>
              );
            })}
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Total Engagement */}
            <div className="group relative bg-gradient-to-br from-card via-card to-primary/5 rounded-3xl p-6 border border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-1">
              <div className="flex items-start justify-between mb-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/30">
                  <Heart className="w-7 h-7 text-white" />
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-success/10 text-success text-xs font-semibold">
                  <ArrowUp className="w-3.5 h-3.5" />
                  12.5%
                </div>
              </div>
              <p className="text-muted-foreground text-sm font-medium mb-1">Total Engagement</p>
              <p className="text-4xl font-bold text-foreground mb-1">{formatNumber(kpis.engagement)}</p>
              <p className="text-xs text-muted-foreground">Likes + Comments + Shares</p>
            </div>

            {/* Comments */}
            <div className="group relative bg-gradient-to-br from-card via-card to-blue-500/5 rounded-3xl p-6 border border-border/50 hover:border-blue-500/30 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-1">
              <div className="flex items-start justify-between mb-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/30">
                  <MessageCircle className="w-7 h-7 text-white" />
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-success/10 text-success text-xs font-semibold">
                  <ArrowUp className="w-3.5 h-3.5" />
                  8.3%
                </div>
              </div>
              <p className="text-muted-foreground text-sm font-medium mb-1">Commentaires</p>
              <p className="text-4xl font-bold text-foreground mb-1">{formatNumber(kpis.comments)}</p>
              <p className="text-xs text-muted-foreground">Sur {kpis.posts} posts</p>
            </div>

            {/* Engagement Rate */}
            <div className="group relative bg-gradient-to-br from-card via-card to-emerald-500/5 rounded-3xl p-6 border border-border/50 hover:border-emerald-500/30 transition-all duration-300 hover:shadow-2xl hover:shadow-emerald-500/10 hover:-translate-y-1">
              <div className="flex items-start justify-between mb-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                  <TrendingUp className="w-7 h-7 text-white" />
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-success/10 text-success text-xs font-semibold">
                  <ArrowUp className="w-3.5 h-3.5" />
                  15.2%
                </div>
              </div>
              <p className="text-muted-foreground text-sm font-medium mb-1">Taux d'engagement</p>
              <p className="text-4xl font-bold text-foreground mb-1">{kpis.engagementRate}%</p>
              <p className="text-xs text-muted-foreground">Excellent performance</p>
            </div>

            {/* Impressions */}
            <div className="group relative bg-gradient-to-br from-card via-card to-orange-500/5 rounded-3xl p-6 border border-border/50 hover:border-orange-500/30 transition-all duration-300 hover:shadow-2xl hover:shadow-orange-500/10 hover:-translate-y-1">
              <div className="flex items-start justify-between mb-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-lg shadow-orange-500/30">
                  <Eye className="w-7 h-7 text-white" />
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-destructive/10 text-destructive text-xs font-semibold">
                  <ArrowDown className="w-3.5 h-3.5" />
                  2.1%
                </div>
              </div>
              <p className="text-muted-foreground text-sm font-medium mb-1">Impressions</p>
              <p className="text-4xl font-bold text-foreground mb-1">{formatNumber(kpis.impressions)}</p>
              <p className="text-xs text-muted-foreground">Portée totale</p>
            </div>
          </div>

          {/* Secondary KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-card/50 backdrop-blur-sm rounded-2xl p-5 border border-border/50 hover:border-primary/20 transition-all">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500/20 to-pink-500/20 flex items-center justify-center">
                  <ThumbsUp className="w-6 h-6 text-red-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{formatNumber(kpis.likes)}</p>
                  <p className="text-sm text-muted-foreground">Total Likes</p>
                </div>
              </div>
            </div>

            <div className="bg-card/50 backdrop-blur-sm rounded-2xl p-5 border border-border/50 hover:border-primary/20 transition-all">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center">
                  <Repeat2 className="w-6 h-6 text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{formatNumber(kpis.shares)}</p>
                  <p className="text-sm text-muted-foreground">Total Partages</p>
                </div>
              </div>
            </div>

            <div className="bg-card/50 backdrop-blur-sm rounded-2xl p-5 border border-border/50 hover:border-primary/20 transition-all">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{kpis.posts}</p>
                  <p className="text-sm text-muted-foreground">Posts publiés</p>
                </div>
              </div>
            </div>
          </div>

          {/* Posts Grid */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-foreground">Posts récents</h2>
              <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-all font-medium shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40">
                <ExternalLink className="w-4 h-4" />
                Voir tous les posts
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPosts.map((post) => {
                const PlatformIcon = platformsConfig[post.platform].icon;
                const MediaIcon = getMediaIcon(post.media_type);

                return (
                  <div
                    key={post.id}
                    className="group bg-card rounded-3xl border border-border/50 overflow-hidden hover:border-primary/30 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
                  >
                    {/* Card Header */}
                    <div className="p-6 pb-4">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={post.author_avatar}
                            alt={post.author}
                            className="w-11 h-11 rounded-full border-2 border-border"
                          />
                          <div>
                            <p className="text-sm font-semibold text-foreground">{post.author}</p>
                            <p className="text-xs text-muted-foreground">{formatDate(post.posted_at)}</p>
                          </div>
                        </div>
                        <div className={cn(
                          "w-9 h-9 rounded-xl flex items-center justify-center",
                          platformsConfig[post.platform].bgColor
                        )}>
                          <PlatformIcon className="w-4 h-4" />
                        </div>
                      </div>

                      {/* Content */}
                      <p className="text-sm text-foreground leading-relaxed mb-4 line-clamp-3">
                        {post.content}
                      </p>

                      {/* Media indicator */}
                      {post.media_type && (
                        <div className="flex items-center gap-2 mb-4 px-3 py-2 rounded-xl bg-secondary/50 w-fit">
                          <MediaIcon className="w-4 h-4 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground font-medium capitalize">
                            {post.media_type}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Card Footer - Stats */}
                    <div className="px-6 py-4 bg-secondary/30 border-t border-border/50">
                      <div className="grid grid-cols-4 gap-3">
                        <div className="text-center">
                          <p className="text-xs text-muted-foreground mb-1">Likes</p>
                          <p className="text-sm font-bold text-foreground">{formatNumber(post.likes)}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-muted-foreground mb-1">Comments</p>
                          <p className="text-sm font-bold text-foreground">{formatNumber(post.comments)}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-muted-foreground mb-1">Shares</p>
                          <p className="text-sm font-bold text-foreground">{formatNumber(post.shares)}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-muted-foreground mb-1">Views</p>
                          <p className="text-sm font-bold text-foreground">{formatNumber(post.impressions)}</p>
                        </div>
                      </div>
                    </div>

                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                  </div>
                );
              })}
            </div>

            {filteredPosts.length === 0 && (
              <div className="text-center py-16 bg-card/50 rounded-3xl border border-dashed border-border">
                <Globe className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
                <p className="text-lg font-semibold text-muted-foreground mb-2">
                  Aucun post disponible
                </p>
                <p className="text-sm text-muted-foreground">
                  Aucun contenu organique trouvé pour cette plateforme
                </p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default SocialMedia;
