import { useState, useEffect } from "react";
import { 
  Sparkles, 
  Users2, 
  UserCircle, 
  ChevronDown, 
  ExternalLink, 
  Calendar,
  Building2,
  Filter,
  Check,
  Image as ImageIcon,
  Globe,
  Mail,
  Send,
  Newspaper
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

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
  { id: "socialy", label: "Socialy", icon: Sparkles },
  { id: "concurrent", label: "Concurrent", icon: Users2 },
  { id: "journalistes", label: "Journalistes", icon: UserCircle },
];

// Mock journalists data
const mockJournalists: Journalist[] = [
  { id: "1", name: "Marie Dupont", media: "Le Monde", email: "m.dupont@lemonde.fr", selected: false },
  { id: "2", name: "Jean Martin", media: "Les Échos", email: "j.martin@lesechos.fr", selected: false },
  { id: "3", name: "Sophie Bernard", media: "Le Figaro", email: "s.bernard@lefigaro.fr", selected: false },
];

export const ProjectSummary = () => {
  const [activeSubTab, setActiveSubTab] = useState("concurrent");
  const [articles, setArticles] = useState<Article[]>([]);
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedAgency, setSelectedAgency] = useState<string | null>(null);
  const [showAgencyDropdown, setShowAgencyDropdown] = useState(false);
  const [journalists, setJournalists] = useState<Journalist[]>(mockJournalists);

  useEffect(() => {
    fetchAgencies();
    fetchArticles();
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

  return (
    <div className="glass-card rounded-2xl p-6">
      {/* Header with title and sub-tabs */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Newspaper className="w-5 h-5 text-primary" />
          </div>
          <h3 className="text-lg font-bold text-foreground">Relations Presse</h3>
        </div>
        
        {/* Sub-tabs */}
        <div className="flex items-center gap-1 p-1 bg-secondary/50 rounded-xl">
          {subTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200",
                  isActive
                    ? "bg-foreground text-background shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* SOCIALY TAB */}
      {activeSubTab === "socialy" && (
        <div className="flex flex-col items-center justify-center py-12 bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl border border-primary/20">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center mb-4 shadow-lg shadow-primary/20">
            <Sparkles className="w-7 h-7 text-primary-foreground" />
          </div>
          <h4 className="text-base font-bold text-foreground">Vos retombées presse</h4>
          <p className="text-sm text-muted-foreground mt-1 text-center max-w-sm">
            Retrouvez ici tous les articles où votre marque est mentionnée
          </p>
          <span className="mt-4 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
            Configuration requise
          </span>
        </div>
      )}

      {/* CONCURRENT TAB */}
      {activeSubTab === "concurrent" && (
        <div className="space-y-4">
          {/* Filter dropdown */}
          <div className="flex items-center justify-between">
            <div className="relative">
              <button
                onClick={() => setShowAgencyDropdown(!showAgencyDropdown)}
                className="flex items-center gap-2 px-3 py-2 bg-secondary/50 border border-border rounded-lg hover:border-primary/30 transition-colors"
              >
                <Filter className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">{selectedAgencyName}</span>
                <ChevronDown className={cn(
                  "w-3.5 h-3.5 text-muted-foreground transition-transform duration-200",
                  showAgencyDropdown && "rotate-180"
                )} />
              </button>

              {showAgencyDropdown && (
                <div className="absolute top-full left-0 mt-2 w-56 bg-card border border-border rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="p-1.5">
                    <button
                      onClick={() => {
                        setSelectedAgency(null);
                        setShowAgencyDropdown(false);
                      }}
                      className={cn(
                        "w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors",
                        !selectedAgency 
                          ? "bg-primary/10 text-primary" 
                          : "text-foreground hover:bg-secondary"
                      )}
                    >
                      <Users2 className="w-4 h-4" />
                      Tous les concurrents
                      {!selectedAgency && <Check className="w-4 h-4 ml-auto" />}
                    </button>
                    
                    {agencies.length > 0 && <div className="border-t border-border my-1.5" />}
                    
                    {agencies.map(agency => (
                      <button
                        key={agency.id}
                        onClick={() => {
                          setSelectedAgency(agency.id);
                          setShowAgencyDropdown(false);
                        }}
                        className={cn(
                          "w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors",
                          selectedAgency === agency.id 
                            ? "bg-primary/10 text-primary" 
                            : "text-foreground hover:bg-secondary"
                        )}
                      >
                        <Building2 className="w-4 h-4" />
                        {agency.name}
                        {selectedAgency === agency.id && <Check className="w-4 h-4 ml-auto" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <span className="text-xs text-muted-foreground">
              {filteredArticles.length} article{filteredArticles.length !== 1 ? "s" : ""}
            </span>
          </div>

          {/* Articles List */}
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex gap-3 p-3 bg-secondary/30 rounded-xl animate-pulse">
                  <div className="w-16 h-16 bg-secondary rounded-lg flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-secondary rounded w-3/4" />
                    <div className="h-3 bg-secondary rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredArticles.length > 0 ? (
            <div className="space-y-2 max-h-[300px] overflow-y-auto scrollbar-hide">
              {filteredArticles.map((article) => (
                <a
                  key={article.id}
                  href={article.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex gap-3 p-3 bg-secondary/30 hover:bg-secondary/50 rounded-xl transition-all duration-200"
                >
                  {/* Thumbnail */}
                  <div className="relative w-16 h-16 rounded-lg bg-secondary overflow-hidden flex-shrink-0">
                    {article.thumbnail ? (
                      <img
                        src={article.thumbnail}
                        alt=""
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="w-6 h-6 text-muted-foreground/40" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/10 transition-colors flex items-center justify-center">
                      <ExternalLink className="w-4 h-4 text-background opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                      {article.title}
                    </h4>
                    
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      {article.competitor_name && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-primary/10 text-primary text-[10px] font-medium">
                          <Building2 className="w-2.5 h-2.5" />
                          {article.competitor_name}
                        </span>
                      )}
                      {article.source_name && (
                        <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                          {article.source_icon && (
                            <img src={article.source_icon} alt="" className="w-3 h-3 rounded" />
                          )}
                          {article.source_name}
                        </span>
                      )}
                      {article.article_date && (
                        <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                          <Calendar className="w-2.5 h-2.5" />
                          {formatDate(article.article_date)}
                        </span>
                      )}
                    </div>
                  </div>
                </a>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 bg-secondary/20 rounded-xl">
              <Users2 className="w-10 h-10 text-muted-foreground/40 mb-3" />
              <h4 className="text-sm font-semibold text-foreground">Aucun article</h4>
              <p className="text-xs text-muted-foreground mt-1 text-center max-w-xs">
                {selectedAgency 
                  ? "Aucun article pour ce concurrent"
                  : "Ajoutez des concurrents dans votre profil"}
              </p>
            </div>
          )}
        </div>
      )}

      {/* JOURNALISTES TAB */}
      {activeSubTab === "journalistes" && (
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Sélectionnez pour envoyer un CP
            </p>
            
            {selectedJournalists.length > 0 && (
              <button className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-xs font-medium hover:opacity-90 transition-opacity shadow-sm">
                <Send className="w-3 h-3" />
                Envoyer ({selectedJournalists.length})
              </button>
            )}
          </div>

          {/* Journalists List */}
          <div className="space-y-2 max-h-[280px] overflow-y-auto scrollbar-hide">
            {journalists.map((journalist) => (
              <div
                key={journalist.id}
                onClick={() => toggleJournalist(journalist.id)}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-200",
                  journalist.selected
                    ? "bg-primary/10 border border-primary/30 shadow-sm"
                    : "bg-secondary/30 border border-transparent hover:bg-secondary/50"
                )}
              >
                {/* Checkbox */}
                <div className={cn(
                  "w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all",
                  journalist.selected
                    ? "bg-primary border-primary"
                    : "border-muted-foreground/30"
                )}>
                  {journalist.selected && (
                    <Check className="w-3 h-3 text-primary-foreground" />
                  )}
                </div>

                {/* Avatar */}
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-muted to-secondary flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-bold text-foreground">
                    {journalist.name.charAt(0)}
                  </span>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-foreground">{journalist.name}</h4>
                  <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Globe className="w-2.5 h-2.5" />
                      {journalist.media}
                    </span>
                    <span className="flex items-center gap-1">
                      <Mail className="w-2.5 h-2.5" />
                      {journalist.email}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Info */}
          <div className="flex items-center gap-2 px-3 py-2 bg-warning/10 rounded-lg">
            <UserCircle className="w-4 h-4 text-warning flex-shrink-0" />
            <p className="text-[10px] text-muted-foreground">
              Base exemple • Configuration bientôt disponible
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
