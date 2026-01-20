import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
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
  EyeOff,
  Link,
  Eye,
  RotateCcw,
  RefreshCw,
  Loader2,
} from "lucide-react";
import { CreateCommuniqueModal } from "@/components/presse/CreateCommuniqueModal";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectSeparator } from "@/components/ui/select";
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
  competitor_id: string;
  hidden?: boolean;
}

interface OrganizationArticle {
  id: string;
  title: string;
  link: string;
  thumbnail: string | null;
  source_name: string | null;
  source_icon: string | null;
  authors: string | null;
  article_date: string | null;
  snippet: string | null;
  hidden?: boolean;
}

interface ClientArticle {
  id: string;
  title: string;
  link: string;
  thumbnail: string | null;
  source_name: string | null;
  source_icon: string | null;
  authors: string | null;
  article_date: string | null;
  snippet: string | null;
  client_name: string | null;
  client_id: string;
  hidden?: boolean;
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
  enrichment_status: string | null;
  selected: boolean;
  isEditingNotes?: boolean;
}

const getSubTabs = (orgName: string) => [
  { id: "socialy", label: orgName, group: "articles" },
  { id: "concurrent", label: "Concurrents", group: "articles" },
  { id: "client", label: "Client", group: "articles" },
  { id: "veille-marche", label: "Veille Marché", group: "articles" },
  { id: "journalistes", label: "Journalistes", group: "contacts" },
  { id: "communiques", label: "Communiqués", group: "contacts" },
];

interface Communique {
  id: string;
  name: string;
  pdf_url: string | null;
  word_url: string | null;
  assets_link: string | null;
  created_at: string;
  status: string;
}

const STATUS_OPTIONS = [
  { value: "en_cours", label: "En cours", color: "bg-yellow-500/10 text-yellow-600 border-yellow-500/30" },
  { value: "envoye", label: "Envoyé", color: "bg-green-500/10 text-green-600 border-green-500/30" },
  { value: "archive", label: "Archivé", color: "bg-muted text-muted-foreground border-border" },
];

const STATUS_ORDER = ["en_cours", "envoye", "archive"];

