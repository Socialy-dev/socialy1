import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { 
  ArrowLeft, 
  Fingerprint, 
  Building2, 
  BookOpen, 
  Phone, 
  Link2,
  Save,
  Upload,
  Plus,
  Trash2,
  Globe,
  Mail,
  MapPin,
  Linkedin,
  Twitter,
  Instagram,
  Facebook,
  Loader2,
  CheckCircle2,
  XCircle
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { useGmailConnections } from "@/hooks/useGmailConnections";
import { useMetaConnections } from "@/hooks/useMetaConnections";
import { MetaAccountSelectionModal } from "@/components/integrations/MetaAccountSelectionModal";

type TabType = "identity" | "company" | "memory" | "contact" | "integrations";

interface TabItem {
  id: TabType;
  label: string;
  icon: React.ElementType;
}

const tabs: TabItem[] = [
  { id: "identity", label: "Identité de marque", icon: Fingerprint },
  { id: "company", label: "Informations entreprise", icon: Building2 },
  { id: "memory", label: "Ressources mémoire", icon: BookOpen },
  { id: "contact", label: "Informations contact", icon: Phone },
  { id: "integrations", label: "Intégrations", icon: Link2 },
];

interface PendingMetaConnection {
  connectionId: string;
  allAccounts: Array<{ id: string; name: string; business_name: string }>;
}

const Profile = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, currentOrganization } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>("identity");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [pendingMetaConnection, setPendingMetaConnection] = useState<PendingMetaConnection | null>(null);
  const [showMetaSelectionModal, setShowMetaSelectionModal] = useState(false);
  
  const {
    connections: gmailConnections,
    isLoading: isLoadingGmail,
    connectGmail,
    isConnecting: isConnectingGmail,
    disconnectGmail,
    isDisconnecting: isDisconnectingGmail,
  } = useGmailConnections();

  const {
    connections: metaConnections,
    isLoading: isLoadingMeta,
    connectMeta,
    isConnecting: isConnectingMeta,
    disconnectMeta,
    isDisconnecting: isDisconnectingMeta,
    refetch: refetchMetaConnections,
  } = useMetaConnections();

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab && tabs.some(t => t.id === tab)) {
      setActiveTab(tab as TabType);
    }
    
    const success = searchParams.get("success");
    const error = searchParams.get("error");
    const accountsCount = searchParams.get("accounts");
    const connectionId = searchParams.get("connection_id");
    
    if (success === "gmail_connected") {
      toast.success("Compte Gmail connecté avec succès !");
      setSearchParams({});
    }
    
    if (success === "meta_pending" && connectionId) {
      const fetchPendingConnection = async () => {
        const { data, error: fetchError } = await supabase
          .from("meta_connections")
          .select("id, ad_account_details")
          .eq("id", connectionId)
          .single();
        
        if (fetchError || !data) {
          toast.error("Erreur lors de la récupération des comptes");
          setSearchParams({});
          return;
        }
        
        const allAccounts = (data.ad_account_details as Array<{ id: string; name: string; business_name: string }>) || [];
        setPendingMetaConnection({
          connectionId: data.id,
          allAccounts,
        });
        setShowMetaSelectionModal(true);
        setSearchParams({ tab: "integrations" });
      };
      
      fetchPendingConnection();
    }
    
    if (success === "meta_connected") {
      toast.success(`Meta Ads connecté avec succès ! ${accountsCount || ""} compte(s) publicitaire(s) trouvé(s)`);
      setSearchParams({});
    }
    
    if (error) {
      toast.error(decodeURIComponent(error));
      setSearchParams({});
    }
  }, [searchParams, setSearchParams]);
  
  const [profileData, setProfileData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    brandName: "",
    brandDescription: "",
    brandColors: [] as string[],
    brandFont: "",
    companyName: "",
    companyDescription: "",
    companySector: "",
    companySize: "",
    companyWebsite: "",
    contactEmail: "",
    contactPhone: "",
    contactAddress: "",
    linkedinUrl: "",
    twitterUrl: "",
    instagramUrl: "",
    facebookUrl: "",
  });

  const [linkedinPosts, setLinkedinPosts] = useState<Array<{ id: string; content: string; created_at: string }>>([]);
  const [newPost, setNewPost] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      if (!user) {
        navigate("/auth");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      const userEmail = user.email || "";

      if (profile) {
        setProfileData({
          firstName: profile.first_name || "",
          lastName: profile.last_name || "",
          email: userEmail,
          contactEmail: profile.email || userEmail,
          brandName: profile.brand_name || "",
          brandDescription: profile.brand_description || "",
          brandColors: [],
          brandFont: profile.brand_font || "",
          companyName: profile.company_name || "",
          companyDescription: profile.company_description || "",
          companySector: profile.company_sector || "",
          companySize: profile.company_size || "",
          companyWebsite: profile.company_website || "",
          contactPhone: profile.phone || "",
          contactAddress: profile.address || "",
          linkedinUrl: profile.linkedin_url || "",
          twitterUrl: profile.twitter_url || "",
          instagramUrl: profile.instagram_url || "",
          facebookUrl: profile.facebook_url || "",
        });
      } else {
        setProfileData(prev => ({
          ...prev,
          email: userEmail,
          contactEmail: userEmail,
        }));
      }

      const { data: posts } = await supabase
        .from("user_linkedin_posts")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (posts) {
        setLinkedinPosts(posts);
      }

      setIsLoading(false);
    };

    fetchData();
  }, [user, navigate]);

  const handleSave = async () => {
    if (!user) return;
    setIsSaving(true);

    const { error } = await supabase
      .from("profiles")
      .update({
        first_name: profileData.firstName,
        last_name: profileData.lastName,
        email: profileData.contactEmail,
        brand_name: profileData.brandName,
        brand_description: profileData.brandDescription,
        brand_font: profileData.brandFont,
        company_name: profileData.companyName,
        company_description: profileData.companyDescription,
        company_sector: profileData.companySector,
        company_size: profileData.companySize,
        company_website: profileData.companyWebsite,
        phone: profileData.contactPhone,
        address: profileData.contactAddress,
        linkedin_url: profileData.linkedinUrl,
        twitter_url: profileData.twitterUrl,
        instagram_url: profileData.instagramUrl,
        facebook_url: profileData.facebookUrl,
      })
      .eq("user_id", user.id);

    if (error) {
      toast.error("Erreur lors de la sauvegarde");
    } else {
      toast.success("Profil sauvegardé avec succès");
    }
    setIsSaving(false);
  };

  const handleAddPost = async () => {
    if (!newPost.trim() || !user) return;

    const { data, error } = await supabase
      .from("user_linkedin_posts")
      .insert({
        user_id: user.id,
        content: newPost.trim(),
      })
      .select()
      .single();

    if (error) {
      toast.error("Erreur lors de l'ajout du post");
    } else if (data) {
      setLinkedinPosts([data, ...linkedinPosts]);
      setNewPost("");
      toast.success("Post ajouté à votre mémoire");
    }
  };

  const handleDeletePost = async (postId: string) => {
    const { error } = await supabase
      .from("user_linkedin_posts")
      .delete()
      .eq("id", postId);

    if (error) {
      toast.error("Erreur lors de la suppression");
    } else {
      setLinkedinPosts(linkedinPosts.filter(p => p.id !== postId));
      toast.success("Post supprimé");
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "identity":
        return (
          <div className="space-y-8">
            <div className="bg-card rounded-3xl border border-border/40 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-border/30 bg-gradient-to-r from-primary/5 to-transparent">
                <h3 className="text-lg font-semibold text-foreground">Logo & Visuels</h3>
                <p className="text-sm text-muted-foreground mt-1">Uploadez votre logo et vos visuels de marque</p>
              </div>
              <div className="p-6">
                <div className="flex items-center gap-6">
                  <div className="w-32 h-32 rounded-2xl bg-secondary/50 border-2 border-dashed border-border/50 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-secondary/70 hover:border-primary/30 transition-all group">
                    <Upload className="w-8 h-8 text-muted-foreground/50 group-hover:text-primary transition-colors" />
                    <span className="text-xs text-muted-foreground">Logo</span>
                  </div>
                  <div className="flex-1 space-y-4">
                    <div>
                      <Label className="text-sm font-medium">Nom de la marque</Label>
                      <Input
                        value={profileData.brandName}
                        onChange={(e) => setProfileData({ ...profileData, brandName: e.target.value })}
                        placeholder="Ex: Socialy"
                        className="mt-2 h-12 rounded-xl border-border/50 bg-background"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-card rounded-3xl border border-border/40 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-border/30 bg-gradient-to-r from-primary/5 to-transparent">
                <h3 className="text-lg font-semibold text-foreground">Couleurs de la marque</h3>
                <p className="text-sm text-muted-foreground mt-1">Définissez votre palette de couleurs</p>
              </div>
              <div className="p-6">
                <div className="flex flex-wrap gap-4">
                  {["#E65F2B", "#1A932E", "#060606", "#EBDFD7"].map((color, index) => (
                    <div key={index} className="flex flex-col items-center gap-2">
                      <div 
                        className="w-16 h-16 rounded-2xl shadow-lg border-4 border-white cursor-pointer hover:scale-105 transition-transform"
                        style={{ backgroundColor: color }}
                      />
                      <span className="text-xs text-muted-foreground font-mono">{color}</span>
                    </div>
                  ))}
                  <button className="w-16 h-16 rounded-2xl border-2 border-dashed border-border/50 flex items-center justify-center hover:border-primary/50 hover:bg-secondary/30 transition-all">
                    <Plus className="w-6 h-6 text-muted-foreground" />
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-card rounded-3xl border border-border/40 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-border/30 bg-gradient-to-r from-primary/5 to-transparent">
                <h3 className="text-lg font-semibold text-foreground">Description de la marque</h3>
                <p className="text-sm text-muted-foreground mt-1">Décrivez votre identité et vos valeurs</p>
              </div>
              <div className="p-6">
                <Textarea
                  value={profileData.brandDescription}
                  onChange={(e) => setProfileData({ ...profileData, brandDescription: e.target.value })}
                  placeholder="Décrivez votre marque, ses valeurs, sa mission..."
                  className="min-h-[120px] rounded-xl border-border/50 bg-background resize-none"
                />
              </div>
            </div>
          </div>
        );

      case "company":
        return (
          <div className="space-y-8">
            <div className="bg-card rounded-3xl border border-border/40 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-border/30 bg-gradient-to-r from-accent-blue/10 to-transparent">
                <h3 className="text-lg font-semibold text-foreground">Informations générales</h3>
                <p className="text-sm text-muted-foreground mt-1">Les informations de base de votre entreprise</p>
              </div>
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label className="text-sm font-medium">Nom de l'entreprise</Label>
                    <Input
                      value={profileData.companyName}
                      onChange={(e) => setProfileData({ ...profileData, companyName: e.target.value })}
                      placeholder="Ex: Socialy Agency"
                      className="mt-2 h-12 rounded-xl border-border/50 bg-background"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Secteur d'activité</Label>
                    <Input
                      value={profileData.companySector}
                      onChange={(e) => setProfileData({ ...profileData, companySector: e.target.value })}
                      placeholder="Ex: Communication & Marketing"
                      className="mt-2 h-12 rounded-xl border-border/50 bg-background"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label className="text-sm font-medium">Taille de l'entreprise</Label>
                    <Input
                      value={profileData.companySize}
                      onChange={(e) => setProfileData({ ...profileData, companySize: e.target.value })}
                      placeholder="Ex: 10-50 employés"
                      className="mt-2 h-12 rounded-xl border-border/50 bg-background"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Site web</Label>
                    <div className="relative mt-2">
                      <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        value={profileData.companyWebsite}
                        onChange={(e) => setProfileData({ ...profileData, companyWebsite: e.target.value })}
                        placeholder="https://socialy.fr"
                        className="h-12 pl-11 rounded-xl border-border/50 bg-background"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-card rounded-3xl border border-border/40 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-border/30 bg-gradient-to-r from-accent-blue/10 to-transparent">
                <h3 className="text-lg font-semibold text-foreground">Description de l'entreprise</h3>
                <p className="text-sm text-muted-foreground mt-1">Présentez votre activité en quelques lignes</p>
              </div>
              <div className="p-6">
                <Textarea
                  value={profileData.companyDescription}
                  onChange={(e) => setProfileData({ ...profileData, companyDescription: e.target.value })}
                  placeholder="Décrivez votre entreprise, ses services, son histoire..."
                  className="min-h-[120px] rounded-xl border-border/50 bg-background resize-none"
                />
              </div>
            </div>
          </div>
        );

      case "memory":
        return (
          <div className="space-y-8">
            <div className="bg-card rounded-3xl border border-border/40 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-border/30 bg-gradient-to-r from-success/10 to-transparent">
                <h3 className="text-lg font-semibold text-foreground">Posts LinkedIn</h3>
                <p className="text-sm text-muted-foreground mt-1">Ajoutez vos posts pour que l'IA apprenne votre style d'écriture</p>
              </div>
              <div className="p-6 border-b border-border/30 bg-secondary/20">
                <div className="space-y-4">
                  <Textarea
                    value={newPost}
                    onChange={(e) => setNewPost(e.target.value)}
                    placeholder="Collez ici un de vos posts LinkedIn pour enrichir votre mémoire..."
                    className="min-h-[100px] rounded-xl border-border/50 bg-background resize-none"
                  />
                  <Button
                    onClick={handleAddPost}
                    disabled={!newPost.trim()}
                    className="h-11 px-6 rounded-xl bg-primary hover:bg-primary/90"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Ajouter à la mémoire
                  </Button>
                </div>
              </div>
              <div className="p-6">
                {linkedinPosts.length === 0 ? (
                  <div className="py-12 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-secondary/50 flex items-center justify-center">
                      <BookOpen className="w-8 h-8 text-muted-foreground/40" />
                    </div>
                    <p className="text-muted-foreground font-medium">Aucun post enregistré</p>
                    <p className="text-sm text-muted-foreground/60 mt-1">
                      Ajoutez vos meilleurs posts LinkedIn
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {linkedinPosts.map((post) => (
                      <div
                        key={post.id}
                        className="group p-4 rounded-2xl bg-secondary/30 hover:bg-secondary/50 transition-all border border-transparent hover:border-border/30"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <p className="text-sm text-foreground/80 line-clamp-3">{post.content}</p>
                          <button
                            onClick={() => handleDeletePost(post.id)}
                            className="p-2 rounded-xl text-muted-foreground hover:text-danger hover:bg-danger/10 opacity-0 group-hover:opacity-100 transition-all shrink-0"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                          {new Date(post.created_at).toLocaleDateString("fr-FR", {
                            day: "numeric",
                            month: "short",
                            year: "numeric"
                          })}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case "contact":
        return (
          <div className="space-y-8">
            <div className="bg-card rounded-3xl border border-border/40 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-border/30 bg-gradient-to-r from-warning/10 to-transparent">
                <h3 className="text-lg font-semibold text-foreground">Coordonnées</h3>
                <p className="text-sm text-muted-foreground mt-1">Vos informations de contact</p>
              </div>
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label className="text-sm font-medium">Prénom</Label>
                    <Input
                      value={profileData.firstName}
                      onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                      placeholder="Votre prénom"
                      className="mt-2 h-12 rounded-xl border-border/50 bg-background"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Nom</Label>
                    <Input
                      value={profileData.lastName}
                      onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                      placeholder="Votre nom"
                      className="mt-2 h-12 rounded-xl border-border/50 bg-background"
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Email</Label>
                  <div className="relative mt-2">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      value={profileData.contactEmail}
                      onChange={(e) => setProfileData({ ...profileData, contactEmail: e.target.value })}
                      placeholder="contact@socialy.fr"
                      className="h-12 pl-11 rounded-xl border-border/50 bg-background"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label className="text-sm font-medium">Téléphone</Label>
                    <div className="relative mt-2">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        value={profileData.contactPhone}
                        onChange={(e) => setProfileData({ ...profileData, contactPhone: e.target.value })}
                        placeholder="+33 1 23 45 67 89"
                        className="h-12 pl-11 rounded-xl border-border/50 bg-background"
                      />
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Adresse</Label>
                    <div className="relative mt-2">
                      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        value={profileData.contactAddress}
                        onChange={(e) => setProfileData({ ...profileData, contactAddress: e.target.value })}
                        placeholder="Paris, France"
                        className="h-12 pl-11 rounded-xl border-border/50 bg-background"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-card rounded-3xl border border-border/40 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-border/30 bg-gradient-to-r from-warning/10 to-transparent">
                <h3 className="text-lg font-semibold text-foreground">Réseaux sociaux</h3>
                <p className="text-sm text-muted-foreground mt-1">Vos profils sur les réseaux</p>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <div className="relative">
                    <Linkedin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#0A66C2]" />
                    <Input
                      value={profileData.linkedinUrl}
                      onChange={(e) => setProfileData({ ...profileData, linkedinUrl: e.target.value })}
                      placeholder="linkedin.com/company/socialy"
                      className="h-12 pl-11 rounded-xl border-border/50 bg-background"
                    />
                  </div>
                </div>
                <div>
                  <div className="relative">
                    <Twitter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1DA1F2]" />
                    <Input
                      value={profileData.twitterUrl}
                      onChange={(e) => setProfileData({ ...profileData, twitterUrl: e.target.value })}
                      placeholder="twitter.com/socialy"
                      className="h-12 pl-11 rounded-xl border-border/50 bg-background"
                    />
                  </div>
                </div>
                <div>
                  <div className="relative">
                    <Instagram className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#E4405F]" />
                    <Input
                      value={profileData.instagramUrl}
                      onChange={(e) => setProfileData({ ...profileData, instagramUrl: e.target.value })}
                      placeholder="instagram.com/socialy"
                      className="h-12 pl-11 rounded-xl border-border/50 bg-background"
                    />
                  </div>
                </div>
                <div>
                  <div className="relative">
                    <Facebook className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1877F2]" />
                    <Input
                      value={profileData.facebookUrl}
                      onChange={(e) => setProfileData({ ...profileData, facebookUrl: e.target.value })}
                      placeholder="facebook.com/socialy"
                      className="h-12 pl-11 rounded-xl border-border/50 bg-background"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case "integrations":
        return (
          <div className="space-y-8">
            <div className="bg-card rounded-3xl border border-border/40 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-border/30 bg-gradient-to-r from-accent-purple/10 to-transparent">
                <h3 className="text-lg font-semibold text-foreground">Services connectés</h3>
                <p className="text-sm text-muted-foreground mt-1">Gérez vos intégrations avec des services tiers</p>
              </div>
              <div className="p-6">
                <div className="grid gap-4">
                  <div className="flex items-center justify-between p-4 rounded-2xl bg-secondary/30 hover:bg-secondary/50 transition-all border border-transparent hover:border-border/30">
                    <div className="flex items-center gap-4">
                      <div 
                        className="w-12 h-12 rounded-xl flex items-center justify-center"
                        style={{ backgroundColor: "#EA433515" }}
                      >
                        <Mail className="w-6 h-6" style={{ color: "#EA4335" }} />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">Gmail</p>
                        {gmailConnections.length > 0 ? (
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                            <p className="text-sm text-muted-foreground">
                              {gmailConnections.length} compte{gmailConnections.length > 1 ? "s" : ""} connecté{gmailConnections.length > 1 ? "s" : ""}
                            </p>
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">Non connecté</p>
                        )}
                      </div>
                    </div>
                    <Button
                      onClick={() => connectGmail()}
                      disabled={isConnectingGmail}
                      className="h-10 rounded-xl"
                    >
                      {isConnectingGmail ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        "Connecter"
                      )}
                    </Button>
                  </div>

                  {gmailConnections.map((connection) => (
                    <div
                      key={connection.id}
                      className="flex items-center justify-between p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/20"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                          <Mail className="w-5 h-5 text-emerald-500" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{connection.email}</p>
                          <p className="text-xs text-muted-foreground">
                            Connecté le {new Date(connection.connected_at).toLocaleDateString("fr-FR")}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        onClick={() => disconnectGmail(connection.id)}
                        disabled={isDisconnectingGmail}
                        className="h-10 rounded-xl text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        {isDisconnectingGmail ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          "Déconnecter"
                        )}
                      </Button>
                    </div>
                  ))}

                  <div className="flex items-center justify-between p-4 rounded-2xl bg-secondary/30 hover:bg-secondary/50 transition-all border border-transparent hover:border-border/30">
                    <div className="flex items-center gap-4">
                      <div 
                        className="w-12 h-12 rounded-xl flex items-center justify-center"
                        style={{ backgroundColor: "#1877F215" }}
                      >
                        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="#1877F2">
                          <path d="M12 2C6.477 2 2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.989C18.343 21.129 22 16.99 22 12c0-5.523-4.477-10-10-10z"/>
                        </svg>
                      </div>
                      <div>
                        <p className="font-medium text-foreground">Meta Ads</p>
                        {metaConnections.length > 0 ? (
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                            <p className="text-sm text-muted-foreground">
                              {metaConnections.length} compte{metaConnections.length > 1 ? "s" : ""} connecté{metaConnections.length > 1 ? "s" : ""}
                            </p>
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">Non connecté</p>
                        )}
                      </div>
                    </div>
                    <Button
                      onClick={() => connectMeta()}
                      disabled={isConnectingMeta}
                      className="h-10 rounded-xl"
                    >
                      {isConnectingMeta ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        "Connecter"
                      )}
                    </Button>
                  </div>

                  {metaConnections.map((connection) => (
                    <div
                      key={connection.id}
                      className="flex items-center justify-between p-4 rounded-2xl bg-[#1877F2]/5 border border-[#1877F2]/20"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-[#1877F2]/10 flex items-center justify-center">
                          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#1877F2">
                            <path d="M12 2C6.477 2 2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.989C18.343 21.129 22 16.99 22 12c0-5.523-4.477-10-10-10z"/>
                          </svg>
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{connection.user_name || connection.email}</p>
                          <p className="text-xs text-muted-foreground">
                            {connection.ad_account_ids?.length || 0} compte(s) pub · Connecté le {new Date(connection.connected_at).toLocaleDateString("fr-FR")}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        onClick={() => disconnectMeta(connection.id)}
                        disabled={isDisconnectingMeta}
                        className="h-10 rounded-xl text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        {isDisconnectingMeta ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          "Déconnecter"
                        )}
                      </Button>
                    </div>
                  ))}

                  {[
                    { name: "LinkedIn", icon: Linkedin, connected: false, color: "#0A66C2" },
                    { name: "Google Drive", icon: Globe, connected: false, color: "#4285F4" },
                    { name: "Slack", icon: Link2, connected: false, color: "#4A154B" },
                    { name: "Notion", icon: BookOpen, connected: false, color: "#000000" },
                  ].map((integration, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 rounded-2xl bg-secondary/30 hover:bg-secondary/50 transition-all border border-transparent hover:border-border/30"
                    >
                      <div className="flex items-center gap-4">
                        <div 
                          className="w-12 h-12 rounded-xl flex items-center justify-center"
                          style={{ backgroundColor: `${integration.color}15` }}
                        >
                          <integration.icon className="w-6 h-6" style={{ color: integration.color }} />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{integration.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {integration.connected ? "Connecté" : "Non connecté"}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant={integration.connected ? "outline" : "default"}
                        className="h-10 rounded-xl"
                      >
                        {integration.connected ? "Déconnecter" : "Connecter"}
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-50 bg-card/80 backdrop-blur-xl border-b border-border/30">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate("/dashboard")}
                className="w-10 h-10 rounded-xl bg-secondary/50 hover:bg-secondary flex items-center justify-center transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-foreground" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Mon Profil</h1>
                <p className="text-sm text-muted-foreground">Gérez vos informations et préférences</p>
              </div>
            </div>
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="h-11 px-6 rounded-xl bg-[#4F6BF7] hover:bg-[#4F6BF7]/90 text-white font-medium shadow-lg shadow-[#4F6BF7]/20"
            >
              {isSaving ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Sauvegarde...
                </span>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Sauvegarder
                </>
              )}
            </Button>
          </div>

          <div className="mt-6 flex items-center gap-2 overflow-x-auto scrollbar-hide pb-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "flex items-center gap-2 px-5 py-3 rounded-full font-medium text-sm whitespace-nowrap transition-all",
                    isActive
                      ? "bg-[#4F6BF7] text-white shadow-lg shadow-[#4F6BF7]/20"
                      : "bg-secondary/50 text-foreground/70 hover:bg-secondary hover:text-foreground"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {renderTabContent()}
      </main>

      <MetaAccountSelectionModal
        isOpen={showMetaSelectionModal}
        onClose={() => {
          setShowMetaSelectionModal(false);
          setPendingMetaConnection(null);
        }}
        pendingConnectionId={pendingMetaConnection?.connectionId || null}
        allAccounts={pendingMetaConnection?.allAccounts || []}
        onSuccess={() => {
          refetchMetaConnections();
        }}
      />
    </div>
  );
};

export default Profile;