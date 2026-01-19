import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Header } from "@/components/dashboard/Header";
import { OrganizationLinkedInPosts } from "@/components/growth/OrganizationLinkedInPosts";
import { MarchePublicView } from "@/components/growth/MarchePublicView";
import { cn } from "@/lib/utils";
import {
  Linkedin,
  MessageSquare,
  ChevronRight,
  ChevronDown,
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
  Loader2,
  ExternalLink,
  Check,
  Copy,
  Briefcase,
  Trophy,
  RefreshCw
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

type MainTab = "linkedin" | "marche-public";
type LinkedInSubTab = "generation" | "comment" | "classement";
type ViewMode = "menu" | "form";

interface OrganizationLinkedInPost {
  id: string;
  post_url: string;
  text: string | null;
  posted_at_date: string | null;
  author_name: string | null;
  author_headline: string | null;
  author_profile_url: string | null;
  author_avatar_url: string | null;
  likes_count: number;
  comments_count: number;
  reposts_count: number;
  impressions: number;
  engagement_rate: number;
  media_items: any[] | null;
}

const linkedinStats = {
  posts: 15,
  views: "124.5k",
  engagement: "4.2%",
  followers: 2847,
  growth: "+12.4%"
};

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
  const { user, effectiveOrgId } = useAuth();
  const [searchParams] = useSearchParams();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeMainTab, setActiveMainTab] = useState<MainTab>("linkedin");
  
  const tabFromUrl = searchParams.get("tab");
  const [linkedinSubTab, setLinkedinSubTab] = useState<LinkedInSubTab>(() => {
    if (tabFromUrl === "engagement") return "comment";
    if (tabFromUrl === "classement") return "classement";
    return "generation";
  });
  
  const [viewMode, setViewMode] = useState<ViewMode>("menu");
  const [postFilter, setPostFilter] = useState<"all" | "linkedin" | "generated">("all");

  useEffect(() => {
    if (tabFromUrl === "engagement") {
      setLinkedinSubTab("comment");
      setActiveMainTab("linkedin");
    } else if (tabFromUrl === "classement") {
      setLinkedinSubTab("classement");
      setActiveMainTab("linkedin");
    } else if (tabFromUrl === "marche-public") {
      setActiveMainTab("marche-public");
    } else if (!tabFromUrl) {
      setLinkedinSubTab("generation");
      setActiveMainTab("linkedin");
    }
  }, [tabFromUrl]);

  const [postSubject, setPostSubject] = useState("");
  const [postObjective, setPostObjective] = useState("");
  const [postTone, setPostTone] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const [selectedOrgPost, setSelectedOrgPost] = useState<OrganizationLinkedInPost | null>(null);
  const [commentDraft, setCommentDraft] = useState("");
  const [generatedComments, setGeneratedComments] = useState<string[]>([]);
  const [isGeneratingComment, setIsGeneratingComment] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);


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

  const handleSelectOrgPost = (post: OrganizationLinkedInPost) => {
    setSelectedOrgPost(post);
    setGeneratedComments([]);
    setCommentDraft("");
  };

  const handleGenerateComments = async () => {
    if (!selectedOrgPost) {
      toast.error("Veuillez sélectionner un post");
      return;
    }

    setIsGeneratingComment(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 1500));

      const mockComments = [
        `Super analyse ! ${commentDraft ? `"${commentDraft}" - ` : ""}Je partage totalement ce point de vue. L'importance de cette approche est souvent sous-estimée dans notre secteur.`,
        `Merci pour ce partage enrichissant ! ${commentDraft ? `Comme tu le soulignes, "${commentDraft}". ` : ""}C'est exactement le type de réflexion dont nous avons besoin.`,
        `Très pertinent ! ${commentDraft ? `"${commentDraft}" ` : ""}Cette perspective apporte une vraie valeur ajoutée à la conversation. Hâte de lire la suite !`
      ];

      setGeneratedComments(mockComments);
      toast.success("Commentaires générés avec succès !");
    } catch (error) {
      console.error("Error generating comments:", error);
      toast.error("Erreur lors de la génération des commentaires");
    } finally {
      setIsGeneratingComment(false);
    }
  };

  const handleCopyComment = async (comment: string, index: number) => {
    await navigator.clipboard.writeText(comment);
    setCopiedIndex(index);
    toast.success("Commentaire copié !");
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return "Hier";
    if (diffDays < 7) return `il y a ${diffDays} jours`;
    if (diffDays < 30) return `il y a ${Math.floor(diffDays / 7)} semaine${Math.floor(diffDays / 7) > 1 ? "s" : ""}`;
    return date.toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });
  };

  const truncateContent = (content: string, maxLength: number = 100) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + "...";
  };

  const filteredPosts = postFilter === "all"
    ? recentPosts
    : recentPosts.filter(p => p.source === postFilter);

  const getCreationContent = () => {
    if (linkedinSubTab === "comment") {
      return {
        title: "Commentaire LinkedIn",
        description: "Générer des commentaires",
        icon: MessageSquare
      };
    }
    return {
      title: "Post LinkedIn",
      description: "Créer un post engageant",
      icon: Linkedin
    };
  };

  const creationContent = getCreationContent();

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

        <main className="flex-1 p-6 pt-4 overflow-y-auto">


          <div className="space-y-3 mb-6">
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  if (activeMainTab !== "linkedin") {
                    setActiveMainTab("linkedin");
                    setLinkedinSubTab("generation");
                  }
                  setViewMode("menu");
                  setSelectedOrgPost(null);
                  setGeneratedComments([]);
                }}
                className={cn(
                  "flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200 border",
                  activeMainTab === "linkedin"
                    ? "bg-foreground text-background border-foreground shadow-sm"
                    : "bg-transparent text-muted-foreground border-border hover:border-foreground/30 hover:text-foreground"
                )}
              >
                <Linkedin className="w-4 h-4" />
                LinkedIn
                {activeMainTab === "linkedin" ? (
                  <ChevronDown className="w-3.5 h-3.5" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5" />
                )}
              </button>

              <button
                onClick={() => {
                  setActiveMainTab("marche-public");
                  setLinkedinSubTab(null);
                  setViewMode("menu");
                  setSelectedOrgPost(null);
                  setGeneratedComments([]);
                }}
                className={cn(
                  "flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200 border",
                  activeMainTab === "marche-public"
                    ? "bg-foreground text-background border-foreground shadow-sm"
                    : "bg-transparent text-muted-foreground border-border hover:border-foreground/30 hover:text-foreground"
                )}
              >
                <Briefcase className="w-4 h-4" />
                Marché Public
              </button>
            </div>

            {activeMainTab === "linkedin" && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setLinkedinSubTab("generation")}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium transition-all duration-200 border",
                    linkedinSubTab === "generation"
                      ? "bg-primary text-primary-foreground border-primary shadow-sm"
                      : "bg-transparent text-muted-foreground border-border hover:border-primary/30 hover:text-foreground"
                  )}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Génération de contenu
                </button>
                <button
                  onClick={() => setLinkedinSubTab("comment")}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium transition-all duration-200 border",
                    linkedinSubTab === "comment"
                      ? "bg-primary text-primary-foreground border-primary shadow-sm"
                      : "bg-transparent text-muted-foreground border-border hover:border-primary/30 hover:text-foreground"
                  )}
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Commentaire / Repost
                </button>
                <button
                  onClick={() => setLinkedinSubTab("classement")}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium transition-all duration-200 border",
                    linkedinSubTab === "classement"
                      ? "bg-primary text-primary-foreground border-primary shadow-sm"
                      : "bg-transparent text-muted-foreground border-border hover:border-primary/30 hover:text-foreground"
                  )}
                >
                  <Trophy className="w-3.5 h-3.5" />
                  Classement
                </button>
              </div>
            )}
          </div>

          <div className="glass-card rounded-2xl p-8">
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-foreground">
                {activeMainTab === "marche-public"
                  ? "Marché Public"
                  : linkedinSubTab === "generation"
                    ? "Génération de contenu"
                    : linkedinSubTab === "comment"
                      ? "Commentaire / Repost LinkedIn"
                      : linkedinSubTab === "classement"
                        ? "Classement LinkedIn"
                        : "LinkedIn"}
              </h1>
              <p className="text-muted-foreground text-sm mt-1">
                {activeMainTab === "marche-public"
                  ? "Consultez les opportunités d'appels d'offres"
                  : linkedinSubTab === "generation"
                    ? "Créez du contenu engageant avec l'IA"
                    : linkedinSubTab === "comment"
                      ? "Générez des commentaires et reposts personnalisés"
                      : linkedinSubTab === "classement"
                        ? "Suivez les performances de votre équipe"
                        : "Sélectionnez une catégorie"}
              </p>
            </div>

            {activeMainTab === "linkedin" && linkedinSubTab === "generation" && (
              <div className="space-y-8">
                {/* Hero Section with Gradient */}
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-500/10 via-blue-500/10 to-pink-500/10 p-8 backdrop-blur-sm border border-violet-500/20">
                  <div className="absolute inset-0 bg-gradient-to-r from-violet-500/5 via-blue-500/5 to-pink-500/5 animate-pulse" />
                  <div className="relative z-10">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center shadow-lg shadow-violet-500/30">
                        <Sparkles className="w-8 h-8 text-white" />
                      </div>
                      <div>
                        <h2 className="text-3xl font-bold bg-gradient-to-r from-violet-600 to-blue-600 bg-clip-text text-transparent">
                          Génération de contenu
                        </h2>
                        <p className="text-muted-foreground mt-1">Créez du contenu engageant avec l'IA en quelques secondes</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Left Column - Analytics & Posts */}
                  <div className="lg:col-span-2 space-y-6">
                    {/* Analytics Card with Glassmorphism */}
                    <div className="relative group">
                      <div className="absolute -inset-0.5 bg-gradient-to-r from-violet-500 to-blue-500 rounded-3xl opacity-20 group-hover:opacity-30 blur transition duration-500" />
                      <div className="relative bg-card/80 backdrop-blur-xl rounded-3xl border border-border/50 p-8 shadow-xl">
                        <div className="flex items-center justify-between mb-8">
                          <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500/20 to-violet-500/20 flex items-center justify-center border border-blue-500/30">
                              <Linkedin className="w-7 h-7 text-blue-500" />
                            </div>
                            <div>
                              <h3 className="text-xl font-bold text-foreground">LinkedIn Analytics</h3>
                              <p className="text-sm text-muted-foreground">Performances des 30 derniers jours</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30">
                            <TrendingUp className="w-4 h-4 text-green-500" />
                            <span className="text-green-500 font-semibold">{linkedinStats.growth}</span>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {/* Posts Stat */}
                          <div className="relative group/stat">
                            <div className="absolute -inset-0.5 bg-gradient-to-br from-violet-500 to-purple-500 rounded-2xl opacity-0 group-hover/stat:opacity-20 blur transition duration-300" />
                            <div className="relative bg-gradient-to-br from-violet-500/10 to-purple-500/10 rounded-2xl p-5 border border-violet-500/20 hover:border-violet-500/40 transition-all duration-300 hover:scale-105">
                              <div className="flex items-center gap-2 text-violet-500 text-sm mb-2">
                                <FileEdit className="w-4 h-4" />
                                <span className="font-medium">Posts</span>
                              </div>
                              <p className="text-3xl font-bold text-foreground">{linkedinStats.posts}</p>
                              <div className="mt-2 w-full h-1 bg-violet-500/20 rounded-full overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-violet-500 to-purple-500 w-3/4 rounded-full" />
                              </div>
                            </div>
                          </div>

                          {/* Views Stat */}
                          <div className="relative group/stat">
                            <div className="absolute -inset-0.5 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl opacity-0 group-hover/stat:opacity-20 blur transition duration-300" />
                            <div className="relative bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-2xl p-5 border border-blue-500/20 hover:border-blue-500/40 transition-all duration-300 hover:scale-105">
                              <div className="flex items-center gap-2 text-blue-500 text-sm mb-2">
                                <Eye className="w-4 h-4" />
                                <span className="font-medium">Vues</span>
                              </div>
                              <p className="text-3xl font-bold text-foreground">{linkedinStats.views}</p>
                              <div className="mt-2 w-full h-1 bg-blue-500/20 rounded-full overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 w-4/5 rounded-full" />
                              </div>
                            </div>
                          </div>

                          {/* Engagement Stat */}
                          <div className="relative group/stat">
                            <div className="absolute -inset-0.5 bg-gradient-to-br from-pink-500 to-rose-500 rounded-2xl opacity-0 group-hover/stat:opacity-20 blur transition duration-300" />
                            <div className="relative bg-gradient-to-br from-pink-500/10 to-rose-500/10 rounded-2xl p-5 border border-pink-500/20 hover:border-pink-500/40 transition-all duration-300 hover:scale-105">
                              <div className="flex items-center gap-2 text-pink-500 text-sm mb-2">
                                <BarChart3 className="w-4 h-4" />
                                <span className="font-medium">Engagement</span>
                              </div>
                              <p className="text-3xl font-bold text-foreground">{linkedinStats.engagement}</p>
                              <div className="mt-2 w-full h-1 bg-pink-500/20 rounded-full overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-pink-500 to-rose-500 w-1/2 rounded-full" />
                              </div>
                            </div>
                          </div>

                          {/* Followers Stat */}
                          <div className="relative group/stat">
                            <div className="absolute -inset-0.5 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl opacity-0 group-hover/stat:opacity-20 blur transition duration-300" />
                            <div className="relative bg-gradient-to-br from-amber-500/10 to-orange-500/10 rounded-2xl p-5 border border-amber-500/20 hover:border-amber-500/40 transition-all duration-300 hover:scale-105">
                              <div className="flex items-center gap-2 text-amber-500 text-sm mb-2">
                                <Users className="w-4 h-4" />
                                <span className="font-medium">Followers</span>
                              </div>
                              <p className="text-3xl font-bold text-foreground">{linkedinStats.followers.toLocaleString()}</p>
                              <div className="mt-2 w-full h-1 bg-amber-500/20 rounded-full overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-amber-500 to-orange-500 w-2/3 rounded-full" />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Recent Posts Card */}
                    <div className="relative group">
                      <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-violet-500 rounded-3xl opacity-10 group-hover:opacity-20 blur transition duration-500" />
                      <div className="relative bg-card/80 backdrop-blur-xl rounded-3xl border border-border/50 p-8 shadow-xl">
                        <div className="flex items-center justify-between mb-6">
                          <h3 className="text-xl font-bold text-foreground">Posts récents</h3>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setPostFilter("all")}
                              className={cn(
                                "px-4 py-2 rounded-full text-xs font-semibold transition-all duration-300",
                                postFilter === "all"
                                  ? "bg-gradient-to-r from-violet-500 to-blue-500 text-white shadow-lg shadow-violet-500/30"
                                  : "bg-secondary/50 text-muted-foreground hover:bg-secondary/80"
                              )}
                            >
                              Tous
                            </button>
                            <button
                              onClick={() => setPostFilter("linkedin")}
                              className={cn(
                                "px-4 py-2 rounded-full text-xs font-semibold transition-all duration-300",
                                postFilter === "linkedin"
                                  ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/30"
                                  : "bg-secondary/50 text-muted-foreground hover:bg-secondary/80"
                              )}
                            >
                              LinkedIn
                            </button>
                            <button
                              onClick={() => setPostFilter("generated")}
                              className={cn(
                                "px-4 py-2 rounded-full text-xs font-semibold transition-all duration-300",
                                postFilter === "generated"
                                  ? "bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-lg shadow-pink-500/30"
                                  : "bg-secondary/50 text-muted-foreground hover:bg-secondary/80"
                              )}
                            >
                              Générés
                            </button>
                            <button className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors ml-2 px-3 py-2 rounded-full hover:bg-secondary/50">
                              Voir tout <ArrowUpRight className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        <div className="space-y-3">
                          {filteredPosts.map((post, idx) => (
                            <div
                              key={post.id}
                              className="relative group/post overflow-hidden"
                            >
                              <div className="absolute -inset-0.5 bg-gradient-to-r from-violet-500/20 via-blue-500/20 to-pink-500/20 rounded-2xl opacity-0 group-hover/post:opacity-100 blur transition duration-300" />
                              <div className="relative flex items-center justify-between p-5 bg-gradient-to-br from-secondary/40 to-secondary/20 backdrop-blur-sm rounded-2xl hover:from-secondary/60 hover:to-secondary/30 transition-all duration-300 cursor-pointer border border-border/30 hover:border-border/60">
                                <div className="flex-1 min-w-0 flex items-center gap-4">
                                  <div className={cn(
                                    "w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg flex-shrink-0",
                                    idx === 0 && "bg-gradient-to-br from-violet-500 to-purple-500 text-white shadow-lg shadow-violet-500/30",
                                    idx === 1 && "bg-gradient-to-br from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/30",
                                    idx === 2 && "bg-gradient-to-br from-pink-500 to-rose-500 text-white shadow-lg shadow-pink-500/30"
                                  )}>
                                    {idx + 1}
                                  </div>
                                  <div className="flex-1">
                                    <p className="text-sm font-semibold text-foreground line-clamp-1 pr-4">{post.title}</p>
                                    <div className="flex items-center gap-4 mt-2">
                                      <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                        <ThumbsUp className="w-3.5 h-3.5" /> {post.likes}
                                      </span>
                                      <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                        <MessageCircle className="w-3.5 h-3.5" /> {post.comments}
                                      </span>
                                      <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                        <Share2 className="w-3.5 h-3.5" /> {post.shares}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-3 flex-shrink-0">
                                  <span className="flex items-center gap-1.5 text-xs text-muted-foreground bg-background/50 px-3 py-1.5 rounded-full">
                                    <Clock className="w-3.5 h-3.5" /> {post.date}
                                  </span>
                                  {post.source === "generated" && (
                                    <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-violet-500/20 to-purple-500/20 border border-violet-500/30 text-violet-600 text-xs font-semibold">
                                      <Sparkles className="w-3.5 h-3.5" /> IA
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column - Creation Form */}
                  <div className="lg:col-span-1">
                    <div className="sticky top-8">
                      <div className="relative group">
                        <div className="absolute -inset-1 bg-gradient-to-r from-pink-500 via-violet-500 to-blue-500 rounded-3xl opacity-20 group-hover:opacity-30 blur-lg transition duration-500" />
                        <div className="relative bg-card/90 backdrop-blur-xl rounded-3xl border border-border/50 p-7 shadow-2xl">
                          <div className="mb-7">
                            <div className="flex items-center gap-3 mb-3">
                              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-500 to-violet-500 flex items-center justify-center shadow-lg shadow-pink-500/30">
                                <Sparkles className="w-6 h-6 text-white" />
                              </div>
                              <div>
                                <h3 className="text-lg font-bold text-foreground">Créer du contenu</h3>
                                <p className="text-xs text-muted-foreground">Powered by AI</p>
                              </div>
                            </div>
                          </div>

                          {viewMode === "menu" ? (
                            <button
                              onClick={handleStartCreation}
                              className="w-full group/btn relative overflow-hidden"
                            >
                              <div className="absolute inset-0 bg-gradient-to-r from-violet-500 via-blue-500 to-pink-500 opacity-0 group-hover/btn:opacity-10 transition duration-300" />
                              <div className="relative flex items-center justify-between p-5 bg-gradient-to-br from-secondary/40 to-secondary/20 rounded-2xl border border-border/50 hover:border-violet-500/30 transition-all duration-300">
                                <div className="flex items-center gap-4">
                                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-foreground/10 to-foreground/5 flex items-center justify-center group-hover/btn:from-violet-500/20 group-hover/btn:to-blue-500/20 transition-all duration-300">
                                    <creationContent.icon className="w-6 h-6 text-foreground group-hover/btn:text-violet-500 transition-colors duration-300" />
                                  </div>
                                  <div className="text-left">
                                    <p className="font-semibold text-foreground">{creationContent.title}</p>
                                    <p className="text-xs text-muted-foreground">{creationContent.description}</p>
                                  </div>
                                </div>
                                <ChevronRight className="w-6 h-6 text-muted-foreground group-hover/btn:text-violet-500 group-hover/btn:translate-x-1 transition-all duration-300" />
                              </div>
                            </button>
                          ) : (
                            <>
                              <button
                                onClick={handleBackToMenu}
                                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6 px-3 py-2 rounded-full hover:bg-secondary/50"
                              >
                                ← Retour
                              </button>

                              <div className="space-y-5">
                                <div>
                                  <label className="block text-sm font-semibold text-foreground mb-2.5">
                                    Sujet du post
                                  </label>
                                  <textarea
                                    value={postSubject}
                                    onChange={(e) => setPostSubject(e.target.value)}
                                    placeholder="Décrivez le sujet de votre post..."
                                    className="w-full px-4 py-3.5 bg-gradient-to-br from-secondary/40 to-secondary/20 border border-border/50 rounded-2xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 resize-none text-sm backdrop-blur-sm transition-all duration-300"
                                    rows={3}
                                  />
                                </div>

                                <div>
                                  <label className="block text-sm font-semibold text-foreground mb-2.5">
                                    Objectif
                                  </label>
                                  <input
                                    type="text"
                                    value={postObjective}
                                    onChange={(e) => setPostObjective(e.target.value)}
                                    placeholder="Ex: générer des leads, éduquer..."
                                    className="w-full px-4 py-3.5 bg-gradient-to-br from-secondary/40 to-secondary/20 border border-border/50 rounded-2xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 text-sm backdrop-blur-sm transition-all duration-300"
                                  />
                                </div>

                                <div>
                                  <label className="block text-sm font-semibold text-foreground mb-2.5">
                                    Ton du message
                                  </label>
                                  <input
                                    type="text"
                                    value={postTone}
                                    onChange={(e) => setPostTone(e.target.value)}
                                    placeholder="Ex: professionnel, inspirant..."
                                    className="w-full px-4 py-3.5 bg-gradient-to-br from-secondary/40 to-secondary/20 border border-border/50 rounded-2xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:border-pink-500/50 text-sm backdrop-blur-sm transition-all duration-300"
                                  />
                                </div>

                                <button
                                  onClick={handleGeneratePost}
                                  disabled={isGenerating || !postSubject.trim()}
                                  className={cn(
                                    "relative w-full flex items-center justify-center gap-2 px-6 py-4 rounded-2xl font-semibold transition-all duration-300 text-sm overflow-hidden group/gen",
                                    isGenerating || !postSubject.trim()
                                      ? "bg-secondary/50 text-muted-foreground cursor-not-allowed"
                                      : "bg-gradient-to-r from-violet-500 via-blue-500 to-pink-500 text-white shadow-lg shadow-violet-500/30 hover:shadow-xl hover:shadow-violet-500/40 hover:scale-[1.02]"
                                  )}
                                >
                                  {!isGenerating && !(!postSubject.trim()) && (
                                    <div className="absolute inset-0 bg-gradient-to-r from-pink-500 via-violet-500 to-blue-500 opacity-0 group-hover/gen:opacity-100 transition-opacity duration-500" />
                                  )}
                                  <span className="relative z-10 flex items-center gap-2">
                                    {isGenerating && <Loader2 className="w-5 h-5 animate-spin" />}
                                    {isGenerating ? "Génération en cours..." : (
                                      <>
                                        <Sparkles className="w-5 h-5" />
                                        Générer le post
                                      </>
                                    )}
                                  </span>
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeMainTab === "linkedin" && linkedinSubTab === "comment" && (
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <div className="lg:col-span-3 space-y-6">
                  <div className="bg-card rounded-3xl border border-border p-6 shadow-sm">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                        <Linkedin className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-foreground">Posts de l'organisation</h3>
                        <p className="text-sm text-muted-foreground">Sélectionnez un post à commenter</p>
                      </div>
                    </div>

                    <OrganizationLinkedInPosts
                      organizationId={effectiveOrgId}
                      selectedPost={selectedOrgPost}
                      onSelectPost={handleSelectOrgPost}
                    />
                  </div>

                  {generatedComments.length > 0 && (
                    <div className="bg-card rounded-3xl border border-border p-6 shadow-sm">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-success/20 to-success/5 flex items-center justify-center">
                          <Sparkles className="w-6 h-6 text-success" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-foreground">Commentaires générés</h3>
                          <p className="text-sm text-muted-foreground">Choisissez et copiez le commentaire qui vous convient</p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        {generatedComments.map((comment, index) => (
                          <div
                            key={index}
                            className="p-5 bg-gradient-to-br from-secondary/40 to-secondary/20 rounded-2xl border border-border/50 group"
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <span className="text-xs font-medium text-muted-foreground bg-background/50 px-2 py-1 rounded-full">
                                    Version {index + 1}
                                  </span>
                                </div>
                                <p className="text-sm text-foreground leading-relaxed">{comment}</p>
                              </div>
                              <button
                                onClick={() => handleCopyComment(comment, index)}
                                className={cn(
                                  "flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                                  copiedIndex === index
                                    ? "bg-success text-success-foreground"
                                    : "bg-background/50 text-muted-foreground hover:bg-background hover:text-foreground"
                                )}
                              >
                                {copiedIndex === index ? (
                                  <Check className="w-5 h-5" />
                                ) : (
                                  <Copy className="w-5 h-5" />
                                )}
                              </button>
                            </div>
                            {selectedOrgPost?.post_url && (
                              <a
                                href={selectedOrgPost.post_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 mt-4 text-xs text-primary hover:underline"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                                Aller commenter sur LinkedIn
                              </a>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="lg:col-span-2">
                  <div className="bg-card rounded-3xl border border-border p-6 sticky top-8 shadow-sm">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-foreground/10 to-foreground/5 flex items-center justify-center">
                        <MessageSquare className="w-6 h-6 text-foreground" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-foreground">Générer un commentaire</h3>
                        <p className="text-sm text-muted-foreground">L'IA va créer plusieurs versions</p>
                      </div>
                    </div>

                    {selectedOrgPost ? (
                      <div className="space-y-5">
                        <div className="p-4 bg-secondary/30 rounded-2xl border border-border/50">
                          <p className="text-xs text-muted-foreground mb-2">Post sélectionné</p>
                          <p className="text-sm text-foreground font-medium line-clamp-3">
                            {truncateContent(selectedOrgPost.text || "", 100)}
                          </p>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-foreground mb-2">
                            Ébauche du commentaire (optionnel)
                          </label>
                          <textarea
                            value={commentDraft}
                            onChange={(e) => setCommentDraft(e.target.value)}
                            placeholder="Donnez une direction à l'IA : idée principale, ton souhaité..."
                            className="w-full px-4 py-3 bg-secondary/30 border border-border rounded-2xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none text-sm"
                            rows={4}
                          />
                        </div>

                        <button
                          onClick={handleGenerateComments}
                          disabled={isGeneratingComment}
                          className={cn(
                            "w-full flex items-center justify-center gap-2 px-6 py-4 rounded-2xl font-medium transition-all duration-200 text-sm",
                            isGeneratingComment
                              ? "bg-secondary text-muted-foreground cursor-not-allowed"
                              : "bg-foreground text-background hover:bg-foreground/90 shadow-lg hover:shadow-xl"
                          )}
                        >
                          {isGeneratingComment ? (
                            <>
                              <Loader2 className="w-5 h-5 animate-spin" />
                              Génération en cours...
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-5 h-5" />
                              Générer 3 versions
                            </>
                          )}
                        </button>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <div className="w-16 h-16 rounded-2xl bg-secondary/50 flex items-center justify-center mx-auto mb-4">
                          <Linkedin className="w-8 h-8 text-muted-foreground/50" />
                        </div>
                        <p className="font-medium">Sélectionnez un post</p>
                        <p className="text-sm text-muted-foreground/70 mt-1">
                          pour générer des commentaires personnalisés
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeMainTab === "linkedin" && linkedinSubTab === "classement" && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                  <div className="bg-card rounded-2xl border border-border p-6">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">🏆</span>
                        <h3 className="text-lg font-bold text-foreground">Classement ce mois</h3>
                      </div>
                      <select className="bg-secondary/50 border border-border rounded-lg px-3 py-1.5 text-sm text-foreground">
                        <option>Cette semaine</option>
                        <option>Ce mois</option>
                        <option>Tout temps</option>
                      </select>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-amber-500/10 to-transparent rounded-xl border border-amber-500/20">
                        <div className="flex items-center gap-4">
                          <span className="text-lg font-bold text-amber-500">1.</span>
                          <span className="font-semibold text-foreground">Paul</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-foreground">847 pts</span>
                          <span className="text-lg">🔥🚀⭐</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-slate-400/10 to-transparent rounded-xl border border-slate-400/20">
                        <div className="flex items-center gap-4">
                          <span className="text-lg font-bold text-slate-400">2.</span>
                          <span className="font-semibold text-foreground">Sara</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-foreground">692 pts</span>
                          <span className="text-lg">🔥⭐</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-amber-700/10 to-transparent rounded-xl border border-amber-700/20">
                        <div className="flex items-center gap-4">
                          <span className="text-lg font-bold text-amber-700">3.</span>
                          <span className="font-semibold text-foreground">Alex</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-foreground">531 pts</span>
                          <span className="text-lg">🚀</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-primary/5 rounded-xl border-2 border-primary/30">
                        <div className="flex items-center gap-4">
                          <span className="text-lg font-bold text-muted-foreground">4.</span>
                          <span className="font-semibold text-primary">Toi (Marie)</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-foreground">423 pts</span>
                          <span className="text-lg">🔥</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-xl">
                        <div className="flex items-center gap-4">
                          <span className="text-lg font-bold text-muted-foreground">5.</span>
                          <span className="font-semibold text-foreground">Thomas</span>
                        </div>
                        <span className="font-bold text-foreground">387 pts</span>
                      </div>
                    </div>

                    <div className="mt-6 p-4 bg-secondary/20 rounded-xl flex items-center gap-3">
                      <span className="text-xl">💡</span>
                      <p className="text-sm text-muted-foreground">
                        Encore <span className="font-semibold text-foreground">100pts</span> pour le badge ⭐
                      </p>
                    </div>
                  </div>

                  <div className="bg-card rounded-2xl border border-border p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-xl">💬</span>
                      <h3 className="text-lg font-bold text-foreground">Feed</h3>
                    </div>
                    <div className="space-y-3">
                      <div className="p-3 bg-secondary/20 rounded-xl text-sm">
                        <span className="text-muted-foreground">Il y a 2h :</span>
                        <span className="text-foreground ml-1">Paul a cité Socialy</span>
                      </div>
                      <div className="p-3 bg-secondary/20 rounded-xl text-sm">
                        <span className="text-muted-foreground">Hier :</span>
                        <span className="text-foreground ml-1">Sara badge 🔥 On Fire</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="bg-card rounded-2xl border border-border p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-xl">📊</span>
                      <h3 className="text-lg font-bold text-foreground">Ton mois</h3>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-secondary/20 rounded-xl">
                        <span className="text-sm text-foreground">Reposts</span>
                        <span className="text-sm font-semibold text-foreground">12 <span className="text-primary">(+60pts)</span></span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-secondary/20 rounded-xl">
                        <span className="text-sm text-foreground">Commentaires</span>
                        <span className="text-sm font-semibold text-foreground">8 <span className="text-primary">(+40pts)</span></span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-primary/10 to-transparent rounded-xl border border-primary/20">
                        <span className="text-sm text-foreground">Citations</span>
                        <span className="text-sm font-semibold text-foreground">5 <span className="text-primary">(+250pts)</span> 💕</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-card rounded-2xl border border-border p-6">
                    <h3 className="text-sm font-semibold text-muted-foreground mb-4">Badges à débloquer</h3>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="aspect-square bg-secondary/30 rounded-xl flex items-center justify-center text-2xl opacity-50">⭐</div>
                      <div className="aspect-square bg-secondary/30 rounded-xl flex items-center justify-center text-2xl opacity-50">💎</div>
                      <div className="aspect-square bg-secondary/30 rounded-xl flex items-center justify-center text-2xl opacity-50">👑</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeMainTab === "marche-public" && (
              <MarchePublicView />
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default GrowthMarketing;

