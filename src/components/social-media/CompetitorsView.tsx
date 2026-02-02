import { useState } from "react";
import { cn } from "@/lib/utils";
import { Plus, LayoutGrid, BarChart3, Users, TrendingUp, CalendarDays, Hash, Film, Minus, TrendingDown } from "lucide-react";
import { CompetitorFilter } from "./CompetitorFilter";
import { PlatformDropdown, Platform } from "./PlatformDropdown";
import { ManageCompetitorsModal } from "./ManageCompetitorsModal";
import { useCompetitors } from "@/hooks/useCompetitors";
import { CompetitorTikTokPostsView } from "./CompetitorTikTokPostsView";
import { CompetitorFacebookPostsView } from "./CompetitorFacebookPostsView";
import { CompetitorLinkedInPostsView } from "./CompetitorLinkedInPostsView";
import { CompetitorInstagramPostsView } from "./CompetitorInstagramPostsView";
import { AllPlatformsCompetitorView } from "./AllPlatformsCompetitorView";
import { useCompetitorTikTokAnalytics } from "@/hooks/useCompetitorTikTokAnalytics";
import { useCompetitorFacebookAnalytics } from "@/hooks/useCompetitorFacebookAnalytics";
import { useCompetitorLinkedInAnalytics } from "@/hooks/useCompetitorLinkedInAnalytics";
import { useCompetitorInstagramAnalytics } from "@/hooks/useCompetitorInstagramAnalytics";
import { ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, ZAxis, Tooltip, Cell, BarChart, Bar, AreaChart, Area, CartesianGrid, ReferenceDot } from "recharts";
import { format, eachWeekOfInterval, subDays, parseISO, isWithinInterval } from "date-fns";
import { fr } from "date-fns/locale";

interface CompetitorsViewProps {
  selectedPlatform: Platform;
  onPlatformChange: (platform: Platform) => void;
}

const getColorByEngagement = (rate: number): string => {
  if (rate >= 5) return "hsl(142, 71%, 45%)";
  if (rate >= 3) return "hsl(252, 85%, 60%)";
  if (rate >= 1) return "hsl(38, 92%, 50%)";
  return "hsl(0, 84%, 60%)";
};

