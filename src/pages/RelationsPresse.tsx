import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Header } from "@/components/dashboard/Header";
import { cn } from "@/lib/utils";
import {
  Users2,
  UserCircle,
  ChevronDown,
  ExternalLink,
  Calendar,
  Building2,
  Filter,
  Check,
  Image as ImageIcon,
  Mail,
  Send,
  Newspaper,
  Zap,
  X,
  Paperclip,
  Linkedin,
  Upload,
  Briefcase,
  MessageSquare,
  Info,
  Tag,
  FolderOpen,
  FileText,
  Presentation,
  File,
  Trash2,
  Download,
  Plus,
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "@/hooks/use-toast";

interface Article {
  id: string;
  title: string;
  link: string;
  thumbnail: string | null;
  source_name: string | null;
  source_icon: string | null;
  authors: string | null;
  article_date: string | null;
  snippet: string | null;
  competitor_name: string | null;
  agency_id: string;
}

interface SocialyArticle {
  id: string;
  title: string;
  link: string;
  thumbnail: string | null;
  source_name: string | null;
  source_icon: string | null;
  authors: string | null;
  article_date: string | null;
  snippet: string | null;
}

interface Agency {
  id: string;
  name: string;
}

interface Journalist {
  id: string;
  name: string;
  media: string | null;
  media_specialty: string | null;
  job: string | null;
  email: string | null;
  linkedin: string | null;
  notes: string | null;
  source_type: string | null;
  competitor_name: string | null;
  selected: boolean;
  isEditingNotes?: boolean;
}

const subTabs = [
  { id: "socialy", label: "Socialy", icon: Zap },
  { id: "concurrent", label: "Concurrent", icon: Users2 },
  { id: "journalistes", label: "Journalistes", icon: UserCircle },
  { id: "ressources", label: "Ressources", icon: FolderOpen },
];

interface Resource {
  id: string;
  name: string;
  type: string;
  description: string | null;
  file_url: string | null;
  content: string | null;
  created_at: string;
}

const RESOURCE_TYPES = [{ value: "communique", label: "Communiqué de presse", icon: FileText }];

const RelationsPresse = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const navigate = useNavigate();

  const [activeSubTab, setActiveSubTab] = useState("socialy");
  const [articles, setArticles] = useState<Article[]>([]);
  const [socialyArticles, setSocialyArticles] = useState<SocialyArticle[]>([]);
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingSocialy, setIsLoadingSocialy] = useState(false);
  const [selectedAgency, setSelectedAgency] = useState<string | null>(null);
  const [showAgencyDropdown, setShowAgencyDropdown] = useState(false);
  const [journalists, setJournalists] = useState<Journalist[]>([]);
  const [isLoadingJournalists, setIsLoadingJournalists] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailSubject, setEmailSubject] = useState("");
  const [emailMessage, setEmailMessage] = useState("");
  const [emailAttachment, setEmailAttachment] = useState<File | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<string | null>(null);
  const [showMediaDropdown, setShowMediaDropdown] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const [resources, setResources] = useState<Resource[]>([]);
  const [isLoadingResources, setIsLoadingResources] = useState(false);
  const [showAddResourceForm, setShowAddResourceForm] = useState(false);
  const [uploadingResource, setUploadingResource] = useState(false);
  const [activeResourceType, setActiveResourceType] = useState<string>("all");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formResourceName, setFormResourceName] = useState("");
  const [formResourceType, setFormResourceType] = useState("communique");
  const [formResourceDescription, setFormResourceDescription] = useState("");
  const [formResourceContent, setFormResourceContent] = useState("");
  const [formResourceFile, setFormResourceFile] = useState<File | null>(null);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate("/auth");
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    fetchAgencies();
    fetchArticles();
    fetchSocialyArticles();
    fetchJournalists();
    fetchResources();
  }, []);

  const fetchJournalists = async () => {
    setIsLoadingJournalists(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      const { data, error } = await supabase.from("journalists").select("*").eq("user_id", user.id).order("name");

      if (!error && data) {
        setJournalists(data.map((j) => ({ ...j, selected: false })));
      }
    }
    setIsLoadingJournalists(false);
  };

  const fetchAgencies = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase
        .from("competitor_agencies")
        .select("id, name")
        .eq("user_id", user.id)
        .order("name");
      setAgencies(data || []);
    }
  };

  const fetchArticles = async () => {
    setIsLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      const { data, error } = await supabase
        .from("competitor_articles")
        .select("*")
        .eq("user_id", user.id)
        .order("article_iso_date", { ascending: false });

      if (!error && data) {
        setArticles(data);
      }
    }
    setIsLoading(false);
  };

  const fetchSocialyArticles = async () => {
    setIsLoadingSocialy(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      const { data, error } = await supabase
        .from("socialy_articles")
        .select("*")
        .eq("user_id", user.id)
        .order("article_iso_date", { ascending: false });

      if (!error && data) {
        setSocialyArticles(data);
      }
    }
    setIsLoadingSocialy(false);
  };

  const fetchResources = async () => {
    setIsLoadingResources(true);
    try {
      const { data, error } = await supabase
        .from("admin_resources")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setResources(data as Resource[]);
    } catch (error: any) {
      console.error("Error fetching resources:", error);
    } finally {
      setIsLoadingResources(false);
    }
  };

  const handleResourceFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFormResourceFile(file);
      if (!formResourceName) {
        setFormResourceName(file.name.replace(/\.[^/.]+$/, ""));
      }
    }
  };

  const handleResourceSubmit = async () => {
    if (!formResourceName.trim()) {
      toast({ title: "Erreur", description: "Le nom est requis", variant: "destructive" });
      return;
    }

    if (!formResourceContent.trim() && !formResourceFile) {
      toast({ title: "Erreur", description: "Ajoutez du contenu ou un fichier", variant: "destructive" });
      return;
    }

    setUploadingResource(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      let fileUrl: string | null = null;

      if (formResourceFile) {
        const fileExt = formResourceFile.name.split(".").pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `${user.id}/${fileName}`;

        const { error: uploadError } = await supabase.storage.from("resources").upload(filePath, formResourceFile);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage.from("resources").getPublicUrl(filePath);

        fileUrl = urlData.publicUrl;
      }

      const { error } = await supabase.from("admin_resources").insert({
        name: formResourceName.trim(),
        type: formResourceType,
        description: formResourceDescription.trim() || null,
        content: formResourceContent.trim() || null,
        file_url: fileUrl,
        uploaded_by: user.id,
      });

      if (error) throw error;

      toast({ title: "Ressource ajoutée !" });
      resetResourceForm();
      fetchResources();
    } catch (error: any) {
      console.error("Error adding resource:", error);
      toast({ title: "Erreur", description: "Erreur lors de l'ajout", variant: "destructive" });
    } finally {
      setUploadingResource(false);
    }
  };

  const handleDeleteResource = async (resource: Resource) => {
    try {
      if (resource.file_url) {
        const pathMatch = resource.file_url.match(/resources\/(.+)$/);
        if (pathMatch) {
          await supabase.storage.from("resources").remove([pathMatch[1]]);
        }
      }

      const { error } = await supabase.from("admin_resources").delete().eq("id", resource.id);

      if (error) throw error;

      toast({ title: "Ressource supprimée" });
      fetchResources();
    } catch (error: any) {
      toast({ title: "Erreur", description: "Erreur lors de la suppression", variant: "destructive" });
    }
  };

  const resetResourceForm = () => {
    setFormResourceName("");
    setFormResourceType("communique");
    setFormResourceDescription("");
    setFormResourceContent("");
    setFormResourceFile(null);
    setShowAddResourceForm(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const filteredResources =
    activeResourceType === "all" ? resources : resources.filter((r) => r.type === activeResourceType);

  const getResourceTypeIcon = (type: string) => {
    const found = RESOURCE_TYPES.find((t) => t.value === type);
    return found ? found.icon : File;
  };

  const getResourceTypeLabel = (type: string) => {
    const found = RESOURCE_TYPES.find((t) => t.value === type);
    return found ? found.label : type;
  };

  const filteredArticles = selectedAgency ? articles.filter((a) => a.agency_id === selectedAgency) : articles;

  const selectedAgencyName = selectedAgency
    ? agencies.find((a) => a.id === selectedAgency)?.name
    : "Tous les concurrents";

  const toggleJournalist = (id: string) => {
    setJournalists(journalists.map((j) => (j.id === id ? { ...j, selected: !j.selected } : j)));
  };

  const updateJournalistNotes = async (id: string, notes: string) => {
    const { error } = await supabase.from("journalists").update({ notes }).eq("id", id);

    if (error) {
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder le commentaire",
        variant: "destructive",
      });
    } else {
      setJournalists(journalists.map((j) => (j.id === id ? { ...j, notes, isEditingNotes: false } : j)));
    }
  };

  const startEditingNotes = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setJournalists(
      journalists.map((j) => (j.id === id ? { ...j, isEditingNotes: true } : { ...j, isEditingNotes: false })),
    );
  };

  const selectedJournalists = journalists.filter((j) => j.selected);

  // Get unique medias for filter dropdown (sanitized)
  const uniqueMedias = Array.from(
    new Set(journalists.map((j) => j.media).filter((m): m is string => m !== null && m.trim() !== "")),
  ).sort((a, b) => a.localeCompare(b, "fr"));

  // Filter journalists by selected media
  const filteredJournalists = selectedMedia ? journalists.filter((j) => j.media === selectedMedia) : journalists;

  const selectedMediaLabel = selectedMedia || "Tous les médias";

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
    });
  };

  const handleCsvImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      toast({
        title: "Erreur",
        description: "Vous devez être connecté pour importer des journalistes",
        variant: "destructive",
      });
      setIsImporting(false);
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const text = e.target?.result as string;
        const lines = text.split("\n").filter((line) => line.trim());

        // Skip header row and parse data
        const dataLines = lines.slice(1);
        const journalistsToInsert = [];

        for (const line of dataLines) {
          // Parse CSV, handling potential commas within quoted fields
          const values = line.match(/(".*?"|[^,]+)(?=\s*,|\s*$)/g)?.map((v) => v.replace(/^"|"$/g, "").trim()) || [];

          // Expected format: Media, Contact, Poste, Email, Tel direct, Commentaire
          const [media, name, job, email, phone, notes] = values;

          if (name && name.trim()) {
            journalistsToInsert.push({
              user_id: user.id,
              name: name.trim(),
              media: media?.trim() || null,
              job: job?.trim() || null,
              email: email?.trim() || null,
              phone: phone?.trim() || null,
              notes: notes?.trim() || null,
              source_type: "import",
            });
          }
        }

        if (journalistsToInsert.length > 0) {
          const { error } = await supabase.from("journalists").insert(journalistsToInsert);

          if (error) {
            throw error;
          }

          toast({
            title: "Import réussi !",
            description: `${journalistsToInsert.length} journaliste(s) importé(s)`,
          });
          fetchJournalists();
        } else {
          toast({
            title: "Fichier vide",
            description: "Aucun journaliste trouvé dans le fichier",
            variant: "destructive",
          });
        }
      } catch (error: any) {
        console.error("Import error:", error);
        toast({
          title: "Erreur d'import",
          description: error.message || "Une erreur est survenue lors de l'import",
          variant: "destructive",
        });
      }
      setIsImporting(false);
    };
    reader.readAsText(file);
    event.target.value = "";
  };

  const handleSendEmail = async () => {
    if (!emailSubject.trim() || !emailMessage.trim()) {
      toast({
        title: "Champs requis",
        description: "Veuillez remplir le sujet et le message",
        variant: "destructive",
      });
      return;
    }

    setIsSending(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));

    toast({
      title: "Communiqué envoyé !",
      description: `Email envoyé à ${selectedJournalists.length} journaliste(s)`,
    });

    setShowEmailModal(false);
    setEmailSubject("");
    setEmailMessage("");
    setEmailAttachment(null);
    setJournalists(journalists.map((j) => ({ ...j, selected: false })));
    setIsSending(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />

      <main className={cn("min-h-screen p-8 content-transition", sidebarCollapsed ? "ml-20" : "ml-64")}>
        <Header />

        {/* Full Page Relations Presse */}
        <div className="glass-card rounded-2xl p-8">
          {/* Header with title and sub-tabs */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Newspaper className="w-7 h-7 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Relations Presse</h1>
                <p className="text-muted-foreground text-sm mt-1">
                  Gérez vos retombées presse et vos contacts journalistes
                </p>
              </div>
            </div>

            {/* Sub-tabs */}
            <div className="flex items-center gap-2 p-2 bg-secondary/50 rounded-xl">
              {subTabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeSubTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveSubTab(tab.id)}
                    className={cn(
                      "flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200",
                      isActive
                        ? "bg-foreground text-background shadow-md"
                        : "text-muted-foreground hover:text-foreground hover:bg-secondary/80",
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* SOCIALY TAB */}
          {activeSubTab === "socialy" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <p className="text-lg font-medium text-foreground flex items-center gap-2">
                  <Zap className="w-5 h-5 text-primary" />
                  Retombées presse de Socialy
                </p>
                <span className="text-sm font-medium text-muted-foreground bg-secondary/50 px-4 py-2 rounded-lg">
                  {socialyArticles.length} article{socialyArticles.length !== 1 ? "s" : ""}
                </span>
              </div>

              {isLoadingSocialy ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="flex gap-4 p-4 bg-secondary/30 rounded-2xl animate-pulse">
                      <div className="w-28 h-24 bg-secondary rounded-xl flex-shrink-0" />
                      <div className="flex-1 space-y-3">
                        <div className="h-5 bg-secondary rounded w-3/4" />
                        <div className="h-4 bg-secondary rounded w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : socialyArticles.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {socialyArticles.map((article) => (
                    <a
                      key={article.id}
                      href={article.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex gap-4 p-4 bg-secondary/40 hover:bg-secondary/70 rounded-2xl transition-all duration-300 border border-transparent hover:border-primary/20 hover:shadow-lg"
                    >
                      <div className="relative w-28 h-24 rounded-xl bg-secondary overflow-hidden flex-shrink-0">
                        {article.thumbnail ? (
                          <img
                            src={article.thumbnail}
                            alt=""
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-secondary to-muted">
                            <ImageIcon className="w-8 h-8 text-muted-foreground/30" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-2">
                          <ExternalLink className="w-4 h-4 text-background" />
                        </div>
                      </div>

                      <div className="flex-1 min-w-0 flex flex-col justify-center">
                        <h4 className="text-sm font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors leading-tight">
                          {article.title}
                        </h4>

                        <div className="flex items-center gap-2 mt-2.5 flex-wrap">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-primary/15 text-primary text-xs font-semibold">
                            <Zap className="w-3 h-3" />
                            Socialy
                          </span>
                          {article.source_name && (
                            <span className="text-xs text-muted-foreground flex items-center gap-1 font-medium">
                              {article.source_icon && (
                                <img src={article.source_icon} alt="" className="w-3.5 h-3.5 rounded" />
                              )}
                              {article.source_name}
                            </span>
                          )}
                        </div>
                        {article.article_date && (
                          <span className="text-xs text-muted-foreground flex items-center gap-1 font-medium mt-1.5">
                            <Calendar className="w-3 h-3" />
                            {formatDate(article.article_date)}
                          </span>
                        )}
                      </div>
                    </a>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 bg-gradient-to-br from-primary/5 to-primary/10 rounded-2xl border border-primary/20">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center mb-6 shadow-lg shadow-primary/25">
                    <Zap className="w-10 h-10 text-primary-foreground" />
                  </div>
                  <h4 className="text-2xl font-bold text-foreground">Vos retombées presse</h4>
                  <p className="text-muted-foreground mt-2 text-center max-w-md">
                    Aucun article trouvé. Configurez votre veille pour voir les mentions de Socialy.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* CONCURRENT TAB */}
          {activeSubTab === "concurrent" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="relative">
                  <button
                    onClick={() => setShowAgencyDropdown(!showAgencyDropdown)}
                    className="flex items-center gap-3 px-5 py-3 bg-secondary/60 border border-border rounded-xl hover:border-primary/40 transition-all duration-200 shadow-sm"
                  >
                    <Filter className="w-4 h-4 text-primary" />
                    <span className="text-sm font-semibold text-foreground">{selectedAgencyName}</span>
                    <ChevronDown
                      className={cn(
                        "w-4 h-4 text-muted-foreground transition-transform duration-200",
                        showAgencyDropdown && "rotate-180",
                      )}
                    />
                  </button>

                  {showAgencyDropdown && (
                    <div className="absolute top-full left-0 mt-2 w-72 bg-card border border-border rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                      <div className="p-2">
                        <button
                          onClick={() => {
                            setSelectedAgency(null);
                            setShowAgencyDropdown(false);
                          }}
                          className={cn(
                            "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
                            !selectedAgency ? "bg-primary/10 text-primary" : "text-foreground hover:bg-secondary",
                          )}
                        >
                          <Users2 className="w-5 h-5" />
                          Tous les concurrents
                          {!selectedAgency && <Check className="w-5 h-5 ml-auto" />}
                        </button>

                        {agencies.length > 0 && <div className="border-t border-border my-2" />}

                        {agencies.map((agency) => (
                          <button
                            key={agency.id}
                            onClick={() => {
                              setSelectedAgency(agency.id);
                              setShowAgencyDropdown(false);
                            }}
                            className={cn(
                              "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
                              selectedAgency === agency.id
                                ? "bg-primary/10 text-primary"
                                : "text-foreground hover:bg-secondary",
                            )}
                          >
                            <Building2 className="w-5 h-5" />
                            {agency.name}
                            {selectedAgency === agency.id && <Check className="w-5 h-5 ml-auto" />}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <span className="text-sm font-medium text-muted-foreground bg-secondary/50 px-4 py-2 rounded-lg">
                  {filteredArticles.length} article{filteredArticles.length !== 1 ? "s" : ""}
                </span>
              </div>

              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="flex gap-4 p-4 bg-secondary/30 rounded-2xl animate-pulse">
                      <div className="w-28 h-24 bg-secondary rounded-xl flex-shrink-0" />
                      <div className="flex-1 space-y-3">
                        <div className="h-5 bg-secondary rounded w-3/4" />
                        <div className="h-4 bg-secondary rounded w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredArticles.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {filteredArticles.map((article) => (
                    <a
                      key={article.id}
                      href={article.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex gap-4 p-4 bg-secondary/40 hover:bg-secondary/70 rounded-2xl transition-all duration-300 border border-transparent hover:border-primary/20 hover:shadow-lg"
                    >
                      <div className="relative w-28 h-24 rounded-xl bg-secondary overflow-hidden flex-shrink-0">
                        {article.thumbnail ? (
                          <img
                            src={article.thumbnail}
                            alt=""
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-secondary to-muted">
                            <ImageIcon className="w-8 h-8 text-muted-foreground/30" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-2">
                          <ExternalLink className="w-4 h-4 text-background" />
                        </div>
                      </div>

                      <div className="flex-1 min-w-0 flex flex-col justify-center">
                        <h4 className="text-sm font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors leading-tight">
                          {article.title}
                        </h4>

                        <div className="flex items-center gap-2 mt-2.5 flex-wrap">
                          {article.competitor_name && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-primary/15 text-primary text-xs font-semibold">
                              <Building2 className="w-3 h-3" />
                              {article.competitor_name}
                            </span>
                          )}
                          {article.source_name && (
                            <span className="text-xs text-muted-foreground flex items-center gap-1 font-medium">
                              {article.source_icon && (
                                <img src={article.source_icon} alt="" className="w-3.5 h-3.5 rounded" />
                              )}
                              {article.source_name}
                            </span>
                          )}
                        </div>
                        {article.article_date && (
                          <span className="text-xs text-muted-foreground flex items-center gap-1 font-medium mt-1.5">
                            <Calendar className="w-3 h-3" />
                            {formatDate(article.article_date)}
                          </span>
                        )}
                      </div>
                    </a>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 bg-gradient-to-br from-primary/5 to-primary/10 rounded-2xl border border-primary/20">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center mb-6 shadow-lg shadow-primary/25">
                    <Users2 className="w-10 h-10 text-primary-foreground" />
                  </div>
                  <h4 className="text-2xl font-bold text-foreground">Veille concurrentielle</h4>
                  <p className="text-muted-foreground mt-2 text-center max-w-md">
                    Aucun article trouvé. Ajoutez des concurrents et configurez votre veille.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* JOURNALISTES TAB */}
          {activeSubTab === "journalistes" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <p className="text-lg font-medium text-foreground flex items-center gap-2">
                    <UserCircle className="w-5 h-5 text-primary" />
                    Vos contacts journalistes
                  </p>

                  {/* Media Filter Dropdown */}
                  <div className="relative">
                    <button
                      onClick={() => setShowMediaDropdown(!showMediaDropdown)}
                      className="flex items-center gap-2 px-4 py-2 bg-secondary/60 border border-border rounded-xl hover:border-primary/40 transition-all duration-200 shadow-sm"
                    >
                      <Filter className="w-4 h-4 text-primary" />
                      <span className="text-sm font-medium text-foreground">{selectedMediaLabel}</span>
                      <ChevronDown
                        className={cn(
                          "w-4 h-4 text-muted-foreground transition-transform duration-200",
                          showMediaDropdown && "rotate-180",
                        )}
                      />
                    </button>

                    {showMediaDropdown && (
                      <div className="absolute top-full left-0 mt-2 w-64 bg-card border border-border rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                        <div className="p-2 max-h-80 overflow-y-auto">
                          <button
                            onClick={() => {
                              setSelectedMedia(null);
                              setShowMediaDropdown(false);
                            }}
                            className={cn(
                              "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
                              !selectedMedia ? "bg-primary/10 text-primary" : "text-foreground hover:bg-secondary",
                            )}
                          >
                            <Newspaper className="w-5 h-5" />
                            Tous les médias
                            {!selectedMedia && <Check className="w-5 h-5 ml-auto" />}
                          </button>

                          {uniqueMedias.length > 0 && <div className="border-t border-border my-2" />}

                          {uniqueMedias.map((media) => (
                            <button
                              key={media}
                              onClick={() => {
                                setSelectedMedia(media);
                                setShowMediaDropdown(false);
                              }}
                              className={cn(
                                "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
                                selectedMedia === media
                                  ? "bg-primary/10 text-primary"
                                  : "text-foreground hover:bg-secondary",
                              )}
                            >
                              <Newspaper className="w-5 h-5" />
                              {media}
                              {selectedMedia === media && <Check className="w-5 h-5 ml-auto" />}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {/* Import CSV Button */}
                  <label
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 bg-secondary/60 border border-border rounded-xl hover:border-primary/40 transition-all cursor-pointer",
                      isImporting && "opacity-50 cursor-not-allowed",
                    )}
                  >
                    <Upload className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium text-foreground">
                      {isImporting ? "Import..." : "Importer CSV"}
                    </span>
                    <input
                      type="file"
                      accept=".csv,.txt"
                      className="hidden"
                      onChange={handleCsvImport}
                      disabled={isImporting}
                    />
                  </label>

                  <span className="text-sm font-medium text-muted-foreground bg-secondary/50 px-4 py-2 rounded-lg">
                    {filteredJournalists.length} journaliste{filteredJournalists.length !== 1 ? "s" : ""}
                  </span>
                  {selectedJournalists.length > 0 && (
                    <button
                      onClick={() => setShowEmailModal(true)}
                      className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-all font-semibold shadow-lg shadow-primary/25"
                    >
                      <Send className="w-4 h-4" />
                      Envoyer un communiqué ({selectedJournalists.length})
                    </button>
                  )}
                </div>
              </div>

              {isLoadingJournalists ? (
                <div className="bg-secondary/30 rounded-2xl overflow-hidden">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div
                      key={i}
                      className="flex items-center gap-4 px-5 py-4 border-b border-border/50 last:border-b-0 animate-pulse"
                    >
                      <div className="w-10 h-10 bg-secondary rounded-full flex-shrink-0" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-secondary rounded w-1/4" />
                      </div>
                      <div className="h-4 bg-secondary rounded w-1/6" />
                      <div className="h-4 bg-secondary rounded w-1/5" />
                      <div className="h-4 bg-secondary rounded w-1/6" />
                    </div>
                  ))}
                </div>
              ) : filteredJournalists.length > 0 ? (
                <div className="bg-card rounded-2xl border border-border overflow-hidden">
                  {/* Table Header */}
                  <div className="grid grid-cols-[auto_1.5fr_1.2fr_1fr_0.8fr_0.5fr_1.2fr_1.5fr_60px] gap-3 px-5 py-3 bg-secondary/60 border-b border-border text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    <div className="w-10" />
                    <div>Contact</div>
                    <div>Média</div>
                    <div className="flex items-center gap-1">
                      Spécialité
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="w-3 h-3 text-muted-foreground/60 cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Spécialité du média (Tech, Mode, Business...)</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <div>Poste</div>
                    <div>LinkedIn</div>
                    <div>Email</div>
                    <div>Commentaire</div>
                    <div className="text-center">Sélect.</div>
                  </div>

                  {/* Table Body */}
                  <div className="divide-y divide-border/50">
                    {filteredJournalists.map((journalist) => (
                      <button
                        key={journalist.id}
                        onClick={() => toggleJournalist(journalist.id)}
                        className={cn(
                          "w-full grid grid-cols-[auto_1.5fr_1.2fr_1fr_0.8fr_0.5fr_1.2fr_1.5fr_60px] gap-3 px-5 py-4 text-left transition-all duration-200 hover:bg-secondary/50",
                          journalist.selected && "bg-primary/5",
                        )}
                      >
                        {/* Avatar */}
                        <div
                          className={cn(
                            "w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0",
                            journalist.selected ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground",
                          )}
                        >
                          {journalist.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .slice(0, 2)}
                        </div>

                        {/* Contact Name */}
                        <div className="flex items-center min-w-0">
                          <span className="font-semibold text-foreground truncate">{journalist.name}</span>
                        </div>

                        {/* Media - Modern Tag */}
                        <div className="flex items-center min-w-0">
                          {journalist.media ? (
                            <span
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-blue-500/15 to-indigo-500/15 text-blue-700 dark:text-blue-400 text-xs font-semibold border border-blue-500/20 max-w-full"
                              title={journalist.media}
                            >
                              <Newspaper className="w-3 h-3 flex-shrink-0" />
                              <span className="truncate">{journalist.media}</span>
                            </span>
                          ) : (
                            <span className="text-sm text-muted-foreground/50">—</span>
                          )}
                        </div>

                        {/* Media Specialty */}
                        <div className="flex items-center min-w-0">
                          {journalist.media_specialty ? (
                            <span
                              className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-xs font-medium"
                              title={journalist.media_specialty}
                            >
                              <Tag className="w-3 h-3 flex-shrink-0" />
                              <span className="truncate">{journalist.media_specialty}</span>
                            </span>
                          ) : (
                            <span className="text-sm text-muted-foreground/50">—</span>
                          )}
                        </div>

                        {/* Job - Poste */}
                        <div className="flex items-center min-w-0">
                          {journalist.job ? (
                            <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-purple-500/10 text-purple-700 dark:text-purple-400 text-xs font-medium truncate">
                              <Briefcase className="w-3 h-3 flex-shrink-0" />
                              {journalist.job}
                            </span>
                          ) : (
                            <span className="text-sm text-muted-foreground/50">—</span>
                          )}
                        </div>

                        {/* LinkedIn */}
                        <div className="flex items-center min-w-0">
                          {journalist.linkedin ? (
                            <a
                              href={journalist.linkedin}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-[#0A66C2]/15 text-[#0A66C2] hover:bg-[#0A66C2]/25 transition-colors"
                            >
                              <Linkedin className="w-4 h-4" />
                            </a>
                          ) : (
                            <span className="text-sm text-muted-foreground/50">—</span>
                          )}
                        </div>

                        {/* Email */}
                        <div className="flex items-center min-w-0">
                          {journalist.email ? (
                            <span className="text-sm text-primary truncate">{journalist.email}</span>
                          ) : (
                            <span className="text-sm text-muted-foreground/50">—</span>
                          )}
                        </div>

                        {/* Notes - Commentaire éditable */}
                        <div className="flex items-center min-w-0" onClick={(e) => e.stopPropagation()}>
                          {journalist.isEditingNotes ? (
                            <input
                              type="text"
                              defaultValue={journalist.notes || ""}
                              autoFocus
                              className="w-full px-2 py-1 text-sm bg-background border border-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                              onBlur={(e) => updateJournalistNotes(journalist.id, e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  updateJournalistNotes(journalist.id, e.currentTarget.value);
                                }
                                if (e.key === "Escape") {
                                  setJournalists(
                                    journalists.map((j) =>
                                      j.id === journalist.id ? { ...j, isEditingNotes: false } : j,
                                    ),
                                  );
                                }
                              }}
                            />
                          ) : (
                            <button
                              onClick={(e) => startEditingNotes(journalist.id, e)}
                              className={cn(
                                "w-full text-left px-2 py-1 rounded-lg transition-colors text-sm",
                                journalist.notes
                                  ? "bg-amber-500/10 text-amber-700 dark:text-amber-400 hover:bg-amber-500/20"
                                  : "text-muted-foreground/50 hover:bg-secondary hover:text-foreground",
                              )}
                            >
                              {journalist.notes || "Ajouter..."}
                            </button>
                          )}
                        </div>

                        {/* Checkbox */}
                        <div className="flex items-center justify-center">
                          <div
                            className={cn(
                              "w-6 h-6 rounded-lg border-2 flex items-center justify-center flex-shrink-0 transition-all",
                              journalist.selected
                                ? "bg-primary border-primary"
                                : "border-muted-foreground/30 hover:border-primary/50",
                            )}
                          >
                            {journalist.selected && <Check className="w-4 h-4 text-primary-foreground" />}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 bg-gradient-to-br from-primary/5 to-primary/10 rounded-2xl border border-primary/20">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center mb-6 shadow-lg shadow-primary/25">
                    <UserCircle className="w-10 h-10 text-primary-foreground" />
                  </div>
                  <h4 className="text-2xl font-bold text-foreground">Vos contacts journalistes</h4>
                  <p className="text-muted-foreground mt-2 text-center max-w-md">
                    Les journalistes seront automatiquement ajoutés à partir des articles de votre veille presse.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* RESSOURCES TAB */}
          {activeSubTab === "ressources" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                    <FolderOpen className="w-5 h-5 text-primary" />
                    Vos ressources
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Templates et communiqués pour vos relations presse
                  </p>
                </div>
                <Button onClick={() => setShowAddResourceForm(true)} className="gap-2">
                  <Plus className="w-4 h-4" />
                  Communiqué
                </Button>
              </div>

              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => setActiveResourceType("all")}
                  className={cn(
                    "px-4 py-2 rounded-full text-sm font-medium transition-all",
                    activeResourceType === "all"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted/50 text-muted-foreground hover:bg-muted",
                  )}
                >
                  Tous ({resources.length})
                </button>
                {RESOURCE_TYPES.map((type) => {
                  const count = resources.filter((r) => r.type === type.value).length;
                  return (
                    <button
                      key={type.value}
                      onClick={() => setActiveResourceType(type.value)}
                      className={cn(
                        "px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2",
                        activeResourceType === type.value
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted/50 text-muted-foreground hover:bg-muted",
                      )}
                    >
                      <type.icon className="w-4 h-4" />
                      {type.label} ({count})
                    </button>
                  );
                })}
              </div>

              {isLoadingResources ? (
                <div className="flex justify-center py-12">
                  <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                </div>
              ) : filteredResources.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 bg-gradient-to-br from-primary/5 to-primary/10 rounded-2xl border border-primary/20">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center mb-6 shadow-lg shadow-primary/25">
                    <FolderOpen className="w-10 h-10 text-primary-foreground" />
                  </div>
                  <h4 className="text-2xl font-bold text-foreground">Aucune ressource</h4>
                  <p className="text-muted-foreground mt-2 text-center max-w-md">
                    Ajoutez vos premiers templates et communiqués de presse
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredResources.map((resource) => {
                    const TypeIcon = getResourceTypeIcon(resource.type);
                    return (
                      <div key={resource.id} className="glass-card p-5 rounded-xl group hover:shadow-lg transition-all">
                        <div className="flex items-start justify-between mb-3">
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <TypeIcon className="w-5 h-5 text-primary" />
                          </div>
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            {resource.file_url && (
                              <a href={resource.file_url} target="_blank" rel="noopener noreferrer">
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <Download className="w-4 h-4" />
                                </Button>
                              </a>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive"
                              onClick={() => handleDeleteResource(resource)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>

                        <h4 className="font-semibold text-foreground mb-1 line-clamp-1">{resource.name}</h4>
                        <p className="text-xs text-muted-foreground mb-2">{getResourceTypeLabel(resource.type)}</p>

                        {resource.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{resource.description}</p>
                        )}

                        {resource.content && (
                          <div className="bg-muted/50 rounded-lg p-3 max-h-24 overflow-hidden relative">
                            <p className="text-xs text-muted-foreground font-mono line-clamp-4">{resource.content}</p>
                            <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-muted/50 to-transparent" />
                          </div>
                        )}

                        <p className="text-xs text-muted-foreground mt-3">
                          Ajouté le {new Date(resource.created_at).toLocaleDateString("fr-FR")}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Add Resource Modal */}
      {showAddResourceForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-card rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-border shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-foreground">Nouvelle ressource</h3>
              <Button variant="ghost" size="icon" onClick={resetResourceForm}>
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Nom</Label>
                  <Input
                    value={formResourceName}
                    onChange={(e) => setFormResourceName(e.target.value)}
                    placeholder="Nom de la ressource"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Type</Label>
                  <Select value={formResourceType} onValueChange={setFormResourceType}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {RESOURCE_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          <div className="flex items-center gap-2">
                            <type.icon className="w-4 h-4" />
                            {type.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Description (optionnel)</Label>
                <Input
                  value={formResourceDescription}
                  onChange={(e) => setFormResourceDescription(e.target.value)}
                  placeholder="Brève description"
                  className="mt-1"
                />
              </div>

              <div>
                <Label>Contenu texte</Label>
                <Textarea
                  value={formResourceContent}
                  onChange={(e) => setFormResourceContent(e.target.value)}
                  placeholder="Collez le texte du communiqué, template, etc."
                  className="mt-1 min-h-[200px] font-mono text-sm"
                />
              </div>

              <div>
                <Label>Ou importer un fichier</Label>
                <div className="mt-1">
                  <input
                    ref={fileInputRef}
                    type="file"
                    onChange={handleResourceFileChange}
                    className="hidden"
                    accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.md"
                  />
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className={cn(
                      "border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors",
                      formResourceFile ? "border-primary bg-primary/5" : "border-border hover:border-muted-foreground",
                    )}
                  >
                    {formResourceFile ? (
                      <div className="flex items-center justify-center gap-3">
                        <File className="w-8 h-8 text-primary" />
                        <div className="text-left">
                          <p className="font-medium text-foreground">{formResourceFile.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {(formResourceFile.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            setFormResourceFile(null);
                            if (fileInputRef.current) {
                              fileInputRef.current.value = "";
                            }
                          }}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ) : (
                      <div>
                        <Upload className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                        <p className="text-muted-foreground">Cliquez ou glissez un fichier</p>
                        <p className="text-xs text-muted-foreground mt-1">PDF, Word, PowerPoint, TXT</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={resetResourceForm}>
                  Annuler
                </Button>
                <Button onClick={handleResourceSubmit} disabled={uploadingResource}>
                  {uploadingResource ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    "Enregistrer"
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Email Modal */}
      {showEmailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-foreground/60 backdrop-blur-sm"
            onClick={() => setShowEmailModal(false)}
          />

          <div className="relative w-full max-w-2xl bg-card rounded-3xl shadow-2xl border border-border overflow-hidden animate-in fade-in zoom-in-95 duration-300">
            <div className="flex items-center justify-between p-6 border-b border-border bg-gradient-to-r from-primary/5 to-transparent">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Mail className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground">Nouveau communiqué</h3>
                  <p className="text-sm text-muted-foreground">
                    À : {selectedJournalists.map((j) => j.name).join(", ")}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowEmailModal(false)}
                className="w-10 h-10 rounded-full hover:bg-secondary flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div>
                <label className="text-sm font-semibold text-foreground mb-2 block">Sujet</label>
                <input
                  type="text"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  placeholder="Sujet de votre communiqué..."
                  className="w-full px-4 py-3 rounded-xl bg-secondary/50 border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-foreground placeholder:text-muted-foreground"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-foreground mb-2 block">Message</label>
                <textarea
                  value={emailMessage}
                  onChange={(e) => setEmailMessage(e.target.value)}
                  placeholder="Rédigez votre communiqué de presse..."
                  rows={8}
                  className="w-full px-4 py-3 rounded-xl bg-secondary/50 border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-foreground placeholder:text-muted-foreground resize-none"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-foreground mb-2 block">Pièce jointe</label>
                <label className="flex items-center gap-3 px-4 py-3 rounded-xl bg-secondary/50 border border-dashed border-border hover:border-primary/40 cursor-pointer transition-all">
                  <Paperclip className="w-5 h-5 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {emailAttachment ? emailAttachment.name : "Ajouter un communiqué PDF..."}
                  </span>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    className="hidden"
                    onChange={(e) => setEmailAttachment(e.target.files?.[0] || null)}
                  />
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 p-6 border-t border-border bg-secondary/30">
              <button
                onClick={() => setShowEmailModal(false)}
                className="px-5 py-2.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary transition-all font-medium"
              >
                Annuler
              </button>
              <button
                onClick={handleSendEmail}
                disabled={isSending}
                className="flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-all font-semibold shadow-lg shadow-primary/25 disabled:opacity-50"
              >
                {isSending ? (
                  <>
                    <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    Envoi...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Envoyer
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RelationsPresse;