const RelationsPresse = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { isOrgAdmin, isSuperAdmin, effectiveOrgId, viewAsOrgId, currentOrganization, effectiveOrgName } = useAuth();
  const isViewingAsOtherOrg = isSuperAdmin && viewAsOrgId && viewAsOrgId !== currentOrganization?.id;

  const tabFromUrl = searchParams.get("tab");
  const [activeSubTab, setActiveSubTab] = useState(() => {
    if (tabFromUrl === "journalistes") return "journalistes";
    if (tabFromUrl === "communiques") return "communiques";
    return "socialy";
  });

  useEffect(() => {
    if (tabFromUrl === "journalistes") {
      setActiveSubTab("journalistes");
    } else if (tabFromUrl === "communiques") {
      setActiveSubTab("communiques");
    } else if (!tabFromUrl) {
      setActiveSubTab("socialy");
    }
  }, [tabFromUrl]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [organizationArticles, setOrganizationArticles] = useState<OrganizationArticle[]>([]);
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingOrganization, setIsLoadingOrganization] = useState(false);
  const [selectedAgency, setSelectedAgency] = useState<string | null>(null);
  const [showAgencyDropdown, setShowAgencyDropdown] = useState(false);

  const [journalists, setJournalists] = useState<Journalist[]>([]);
  const [isLoadingJournalists, setIsLoadingJournalists] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailSubject, setEmailSubject] = useState("");
  const [emailMessage, setEmailMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [selectedCommunique, setSelectedCommunique] = useState<Communique | null>(null);
  const [selectedMedia, setSelectedMedia] = useState<string | null>(null);
  const [showMediaDropdown, setShowMediaDropdown] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isEnrichingJournalists, setIsEnrichingJournalists] = useState(false);
  const [isUpdatingOrganizationArticles, setIsUpdatingOrganizationArticles] = useState(false);

  const [communiques, setCommuniques] = useState<Communique[]>([]);
  const [isLoadingCommuniques, setIsLoadingCommuniques] = useState(false);
  const [showAddCommuniqueForm, setShowAddCommuniqueForm] = useState(false);
  const [uploadingCommunique, setUploadingCommunique] = useState(false);
  const pdfInputRef = useRef<HTMLInputElement>(null);
  const wordInputRef = useRef<HTMLInputElement>(null);
  const [formCommuniqueName, setFormCommuniqueName] = useState("");
  const [formCommuniquePdf, setFormCommuniquePdf] = useState<File | null>(null);
  const [formCommuniqueWord, setFormCommuniqueWord] = useState<File | null>(null);
  const [formCommuniqueAssetsLink, setFormCommuniqueAssetsLink] = useState("");

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
    fetchClients();
    fetchArticles();
    fetchClientArticles();
    fetchVeilleArticles();
    fetchOrganizationArticles();
    fetchJournalists();
    fetchCommuniques();
  }, [isOrgAdmin, effectiveOrgId, isViewingAsOtherOrg]);

  useEffect(() => {
    if (!effectiveOrgId) return;

    const channel = supabase
      .channel('journalists-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'journalists',
        },
        (payload) => {
          const updatedJournalist = payload.new as any;
          if (updatedJournalist && updatedJournalist.organization_id === effectiveOrgId) {
            setJournalists(prev => 
              prev.map(j => 
                j.id === updatedJournalist.id 
                  ? { ...j, ...updatedJournalist, selected: j.selected } 
                  : j
              )
            );
            
            if (updatedJournalist.enrichment_status === 'completed' && 
                (updatedJournalist.linkedin || updatedJournalist.email)) {
              toast({
                title: "Enrichissement réussi",
                description: `${updatedJournalist.name} a été enrichi`,
              });
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [effectiveOrgId]);

  useEffect(() => {
    const hasEnrichmentsInProgress = journalists.some(
      j => j.enrichment_status === 'pending' || j.enrichment_status === 'processing'
    );

    if (!hasEnrichmentsInProgress || !effectiveOrgId) return;

    const pollInterval = setInterval(() => {
      fetchJournalists();
    }, 5000);

    return () => clearInterval(pollInterval);
  }, [journalists.some(j => j.enrichment_status === 'pending' || j.enrichment_status === 'processing'), effectiveOrgId]);

  const fetchJournalists = async () => {
    setIsLoadingJournalists(true);
    if (effectiveOrgId) {
      let query = supabase.from("journalists").select("*").eq("organization_id", effectiveOrgId);
      const { data, error } = await query.order("name");

      if (!error && data) {
        setJournalists(data.map((j) => ({ ...j, selected: false })));
      }
    }
    setIsLoadingJournalists(false);
  };

  const fetchAgencies = async () => {
    if (effectiveOrgId) {
      let query = supabase.from("organization_competitor").select("id, name").eq("organization_id", effectiveOrgId);
      const { data } = await query.order("name");
      
      let agenciesList = data || [];
      
      const hasAutre = agenciesList.some(a => a.name === "Autre");
      if (!hasAutre) {
        const { data: newAutre, error } = await supabase
          .from("organization_competitor")
          .insert({ organization_id: effectiveOrgId, name: "Autre" })
          .select("id, name")
          .single();
        
        if (!error && newAutre) {
          agenciesList = [newAutre, ...agenciesList];
        }
      } else {
        agenciesList = agenciesList.sort((a, b) => {
          if (a.name === "Autre") return -1;
          if (b.name === "Autre") return 1;
          return a.name.localeCompare(b.name);
        });
      }
      
      setAgencies(agenciesList);
    }
  };

  const fetchClients = async () => {
    setIsLoadingClients(true);
    if (effectiveOrgId) {
      let query = supabase.from("client_agencies").select("id, name").eq("organization_id", effectiveOrgId);
      const { data } = await query.order("name");
      
      let clientsList = data || [];
      
      const hasAutre = clientsList.some(c => c.name === "Autre");
      if (!hasAutre) {
        const { data: newAutre, error } = await supabase
          .from("client_agencies")
          .insert({ organization_id: effectiveOrgId, name: "Autre" })
          .select("id, name")
          .single();
        
        if (!error && newAutre) {
          clientsList = [newAutre, ...clientsList];
        }
      }
      
      setClients(clientsList);
    }
    setIsLoadingClients(false);
  };

  const fetchClientArticles = async () => {
    if (effectiveOrgId) {
      const { data, error } = await supabase
        .from("client_articles")
        .select("*")
        .eq("hidden", false)
        .not("title", "is", null)
        .neq("title", "")
        .eq("organization_id", effectiveOrgId)
        .order("article_iso_date", { ascending: false });

      if (!error && data) {
        setClientArticles(data.filter((a: any) => a.title && a.title.trim() !== ""));
      }
    }
  };

  const fetchVeilleArticles = async () => {
    setIsLoadingVeille(true);
    if (effectiveOrgId) {
      const { data, error } = await supabase
        .from("market_watch_topics")
        .select("*")
        .eq("hidden", false)
        .not("title", "is", null)
        .neq("title", "")
        .eq("organization_id", effectiveOrgId)
        .order("article_iso_date", { ascending: false });

      if (!error && data) {
        setVeilleArticles(data.filter((a: any) => a.title && a.title.trim() !== ""));
      }
    }
    setIsLoadingVeille(false);
  };

  const fetchArticles = async () => {
    setIsLoading(true);
    if (effectiveOrgId) {
      let query = supabase.from("competitor_articles").select("*").eq("hidden", false).not("title", "is", null).neq("title", "").eq("organization_id", effectiveOrgId);
      const { data, error } = await query.order("article_iso_date", { ascending: false });

      if (!error && data) {
        setArticles(data.filter(a => a.title && a.title.trim() !== ""));
      }
    }
    setIsLoading(false);
  };

  const fetchOrganizationArticles = async () => {
    setIsLoadingOrganization(true);
    if (effectiveOrgId) {
      let query = supabase.from("organization_articles").select("*").eq("hidden", false).not("title", "is", null).neq("title", "").eq("organization_id", effectiveOrgId);
      const { data, error } = await query.order("article_iso_date", { ascending: false });

      if (!error && data) {
        setOrganizationArticles(data.filter(a => a.title && a.title.trim() !== ""));
      }
    }
    setIsLoadingOrganization(false);
  };

  const fetchCommuniques = async () => {
    setIsLoadingCommuniques(true);
    try {
      let query = supabase
        .from("communique_presse")
        .select("*");

      if (isViewingAsOtherOrg && effectiveOrgId) {
        query = query.eq("organization_id", effectiveOrgId);
      }

      const { data, error } = await query.order("created_at", { ascending: false });

      if (error) throw error;
      const sortedData = (data as Communique[]).sort((a, b) => {
        const orderA = STATUS_ORDER.indexOf(a.status);
        const orderB = STATUS_ORDER.indexOf(b.status);
        if (orderA !== orderB) return orderA - orderB;
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
      setCommuniques(sortedData);
    } catch (error: any) {
      console.error("Error fetching communiques:", error);
    } finally {
      setIsLoadingCommuniques(false);
    }
  };

  const handleCommuniqueSubmit = async () => {
    if (!formCommuniqueName.trim()) {
      toast({ title: "Champ obligatoire manquant", description: "Veuillez saisir un nom pour le communiqué", variant: "destructive" });
      return;
    }

    if (!formCommuniquePdf && !formCommuniqueWord && !formCommuniqueAssetsLink.trim()) {
      toast({ title: "Fichier ou lien requis", description: "Veuillez ajouter un PDF, un fichier Word ou un lien vers les assets", variant: "destructive" });
      return;
    }

    setUploadingCommunique(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      let pdfUrl: string | null = null;
      let wordUrl: string | null = null;

      if (formCommuniquePdf) {
        const fileExt = formCommuniquePdf.name.split(".").pop();
        const fileName = `${Date.now()}-pdf-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `${user.id}/${fileName}`;

        const { error: uploadError } = await supabase.storage.from("communique_presse").upload(filePath, formCommuniquePdf);
        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage.from("communique_presse").getPublicUrl(filePath);
        pdfUrl = urlData.publicUrl;
      }

      if (formCommuniqueWord) {
        const fileExt = formCommuniqueWord.name.split(".").pop();
        const fileName = `${Date.now()}-word-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `${user.id}/${fileName}`;

        const { error: uploadError } = await supabase.storage.from("communique_presse").upload(filePath, formCommuniqueWord);
        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage.from("communique_presse").getPublicUrl(filePath);
        wordUrl = urlData.publicUrl;
      }

      const { error } = await supabase.from("communique_presse").insert({
        name: formCommuniqueName.trim(),
        pdf_url: pdfUrl,
        word_url: wordUrl,
        assets_link: formCommuniqueAssetsLink.trim() || null,
        created_by: user.id,
      });

      if (error) throw error;

      toast({ title: "Communiqué créé avec succès", description: "Votre communiqué de presse a été enregistré" });
      resetCommuniqueForm();
      fetchCommuniques();
    } catch (error: any) {
      console.error("Error adding communique:", error);
      toast({ title: "Échec de la création", description: "Une erreur s'est produite lors de l'ajout du communiqué. Veuillez réessayer.", variant: "destructive" });
    } finally {
      setUploadingCommunique(false);
    }
  };

  const handleDeleteCommunique = async (communique: Communique) => {
    try {
      const filesToDelete: string[] = [];

      if (communique.pdf_url) {
        const pathMatch = communique.pdf_url.match(/communique_presse\/(.+)$/);
        if (pathMatch) filesToDelete.push(pathMatch[1]);
      }

      if (communique.word_url) {
        const pathMatch = communique.word_url.match(/communique_presse\/(.+)$/);
        if (pathMatch) filesToDelete.push(pathMatch[1]);
      }

      if (filesToDelete.length > 0) {
        await supabase.storage.from("communique_presse").remove(filesToDelete);
      }

      const { error } = await supabase.from("communique_presse").delete().eq("id", communique.id);

      if (error) throw error;

      toast({ title: "Communiqué supprimé", description: "Le communiqué et ses fichiers associés ont été supprimés" });
      fetchCommuniques();
    } catch (error: any) {
      toast({ title: "Échec de la suppression", description: "Impossible de supprimer le communiqué. Veuillez réessayer.", variant: "destructive" });
    }
  };

  const resetCommuniqueForm = () => {
    setFormCommuniqueName("");
    setFormCommuniquePdf(null);
    setFormCommuniqueWord(null);
    setFormCommuniqueAssetsLink("");
    setShowAddCommuniqueForm(false);
    if (pdfInputRef.current) pdfInputRef.current.value = "";
    if (wordInputRef.current) wordInputRef.current.value = "";
  };

  const filteredArticles = selectedAgency ? articles.filter((a) => a.competitor_id === selectedAgency) : articles;

  const selectedAgencyName = selectedAgency
    ? agencies.find((a) => a.id === selectedAgency)?.name
    : "Tous les concurrents";

  const [showAddSocialyModal, setShowAddSocialyModal] = useState(false);
  const [showAddCompetitorModal, setShowAddCompetitorModal] = useState(false);
  const [showAddClientModal, setShowAddClientModal] = useState(false);
  const [showAddVeilleModal, setShowAddVeilleModal] = useState(false);
  const [newArticleLink, setNewArticleLink] = useState("");
  const [newTopicName, setNewTopicName] = useState("");
  const [isAddingArticle, setIsAddingArticle] = useState(false);
  const [showHiddenOrganization, setShowHiddenOrganization] = useState(false);
  const [showHiddenCompetitor, setShowHiddenCompetitor] = useState(false);
  const [hiddenOrganizationArticles, setHiddenOrganizationArticles] = useState<OrganizationArticle[]>([]);
  const [hiddenCompetitorArticles, setHiddenCompetitorArticles] = useState<Article[]>([]);
  const [showCompetitorManager, setShowCompetitorManager] = useState(false);
  const [showClientManager, setShowClientManager] = useState(false);
  const [newCompetitorName, setNewCompetitorName] = useState("");
  const [newClientName, setNewClientName] = useState("");
  const [isAddingCompetitor, setIsAddingCompetitor] = useState(false);
  const [isAddingClient, setIsAddingClient] = useState(false);
  const [selectedCompetitorId, setSelectedCompetitorId] = useState<string>("");
  const [selectedClientId, setSelectedClientId] = useState<string>("");
  const [clients, setClients] = useState<Agency[]>([]);
  const [clientArticles, setClientArticles] = useState<ClientArticle[]>([]);
  const [veilleArticles, setVeilleArticles] = useState<OrganizationArticle[]>([]);
  const [isLoadingClients, setIsLoadingClients] = useState(false);
  const [isLoadingVeille, setIsLoadingVeille] = useState(false);

  const fetchHiddenOrganizationArticles = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user && isOrgAdmin) {
      const { data } = await supabase.from("organization_articles").select("*").eq("hidden", true).not("title", "is", null).neq("title", "").order("article_iso_date", { ascending: false });
      if (data) setHiddenOrganizationArticles(data.filter(a => a.title && a.title.trim() !== ""));
    }
  };

  const fetchHiddenCompetitorArticles = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user && isOrgAdmin) {
      const { data } = await supabase.from("competitor_articles").select("*").eq("hidden", true).not("title", "is", null).neq("title", "").order("article_iso_date", { ascending: false });
      if (data) setHiddenCompetitorArticles(data.filter(a => a.title && a.title.trim() !== ""));
    }
  };

  const handleHideOrganizationArticle = async (articleId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const { error } = await supabase.from("organization_articles").update({ hidden: true }).eq("id", articleId);
    if (error) {
      toast({ title: "Échec du masquage", description: "Impossible de masquer cet article. Veuillez réessayer.", variant: "destructive" });
    } else {
      toast({ title: "Article masqué", description: "L'article ne sera plus visible dans la liste principale" });
      fetchOrganizationArticles();
      fetchHiddenOrganizationArticles();
    }
  };

  const handleRestoreOrganizationArticle = async (articleId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const { error } = await supabase.from("organization_articles").update({ hidden: false }).eq("id", articleId);
    if (error) {
      toast({ title: "Échec de la restauration", description: "Impossible de restaurer cet article. Veuillez réessayer.", variant: "destructive" });
    } else {
      toast({ title: "Article restauré", description: "L'article est de nouveau visible dans la liste principale" });
      fetchOrganizationArticles();
      fetchHiddenOrganizationArticles();
    }
  };

  const handleHideCompetitorArticle = async (articleId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const { error } = await supabase.from("competitor_articles").update({ hidden: true }).eq("id", articleId);
    if (error) {
      toast({ title: "Échec du masquage", description: "Impossible de masquer cet article. Veuillez réessayer.", variant: "destructive" });
    } else {
      toast({ title: "Article masqué", description: "L'article ne sera plus visible dans la liste principale" });
      fetchArticles();
      fetchHiddenCompetitorArticles();
    }
  };

  const handleRestoreCompetitorArticle = async (articleId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const { error } = await supabase.from("competitor_articles").update({ hidden: false }).eq("id", articleId);
    if (error) {
      toast({ title: "Échec de la restauration", description: "Impossible de restaurer cet article. Veuillez réessayer.", variant: "destructive" });
    } else {
      toast({ title: "Article restauré", description: "L'article est de nouveau visible dans la liste principale" });
      fetchArticles();
      fetchHiddenCompetitorArticles();
    }
  };

  const handleUpdateOrganizationArticles = async () => {
    if (!effectiveOrgId) {
      toast({ title: "Erreur", description: "Organisation non trouvée", variant: "destructive" });
      return;
    }

    setIsUpdatingOrganizationArticles(true);

    try {
      const { data, error } = await supabase.functions.invoke("fetch-organization-articles", {
        body: {
          organization_id: effectiveOrgId,
          organization_name: effectiveOrgName,
        },
      });

      if (error) {
        throw error;
      }

      toast({ 
        title: "Mise à jour terminée", 
        description: `${data.inserted} nouveaux articles, ${data.updated} mis à jour` 
      });
      
      fetchOrganizationArticles();
    } catch (updateError) {
      console.error("Update error:", updateError);
      toast({ title: "Échec de la mise à jour", description: "Impossible de récupérer les articles. Veuillez réessayer.", variant: "destructive" });
    }

    setIsUpdatingOrganizationArticles(false);
  };

  const handleAddOrganizationArticle = async () => {
    if (!newArticleLink.trim()) {
      toast({ title: "Lien manquant", description: "Veuillez coller le lien de l'article à ajouter", variant: "destructive" });
      return;
    }
    if (!effectiveOrgId) {
      toast({ title: "Erreur", description: "Organisation non trouvée", variant: "destructive" });
      return;
    }
    setIsAddingArticle(true);

    try {
      const { error } = await supabase.functions.invoke("enrich-article", {
        body: {
          link: newArticleLink.trim(),
          type: "socialy",
          organization_id: effectiveOrgId,
        },
      });

      if (error) {
        throw error;
      }

      toast({ title: "Enrichissement en cours", description: `L'article ${effectiveOrgName} sera disponible dans quelques instants` });
    } catch (enrichError) {
      console.error("Enrichment error:", enrichError);
      toast({ title: "Échec de l'envoi", description: "Impossible d'envoyer l'article pour enrichissement. Veuillez réessayer.", variant: "destructive" });
    }

    setNewArticleLink("");
    setShowAddSocialyModal(false);
    setIsAddingArticle(false);
  };

  const handleAddCompetitorArticle = async () => {
    if (!newArticleLink.trim()) {
      toast({ title: "Lien manquant", description: "Veuillez coller le lien de l'article à ajouter", variant: "destructive" });
      return;
    }
    if (!effectiveOrgId) {
      toast({ title: "Erreur", description: "Organisation non trouvée", variant: "destructive" });
      return;
    }

    const autreCompetitor = agencies.find(a => a.name === "Autre");
    if (!autreCompetitor) {
      toast({ title: "Erreur", description: "Le concurrent 'Autre' n'existe pas. Veuillez l'ajouter d'abord.", variant: "destructive" });
      return;
    }

    setIsAddingArticle(true);

    try {
      const { error } = await supabase.functions.invoke("enrich-article", {
        body: {
          link: newArticleLink.trim(),
          type: "competitor",
          organization_id: effectiveOrgId,
          competitor_id: autreCompetitor.id,
          competitor_name: "Autre",
        },
      });

      if (error) {
        throw error;
      }

      toast({ title: "Enrichissement en cours", description: "L'article sera disponible dans quelques instants" });
    } catch (enrichError) {
      console.error("Enrichment error:", enrichError);
      toast({ title: "Échec de l'envoi", description: "Impossible d'envoyer l'article pour enrichissement. Veuillez réessayer.", variant: "destructive" });
    }

    setNewArticleLink("");
    setShowAddCompetitorModal(false);
    setIsAddingArticle(false);
  };

  const handleAddCompetitor = async () => {
    if (!newCompetitorName.trim()) {
      toast({ title: "Nom requis", description: "Veuillez saisir le nom du concurrent", variant: "destructive" });
      return;
    }
    if (!effectiveOrgId) {
      toast({ title: "Erreur", description: "Organisation non trouvée", variant: "destructive" });
      return;
    }
    setIsAddingCompetitor(true);

    try {
      const { data: newCompetitor, error } = await supabase.from("organization_competitor").insert({
        organization_id: effectiveOrgId,
        name: newCompetitorName.trim(),
      }).select("id, name").single();

      if (error) {
        if (error.code === "23505") {
          toast({ title: "Concurrent existant", description: "Ce concurrent existe déjà dans votre liste", variant: "destructive" });
        } else {
          throw error;
        }
      } else {
        try {
          await supabase.functions.invoke("notify-new-competitor", {
            body: {
              competitor_id: newCompetitor.id,
              competitor_name: newCompetitor.name,
              organization_id: effectiveOrgId,
            },
          });
        } catch (webhookError) {
          console.error("Webhook notification failed:", webhookError);
        }
        
        toast({ title: "Concurrent ajouté", description: `${newCompetitorName.trim()} a été ajouté à votre liste` });
        setNewCompetitorName("");
        fetchAgencies();
      }
    } catch (error) {
      console.error("Error adding competitor:", error);
      toast({ title: "Échec de l'ajout", description: "Impossible d'ajouter le concurrent. Veuillez réessayer.", variant: "destructive" });
    }

    setIsAddingCompetitor(false);
  };

  const handleAddClient = async () => {
    if (!newClientName.trim()) {
      toast({ title: "Nom requis", description: "Veuillez saisir le nom du client", variant: "destructive" });
      return;
    }
    if (!effectiveOrgId) {
      toast({ title: "Erreur", description: "Organisation non trouvée", variant: "destructive" });
      return;
    }
    setIsAddingClient(true);

    try {
      const { data: insertedClient, error } = await supabase.from("client_agencies").insert({
        organization_id: effectiveOrgId,
        name: newClientName.trim(),
      }).select().single();

      if (error) {
        if (error.code === "23505") {
          toast({ title: "Client existant", description: "Ce client existe déjà dans votre liste", variant: "destructive" });
        } else {
          throw error;
        }
      } else {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.access_token && insertedClient) {
          try {
            await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/notify-new-client`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${session.access_token}`,
              },
              body: JSON.stringify({
                client_id: insertedClient.id,
                client_name: insertedClient.name,
                organization_id: effectiveOrgId,
              }),
            });
          } catch (webhookError) {
            console.error("Webhook notification failed:", webhookError);
          }
        }
        toast({ title: "Client ajouté", description: `${newClientName.trim()} a été ajouté à votre liste` });
        setNewClientName("");
        fetchClients();
      }
    } catch (error) {
      console.error("Error adding client:", error);
      toast({ title: "Échec de l'ajout", description: "Impossible d'ajouter le client. Veuillez réessayer.", variant: "destructive" });
    }

    setIsAddingClient(false);
  };

  const handleDeleteClient = async (clientId: string, clientName: string) => {
    if (clientName === "Autre") {
      toast({ title: "Action non autorisée", description: "Le client 'Autre' ne peut pas être supprimé", variant: "destructive" });
      return;
    }
    const { error } = await supabase.from("client_agencies").delete().eq("id", clientId);
    if (error) {
      toast({ title: "Échec de la suppression", description: "Impossible de supprimer le client. Veuillez réessayer.", variant: "destructive" });
    } else {
      toast({ title: "Client supprimé", description: `${clientName} a été retiré de votre liste` });
      fetchClients();
    }
  };

  const handleAddClientArticle = async () => {
    if (!newArticleLink.trim()) {
      toast({ title: "Lien manquant", description: "Veuillez coller le lien de l'article à ajouter", variant: "destructive" });
      return;
    }
    if (!effectiveOrgId) {
      toast({ title: "Erreur", description: "Organisation non trouvée", variant: "destructive" });
      return;
    }

    const autreClient = clients.find(c => c.name === "Autre");
    if (!autreClient) {
      toast({ title: "Erreur", description: "Le client 'Autre' n'existe pas. Veuillez rafraîchir la page.", variant: "destructive" });
      return;
    }

    setIsAddingArticle(true);

    try {
      const { error } = await supabase.functions.invoke("enrich-article", {
        body: {
          link: newArticleLink.trim(),
          type: "client",
          organization_id: effectiveOrgId,
          client_id: autreClient.id,
          client_name: "Autre",
        },
      });

      if (error) {
        throw error;
      }

      toast({ title: "Enrichissement en cours", description: "L'article sera disponible dans quelques instants" });
    } catch (enrichError) {
      console.error("Enrichment error:", enrichError);
      toast({ title: "Échec de l'envoi", description: "Impossible d'envoyer l'article pour enrichissement. Veuillez réessayer.", variant: "destructive" });
    }

    setNewArticleLink("");
    setShowAddClientModal(false);
    setIsAddingArticle(false);
  };

  const handleAddVeilleArticle = async () => {
    if (!newTopicName.trim()) {
      toast({ title: "Sujet manquant", description: "Veuillez saisir un sujet de veille (ex: IA générative, Blockchain...)", variant: "destructive" });
      return;
    }
    if (!effectiveOrgId) {
      toast({ title: "Erreur", description: "Organisation non trouvée", variant: "destructive" });
      return;
    }
    setIsAddingArticle(true);

    try {
      const { error } = await supabase.functions.invoke("add-market-topic", {
        body: {
          topic_name: newTopicName.trim(),
          topic_link: newArticleLink.trim() || null,
          organization_id: effectiveOrgId,
        },
      });

      if (error) {
        throw error;
      }

      toast({ title: "Sujet ajouté", description: "La veille sur ce sujet sera configurée sous peu" });
    } catch (addError) {
      console.error("Add topic error:", addError);
      toast({ title: "Échec de l'ajout", description: "Impossible d'ajouter le sujet. Veuillez réessayer.", variant: "destructive" });
    }

    setNewArticleLink("");
    setNewTopicName("");
    setShowAddVeilleModal(false);
    setIsAddingArticle(false);
  };

  const handleDeleteCompetitor = async (agencyId: string, agencyName: string) => {
    const { error } = await supabase.from("organization_competitor").delete().eq("id", agencyId);
    if (error) {
      toast({ title: "Échec de la suppression", description: "Impossible de supprimer le concurrent. Veuillez réessayer.", variant: "destructive" });
    } else {
      toast({ title: "Concurrent supprimé", description: `${agencyName} a été retiré de votre liste` });
      fetchAgencies();
    }
  };

  const handleDeleteJournalist = async (journalistId: string, journalistName: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const { error } = await supabase.from("journalists").delete().eq("id", journalistId);
    if (error) {
      toast({ title: "Échec de la suppression", description: "Impossible de supprimer le journaliste. Veuillez réessayer.", variant: "destructive" });
    } else {
      toast({ title: "Journaliste supprimé", description: `${journalistName} a été retiré de votre liste de contacts` });
      fetchJournalists();
    }
  };

  const MAX_ENRICHMENT_BATCH = 25;

  const handleEnrichJournalists = async () => {
    if (!effectiveOrgId) {
      toast({ title: "Erreur", description: "Organisation non trouvée", variant: "destructive" });
      return;
    }

    const allJournalistsToEnrich = journalists.filter(
      j => !j.linkedin && !j.email && 
           j.enrichment_status !== 'pending' && 
           j.enrichment_status !== 'processing'
    );
    
    if (allJournalistsToEnrich.length === 0) {
      toast({ 
        title: "Aucun journaliste à enrichir", 
        description: "Tous les journalistes sont déjà enrichis ou en cours d'enrichissement" 
      });
      return;
    }

    const journalistsToEnrich = allJournalistsToEnrich.slice(0, MAX_ENRICHMENT_BATCH);
    const remaining = allJournalistsToEnrich.length - journalistsToEnrich.length;

    if (remaining > 0) {
      toast({ 
        title: "Enrichissement partiel", 
        description: `Les ${MAX_ENRICHMENT_BATCH} premiers journalistes seront enrichis. ${remaining} restant(s) à traiter ensuite.`
      });
    }

    setIsEnrichingJournalists(true);

    try {
      const { data, error } = await supabase.functions.invoke("notify-new-journalist", {
        body: {
          journalists: journalistsToEnrich.map(j => ({
            journalist_id: j.id,
            name: j.name,
            media: j.media,
            email: j.email,
            organization_id: effectiveOrgId,
          })),
          organization_id: effectiveOrgId,
        },
      });

      if (error) throw error;

      if (data?.code === "BATCH_LIMIT_EXCEEDED") {
        toast({ 
          title: "Limite dépassée", 
          description: data.error, 
          variant: "destructive" 
        });
        return;
      }

      toast({ 
        title: "Enrichissement lancé", 
        description: `${journalistsToEnrich.length} journaliste(s) en cours de traitement. Les résultats apparaîtront automatiquement.`
      });
    } catch (err: any) {
      console.error("Enrichment error:", err);
      const errorMessage = err?.message || "Impossible d'envoyer les journalistes pour enrichissement. Veuillez réessayer.";
      toast({ 
        title: "Échec de l'enrichissement", 
        description: errorMessage, 
        variant: "destructive" 
      });
    } finally {
      setIsEnrichingJournalists(false);
    }
  };

  const handleResetStuckEnrichments = async () => {
    const stuckJournalists = journalists.filter(
      j => (j.enrichment_status === 'pending' || j.enrichment_status === 'processing')
    );
    
    if (stuckJournalists.length === 0) {
      toast({ title: "Aucun enrichissement bloqué" });
      return;
    }

    const { error } = await supabase
      .from('journalists')
      .update({ enrichment_status: null, enrichment_error: 'Réinitialisé manuellement' })
      .in('id', stuckJournalists.map(j => j.id));

    if (error) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    } else {
      setJournalists(journalists.map(j => 
        stuckJournalists.find(s => s.id === j.id) 
          ? { ...j, enrichment_status: null } 
          : j
      ));
      toast({ 
        title: "Enrichissements réinitialisés", 
        description: `${stuckJournalists.length} journaliste(s) peuvent être ré-enrichis` 
      });
    }
  };

  const toggleJournalist = (id: string) => {
    setJournalists(journalists.map((j) => (j.id === id ? { ...j, selected: !j.selected } : j)));
  };

  const updateJournalistNotes = async (id: string, notes: string) => {
    const { error } = await supabase.from("journalists").update({ notes }).eq("id", id);

    if (error) {
      toast({
        title: "Échec de la sauvegarde",
        description: "Impossible de sauvegarder le commentaire. Veuillez réessayer.",
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
      year: "numeric",
    });
  };

  const handleCsvImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!effectiveOrgId) {
      toast({
        title: "Erreur",
        description: "Organisation non trouvée",
        variant: "destructive",
      });
      return;
    }

    setIsImporting(true);

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const text = e.target?.result as string;
        const lines = text.split("\n").filter((line) => line.trim());

        const dataLines = lines.slice(1);
        const journalistsToInsert = [];

        for (const line of dataLines) {
          const values = line.match(/(".*?"|[^,]+)(?=\s*,|\s*$)/g)?.map((v) => v.replace(/^"|"$/g, "").trim()) || [];

          const [media, name, job, email, phone, notes] = values;

          if (name && name.trim()) {
            journalistsToInsert.push({
              organization_id: effectiveOrgId,
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
            title: "Import réussi",
            description: `${journalistsToInsert.length} journaliste(s) ajouté(s) à votre base de contacts`,
          });
          fetchJournalists();
        } else {
          toast({
            title: "Fichier vide ou invalide",
            description: "Aucun journaliste n'a été trouvé dans le fichier CSV. Vérifiez le format.",
            variant: "destructive",
          });
        }
      } catch (error: any) {
        console.error("Import error:", error);
        toast({
          title: "Échec de l'import",
          description: error.message || "Une erreur s'est produite lors de l'import du fichier CSV",
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
    setSelectedCommunique(null);
    setJournalists(journalists.map((j) => ({ ...j, selected: false })));
    setIsSending(false);
  };

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />

      <div className={cn("flex-1 flex flex-col min-h-screen content-transition", sidebarCollapsed ? "ml-20" : "ml-72")}>
        <Header sidebarCollapsed={sidebarCollapsed} />

        <main className="flex-1 p-6 pt-4 overflow-y-auto">
          {/* Full Page Relations Presse */}
          <div className="bg-card rounded-2xl border border-border/50 p-8">
            {/* Header with title */}
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Newspaper className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">Presse</h1>
                <p className="text-muted-foreground text-sm">
                  Gérez vos retombées presse et vos contacts journalistes
                </p>
              </div>
            </div>

            {/* Sub-tabs - Full width below header */}
            <div className="flex items-center justify-between mb-8 pb-6 border-b border-border/50">
              <div className="flex items-center gap-1 p-1.5 bg-secondary/50 rounded-xl">
                {getSubTabs(effectiveOrgName).map((tab, index, arr) => {
                  const isActive = activeSubTab === tab.id;
                  const prevTab = arr[index - 1];
                  const showSeparator = prevTab && prevTab.group !== tab.group;
                  
                  return (
                    <div key={tab.id} className="flex items-center">
                      {showSeparator && (
                        <div className="w-px h-6 bg-border mx-2" />
                      )}
                      <button
                        onClick={() => setActiveSubTab(tab.id)}
                        className={cn(
                          "px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap",
                          isActive
                            ? "bg-foreground text-background shadow-md"
                            : "text-muted-foreground hover:text-foreground hover:bg-secondary/80",
                        )}
                      >
                        {tab.label}
                      </button>
                    </div>
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
                    Retombées presse de {effectiveOrgName}
                  </p>
                  <div className="flex items-center gap-3">
                    {isOrgAdmin && hiddenOrganizationArticles.length > 0 && (
                      <Button
                        variant={showHiddenOrganization ? "default" : "outline"}
                        size="sm"
                        onClick={() => {
                          setShowHiddenOrganization(!showHiddenOrganization);
                          if (!showHiddenOrganization) fetchHiddenOrganizationArticles();
                        }}
                        className="gap-2"
                      >
                        <EyeOff className="w-4 h-4" />
                        Masqués ({hiddenOrganizationArticles.length})
                      </Button>
                    )}
                    {isOrgAdmin && hiddenOrganizationArticles.length === 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => fetchHiddenOrganizationArticles()}
                        className="gap-2 text-muted-foreground"
                      >
                        <EyeOff className="w-4 h-4" />
                        Voir masqués
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleUpdateOrganizationArticles}
                      disabled={isUpdatingOrganizationArticles}
                      className="gap-2"
                    >
                      <RefreshCw className={cn("w-4 h-4", isUpdatingOrganizationArticles && "animate-spin")} />
                      {isUpdatingOrganizationArticles ? "Mise à jour..." : "Mettre à jour"}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowAddSocialyModal(true)}
                      className="gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Ajouter
                    </Button>
                    <span className="text-sm font-medium text-muted-foreground bg-secondary/50 px-4 py-2 rounded-lg">
                      {organizationArticles.length} article{organizationArticles.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                </div>

                {showHiddenOrganization && isOrgAdmin && hiddenOrganizationArticles.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <EyeOff className="w-4 h-4" />
                        Articles masqués
                      </p>
                      <Button variant="ghost" size="sm" onClick={() => setShowHiddenOrganization(false)}>
                        Fermer
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 p-4 bg-muted/30 rounded-2xl border border-dashed border-border">
                      {hiddenOrganizationArticles.map((article) => (
                        <div
                          key={article.id}
                          className="group relative flex gap-4 p-4 bg-secondary/40 rounded-2xl opacity-60 hover:opacity-100 transition-all"
                        >
                          <button
                            onClick={(e) => handleRestoreOrganizationArticle(article.id, e)}
                            className="absolute top-2 right-2 z-10 w-8 h-8 rounded-full bg-primary/90 hover:bg-primary flex items-center justify-center transition-all shadow-sm"
                            title="Restaurer l'article"
                          >
                            <RotateCcw className="w-4 h-4 text-primary-foreground" />
                          </button>
                          <div className="relative w-20 h-16 rounded-lg bg-secondary overflow-hidden flex-shrink-0">
                            {article.thumbnail ? (
                              <img src={article.thumbnail} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-secondary to-muted">
                                <ImageIcon className="w-6 h-6 text-muted-foreground/30" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-xs font-semibold text-foreground line-clamp-2">{article.title}</h4>
                            {article.article_date && (
                              <span className="text-xs text-muted-foreground mt-1">{formatDate(article.article_date)}</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {isLoadingOrganization ? (
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
                ) : organizationArticles.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {organizationArticles.map((article) => (
                      <div
                        key={article.id}
                        className="group relative flex gap-4 p-4 bg-secondary/40 hover:bg-secondary/70 rounded-2xl transition-all duration-300 border border-transparent hover:border-primary/20 hover:shadow-lg cursor-pointer"
                        onClick={() => window.open(article.link, "_blank")}
                      >
                        {isOrgAdmin && (
                          <button
                            onClick={(e) => handleHideOrganizationArticle(article.id, e)}
                            className="absolute top-2 right-2 z-10 w-8 h-8 rounded-full bg-background/90 hover:bg-destructive/10 border border-border hover:border-destructive/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-sm"
                            title="Masquer l'article"
                          >
                            <EyeOff className="w-4 h-4 text-muted-foreground hover:text-destructive" />
                          </button>
                        )}
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
                              {effectiveOrgName}
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
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-20 bg-gradient-to-br from-primary/5 to-primary/10 rounded-2xl border border-primary/20">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center mb-6 shadow-lg shadow-primary/25">
                      <Zap className="w-10 h-10 text-primary-foreground" />
                    </div>
                    <h4 className="text-2xl font-bold text-foreground">Vos retombées presse</h4>
                    <p className="text-muted-foreground mt-2 text-center max-w-md">
                      Aucun article trouvé. Configurez votre veille pour voir les mentions de {effectiveOrgName}.
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

                  <div className="flex items-center gap-3">
                    {isOrgAdmin && hiddenCompetitorArticles.length > 0 && (
                      <Button
                        variant={showHiddenCompetitor ? "default" : "outline"}
                        size="sm"
                        onClick={() => {
                          setShowHiddenCompetitor(!showHiddenCompetitor);
                          if (!showHiddenCompetitor) fetchHiddenCompetitorArticles();
                        }}
                        className="gap-2"
                      >
                        <EyeOff className="w-4 h-4" />
                        Masqués ({hiddenCompetitorArticles.length})
                      </Button>
                    )}
                    {isOrgAdmin && hiddenCompetitorArticles.length === 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => fetchHiddenCompetitorArticles()}
                        className="gap-2 text-muted-foreground"
                      >
                        <EyeOff className="w-4 h-4" />
                        Voir masqués
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowCompetitorManager(true)}
                      className="gap-2"
                    >
                      <Building2 className="w-4 h-4" />
                      Concurrents
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowAddCompetitorModal(true)}
                      className="gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Ajouter
                    </Button>
                    <span className="text-sm font-medium text-muted-foreground bg-secondary/50 px-4 py-2 rounded-lg">
                      {filteredArticles.length} article{filteredArticles.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                </div>

                {showHiddenCompetitor && isOrgAdmin && hiddenCompetitorArticles.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <EyeOff className="w-4 h-4" />
                        Articles masqués
                      </p>
                      <Button variant="ghost" size="sm" onClick={() => setShowHiddenCompetitor(false)}>
                        Fermer
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 p-4 bg-muted/30 rounded-2xl border border-dashed border-border">
                      {hiddenCompetitorArticles.map((article) => (
                        <div
                          key={article.id}
                          className="group relative flex gap-4 p-4 bg-secondary/40 rounded-2xl opacity-60 hover:opacity-100 transition-all"
                        >
                          <button
                            onClick={(e) => handleRestoreCompetitorArticle(article.id, e)}
                            className="absolute top-2 right-2 z-10 w-8 h-8 rounded-full bg-primary/90 hover:bg-primary flex items-center justify-center transition-all shadow-sm"
                            title="Restaurer l'article"
                          >
                            <RotateCcw className="w-4 h-4 text-primary-foreground" />
                          </button>
                          <div className="relative w-20 h-16 rounded-lg bg-secondary overflow-hidden flex-shrink-0">
                            {article.thumbnail ? (
                              <img src={article.thumbnail} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-secondary to-muted">
                                <ImageIcon className="w-6 h-6 text-muted-foreground/30" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-xs font-semibold text-foreground line-clamp-2">{article.title}</h4>
                            {article.article_date && (
                              <span className="text-xs text-muted-foreground mt-1">{formatDate(article.article_date)}</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

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
                      <div
                        key={article.id}
                        className="group relative flex gap-4 p-4 bg-secondary/40 hover:bg-secondary/70 rounded-2xl transition-all duration-300 border border-transparent hover:border-primary/20 hover:shadow-lg cursor-pointer"
                        onClick={() => window.open(article.link, "_blank")}
                      >
                        {isOrgAdmin && (
                          <button
                            onClick={(e) => handleHideCompetitorArticle(article.id, e)}
                            className="absolute top-2 right-2 z-10 w-8 h-8 rounded-full bg-background/90 hover:bg-destructive/10 border border-border hover:border-destructive/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-sm"
                            title="Masquer l'article"
                          >
                            <EyeOff className="w-4 h-4 text-muted-foreground hover:text-destructive" />
                          </button>
                        )}
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
                      </div>
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
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleEnrichJournalists}
                            disabled={isEnrichingJournalists || (journalists.filter(j => !j.linkedin && !j.email && j.enrichment_status !== 'pending' && j.enrichment_status !== 'processing').length === 0)}
                            className="gap-2"
                          >
                            {(() => {
                              const inProgress = journalists.filter(j => j.enrichment_status === 'pending' || j.enrichment_status === 'processing').length;
                              const toEnrich = journalists.filter(j => !j.linkedin && !j.email && j.enrichment_status !== 'pending' && j.enrichment_status !== 'processing').length;
                              
                              if (inProgress > 0) {
                                return (
                                  <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    {`En cours (${inProgress})`}
                                  </>
                                );
                              }
                              
                              if (toEnrich > MAX_ENRICHMENT_BATCH) {
                                return (
                                  <>
                                    <Zap className="w-4 h-4" />
                                    {`Enrichir ${MAX_ENRICHMENT_BATCH} sur ${toEnrich}`}
                                  </>
                                );
                              }
                              
                              return (
                                <>
                                  <Zap className="w-4 h-4" />
                                  {`Enrichir (${toEnrich})`}
                                </>
                              );
                            })()}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent className="bg-card border-border shadow-lg">
                          {(() => {
                            const inProgress = journalists.filter(j => j.enrichment_status === 'pending' || j.enrichment_status === 'processing').length;
                            const toEnrich = journalists.filter(j => !j.linkedin && !j.email && j.enrichment_status !== 'pending' && j.enrichment_status !== 'processing').length;
                            
                            if (inProgress > 0) {
                              return `${inProgress} journaliste(s) en cours d'enrichissement. Les résultats apparaîtront automatiquement.`;
                            }
                            
                            if (toEnrich > MAX_ENRICHMENT_BATCH) {
                              return `${toEnrich} journalistes à enrichir. Les ${MAX_ENRICHMENT_BATCH} premiers seront traités, puis relancez pour les suivants.`;
                            }
                            
                            return `Rechercher LinkedIn et email pour ${toEnrich} journaliste(s)`;
                          })()}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    {journalists.filter(j => j.enrichment_status === 'pending' || j.enrichment_status === 'processing').length > 0 && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={handleResetStuckEnrichments}
                              className="gap-2 text-muted-foreground hover:text-destructive"
                            >
                              <RotateCcw className="w-4 h-4" />
                              Réinitialiser
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent className="bg-card border-border shadow-lg">
                            Réinitialiser les enrichissements bloqués pour pouvoir les relancer
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}

                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => fetchJournalists()}
                            disabled={isLoadingJournalists}
                            className="gap-2 text-muted-foreground hover:text-foreground"
                          >
                            <RefreshCw className={cn("w-4 h-4", isLoadingJournalists && "animate-spin")} />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent className="bg-card border-border shadow-lg">
                          Actualiser la liste des journalistes
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

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
                    <div className="grid grid-cols-[auto_1.5fr_1.2fr_1fr_0.8fr_0.5fr_1.2fr_1.5fr_60px_50px] gap-3 px-5 py-3 bg-secondary/60 border-b border-border text-xs font-semibold text-muted-foreground uppercase tracking-wide">
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
                      <div></div>
                    </div>

                    {/* Table Body */}
                    <div className="divide-y divide-border/50">
                      {filteredJournalists.map((journalist) => (
                        <div
                          key={journalist.id}
                          onClick={() => toggleJournalist(journalist.id)}
                          className={cn(
                            "group w-full grid grid-cols-[auto_1.5fr_1.2fr_1fr_0.8fr_0.5fr_1.2fr_1.5fr_60px_50px] gap-3 px-5 py-4 text-left transition-all duration-200 hover:bg-secondary/50 cursor-pointer",
                            journalist.selected && "bg-primary/5",
                          )}
                        >
                          <div className="relative">
                            <div
                              className={cn(
                                "w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 transition-all duration-300",
                                journalist.enrichment_status === 'pending' || journalist.enrichment_status === 'processing'
                                  ? "bg-primary/20 text-primary animate-pulse"
                                  : journalist.selected 
                                    ? "bg-primary text-primary-foreground" 
                                    : "bg-secondary text-foreground",
                              )}
                            >
                              {journalist.enrichment_status === 'pending' || journalist.enrichment_status === 'processing' ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                              ) : (
                                journalist.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")
                                  .slice(0, 2)
                              )}
                            </div>
                            {(journalist.enrichment_status === 'pending' || journalist.enrichment_status === 'processing') && (
                              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                                <Zap className="w-2.5 h-2.5 text-primary-foreground" />
                              </div>
                            )}
                          </div>

                          <div className="flex items-center min-w-0">
                            <span className="font-semibold text-foreground truncate">{journalist.name}</span>
                          </div>

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

                          <div className="flex items-center min-w-0">
                            {journalist.email ? (
                              <span className="text-sm text-primary truncate">{journalist.email}</span>
                            ) : (
                              <span className="text-sm text-muted-foreground/50">—</span>
                            )}
                          </div>

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

                          <div className="flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={(e) => handleDeleteJournalist(journalist.id, journalist.name, e)}
                              className="w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground/50 hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-all duration-200"
                              title="Supprimer le journaliste"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
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

            {/* CLIENT TAB */}
            {activeSubTab === "client" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <p className="text-lg font-medium text-foreground flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-primary" />
                    Retombées presse de vos clients
                  </p>
                  <div className="flex items-center gap-3">
                    <Button variant="outline" size="sm" onClick={() => setShowClientManager(true)} className="gap-2">
                      <Briefcase className="w-4 h-4" />
                      Clients
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setShowAddClientModal(true)} className="gap-2">
                      <Plus className="w-4 h-4" />
                      Ajouter
                    </Button>
                    <span className="text-sm font-medium text-muted-foreground bg-secondary/50 px-4 py-2 rounded-lg">
                      {clientArticles.length} article{clientArticles.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                </div>

                {clientArticles.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {clientArticles.map((article) => (
                      <div
                        key={article.id}
                        className="group relative flex gap-4 p-4 bg-secondary/40 hover:bg-secondary/70 rounded-2xl transition-all duration-300 border border-transparent hover:border-primary/20 hover:shadow-lg cursor-pointer"
                        onClick={() => window.open(article.link, "_blank")}
                      >
                        <div className="relative w-28 h-24 rounded-xl bg-secondary overflow-hidden flex-shrink-0">
                          {article.thumbnail ? (
                            <img src={article.thumbnail} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-secondary to-muted">
                              <ImageIcon className="w-8 h-8 text-muted-foreground/30" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0 flex flex-col justify-center">
                          <h4 className="text-sm font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors leading-tight">{article.title}</h4>
                          <div className="flex items-center gap-2 mt-2.5 flex-wrap">
                            {article.client_name && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-primary/15 text-primary text-xs font-semibold">
                                <Briefcase className="w-3 h-3" />
                                {article.client_name}
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
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-20 bg-gradient-to-br from-primary/5 to-primary/10 rounded-2xl border border-primary/20">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center mb-6 shadow-lg shadow-primary/25">
                      <Briefcase className="w-10 h-10 text-primary-foreground" />
                    </div>
                    <h4 className="text-2xl font-bold text-foreground">Retombées clients</h4>
                    <p className="text-muted-foreground mt-2 text-center max-w-md">
                      Ajoutez des clients et leurs articles pour suivre leurs retombées presse.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* VEILLE MARCHÉ TAB */}
            {activeSubTab === "veille-marche" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <p className="text-lg font-medium text-foreground flex items-center gap-2">
                    <Eye className="w-5 h-5 text-primary" />
                    Veille Marché
                  </p>
                  <div className="flex items-center gap-3">
                    <Button variant="outline" size="sm" onClick={() => setShowAddVeilleModal(true)} className="gap-2">
                      <Plus className="w-4 h-4" />
                      Ajouter un sujet
                    </Button>
                    <span className="text-sm font-medium text-muted-foreground bg-secondary/50 px-4 py-2 rounded-lg">
                      {veilleArticles.length} article{veilleArticles.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                </div>

                {isLoadingVeille ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex gap-4 p-4 bg-secondary/30 rounded-2xl animate-pulse">
                        <div className="w-28 h-24 bg-secondary rounded-xl flex-shrink-0" />
                        <div className="flex-1 space-y-3">
                          <div className="h-5 bg-secondary rounded w-3/4" />
                          <div className="h-4 bg-secondary rounded w-1/2" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : veilleArticles.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {veilleArticles.map((article) => (
                      <div
                        key={article.id}
                        className="group relative flex gap-4 p-4 bg-secondary/40 hover:bg-secondary/70 rounded-2xl transition-all duration-300 border border-transparent hover:border-primary/20 hover:shadow-lg cursor-pointer"
                        onClick={() => window.open(article.link, "_blank")}
                      >
                        <div className="relative w-28 h-24 rounded-xl bg-secondary overflow-hidden flex-shrink-0">
                          {article.thumbnail ? (
                            <img src={article.thumbnail} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-secondary to-muted">
                              <ImageIcon className="w-8 h-8 text-muted-foreground/30" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0 flex flex-col justify-center">
                          <h4 className="text-sm font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors leading-tight">{article.title}</h4>
                          <div className="flex items-center gap-2 mt-2.5 flex-wrap">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-emerald-500/15 text-emerald-600 text-xs font-semibold">
                              <Eye className="w-3 h-3" />
                              Veille
                            </span>
                            {article.source_name && (
                              <span className="text-xs text-muted-foreground flex items-center gap-1 font-medium">
                                {article.source_icon && <img src={article.source_icon} alt="" className="w-3.5 h-3.5 rounded" />}
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
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-20 bg-gradient-to-br from-primary/5 to-primary/10 rounded-2xl border border-primary/20">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center mb-6 shadow-lg shadow-primary/25">
                      <Eye className="w-10 h-10 text-primary-foreground" />
                    </div>
                    <h4 className="text-2xl font-bold text-foreground">Veille Marché</h4>
                    <p className="text-muted-foreground mt-2 text-center max-w-md">
                      Ajoutez des articles de veille pour suivre les tendances de votre marché.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* COMMUNIQUÉS TAB */}
            {activeSubTab === "communiques" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                      <FileText className="w-5 h-5 text-primary" />
                      Vos communiqués de presse
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1">
                      Gérez vos communiqués avec PDF, Word et assets
                    </p>
                  </div>
                  <Button onClick={() => setShowAddCommuniqueForm(true)} className="gap-2">
                    <Plus className="w-4 h-4" />
                    Communiqué
                  </Button>
                </div>

                {isLoadingCommuniques ? (
                  <div className="flex justify-center py-12">
                    <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                  </div>
                ) : communiques.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 bg-gradient-to-br from-primary/5 to-primary/10 rounded-2xl border border-primary/20">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center mb-6 shadow-lg shadow-primary/25">
                      <FileText className="w-10 h-10 text-primary-foreground" />
                    </div>
                    <h4 className="text-2xl font-bold text-foreground">Aucun communiqué</h4>
                    <p className="text-muted-foreground mt-2 text-center max-w-md">
                      Ajoutez votre premier communiqué de presse
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {communiques.map((communique) => {
                      const statusInfo = STATUS_OPTIONS.find(s => s.value === communique.status) || STATUS_OPTIONS[0];
                      return (
                        <div key={communique.id} className="relative bg-card/80 backdrop-blur-sm p-6 rounded-3xl group hover:shadow-2xl hover:shadow-primary/10 transition-all duration-300 border border-border/50 hover:border-primary/20 hover:-translate-y-1">
                          <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/50 to-transparent pointer-events-none" />

                          <div className="relative">
                            <div className="flex items-start justify-between mb-5">
                              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 via-primary/10 to-transparent flex items-center justify-center shadow-lg shadow-primary/10">
                                <FileText className="w-7 h-7 text-primary" />
                              </div>
                              <div className="flex items-center gap-2">
                                <Select
                                  value={communique.status}
                                  onValueChange={async (newStatus) => {
                                    await supabase.from("communique_presse").update({ status: newStatus }).eq("id", communique.id);
                                    fetchCommuniques();
                                  }}
                                >
                                  <SelectTrigger className={cn("h-8 text-xs font-semibold border rounded-full px-3 py-1 w-auto min-w-[100px] shadow-sm", statusInfo.color)}>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {STATUS_OPTIONS.map(opt => (
                                      <SelectItem key={opt.value} value={opt.value}>
                                        {opt.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 rounded-full text-destructive hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-all"
                                  onClick={() => handleDeleteCommunique(communique)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>

                            <h4 className="font-bold text-lg text-foreground mb-4 line-clamp-2">{communique.name}</h4>

                            <div className="flex flex-wrap gap-2 mb-5">
                              {communique.pdf_url && (
                                <a
                                  href={communique.pdf_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-red-500/10 text-red-600 hover:bg-red-500/20 hover:shadow-md hover:shadow-red-500/10 transition-all text-xs font-semibold"
                                >
                                  <FileText className="w-3.5 h-3.5" />
                                  PDF
                                </a>
                              )}
                              {communique.word_url && (
                                <a
                                  href={communique.word_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 hover:shadow-md hover:shadow-blue-500/10 transition-all text-xs font-semibold"
                                >
                                  <File className="w-3.5 h-3.5" />
                                  Word
                                </a>
                              )}
                              {communique.assets_link && (
                                <a
                                  href={communique.assets_link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-purple-500/10 text-purple-600 hover:bg-purple-500/20 hover:shadow-md hover:shadow-purple-500/10 transition-all text-xs font-semibold"
                                >
                                  <ExternalLink className="w-3.5 h-3.5" />
                                  Assets
                                </a>
                              )}
                            </div>

                            <p className="text-xs text-muted-foreground font-medium">
                              Ajouté le {new Date(communique.created_at).toLocaleDateString("fr-FR")}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </main>

        <CreateCommuniqueModal
          isOpen={showAddCommuniqueForm}
          onClose={resetCommuniqueForm}
          onSuccess={fetchCommuniques}
        />

        {showEmailModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="absolute inset-0 bg-foreground/60 backdrop-blur-sm"
              onClick={() => {
                setShowEmailModal(false);
                setSelectedCommunique(null);
              }}
            />

            <div className="relative w-full max-w-3xl bg-card rounded-3xl shadow-2xl border border-border overflow-hidden animate-in fade-in zoom-in-95 duration-300 max-h-[90vh] flex flex-col">
              <div className="flex items-center justify-between p-6 border-b border-border bg-gradient-to-r from-primary/5 to-transparent flex-shrink-0">
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
                  onClick={() => {
                    setShowEmailModal(false);
                    setSelectedCommunique(null);
                  }}
                  className="w-10 h-10 rounded-full hover:bg-secondary flex items-center justify-center transition-colors"
                >
                  <X className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>

              <div className="p-6 space-y-6 overflow-y-auto flex-1">
                <div>
                  <label className="text-sm font-semibold text-foreground mb-3 block">
                    Sélectionnez un communiqué de presse
                  </label>

                  {communiques.length === 0 ? (
                    <div className="text-center py-8 bg-secondary/30 rounded-xl border border-dashed border-border">
                      <FileText className="w-10 h-10 text-muted-foreground/50 mx-auto mb-3" />
                      <p className="text-sm text-muted-foreground">Aucun communiqué disponible</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Créez-en un dans l'onglet Communiqués
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {communiques.map((communique) => (
                        <button
                          key={communique.id}
                          onClick={() => setSelectedCommunique(communique)}
                          className={cn(
                            "group relative p-4 rounded-xl border-2 transition-all duration-200 text-left",
                            selectedCommunique?.id === communique.id
                              ? "border-primary bg-primary/10 shadow-lg shadow-primary/10"
                              : "border-border bg-secondary/30 hover:border-primary/40 hover:bg-secondary/50"
                          )}
                        >
                          <div className="flex items-start gap-3">
                            <div className={cn(
                              "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors",
                              selectedCommunique?.id === communique.id
                                ? "bg-primary text-primary-foreground"
                                : "bg-primary/10 text-primary group-hover:bg-primary/20"
                            )}>
                              <FileText className="w-5 h-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-semibold text-sm text-foreground truncate">
                                  {communique.name}
                                </h4>
                                {(() => {
                                  const statusInfo = STATUS_OPTIONS.find(s => s.value === communique.status) || STATUS_OPTIONS[0];
                                  return (
                                    <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border", statusInfo.color)}>
                                      {statusInfo.label}
                                    </span>
                                  );
                                })()}
                              </div>
                              <div className="flex items-center gap-2 mt-2">
                                {communique.pdf_url && (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-red-500/10 text-red-600 text-[10px] font-medium">
                                    PDF
                                  </span>
                                )}
                                {communique.word_url && (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-blue-500/10 text-blue-600 text-[10px] font-medium">
                                    Word
                                  </span>
                                )}
                                {communique.assets_link && (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-purple-500/10 text-purple-600 text-[10px] font-medium">
                                    Assets
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          {selectedCommunique?.id === communique.id && (
                            <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                              <Check className="w-3 h-3 text-primary-foreground" />
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {selectedCommunique && (
                  <div className="space-y-5 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="h-px bg-border" />

                    <div>
                      <label className="text-sm font-semibold text-foreground mb-2 block">Objet</label>
                      <input
                        type="text"
                        value={emailSubject}
                        onChange={(e) => setEmailSubject(e.target.value)}
                        placeholder="Objet de votre email..."
                        className="w-full px-4 py-3 rounded-xl bg-secondary/50 border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-foreground placeholder:text-muted-foreground"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-semibold text-foreground mb-2 block">Message</label>
                      <textarea
                        value={emailMessage}
                        onChange={(e) => setEmailMessage(e.target.value)}
                        placeholder="Rédigez le message qui accompagne votre communiqué..."
                        rows={6}
                        className="w-full px-4 py-3 rounded-xl bg-secondary/50 border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-foreground placeholder:text-muted-foreground resize-none"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 p-6 border-t border-border bg-secondary/30 flex-shrink-0">
                <button
                  onClick={() => {
                    setShowEmailModal(false);
                    setSelectedCommunique(null);
                  }}
                  className="px-5 py-2.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary transition-all font-medium"
                >
                  Annuler
                </button>
                <button
                  onClick={handleSendEmail}
                  disabled={isSending || !selectedCommunique}
                  className="flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-all font-semibold shadow-lg shadow-primary/25 disabled:opacity-50 disabled:cursor-not-allowed"
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

        {showAddSocialyModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-card rounded-3xl w-full max-w-xl border border-border shadow-2xl overflow-hidden">
              <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-8 border-b border-border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-primary/15 flex items-center justify-center">
                      <Zap className="w-7 h-7 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-foreground">Nouvel article {effectiveOrgName}</h3>
                      <p className="text-sm text-muted-foreground mt-0.5">Ajoutez une retombée presse</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="rounded-full h-10 w-10" onClick={() => { setShowAddSocialyModal(false); setNewArticleLink(""); }}>
                    <X className="w-5 h-5" />
                  </Button>
                </div>
              </div>
              <div className="p-8 space-y-6">
                <div>
                  <Label className="text-sm font-semibold text-foreground">Lien de l'article</Label>
                  <Input
                    value={newArticleLink}
                    onChange={(e) => setNewArticleLink(e.target.value)}
                    placeholder="https://example.com/article..."
                    className="mt-3 h-12 text-base"
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    Les métadonnées seront récupérées automatiquement
                  </p>
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <Button variant="outline" size="lg" onClick={() => { setShowAddSocialyModal(false); setNewArticleLink(""); }}>
                    Annuler
                  </Button>
                  <Button size="lg" onClick={handleAddOrganizationArticle} disabled={isAddingArticle} className="min-w-32">
                    {isAddingArticle ? (
                      <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    ) : (
                      <>
                        <Plus className="w-5 h-5 mr-2" />
                        Ajouter
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {showAddCompetitorModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-card rounded-3xl w-full max-w-xl border border-border shadow-2xl overflow-hidden">
              <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-8 border-b border-border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-primary/15 flex items-center justify-center">
                      <Users2 className="w-7 h-7 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-foreground">Nouvel article concurrent</h3>
                      <p className="text-sm text-muted-foreground mt-0.5">Ajoutez un article de veille</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="rounded-full h-10 w-10" onClick={() => { setShowAddCompetitorModal(false); setNewArticleLink(""); setSelectedCompetitorId(""); }}>
                    <X className="w-5 h-5" />
                  </Button>
                </div>
              </div>
              <div className="p-8 space-y-6">
                <div>
                  <Label className="text-sm font-semibold text-foreground">Lien de l'article</Label>
                  <Input
                    value={newArticleLink}
                    onChange={(e) => setNewArticleLink(e.target.value)}
                    placeholder="https://example.com/article..."
                    className="mt-3 h-12 text-base"
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    Les métadonnées seront récupérées automatiquement
                  </p>
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <Button variant="outline" size="lg" onClick={() => { setShowAddCompetitorModal(false); setNewArticleLink(""); }}>
                    Annuler
                  </Button>
                  <Button size="lg" onClick={handleAddCompetitorArticle} disabled={isAddingArticle || !newArticleLink.trim()} className="min-w-32">
                    {isAddingArticle ? (
                      <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    ) : (
                      <>
                        <Plus className="w-5 h-5 mr-2" />
                        Ajouter
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {showCompetitorManager && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-card rounded-3xl w-full max-w-2xl border border-border shadow-2xl overflow-hidden">
              <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-8 border-b border-border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-primary/15 flex items-center justify-center">
                      <Building2 className="w-7 h-7 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-foreground">Gérer les concurrents</h3>
                      <p className="text-sm text-muted-foreground mt-0.5">Ajoutez ou supprimez des concurrents</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="rounded-full h-10 w-10" onClick={() => { setShowCompetitorManager(false); setNewCompetitorName(""); }}>
                    <X className="w-5 h-5" />
                  </Button>
                </div>
              </div>

              <div className="p-8 space-y-6">
                <div className="flex gap-3">
                  <Input
                    value={newCompetitorName}
                    onChange={(e) => setNewCompetitorName(e.target.value)}
                    placeholder="Nom du concurrent..."
                    className="flex-1 h-12 text-base"
                    onKeyDown={(e) => e.key === "Enter" && handleAddCompetitor()}
                  />
                  <Button size="lg" onClick={handleAddCompetitor} disabled={isAddingCompetitor} className="px-6">
                    {isAddingCompetitor ? (
                      <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    ) : (
                      <>
                        <Plus className="w-5 h-5 mr-2" />
                        Ajouter
                      </>
                    )}
                  </Button>
                </div>

                {agencies.length === 0 ? (
                  <div className="text-center py-12 bg-secondary/30 rounded-2xl border border-dashed border-border">
                    <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
                      <Building2 className="w-8 h-8 text-muted-foreground/50" />
                    </div>
                    <p className="text-base font-medium text-muted-foreground">Aucun concurrent</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Ajoutez votre premier concurrent ci-dessus
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {agencies.filter(a => a.name !== "Autre").map((agency) => (
                      <div
                        key={agency.id}
                        className="group flex items-center justify-between p-5 bg-secondary/40 hover:bg-secondary/60 rounded-2xl transition-all border border-transparent hover:border-border"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                            <Building2 className="w-6 h-6 text-primary" />
                          </div>
                          <div>
                            <p className="font-semibold text-foreground text-base">{agency.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {articles.filter(a => a.competitor_id === agency.id).length} article(s)
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-10 w-10 rounded-full text-destructive hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-all"
                          onClick={() => handleDeleteCompetitor(agency.id, agency.name)}
                        >
                          <Trash2 className="w-5 h-5" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {showAddClientModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-card rounded-3xl w-full max-w-xl border border-border shadow-2xl overflow-hidden">
              <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-8 border-b border-border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-primary/15 flex items-center justify-center">
                      <Briefcase className="w-7 h-7 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-foreground">Nouvel article client</h3>
                      <p className="text-sm text-muted-foreground mt-0.5">Ajoutez une retombée presse client</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="rounded-full h-10 w-10" onClick={() => { setShowAddClientModal(false); setNewArticleLink(""); setSelectedClientId(""); }}>
                    <X className="w-5 h-5" />
                  </Button>
                </div>
              </div>
              <div className="p-8 space-y-6">
                <div>
                  <Label className="text-sm font-semibold text-foreground">Lien de l'article</Label>
                  <Input value={newArticleLink} onChange={(e) => setNewArticleLink(e.target.value)} placeholder="https://example.com/article..." className="mt-3 h-12 text-base" />
                  <p className="text-xs text-muted-foreground mt-2">Les métadonnées seront récupérées automatiquement</p>
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <Button variant="outline" size="lg" onClick={() => { setShowAddClientModal(false); setNewArticleLink(""); }}>Annuler</Button>
                  <Button size="lg" onClick={handleAddClientArticle} disabled={isAddingArticle || !newArticleLink.trim()} className="min-w-32">
                    {isAddingArticle ? <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" /> : <><Plus className="w-5 h-5 mr-2" />Ajouter</>}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {showAddVeilleModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-card rounded-3xl w-full max-w-xl border border-border shadow-2xl overflow-hidden">
              <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-8 border-b border-border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-primary/15 flex items-center justify-center">
                      <Eye className="w-7 h-7 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-foreground">Nouveau sujet de veille</h3>
                      <p className="text-sm text-muted-foreground mt-0.5">Ajoutez un sujet à surveiller</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="rounded-full h-10 w-10" onClick={() => { setShowAddVeilleModal(false); setNewArticleLink(""); setNewTopicName(""); }}>
                    <X className="w-5 h-5" />
                  </Button>
                </div>
              </div>
              <div className="p-8 space-y-6">
                <div>
                  <Label className="text-sm font-semibold text-foreground">Sujet de veille *</Label>
                  <Input value={newTopicName} onChange={(e) => setNewTopicName(e.target.value)} placeholder="Ex: IA générative, Green Tech, Blockchain..." className="mt-3 h-12 text-base" />
                  <p className="text-xs text-muted-foreground mt-2">Le sujet sur lequel vous souhaitez configurer une veille marché</p>
                </div>
                <div>
                  <Label className="text-sm font-semibold text-foreground">Lien de référence (optionnel)</Label>
                  <Input value={newArticleLink} onChange={(e) => setNewArticleLink(e.target.value)} placeholder="https://example.com/article..." className="mt-3 h-12 text-base" />
                  <p className="text-xs text-muted-foreground mt-2">Un lien vers un article de référence sur ce sujet</p>
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <Button variant="outline" size="lg" onClick={() => { setShowAddVeilleModal(false); setNewArticleLink(""); setNewTopicName(""); }}>Annuler</Button>
                  <Button size="lg" onClick={handleAddVeilleArticle} disabled={isAddingArticle || !newTopicName.trim()} className="min-w-32">
                    {isAddingArticle ? <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" /> : <><Plus className="w-5 h-5 mr-2" />Ajouter</>}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {showClientManager && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-card rounded-3xl w-full max-w-2xl border border-border shadow-2xl overflow-hidden">
              <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-8 border-b border-border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-primary/15 flex items-center justify-center">
                      <Briefcase className="w-7 h-7 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-foreground">Gérer les clients</h3>
                      <p className="text-sm text-muted-foreground mt-0.5">Ajoutez ou supprimez des clients</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="rounded-full h-10 w-10" onClick={() => { setShowClientManager(false); setNewClientName(""); }}>
                    <X className="w-5 h-5" />
                  </Button>
                </div>
              </div>
              <div className="p-8 space-y-6">
                <div className="flex gap-3">
                  <Input value={newClientName} onChange={(e) => setNewClientName(e.target.value)} placeholder="Nom du client..." className="flex-1 h-12 text-base" onKeyDown={(e) => e.key === "Enter" && handleAddClient()} />
                  <Button size="lg" onClick={handleAddClient} disabled={isAddingClient} className="px-6">
                    {isAddingClient ? <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" /> : <><Plus className="w-5 h-5 mr-2" />Ajouter</>}
                  </Button>
                </div>
                {clients.length === 0 ? (
                  <div className="text-center py-12 bg-secondary/30 rounded-2xl border border-dashed border-border">
                    <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
                      <Briefcase className="w-8 h-8 text-muted-foreground/50" />
                    </div>
                    <p className="text-base font-medium text-muted-foreground">Aucun client</p>
                    <p className="text-sm text-muted-foreground mt-1">Ajoutez votre premier client ci-dessus</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {clients.filter(c => c.name !== "Autre").map((client) => (
                      <div key={client.id} className="group flex items-center justify-between p-5 bg-secondary/40 hover:bg-secondary/60 rounded-2xl transition-all border border-transparent hover:border-border">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                            <Briefcase className="w-6 h-6 text-primary" />
                          </div>
                          <p className="font-semibold text-foreground text-base">{client.name}</p>
                        </div>
                        <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full text-destructive hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-all" onClick={() => handleDeleteClient(client.id, client.name)}>
                          <Trash2 className="w-5 h-5" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RelationsPresse;