const GenericEngagementChart = ({ data }: { data: Array<{ id: string; date: Date; engagementRate: number; likes: number; comments: number; caption: string }> }) => {
  const chartData = data.map((point) => ({
    ...point,
    x: point.date.getTime(),
    y: point.engagementRate,
    z: Math.max(point.likes + point.comments, 100)
  }));

  const avgEngagement = data.length > 0 
    ? Math.round((data.reduce((sum, d) => sum + d.engagementRate, 0) / data.length) * 100) / 100 
    : 0;

  if (data.length === 0) {
    return <div className="h-[250px] flex items-center justify-center text-muted-foreground">Aucune donnée disponible</div>;
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <TrendingUp className="w-4 h-4" />
        Moyenne: <span className="font-semibold text-foreground">{avgEngagement}%</span>
      </div>
      <div className="h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 10, right: 10, bottom: 20, left: 0 }}>
            <XAxis dataKey="x" type="number" domain={["dataMin", "dataMax"]} tickFormatter={(v) => format(new Date(v), "dd/MM", { locale: fr })} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={{ stroke: "hsl(var(--border))" }} tickLine={false} />
            <YAxis dataKey="y" type="number" domain={[0, "auto"]} tickFormatter={(v) => `${v}%`} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={{ stroke: "hsl(var(--border))" }} tickLine={false} />
            <ZAxis dataKey="z" type="number" range={[40, 300]} />
            <Tooltip content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const d = payload[0].payload;
              return (
                <div className="bg-card border border-border rounded-lg p-3 shadow-xl text-sm">
                  <p className="text-xs text-muted-foreground mb-1">{format(new Date(d.date), "dd MMMM yyyy", { locale: fr })}</p>
                  <p className="font-bold text-foreground">{d.engagementRate}% engagement</p>
                </div>
              );
            }} />
            <Scatter data={chartData}>
              {chartData.map((entry, index) => (
                <Cell key={index} fill={getColorByEngagement(entry.engagementRate)} fillOpacity={0.8} />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

const GenericHashtagChart = ({ data }: { data: Array<{ hashtag: string; usageCount: number; avgEngagementRate: number }> }) => {
  if (data.length === 0) {
    return <div className="h-[250px] flex items-center justify-center text-muted-foreground">Aucun hashtag trouvé</div>;
  }
  return (
    <div className="h-[250px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data.slice(0, 8)} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
          <XAxis type="number" tickFormatter={(v) => `${v}%`} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={{ stroke: "hsl(var(--border))" }} />
          <YAxis type="category" dataKey="hashtag" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} width={60} tickFormatter={(v) => `#${v.slice(0,8)}`} />
          <Tooltip content={({ active, payload }) => {
            if (!active || !payload?.length) return null;
            const d = payload[0].payload;
            return (
              <div className="bg-card border border-border rounded-lg p-3 shadow-xl text-sm">
                <p className="font-bold text-foreground">#{d.hashtag}</p>
                <p className="text-muted-foreground">Engagement: {d.avgEngagementRate}%</p>
                <p className="text-muted-foreground">Utilisé {d.usageCount}x</p>
              </div>
            );
          }} />
          <Bar dataKey="avgEngagementRate" fill="hsl(252, 85%, 60%)" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

const GenericContentTypeChart = ({ data }: { data: Array<{ type: string; label: string; postCount: number; avgEngagementRate: number }> }) => {
  if (data.length === 0) {
    return <div className="h-[250px] flex items-center justify-center text-muted-foreground">Aucun type de contenu</div>;
  }
  return (
    <div className="h-[250px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
          <XAxis dataKey="label" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={{ stroke: "hsl(var(--border))" }} />
          <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} />
          <Tooltip content={({ active, payload }) => {
            if (!active || !payload?.length) return null;
            const d = payload[0].payload;
            return (
              <div className="bg-card border border-border rounded-lg p-3 shadow-xl text-sm">
                <p className="font-bold text-foreground">{d.label}</p>
                <p className="text-muted-foreground">{d.postCount} posts</p>
                <p className="text-muted-foreground">Engagement: {d.avgEngagementRate}%</p>
              </div>
            );
          }} />
          <Bar dataKey="postCount" fill="hsl(199, 89%, 48%)" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

const GenericRegularityChart = ({ posts, periodDays }: { posts: Array<{ posted_at: string | null; created_at: string }>; periodDays: number }) => {
  const now = new Date();
  const startDate = subDays(now, periodDays);
  const weeks = eachWeekOfInterval({ start: startDate, end: now }, { weekStartsOn: 1 });

  const chartData = weeks.map((weekStart) => {
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    const weekPosts = posts.filter((post) => {
      const postDate = post.posted_at ? parseISO(post.posted_at) : parseISO(post.created_at);
      return isWithinInterval(postDate, { start: weekStart, end: weekEnd });
    });
    return {
      weekLabel: format(weekStart, "d MMM", { locale: fr }),
      postCount: weekPosts.length
    };
  });

  const totalPosts = chartData.reduce((sum, d) => sum + d.postCount, 0);
  const avgPerWeek = chartData.length > 0 ? (totalPosts / chartData.length).toFixed(1) : "0";

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
          <CalendarDays className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-base font-semibold text-foreground">Régularité des publications</h3>
          <p className="text-xs text-muted-foreground">Moyenne: {avgPerWeek} posts/semaine</p>
        </div>
      </div>
      <div className="h-[180px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
            <XAxis dataKey="weekLabel" tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} axisLine={{ stroke: "hsl(var(--border))" }} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} allowDecimals={false} />
            <Tooltip content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const d = payload[0].payload;
              return (
                <div className="bg-card border border-border rounded-lg p-3 shadow-xl text-sm">
                  <p className="text-foreground">Semaine du {d.weekLabel}</p>
                  <p className="text-muted-foreground">{d.postCount} publications</p>
                </div>
              );
            }} />
            <Bar dataKey="postCount" radius={[4, 4, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={index} fill={entry.postCount >= 3 ? "hsl(142, 76%, 36%)" : entry.postCount >= 2 ? "hsl(173, 80%, 40%)" : entry.postCount >= 1 ? "hsl(199, 89%, 48%)" : "hsl(var(--muted))"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

const CompetitorTikTokAnalyticsView = ({ competitorId }: { competitorId?: string }) => {
  const analytics = useCompetitorTikTokAnalytics(competitorId);
  const periods = [{ value: "7d", label: "7j" }, { value: "30d", label: "30j" }, { value: "3m", label: "3m" }, { value: "6m", label: "6m" }, { value: "1y", label: "1an" }];

  if (analytics.loading) return <div className="flex items-center justify-center py-16"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        {periods.map((p) => (
          <button key={p.value} onClick={() => analytics.setPeriod(p.value as any)} className={cn("px-3 py-1.5 text-sm font-medium rounded-lg transition-colors", analytics.period === p.value ? "bg-primary text-primary-foreground" : "bg-muted/50 text-muted-foreground hover:text-foreground")}>{p.label}</button>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl bg-card border border-border/50">
          <h3 className="text-base font-semibold text-foreground mb-4">Engagement par post</h3>
          <GenericEngagementChart data={analytics.engagementData.map(d => ({ ...d, views: d.views || 0 }))} />
        </div>
        <div className="p-6 rounded-2xl bg-card border border-border/50">
          <h3 className="text-base font-semibold text-foreground mb-4">Top Hashtags</h3>
          <GenericHashtagChart data={analytics.hashtagPerformance} />
        </div>
        <div className="p-6 rounded-2xl bg-card border border-border/50">
          <h3 className="text-base font-semibold text-foreground mb-4">Types de contenu</h3>
          <GenericContentTypeChart data={analytics.contentTypeStats} />
        </div>
        <div className="p-6 rounded-2xl bg-card border border-border/50">
          <GenericRegularityChart posts={analytics.filteredPosts.map(p => ({ posted_at: p.posted_at, created_at: p.created_at }))} periodDays={analytics.periodDays} />
        </div>
      </div>
    </div>
  );
};

const CompetitorFacebookAnalyticsView = ({ competitorId }: { competitorId?: string }) => {
  const analytics = useCompetitorFacebookAnalytics(competitorId);
  const periods = [{ value: "7d", label: "7j" }, { value: "30d", label: "30j" }, { value: "3m", label: "3m" }, { value: "6m", label: "6m" }, { value: "1y", label: "1an" }];

  if (analytics.loading) return <div className="flex items-center justify-center py-16"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        {periods.map((p) => (
          <button key={p.value} onClick={() => analytics.setPeriod(p.value as any)} className={cn("px-3 py-1.5 text-sm font-medium rounded-lg transition-colors", analytics.period === p.value ? "bg-primary text-primary-foreground" : "bg-muted/50 text-muted-foreground hover:text-foreground")}>{p.label}</button>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl bg-card border border-border/50">
          <h3 className="text-base font-semibold text-foreground mb-4">Engagement par post</h3>
          <GenericEngagementChart data={analytics.engagementData} />
        </div>
        <div className="p-6 rounded-2xl bg-card border border-border/50">
          <h3 className="text-base font-semibold text-foreground mb-4">Types de contenu</h3>
          <GenericContentTypeChart data={analytics.contentTypeStats} />
        </div>
        <div className="lg:col-span-2 p-6 rounded-2xl bg-card border border-border/50">
          <GenericRegularityChart posts={analytics.filteredPosts.map(p => ({ posted_at: p.posted_at, created_at: p.created_at }))} periodDays={analytics.periodDays} />
        </div>
      </div>
    </div>
  );
};

const CompetitorLinkedInAnalyticsView = ({ competitorId }: { competitorId?: string }) => {
  const analytics = useCompetitorLinkedInAnalytics(competitorId);
  const periods = [{ value: "7d", label: "7j" }, { value: "30d", label: "30j" }, { value: "3m", label: "3m" }, { value: "6m", label: "6m" }, { value: "1y", label: "1an" }];

  if (analytics.loading) return <div className="flex items-center justify-center py-16"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        {periods.map((p) => (
          <button key={p.value} onClick={() => analytics.setPeriod(p.value as any)} className={cn("px-3 py-1.5 text-sm font-medium rounded-lg transition-colors", analytics.period === p.value ? "bg-primary text-primary-foreground" : "bg-muted/50 text-muted-foreground hover:text-foreground")}>{p.label}</button>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl bg-card border border-border/50">
          <h3 className="text-base font-semibold text-foreground mb-4">Engagement par post</h3>
          <GenericEngagementChart data={analytics.engagementData.map(d => ({ id: d.id, date: d.date, engagementRate: d.engagementRate, likes: d.likes, comments: d.comments, caption: d.caption }))} />
        </div>
        <div className="p-6 rounded-2xl bg-card border border-border/50">
          <h3 className="text-base font-semibold text-foreground mb-4">Types de contenu</h3>
          <GenericContentTypeChart data={analytics.contentTypeStats.map(d => ({ type: d.type, label: d.label, postCount: d.postCount, avgEngagementRate: d.avgEngagementRate }))} />
        </div>
        <div className="lg:col-span-2 p-6 rounded-2xl bg-card border border-border/50">
          <GenericRegularityChart posts={analytics.filteredPosts.map(p => ({ posted_at: p.posted_at, created_at: p.created_at }))} periodDays={analytics.periodDays} />
        </div>
      </div>
    </div>
  );
};

const CompetitorInstagramAnalyticsView = ({ competitorId }: { competitorId?: string }) => {
  const analytics = useCompetitorInstagramAnalytics(competitorId);
  const periods = [{ value: "7d", label: "7j" }, { value: "30d", label: "30j" }, { value: "3m", label: "3m" }, { value: "6m", label: "6m" }, { value: "1y", label: "1an" }];

  if (analytics.loading) return <div className="flex items-center justify-center py-16"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        {periods.map((p) => (
          <button key={p.value} onClick={() => analytics.setPeriod(p.value as any)} className={cn("px-3 py-1.5 text-sm font-medium rounded-lg transition-colors", analytics.period === p.value ? "bg-primary text-primary-foreground" : "bg-muted/50 text-muted-foreground hover:text-foreground")}>{p.label}</button>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl bg-card border border-border/50">
          <h3 className="text-base font-semibold text-foreground mb-4">Engagement par post</h3>
          <GenericEngagementChart data={analytics.engagementData.map(d => ({ id: d.id, date: d.date, engagementRate: d.engagementRate, likes: d.likes, comments: d.comments, caption: d.caption }))} />
        </div>
        <div className="p-6 rounded-2xl bg-card border border-border/50">
          <h3 className="text-base font-semibold text-foreground mb-4">Top Hashtags</h3>
          <GenericHashtagChart data={analytics.hashtagPerformance} />
        </div>
        <div className="p-6 rounded-2xl bg-card border border-border/50">
          <h3 className="text-base font-semibold text-foreground mb-4">Types de contenu</h3>
          <GenericContentTypeChart data={analytics.contentTypeStats} />
        </div>
        <div className="p-6 rounded-2xl bg-card border border-border/50">
          <GenericRegularityChart posts={analytics.filteredPosts.map(p => ({ posted_at: p.posted_at, created_at: p.created_at }))} periodDays={analytics.periodDays} />
        </div>
      </div>
    </div>
  );
};

export const CompetitorsView = ({ selectedPlatform, onPlatformChange }: CompetitorsViewProps) => {
  const [selectedCompetitor, setSelectedCompetitor] = useState<string>("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const { competitors, loading } = useCompetitors();

  if (selectedPlatform === "global") {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <CompetitorFilter competitors={competitors.map(c => ({ id: c.id, name: c.name, logo: c.logo_url || undefined }))} value={selectedCompetitor} onChange={setSelectedCompetitor} />
            <PlatformDropdown value={selectedPlatform} onChange={onPlatformChange} />
          </div>
          <button onClick={() => setModalOpen(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200 text-sm font-medium shadow-lg shadow-primary/25">
            <Plus className="w-4 h-4" />
            Ajouter un concurrent
          </button>
        </div>
        <AllPlatformsCompetitorView selectedCompetitorId={selectedCompetitor === "all" ? undefined : selectedCompetitor} />
        <ManageCompetitorsModal open={modalOpen} onOpenChange={setModalOpen} />
      </div>
    );
  }

  if (selectedPlatform === "tiktok" || selectedPlatform === "facebook" || selectedPlatform === "linkedin" || selectedPlatform === "instagram") {
    const PostsViewComponent = selectedPlatform === "tiktok" ? CompetitorTikTokPostsView : selectedPlatform === "facebook" ? CompetitorFacebookPostsView : selectedPlatform === "instagram" ? CompetitorInstagramPostsView : CompetitorLinkedInPostsView;
    const AnalyticsViewComponent = selectedPlatform === "tiktok" ? CompetitorTikTokAnalyticsView : selectedPlatform === "facebook" ? CompetitorFacebookAnalyticsView : selectedPlatform === "instagram" ? CompetitorInstagramAnalyticsView : CompetitorLinkedInAnalyticsView;

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <CompetitorFilter competitors={competitors.map(c => ({ id: c.id, name: c.name, logo: c.logo_url || undefined }))} value={selectedCompetitor} onChange={setSelectedCompetitor} />
            <PlatformDropdown value={selectedPlatform} onChange={onPlatformChange} />
            <div className="flex items-center gap-1 p-1 bg-muted/50 rounded-xl">
              <button onClick={() => setShowAnalytics(false)} className={cn("flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200", !showAnalytics ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}>
                <LayoutGrid className="w-4 h-4" />
                Publications
              </button>
              <button onClick={() => setShowAnalytics(true)} className={cn("flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200", showAnalytics ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}>
                <BarChart3 className="w-4 h-4" />
                Analyse
              </button>
            </div>
          </div>
          <button onClick={() => setModalOpen(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200 text-sm font-medium shadow-lg shadow-primary/25">
            <Plus className="w-4 h-4" />
            Ajouter un concurrent
          </button>
        </div>
        {showAnalytics ? <AnalyticsViewComponent competitorId={selectedCompetitor === "all" ? undefined : selectedCompetitor} /> : <PostsViewComponent selectedCompetitorId={selectedCompetitor === "all" ? undefined : selectedCompetitor} />}
        <ManageCompetitorsModal open={modalOpen} onOpenChange={setModalOpen} />
      </div>
    );
  }

  return (
    <div className="text-center py-16 rounded-2xl bg-card border border-dashed border-border">
      <Users className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
      <p className="text-base font-medium text-muted-foreground mb-2">Sélectionnez une plateforme</p>
      <p className="text-sm text-muted-foreground">Choisissez une plateforme pour voir les publications des concurrents</p>
    </div>
  );
};
