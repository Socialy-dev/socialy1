import { useState, useEffect } from "react";
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
  Paperclip
} from "lucide-react";
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
  media: string;
  email: string;
  selected: boolean;
}

const subTabs = [
  { id: "socialy", label: "Socialy", icon: Zap },
  { id: "concurrent", label: "Concurrent", icon: Users2 },
  { id: "journalistes", label: "Journalistes", icon: UserCircle },
];

const mockJournalists: Journalist[] = [
  { id: "1", name: "Marie Dupont", media: "Le Monde", email: "m.dupont@lemonde.fr", selected: false },
  { id: "2", name: "Jean Martin", media: "Les Échos", email: "j.martin@lesechos.fr", selected: false },
  { id: "3", name: "Sophie Bernard", media: "Le Figaro", email: "s.bernard@lefigaro.fr", selected: false },
];

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
  const [journalists, setJournalists] = useState<Journalist[]>(mockJournalists);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailSubject, setEmailSubject] = useState("");
  const [emailMessage, setEmailMessage] = useState("");
  const [emailAttachment, setEmailAttachment] = useState<File | null>(null);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
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
  }, []);

  const fetchAgencies = async () => {
    const { data: { user } } = await supabase.auth.getUser();
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
    const { data: { user } } = await supabase.auth.getUser();
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
    const { data: { user } } = await supabase.auth.getUser();
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

  const filteredArticles = selectedAgency
    ? articles.filter(a => a.agency_id === selectedAgency)
    : articles;

  const selectedAgencyName = selectedAgency
    ? agencies.find(a => a.id === selectedAgency)?.name
    : "Tous les concurrents";

  const toggleJournalist = (id: string) => {
    setJournalists(journalists.map(j => 
      j.id === id ? { ...j, selected: !j.selected } : j
    ));
  };

  const selectedJournalists = journalists.filter(j => j.selected);

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString("fr-FR", { 
      day: "numeric", 
      month: "short"
    });
  };

  const handleSendEmail = async () => {
    if (!emailSubject.trim() || !emailMessage.trim()) {
      toast({
        title: "Champs requis",
        description: "Veuillez remplir le sujet et le message",
        variant: "destructive"
      });
      return;
    }

    setIsSending(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    toast({
      title: "Communiqué envoyé !",
      description: `Email envoyé à ${selectedJournalists.length} journaliste(s)`,
    });

    setShowEmailModal(false);
    setEmailSubject("");
    setEmailMessage("");
    setEmailAttachment(null);
    setJournalists(journalists.map(j => ({ ...j, selected: false })));
    setIsSending(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
      
      <main
        className={cn(
          "min-h-screen p-8 content-transition",
          sidebarCollapsed ? "ml-20" : "ml-64"
        )}
      >
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
                <p className="text-muted-foreground text-sm mt-1">Gérez vos retombées presse et vos contacts journalistes</p>
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
                        : "text-muted-foreground hover:text-foreground hover:bg-secondary/80"
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
                  {[1, 2, 3, 4, 5, 6].map(i => (
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
                    <ChevronDown className={cn(
                      "w-4 h-4 text-muted-foreground transition-transform duration-200",
                      showAgencyDropdown && "rotate-180"
                    )} />
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
                            !selectedAgency 
                              ? "bg-primary/10 text-primary" 
                              : "text-foreground hover:bg-secondary"
                          )}
                        >
                          <Users2 className="w-5 h-5" />
                          Tous les concurrents
                          {!selectedAgency && <Check className="w-5 h-5 ml-auto" />}
                        </button>
                        
                        {agencies.length > 0 && <div className="border-t border-border my-2" />}
                        
                        {agencies.map(agency => (
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
                                : "text-foreground hover:bg-secondary"
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
                  {[1, 2, 3, 4, 5, 6].map(i => (
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
                <p className="text-lg font-medium text-foreground flex items-center gap-2">
                  <UserCircle className="w-5 h-5 text-primary" />
                  Sélectionnez vos contacts
                </p>
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

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {journalists.map((journalist) => (
                  <button
                    key={journalist.id}
                    onClick={() => toggleJournalist(journalist.id)}
                    className={cn(
                      "flex items-center gap-4 p-5 rounded-2xl transition-all duration-300 border-2 text-left",
                      journalist.selected
                        ? "bg-primary/10 border-primary shadow-lg"
                        : "bg-secondary/40 border-transparent hover:bg-secondary/70 hover:border-primary/20"
                    )}
                  >
                    <div className={cn(
                      "w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold flex-shrink-0",
                      journalist.selected
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-foreground"
                    )}>
                      {journalist.name.split(" ").map(n => n[0]).join("")}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-foreground">{journalist.name}</h4>
                      <p className="text-sm text-muted-foreground">{journalist.media}</p>
                      <p className="text-xs text-primary mt-1 truncate">{journalist.email}</p>
                    </div>
                    <div className={cn(
                      "w-7 h-7 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all",
                      journalist.selected
                        ? "bg-primary border-primary"
                        : "border-muted-foreground/30"
                    )}>
                      {journalist.selected && <Check className="w-4 h-4 text-primary-foreground" />}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

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
                    À : {selectedJournalists.map(j => j.name).join(", ")}
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
