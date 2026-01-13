import { useState, useEffect } from "react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Header } from "@/components/dashboard/Header";
import { OrganizationLinkedInPosts } from "@/components/growth/OrganizationLinkedInPosts";
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
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeMainTab, setActiveMainTab] = useState<MainTab>("linkedin");
  const [linkedinSubTab, setLinkedinSubTab] = useState<LinkedInSubTab>("generation");
  const [viewMode, setViewMode] = useState<ViewMode>("menu");
  const [postFilter, setPostFilter] = useState<"all" | "linkedin" | "generated">("all");
  
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
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              <div className="lg:col-span-3 space-y-6">
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
              </div>

              <div className="lg:col-span-2">
                <div className="bg-card rounded-2xl border border-border p-6 sticky top-8">
                  <div className="mb-6">
                    <h3 className="text-base font-semibold text-foreground">Créer du contenu</h3>
                    <p className="text-xs text-muted-foreground">Générez du contenu avec l'IA</p>
                  </div>

                  {viewMode === "menu" ? (
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
                  ) : (
                    <>
                      <button
                        onClick={handleBackToMenu}
                        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
                      >
                        ← Retour
                      </button>

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
                    </>
                  )}
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
            <div className="bg-card rounded-2xl border border-border p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                  <Briefcase className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground">Marché Public</h3>
                  <p className="text-sm text-muted-foreground">Gérez vos appels d'offres et opportunités</p>
                </div>
              </div>
              <div className="text-center py-12 bg-secondary/20 rounded-2xl">
                <Briefcase className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                <p className="text-muted-foreground font-medium">Fonctionnalité à venir</p>
                <p className="text-sm text-muted-foreground/70 mt-1">
                  La gestion des marchés publics sera bientôt disponible
                </p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default GrowthMarketing;
