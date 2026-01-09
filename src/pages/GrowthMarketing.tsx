import { useState } from "react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Header } from "@/components/dashboard/Header";
import { cn } from "@/lib/utils";
import { 
  TrendingUp, 
  Linkedin, 
  FileText, 
  Palette, 
  Video, 
  ChevronRight,
  Eye,
  ThumbsUp,
  MessageCircle,
  Users,
  FileEdit,
  Sparkles,
  Clock,
  Share2,
  BarChart3,
  ArrowUpRight,
  PenLine,
  Send
} from "lucide-react";

type ContentType = "linkedin" | "brief" | "visual" | "video";
type ViewMode = "menu" | "form";

interface ContentOption {
  id: ContentType;
  label: string;
  description: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
}

const contentOptions: ContentOption[] = [
  {
    id: "linkedin",
    label: "Post LinkedIn",
    description: "Créer un post engageant",
    icon: Linkedin,
    color: "text-[#0A66C2]",
    bgColor: "bg-[#0A66C2]/10"
  },
  {
    id: "brief",
    label: "Brief Client",
    description: "Document de cadrage",
    icon: FileText,
    color: "text-emerald-500",
    bgColor: "bg-emerald-500/10"
  },
  {
    id: "visual",
    label: "Création Visuelle",
    description: "Visuels & créations",
    icon: Palette,
    color: "text-purple-500",
    bgColor: "bg-purple-500/10"
  },
  {
    id: "video",
    label: "Création Vidéo",
    description: "Vidéos générées par IA",
    icon: Video,
    color: "text-rose-500",
    bgColor: "bg-rose-500/10"
  }
];

// Mock data for LinkedIn stats
const linkedinStats = {
  posts: 15,
  views: "124.5k",
  engagement: "4.2%",
  followers: 2847,
  growth: "+12.4%"
};

// Mock recent posts
const recentPosts = [
  {
    id: "1",
    title: "Le micro-learning, c'est l'art de maximiser l'impact de la formation...",
    date: "il y a 3 jours",
    likes: 12,
    comments: 3,
    shares: 2,
    reposts: 0,
    source: "linkedin"
  },
  {
    id: "2", 
    title: "30 milliards d'euros. C'est le montant investi dans les formations...",
    date: "il y a 1 semaine",
    likes: 24,
    comments: 5,
    shares: 8,
    reposts: 0,
    source: "linkedin"
  },
  {
    id: "3",
    title: "Ne sous-estime pas le pouvoir de partager ton expertise en ligne...",
    date: "il y a 2 semaines",
    likes: 18,
    comments: 2,
    shares: 4,
    reposts: 0,
    source: "generated"
  }
];

