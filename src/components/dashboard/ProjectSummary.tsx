import { useState, useEffect } from "react";
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
  Globe,
  Mail,
  Send,
  Newspaper,
  Zap,
  X,
  Paperclip
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
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
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailSubject, setEmailSubject] = useState("");
  const [emailMessage, setEmailMessage] = useState("");
  const [emailAttachment, setEmailAttachment] = useState<File | null>(null);
  const [isSending, setIsSending] = useState(false);

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
    // Simulate sending
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
    <>
      <div className="glass-card rounded-2xl p-6">
        {/* Header with title and sub-tabs */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Newspaper className="w-5 h-5 text-primary" />
            </div>
            <h3 className="text-lg font-bold text-foreground">Relations Presse</h3>
          </div>
          
          {/* Sub-tabs - Bigger & cleaner */}
          <div className="flex items-center gap-1.5 p-1.5 bg-secondary/50 rounded-xl">
            {subTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeSubTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveSubTab(tab.id)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200",
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
          <div className="flex flex-col items-center justify-center py-16 bg-gradient-to-br from-primary/5 to-primary/10 rounded-2xl border border-primary/20">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center mb-5 shadow-lg shadow-primary/25">
              <Zap className="w-8 h-8 text-primary-foreground" />
            </div>
            <h4 className="text-xl font-bold text-foreground">Vos retombées presse</h4>
            <p className="text-base text-muted-foreground mt-2 text-center max-w-md">
              Retrouvez ici tous les articles où votre marque est mentionnée
            </p>
            <span className="mt-6 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-semibold">
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
                  className="flex items-center gap-3 px-4 py-2.5 bg-secondary/60 border border-border rounded-xl hover:border-primary/40 transition-all duration-200 shadow-sm"
                >
                  <Filter className="w-4 h-4 text-primary" />
                  <span className="text-sm font-semibold text-foreground">{selectedAgencyName}</span>
                  <ChevronDown className={cn(
                    "w-4 h-4 text-muted-foreground transition-transform duration-200",
                    showAgencyDropdown && "rotate-180"
                  )} />
                </button>

                {showAgencyDropdown && (
                  <div className="absolute top-full left-0 mt-2 w-64 bg-card border border-border rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
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

              <span className="text-sm font-medium text-muted-foreground bg-secondary/50 px-3 py-1.5 rounded-lg">
                {filteredArticles.length} article{filteredArticles.length !== 1 ? "s" : ""}
              </span>
            </div>

            {/* Articles List */}
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="flex gap-4 p-4 bg-secondary/30 rounded-2xl animate-pulse">
                    <div className="w-24 h-20 bg-secondary rounded-xl flex-shrink-0" />
                    <div className="flex-1 space-y-3">
                      <div className="h-5 bg-secondary rounded w-3/4" />
                      <div className="h-4 bg-secondary rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredArticles.length > 0 ? (
              <div className="space-y-3 max-h-[320px] overflow-y-auto scrollbar-hide">
                {filteredArticles.map((article) => (
                  <a
                    key={article.id}
                    href={article.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex gap-4 p-4 bg-secondary/40 hover:bg-secondary/70 rounded-2xl transition-all duration-300 border border-transparent hover:border-primary/20 hover:shadow-lg"
                  >
                    {/* Thumbnail */}
                    <div className="relative w-24 h-20 rounded-xl bg-secondary overflow-hidden flex-shrink-0">
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

                    {/* Content */}
                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                      <h4 className="text-base font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors leading-tight">
                        {article.title}
                      </h4>
                      
                      <div className="flex items-center gap-3 mt-2.5 flex-wrap">
                        {article.competitor_name && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-primary/15 text-primary text-xs font-semibold">
                            <Building2 className="w-3 h-3" />
                            {article.competitor_name}
                          </span>
                        )}
                        {article.source_name && (
                          <span className="text-xs text-muted-foreground flex items-center gap-1.5 font-medium">
                            {article.source_icon && (
                              <img src={article.source_icon} alt="" className="w-4 h-4 rounded" />
                            )}
                            {article.source_name}
                          </span>
                        )}
                        {article.article_date && (
                          <span className="text-xs text-muted-foreground flex items-center gap-1.5 font-medium">
                            <Calendar className="w-3 h-3" />
                            {formatDate(article.article_date)}
                          </span>
                        )}
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-14 bg-secondary/20 rounded-2xl border border-dashed border-border">
                <Users2 className="w-12 h-12 text-muted-foreground/30 mb-4" />
                <h4 className="text-base font-semibold text-foreground">Aucun article</h4>
                <p className="text-sm text-muted-foreground mt-2 text-center max-w-xs">
                  {selectedAgency 
                    ? "Aucun article trouvé pour ce concurrent"
                    : "Ajoutez des concurrents dans votre profil pour voir leurs articles"}
                </p>
              </div>
            )}
          </div>
        )}

        {/* JOURNALISTES TAB */}
        {activeSubTab === "journalistes" && (
          <div className="space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between">
              <p className="text-base font-medium text-foreground">
                Sélectionnez pour envoyer un communiqué
              </p>
              
              {selectedJournalists.length > 0 && (
                <button 
                  onClick={() => setShowEmailModal(true)}
                  className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-bold hover:opacity-90 transition-all shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:scale-105"
                >
                  <Send className="w-4 h-4" />
                  Envoyer ({selectedJournalists.length})
                </button>
              )}
            </div>

            {/* Journalists List */}
            <div className="space-y-3 max-h-[300px] overflow-y-auto scrollbar-hide">
              {journalists.map((journalist) => (
                <div
                  key={journalist.id}
                  onClick={() => toggleJournalist(journalist.id)}
                  className={cn(
                    "flex items-center gap-4 p-4 rounded-2xl cursor-pointer transition-all duration-300",
                    journalist.selected
                      ? "bg-primary/10 border-2 border-primary/40 shadow-lg shadow-primary/10"
                      : "bg-secondary/40 border-2 border-transparent hover:bg-secondary/60 hover:border-border"
                  )}
                >
                  {/* Checkbox */}
                  <div className={cn(
                    "w-6 h-6 rounded-lg border-2 flex items-center justify-center flex-shrink-0 transition-all duration-200",
                    journalist.selected
                      ? "bg-primary border-primary"
                      : "border-muted-foreground/40 hover:border-primary/60"
                  )}>
                    {journalist.selected && (
                      <Check className="w-4 h-4 text-primary-foreground" />
                    )}
                  </div>

                  {/* Avatar */}
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center flex-shrink-0 shadow-inner">
                    <span className="text-lg font-bold text-primary">
                      {journalist.name.charAt(0)}
                    </span>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-base font-semibold text-foreground">{journalist.name}</h4>
                    <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1.5 font-medium">
                        <Globe className="w-3.5 h-3.5 text-primary/70" />
                        {journalist.media}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-primary/70" />
                        {journalist.email}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Info */}
            <div className="flex items-center gap-3 px-4 py-3 bg-warning/10 rounded-xl border border-warning/20">
              <UserCircle className="w-5 h-5 text-warning flex-shrink-0" />
              <p className="text-sm text-muted-foreground font-medium">
                Base exemple • Configuration bientôt disponible
              </p>
            </div>
          </div>
        )}
      </div>

      {/* EMAIL MODAL - FULLSCREEN */}
      {showEmailModal && (
        <div className="fixed inset-0 bg-foreground/60 backdrop-blur-sm z-50 flex items-center justify-center p-6 md:p-10 animate-in fade-in duration-200">
          <div className="bg-card w-full max-w-4xl h-[90vh] rounded-3xl shadow-2xl border border-border overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-8 border-b border-border bg-secondary/30">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <Send className="w-7 h-7 text-primary" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-foreground">Envoyer un communiqué</h3>
                  <p className="text-base text-muted-foreground mt-1">{selectedJournalists.length} destinataire(s) sélectionné(s)</p>
                </div>
              </div>
              <button 
                onClick={() => setShowEmailModal(false)}
                className="w-12 h-12 rounded-xl hover:bg-secondary flex items-center justify-center transition-colors"
              >
                <X className="w-6 h-6 text-muted-foreground" />
              </button>
            </div>

            {/* Recipients */}
            <div className="px-8 py-5 border-b border-border bg-secondary/10">
              <p className="text-sm text-muted-foreground mb-3 font-semibold uppercase tracking-wide">Destinataires</p>
              <div className="flex flex-wrap gap-2">
                {selectedJournalists.map(j => (
                  <span key={j.id} className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-xl text-sm font-semibold">
                    {j.name}
                    <span className="text-primary/50">•</span>
                    <span className="text-sm text-primary/70 font-medium">{j.media}</span>
                  </span>
                ))}
              </div>
            </div>

            {/* Form - Scrollable */}
            <div className="flex-1 overflow-y-auto p-8 space-y-6">
              {/* Subject */}
              <div>
                <label className="block text-base font-semibold text-foreground mb-3">Sujet</label>
                <input
                  type="text"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  placeholder="Objet de votre communiqué de presse..."
                  className="w-full px-5 py-4 bg-secondary/50 border border-border rounded-xl text-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                />
              </div>

              {/* Message */}
              <div className="flex-1">
                <label className="block text-base font-semibold text-foreground mb-3">Message</label>
                <textarea
                  value={emailMessage}
                  onChange={(e) => setEmailMessage(e.target.value)}
                  placeholder="Rédigez votre message personnalisé pour accompagner le communiqué..."
                  rows={10}
                  className="w-full px-5 py-4 bg-secondary/50 border border-border rounded-xl text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all resize-none"
                />
              </div>

              {/* Attachment */}
              <div>
                <label className="block text-base font-semibold text-foreground mb-3">Pièce jointe</label>
                <label className="flex items-center gap-4 px-6 py-5 bg-secondary/30 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-primary/40 hover:bg-secondary/50 transition-all">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Paperclip className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <span className="text-base font-medium text-foreground block">
                      {emailAttachment ? emailAttachment.name : "Ajouter votre communiqué de presse"}
                    </span>
                    <span className="text-sm text-muted-foreground">PDF, Word, ou autre document</span>
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    onChange={(e) => setEmailAttachment(e.target.files?.[0] || null)}
                  />
                </label>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-4 p-8 border-t border-border bg-secondary/20">
              <button
                onClick={() => setShowEmailModal(false)}
                className="flex-1 px-8 py-4 bg-secondary text-foreground rounded-xl text-base font-semibold hover:bg-secondary/80 transition-all"
              >
                Annuler
              </button>
              <button
                onClick={handleSendEmail}
                disabled={isSending}
                className="flex-1 flex items-center justify-center gap-3 px-8 py-4 bg-primary text-primary-foreground rounded-xl text-base font-semibold hover:opacity-90 transition-all shadow-lg shadow-primary/25 disabled:opacity-50"
              >
                {isSending ? (
                  <>
                    <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    Envoi en cours...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Envoyer le communiqué
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
