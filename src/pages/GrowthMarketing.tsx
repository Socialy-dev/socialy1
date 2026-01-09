import { useState } from "react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Header } from "@/components/dashboard/Header";
import { cn } from "@/lib/utils";
import { 
  Linkedin, 
  FileText, 
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
  TrendingUp,
  Loader2
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type ContentType = "linkedin" | "brief";
type ViewMode = "menu" | "form";

interface Tab {
  id: ContentType;
  label: string;
  icon: React.ElementType;
}

const tabs: Tab[] = [
  { id: "linkedin", label: "LinkedIn", icon: Linkedin },
  { id: "brief", label: "Communiqué de Presse", icon: FileText },
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
    source: "linkedin"
  },
  {
    id: "2", 
    title: "30 milliards d'euros. C'est le montant investi dans les formations...",
    date: "il y a 1 semaine",
    likes: 24,
    comments: 5,
    shares: 8,
    source: "linkedin"
  },
  {
    id: "3",
    title: "Ne sous-estime pas le pouvoir de partager ton expertise en ligne...",
    date: "il y a 2 semaines",
    likes: 18,
    comments: 2,
    shares: 4,
    source: "generated"
  }
];

const GrowthMarketing = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState<ContentType>("linkedin");
  const [viewMode, setViewMode] = useState<ViewMode>("menu");
  const [postFilter, setPostFilter] = useState<"all" | "linkedin" | "generated">("all");
  
  // Form states for LinkedIn post
  const [postSubject, setPostSubject] = useState("");
  const [postObjective, setPostObjective] = useState("");
  const [postTone, setPostTone] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const handleStartCreation = () => {
    setViewMode("form");
  };

  const handleBackToMenu = () => {
    setViewMode("menu");
    setPostSubject("");
    setPostObjective("");
    setPostTone("");
  };

  const handleGeneratePost = async () => {
    if (!postSubject.trim()) {
      toast.error("Veuillez entrer un sujet pour le post");
      return;
    }

    setIsGenerating(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Vous devez être connecté pour générer un post");
        return;
      }

      const response = await supabase.functions.invoke("generate-linkedin-post", {
        body: {
          subject: postSubject,
          objective: postObjective,
          tone: postTone,
        },
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      toast.success("Post généré avec succès !");
      console.log("Generated post data:", response.data);
    } catch (error) {
      console.error("Error generating post:", error);
      toast.error("Erreur lors de la génération du post");
    } finally {
      setIsGenerating(false);
    }
  };

  const filteredPosts = postFilter === "all" 
    ? recentPosts 
    : recentPosts.filter(p => p.source === postFilter);

  // Get content based on active tab
  const getCreationContent = () => {
    switch (activeTab) {
      case "linkedin":
        return {
          title: "Post LinkedIn",
          description: "Créer un post engageant",
          icon: Linkedin
        };
      case "brief":
        return {
          title: "Communiqué de Presse",
          description: "Générer un communiqué",
          icon: FileText
        };
    }
  };

  const creationContent = getCreationContent();

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
        <Header showTitle={false} />
        
        {/* Tabs - Above the glass card */}
        <div className="flex items-center gap-2 mb-6">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setViewMode("menu");
                }}
                className={cn(
                  "flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200 border",
                  isActive
                    ? "bg-foreground text-background border-foreground shadow-sm"
                    : "bg-transparent text-muted-foreground border-border hover:border-foreground/30 hover:text-foreground"
                )}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Page Container */}
        <div className="glass-card rounded-2xl p-8">
          {/* Header - Title only, no icon */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-foreground">Growth Marketing</h1>
            <p className="text-muted-foreground text-sm mt-1">Analysez vos performances et créez du contenu impactant</p>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Left Side - Stats & Posts (3 cols) */}
            <div className="lg:col-span-3 space-y-6">
              {/* Analytics Card - Conditional based on tab */}
              {activeTab === "linkedin" && (
                <div className="bg-card rounded-2xl border border-border p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-foreground/5 flex items-center justify-center">
                        <Linkedin className="w-5 h-5 text-foreground" />
                      </div>
                      <div>
                        <h3 className="text-base font-semibold text-foreground">LinkedIn Analytics</h3>
                        <p className="text-xs text-muted-foreground">30 derniers jours</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-success/10 text-success text-sm font-medium">
                      <TrendingUp className="w-3.5 h-3.5" />
                      {linkedinStats.growth}
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-4 gap-3">
                    <div className="bg-secondary/40 rounded-xl p-4">
                      <div className="flex items-center gap-1.5 text-muted-foreground text-xs mb-1">
                        <FileEdit className="w-3.5 h-3.5" />
                        Posts
                      </div>
                      <p className="text-xl font-bold text-foreground">{linkedinStats.posts}</p>
                    </div>
                    <div className="bg-secondary/40 rounded-xl p-4">
                      <div className="flex items-center gap-1.5 text-muted-foreground text-xs mb-1">
                        <Eye className="w-3.5 h-3.5" />
                        Vues
                      </div>
                      <p className="text-xl font-bold text-foreground">{linkedinStats.views}</p>
                    </div>
                    <div className="bg-secondary/40 rounded-xl p-4">
                      <div className="flex items-center gap-1.5 text-muted-foreground text-xs mb-1">
                        <BarChart3 className="w-3.5 h-3.5" />
                        Engagement
                      </div>
                      <p className="text-xl font-bold text-foreground">{linkedinStats.engagement}</p>
                    </div>
                    <div className="bg-secondary/40 rounded-xl p-4">
                      <div className="flex items-center gap-1.5 text-muted-foreground text-xs mb-1">
                        <Users className="w-3.5 h-3.5" />
                        Followers
                      </div>
                      <p className="text-xl font-bold text-foreground">{linkedinStats.followers.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "brief" && (
                <div className="bg-card rounded-2xl border border-border p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-11 h-11 rounded-xl bg-foreground/5 flex items-center justify-center">
                      <FileText className="w-5 h-5 text-foreground" />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-foreground">Briefs Client</h3>
                      <p className="text-xs text-muted-foreground">Documents de cadrage générés</p>
                    </div>
                  </div>
                  <p className="text-muted-foreground text-sm">Aucun brief généré pour le moment.</p>
                </div>
              )}


              {/* Posts List - Only for LinkedIn */}
              {activeTab === "linkedin" && (
                <div className="bg-card rounded-2xl border border-border p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base font-semibold text-foreground">Posts récents</h3>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setPostFilter("all")}
                        className={cn(
                          "px-3 py-1.5 rounded-full text-xs font-medium transition-all border",
                          postFilter === "all" 
                            ? "bg-foreground text-background border-foreground" 
                            : "bg-transparent text-muted-foreground border-border hover:border-foreground/30"
                        )}
                      >
                        Tous
                      </button>
                      <button
                        onClick={() => setPostFilter("linkedin")}
                        className={cn(
                          "px-3 py-1.5 rounded-full text-xs font-medium transition-all border",
                          postFilter === "linkedin" 
                            ? "bg-foreground text-background border-foreground" 
                            : "bg-transparent text-muted-foreground border-border hover:border-foreground/30"
                        )}
                      >
                        LinkedIn
                      </button>
                      <button
                        onClick={() => setPostFilter("generated")}
                        className={cn(
                          "px-3 py-1.5 rounded-full text-xs font-medium transition-all border",
                          postFilter === "generated" 
                            ? "bg-foreground text-background border-foreground" 
                            : "bg-transparent text-muted-foreground border-border hover:border-foreground/30"
                        )}
                      >
                        Générés
                      </button>
                      <button className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors ml-2">
                        Voir tout <ArrowUpRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {filteredPosts.map((post) => (
                      <div 
                        key={post.id} 
                        className="flex items-center justify-between p-4 bg-secondary/30 rounded-xl hover:bg-secondary/50 transition-colors cursor-pointer"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate pr-4">{post.title}</p>
                          <div className="flex items-center gap-4 mt-2">
                            <span className="flex items-center gap-1 text-xs text-muted-foreground">
                              <ThumbsUp className="w-3 h-3" /> {post.likes}
                            </span>
                            <span className="flex items-center gap-1 text-xs text-muted-foreground">
                              <MessageCircle className="w-3 h-3" /> {post.comments}
                            </span>
                            <span className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Share2 className="w-3 h-3" /> {post.shares}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 flex-shrink-0">
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="w-3 h-3" /> {post.date}
                          </span>
                          {post.source === "generated" && (
                            <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                              <Sparkles className="w-3 h-3" /> IA
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Side - Create Content Panel (2 cols) */}
            <div className="lg:col-span-2">
              <div className="bg-card rounded-2xl border border-border p-6 sticky top-8">
                <div className="mb-6">
                  <h3 className="text-base font-semibold text-foreground">Créer du contenu</h3>
                  <p className="text-xs text-muted-foreground">Générez du contenu avec l'IA</p>
                </div>

                {viewMode === "menu" ? (
                  <>
                    {/* Show only the content type matching active tab */}
                    <button
                      onClick={handleStartCreation}
                      className="w-full flex items-center justify-between p-4 bg-secondary/30 rounded-xl hover:bg-secondary/50 transition-all duration-200 group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-11 h-11 rounded-xl bg-foreground/5 flex items-center justify-center">
                          <creationContent.icon className="w-5 h-5 text-foreground" />
                        </div>
                        <div className="text-left">
                          <p className="font-medium text-foreground">{creationContent.title}</p>
                          <p className="text-xs text-muted-foreground">{creationContent.description}</p>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground group-hover:translate-x-1 transition-all" />
                    </button>
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

                    {activeTab === "linkedin" && (
                      <div className="space-y-5">
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-2">
                            Sujet du post
                          </label>
                          <textarea
                            value={postSubject}
                            onChange={(e) => setPostSubject(e.target.value)}
                            placeholder="Décrivez le sujet de votre post..."
                            className="w-full px-4 py-3 bg-secondary/30 border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none text-sm"
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
                            className="w-full px-4 py-3 bg-secondary/30 border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm"
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
                            className="w-full px-4 py-3 bg-secondary/30 border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm"
                          />
                        </div>

                        <button
                          onClick={handleGeneratePost}
                          disabled={isGenerating || !postSubject.trim()}
                          className={cn(
                            "w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-200 text-sm",
                            isGenerating || !postSubject.trim()
                              ? "bg-secondary text-muted-foreground cursor-not-allowed"
                              : "bg-foreground text-background hover:bg-foreground/90"
                          )}
                        >
                          {isGenerating && <Loader2 className="w-4 h-4 animate-spin" />}
                          {isGenerating ? "Génération en cours..." : "Générer le post"}
                        </button>
                      </div>
                    )}

                    {activeTab === "brief" && (
                      <div className="space-y-5">
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-2">
                            Nom du client
                          </label>
                          <input
                            type="text"
                            placeholder="Nom du client..."
                            className="w-full px-4 py-3 bg-secondary/30 border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-foreground mb-2">
                            Contexte du projet
                          </label>
                          <textarea
                            placeholder="Décrivez le contexte et les enjeux..."
                            className="w-full px-4 py-3 bg-secondary/30 border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none text-sm"
                            rows={4}
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-foreground mb-2">
                            Objectifs
                          </label>
                          <textarea
                            placeholder="Quels sont les objectifs du brief ?"
                            className="w-full px-4 py-3 bg-secondary/30 border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none text-sm"
                            rows={3}
                          />
                        </div>

                        <button
                          className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-medium bg-foreground text-background hover:bg-foreground/90 transition-all duration-200 text-sm"
                        >
                          <Sparkles className="w-4 h-4" />
                          Générer le brief
                        </button>
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
