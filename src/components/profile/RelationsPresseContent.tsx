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
  Send
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { JournalistModal } from "./JournalistModal";

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

// Mock journalists data (à remplacer par vraies données)
const mockJournalists: Journalist[] = [
  { id: "1", name: "Marie Dupont", media: "Le Monde", email: "m.dupont@lemonde.fr", selected: false },
  { id: "2", name: "Jean Martin", media: "Les Échos", email: "j.martin@lesechos.fr", selected: false },
  { id: "3", name: "Sophie Bernard", media: "Le Figaro", email: "s.bernard@lefigaro.fr", selected: false },
  { id: "4", name: "Pierre Durand", media: "BFM Business", email: "p.durand@bfm.com", selected: false },
  { id: "5", name: "Claire Petit", media: "France Info", email: "c.petit@franceinfo.fr", selected: false },
];

export const RelationsPresseContent = () => {
  const [activeSubTab, setActiveSubTab] = useState("concurrent");
  const [articles, setArticles] = useState<Article[]>([]);
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedAgency, setSelectedAgency] = useState<string | null>(null);
  const [showAgencyDropdown, setShowAgencyDropdown] = useState(false);
  const [journalists, setJournalists] = useState<Journalist[]>(mockJournalists);
  const [showJournalistModal, setShowJournalistModal] = useState(false);

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
      month: "short", 
      year: "numeric" 
    });
  };

  return (
    <div className="space-y-6">
      {/* Sub-tabs with modern pill design */}
      <div className="flex items-center gap-2 p-1.5 bg-secondary/50 rounded-2xl w-fit">
        {subTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              className={cn(
                "flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-300",
                isActive
                  ? "bg-foreground text-background shadow-lg"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              )}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* SOCIALY TAB */}
      {activeSubTab === "socialy" && (
        <div className="flex flex-col items-center justify-center py-16 bg-gradient-to-br from-primary/5 to-primary/10 rounded-2xl border border-primary/20">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center mb-6 shadow-lg shadow-primary/25">
            <Sparkles className="w-10 h-10 text-primary-foreground" />
          </div>
          <h3 className="text-xl font-bold text-foreground">Vos retombées presse</h3>
          <p className="text-sm text-muted-foreground mt-2 text-center max-w-md">
            Retrouvez ici tous les articles où votre marque est mentionnée
          </p>
          <span className="mt-6 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
            Configuration requise
          </span>
        </div>
      )}

      {/* CONCURRENT TAB */}
      {activeSubTab === "concurrent" && (
        <div className="space-y-5">
          {/* Filter dropdown */}
          <div className="flex items-center justify-between">
            <div className="relative">
              <button
                onClick={() => setShowAgencyDropdown(!showAgencyDropdown)}
                className="flex items-center gap-3 px-4 py-2.5 bg-card border border-border rounded-xl hover:border-primary/50 transition-colors"
              >
                <Filter className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">{selectedAgencyName}</span>
                <ChevronDown className={cn(
                  "w-4 h-4 text-muted-foreground transition-transform duration-200",
                  showAgencyDropdown && "rotate-180"
                )} />
              </button>

              {showAgencyDropdown && (
                <div className="absolute top-full left-0 mt-2 w-64 bg-card border border-border rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="p-2">
                    <button
                      onClick={() => {
                        setSelectedAgency(null);
                        setShowAgencyDropdown(false);
                      }}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors",
                        !selectedAgency 
                          ? "bg-primary/10 text-primary" 
                          : "text-foreground hover:bg-secondary"
                      )}
                    >
                      <Users2 className="w-4 h-4" />
                      Tous les concurrents
                      {!selectedAgency && <Check className="w-4 h-4 ml-auto" />}
                    </button>
                    
                    {agencies.length > 0 && (
                      <div className="border-t border-border my-2" />
                    )}
                    
                    {agencies.map(agency => (
                      <button
                        key={agency.id}
                        onClick={() => {
                          setSelectedAgency(agency.id);
                          setShowAgencyDropdown(false);
                        }}
                        className={cn(
                          "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors",
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

            <div className="text-sm text-muted-foreground">
              {filteredArticles.length} article{filteredArticles.length !== 1 ? "s" : ""}
            </div>
          </div>

          {/* Articles Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="bg-card border border-border rounded-2xl p-4 animate-pulse">
                  <div className="flex gap-4">
                    <div className="w-24 h-24 bg-secondary rounded-xl" />
                    <div className="flex-1 space-y-3">
                      <div className="h-4 bg-secondary rounded w-3/4" />
                      <div className="h-3 bg-secondary rounded w-1/2" />
                      <div className="h-3 bg-secondary rounded w-1/4" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredArticles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredArticles.map((article) => (
                <a
                  key={article.id}
                  href={article.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group bg-card border border-border rounded-2xl p-4 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300"
                >
                  <div className="flex gap-4">
                    {/* Thumbnail */}
                    <div className="relative w-24 h-24 rounded-xl bg-secondary overflow-hidden flex-shrink-0">
                      {article.thumbnail ? (
                        <img
                          src={article.thumbnail}
                          alt={article.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ImageIcon className="w-8 h-8 text-muted-foreground/50" />
                        </div>
                      )}
                      <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-foreground/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <ExternalLink className="w-3 h-3 text-background" />
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                        {article.title}
                      </h4>
                      
                      <div className="flex items-center gap-2 mt-2">
                        {article.source_icon && (
                          <img src={article.source_icon} alt="" className="w-4 h-4 rounded" />
                        )}
                        <span className="text-xs text-muted-foreground truncate">
                          {article.source_name || "Source inconnue"}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 mt-2">
                        {article.competitor_name && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
                            <Building2 className="w-3 h-3" />
                            {article.competitor_name}
                          </span>
                        )}
                        {article.article_date && (
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Calendar className="w-3 h-3" />
                            {formatDate(article.article_date)}
                          </span>
                        )}
                      </div>

                      {article.authors && (
                        <p className="text-xs text-muted-foreground mt-2 truncate">
                          Par {article.authors}
                        </p>
                      )}
                    </div>
                  </div>
                </a>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 bg-secondary/30 rounded-2xl">
              <Users2 className="w-12 h-12 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-semibold text-foreground">Aucun article trouvé</h3>
              <p className="text-sm text-muted-foreground mt-1 text-center max-w-md">
                {selectedAgency 
                  ? "Aucun article pour ce concurrent. Essayez un autre filtre."
                  : "Ajoutez des agences concurrentes pour suivre leur actualité"}
              </p>
            </div>
          )}
        </div>
      )}

      {/* JOURNALISTES TAB */}
      {activeSubTab === "journalistes" && (
        <div className="space-y-5">
          {/* Header with action button */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-foreground">Base de journalistes</h3>
              <p className="text-sm text-muted-foreground">
                Sélectionnez les journalistes pour envoyer un communiqué
              </p>
            </div>
            
            {selectedJournalists.length > 0 && (
              <button
                onClick={() => setShowJournalistModal(true)}
                className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:opacity-90 transition-opacity shadow-lg shadow-primary/25"
              >
                <Send className="w-4 h-4" />
                Envoyer le CP ({selectedJournalists.length})
              </button>
            )}
          </div>

          {/* Journalists Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {journalists.map((journalist) => (
              <div
                key={journalist.id}
                onClick={() => toggleJournalist(journalist.id)}
                className={cn(
                  "relative bg-card border rounded-2xl p-5 cursor-pointer transition-all duration-300",
                  journalist.selected
                    ? "border-primary shadow-lg shadow-primary/10 ring-2 ring-primary/20"
                    : "border-border hover:border-muted-foreground/30 hover:shadow-md"
                )}
              >
                {/* Selection indicator */}
                <div className={cn(
                  "absolute top-4 right-4 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
                  journalist.selected
                    ? "bg-primary border-primary"
                    : "border-border bg-card"
                )}>
                  {journalist.selected && (
                    <Check className="w-3.5 h-3.5 text-primary-foreground" />
                  )}
                </div>

                {/* Avatar */}
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-secondary to-muted flex items-center justify-center mb-4">
                  <span className="text-lg font-bold text-foreground">
                    {journalist.name.charAt(0)}
                  </span>
                </div>

                {/* Info */}
                <h4 className="text-base font-semibold text-foreground">{journalist.name}</h4>
                
                <div className="flex items-center gap-2 mt-2">
                  <Globe className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">{journalist.media}</span>
                </div>

                <a
                  href={`mailto:${journalist.email}`}
                  onClick={(e) => e.stopPropagation()}
                  className="flex items-center gap-2 mt-2 text-sm text-primary hover:underline"
                >
                  <Mail className="w-3.5 h-3.5" />
                  {journalist.email}
                </a>
              </div>
            ))}
          </div>

          {/* Info banner */}
          <div className="flex items-center gap-3 px-4 py-3 bg-warning/10 border border-warning/20 rounded-xl">
            <div className="w-8 h-8 rounded-full bg-warning/20 flex items-center justify-center flex-shrink-0">
              <UserCircle className="w-4 h-4 text-warning" />
            </div>
            <p className="text-sm text-foreground">
              <span className="font-medium">Base de données exemple.</span>{" "}
              <span className="text-muted-foreground">
                La configuration de votre propre base de journalistes sera bientôt disponible.
              </span>
            </p>
          </div>
        </div>
      )}

      {/* Journalist Modal */}
      <JournalistModal
        isOpen={showJournalistModal}
        onClose={() => setShowJournalistModal(false)}
        selectedJournalists={selectedJournalists}
      />
    </div>
  );
};