const GrowthMarketing = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState<ContentType>("linkedin");
  const [viewMode, setViewMode] = useState<ViewMode>("menu");
  const [selectedContentType, setSelectedContentType] = useState<ContentType | null>(null);
  const [postFilter, setPostFilter] = useState<"all" | "linkedin" | "generated">("all");
  
  // Form states for LinkedIn post
  const [postSubject, setPostSubject] = useState("");
  const [postObjective, setPostObjective] = useState("");
  const [postTone, setPostTone] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const handleContentSelect = (type: ContentType) => {
    setSelectedContentType(type);
    setViewMode("form");
  };

  const handleBackToMenu = () => {
    setViewMode("menu");
    setSelectedContentType(null);
    setPostSubject("");
    setPostObjective("");
    setPostTone("");
  };

  const handleGeneratePost = async () => {
    setIsGenerating(true);
    // TODO: Integrate with AI
    setTimeout(() => {
      setIsGenerating(false);
    }, 2000);
  };

  const filteredPosts = postFilter === "all" 
    ? recentPosts 
    : recentPosts.filter(p => p.source === postFilter);

  const tabs = [
    { id: "linkedin" as ContentType, label: "LinkedIn", icon: Linkedin },
    { id: "brief" as ContentType, label: "Brief Client", icon: FileText },
    { id: "visual" as ContentType, label: "Création Visuelle", icon: Palette },
    { id: "video" as ContentType, label: "Création Vidéo", icon: Video },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Sidebar 
        collapsed={sidebarCollapsed} 
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} 
      />
      
      <main
        className={cn(
          "min-h-screen p-8 content-transition",
          sidebarCollapsed ? "ml-20" : "ml-64"
        )}
      >
        <Header />
        
        {/* Page Container */}
        <div className="glass-card rounded-2xl p-8">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
              <TrendingUp className="w-7 h-7 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Growth Marketing</h1>
              <p className="text-muted-foreground text-sm mt-1">Analysez vos performances et créez du contenu impactant</p>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* Left Side - Stats & Posts (3 cols) */}
            <div className="lg:col-span-3 space-y-6">
              {/* LinkedIn Analytics Card */}
              <div className="bg-card rounded-2xl border border-border p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-[#0A66C2]/10 flex items-center justify-center">
                      <Linkedin className="w-6 h-6 text-[#0A66C2]" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-foreground">LinkedIn Analytics</h3>
                      <p className="text-sm text-muted-foreground">30 derniers jours</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-success/10 text-success text-sm font-semibold">
                    <TrendingUp className="w-4 h-4" />
                    {linkedinStats.growth}
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-4 gap-4">
                  <div className="bg-secondary/30 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                      <FileEdit className="w-4 h-4" />
                      Posts
                    </div>
                    <p className="text-2xl font-bold text-foreground">{linkedinStats.posts}</p>
                  </div>
                  <div className="bg-secondary/30 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                      <Eye className="w-4 h-4" />
                      Vues
                    </div>
                    <p className="text-2xl font-bold text-foreground">{linkedinStats.views}</p>
                  </div>
                  <div className="bg-secondary/30 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                      <BarChart3 className="w-4 h-4" />
                      Engagement
                    </div>
                    <p className="text-2xl font-bold text-foreground">{linkedinStats.engagement}</p>
                  </div>
                  <div className="bg-secondary/30 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                      <Users className="w-4 h-4" />
                      Followers
                    </div>
                    <p className="text-2xl font-bold text-foreground">{linkedinStats.followers.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex items-center gap-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={cn(
                        "flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                        isActive
                          ? "bg-[#0A66C2] text-white shadow-md"
                          : "bg-secondary/50 text-muted-foreground hover:text-foreground hover:bg-secondary"
                      )}
                    >
                      <Icon className="w-4 h-4" />
                      {tab.label}
                    </button>
                  );
                })}
              </div>

              {/* Posts List */}
              <div className="bg-card rounded-2xl border border-border p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-foreground">Posts récents</h3>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPostFilter("all")}
                      className={cn(
                        "px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
                        postFilter === "all" 
                          ? "bg-[#0A66C2] text-white" 
                          : "bg-secondary/50 text-muted-foreground hover:bg-secondary"
                      )}
                    >
                      Tous
                    </button>
                    <button
                      onClick={() => setPostFilter("linkedin")}
                      className={cn(
                        "px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
                        postFilter === "linkedin" 
                          ? "bg-[#0A66C2] text-white" 
                          : "bg-secondary/50 text-muted-foreground hover:bg-secondary"
                      )}
                    >
                      LinkedIn
                    </button>
                    <button
                      onClick={() => setPostFilter("generated")}
                      className={cn(
                        "px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
                        postFilter === "generated" 
                          ? "bg-primary text-white" 
                          : "bg-secondary/50 text-muted-foreground hover:bg-secondary"
                      )}
                    >
                      Générés
                    </button>
                    <button className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors ml-2">
                      Voir tout <ArrowUpRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  {filteredPosts.map((post) => (
                    <div 
                      key={post.id} 
                      className="flex items-center justify-between p-4 bg-secondary/30 rounded-xl hover:bg-secondary/50 transition-colors cursor-pointer"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate pr-4">{post.title}</p>
                        <div className="flex items-center gap-4 mt-2">
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <ThumbsUp className="w-3.5 h-3.5" /> {post.likes}
                          </span>
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <MessageCircle className="w-3.5 h-3.5" /> {post.comments}
                          </span>
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Share2 className="w-3.5 h-3.5" /> {post.shares}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="w-3.5 h-3.5" /> {post.date}
                        </span>
                        {post.source === "generated" && (
                          <span className="flex items-center gap-1 px-2 py-1 rounded-lg bg-primary/10 text-primary text-xs font-medium">
                            <Sparkles className="w-3 h-3" /> IA
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Side - Create Content Panel (2 cols) */}
            <div className="lg:col-span-2">
              <div className="bg-card rounded-2xl border border-border p-6 sticky top-8">
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-foreground">Créer du contenu</h3>
                  <p className="text-sm text-muted-foreground">Générez du contenu avec l'IA</p>
                </div>

                {viewMode === "menu" ? (
                  <>
                    <p className="text-sm text-muted-foreground mb-4">Que souhaitez-vous créer ?</p>
                    <div className="space-y-3">
                      {contentOptions.map((option) => {
                        const Icon = option.icon;
                        return (
                          <button
                            key={option.id}
                            onClick={() => handleContentSelect(option.id)}
                            className="w-full flex items-center justify-between p-4 bg-secondary/30 rounded-xl hover:bg-secondary/50 transition-all duration-200 group"
                          >
                            <div className="flex items-center gap-4">
                              <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", option.bgColor)}>
                                <Icon className={cn("w-6 h-6", option.color)} />
                              </div>
                              <div className="text-left">
                                <p className="font-semibold text-foreground">{option.label}</p>
                                <p className="text-sm text-muted-foreground">{option.description}</p>
                              </div>
                            </div>
                            <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground group-hover:translate-x-1 transition-all" />
                          </button>
                        );
                      })}
                    </div>
                  </>
                ) : (
                  <>
                    {/* Back button */}
                    <button
                      onClick={handleBackToMenu}
                      className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
                    >
                      ← Retour
                    </button>

                    {selectedContentType === "linkedin" && (
                      <div className="space-y-5">
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-2">
                            Sujet du post
                          </label>
                          <textarea
                            value={postSubject}
                            onChange={(e) => setPostSubject(e.target.value)}
                            placeholder="Décrivez le sujet de votre post..."
                            className="w-full px-4 py-3 bg-secondary/30 border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                            rows={3}
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-foreground mb-2">
                            Objectif
                          </label>
                          <input
                            type="text"
                            value={postObjective}
                            onChange={(e) => setPostObjective(e.target.value)}
                            placeholder="Ex: générer des leads, éduquer, inspirer..."
                            className="w-full px-4 py-3 bg-secondary/30 border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-foreground mb-2">
                            Ton du message
                          </label>
                          <input
                            type="text"
                            value={postTone}
                            onChange={(e) => setPostTone(e.target.value)}
                            placeholder="Ex: professionnel, inspirant, décontracté..."
                            className="w-full px-4 py-3 bg-secondary/30 border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                          />
                        </div>

                        <button
                          onClick={handleGeneratePost}
                          disabled={isGenerating || !postSubject.trim()}
                          className={cn(
                            "w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-semibold transition-all duration-200",
                            isGenerating || !postSubject.trim()
                              ? "bg-secondary text-muted-foreground cursor-not-allowed"
                              : "bg-foreground text-background hover:bg-foreground/90"
                          )}
                        >
                          <Sparkles className="w-5 h-5" />
                          {isGenerating ? "Génération en cours..." : "Générer le post"}
                        </button>
                      </div>
                    )}

                    {selectedContentType === "brief" && (
                      <div className="space-y-5">
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-2">
                            Nom du client
                          </label>
                          <input
                            type="text"
                            placeholder="Nom du client..."
                            className="w-full px-4 py-3 bg-secondary/30 border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-foreground mb-2">
                            Contexte du projet
                          </label>
                          <textarea
                            placeholder="Décrivez le contexte et les enjeux..."
                            className="w-full px-4 py-3 bg-secondary/30 border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                            rows={4}
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-foreground mb-2">
                            Objectifs
                          </label>
                          <textarea
                            placeholder="Quels sont les objectifs du brief ?"
                            className="w-full px-4 py-3 bg-secondary/30 border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                            rows={3}
                          />
                        </div>

                        <button
                          className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-semibold bg-foreground text-background hover:bg-foreground/90 transition-all duration-200"
                        >
                          <Sparkles className="w-5 h-5" />
                          Générer le brief
                        </button>
                      </div>
                    )}

                    {(selectedContentType === "visual" || selectedContentType === "video") && (
                      <div className="flex flex-col items-center justify-center py-12 text-center">
                        <div className="w-16 h-16 rounded-2xl bg-secondary/50 flex items-center justify-center mb-4">
                          {selectedContentType === "visual" ? (
                            <Palette className="w-8 h-8 text-muted-foreground" />
                          ) : (
                            <Video className="w-8 h-8 text-muted-foreground" />
                          )}
                        </div>
                        <p className="text-muted-foreground">
                          Fonctionnalité à venir
                        </p>
                        <p className="text-sm text-muted-foreground/70 mt-1">
                          Cette section sera bientôt disponible
                        </p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default GrowthMarketing;
