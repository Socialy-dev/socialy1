import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  ArrowLeft,
  Linkedin,
  Instagram,
  Twitter,
  Globe,
  Youtube,
  Facebook,
  Building2,
  FileText,
  Target,
  Users,
  Briefcase,
  Mail,
  Phone,
  MapPin,
  Save,
  Sparkles,
  TrendingUp,
  MessageSquare,
  Hash,
  Link2,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ClientInfo {
  id: string;
  organization_id: string;
  linkedin_url: string | null;
  instagram_url: string | null;
  twitter_url: string | null;
  youtube_url: string | null;
  facebook_url: string | null;
  website_url: string | null;
  company_name: string | null;
  company_description: string | null;
  industry: string | null;
  target_audience: string | null;
  key_messages: string | null;
  tone_of_voice: string | null;
  hashtags: string | null;
  competitors: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  address: string | null;
}

interface ResourcesPanelProps {
  onBack: () => void;
}

export const ResourcesPanel = ({ onBack }: ResourcesPanelProps) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { currentOrganization } = useAuth();

  const [formData, setFormData] = useState<Partial<ClientInfo>>({
    linkedin_url: "",
    instagram_url: "",
    twitter_url: "",
    youtube_url: "",
    facebook_url: "",
    website_url: "",
    company_name: "",
    company_description: "",
    industry: "",
    target_audience: "",
    key_messages: "",
    tone_of_voice: "",
    hashtags: "",
    competitors: "",
    contact_email: "",
    contact_phone: "",
    address: "",
  });

  useEffect(() => {
    if (currentOrganization?.id) {
      fetchClientInfo();
    }
  }, [currentOrganization?.id]);

  const fetchClientInfo = async () => {
    if (!currentOrganization?.id) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("organization_resources")
        .select("*")
        .eq("organization_id", currentOrganization.id)
        .maybeSingle();

      if (error && error.code !== "PGRST116") throw error;
      
      if (data) {
        setFormData(data);
      }
    } catch (error: any) {
      console.error("Error fetching client info:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!currentOrganization?.id) {
      toast.error("Aucune organisation sélectionnée");
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from("organization_resources")
        .upsert({
          organization_id: currentOrganization.id,
          ...formData,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: "organization_id"
        });

      if (error) throw error;
      toast.success("Informations sauvegardées !");
    } catch (error: any) {
      console.error("Error saving:", error);
      toast.error("Erreur lors de la sauvegarde");
    } finally {
      setSaving(false);
    }
  };

  const updateField = (field: keyof ClientInfo, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-24">
        <div className="w-10 h-10 border-3 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="shrink-0 hover:bg-muted/50"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h2 className="text-2xl font-bold text-foreground">Ressources Client</h2>
            <p className="text-muted-foreground">
              Informations pour la génération de contenu et l'analyse
            </p>
          </div>
        </div>
        <Button 
          onClick={handleSave} 
          disabled={saving}
          className="gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg"
        >
          {saving ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          Sauvegarder
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-blue-500/10 via-purple-500/5 to-pink-500/10 rounded-3xl p-6 border border-white/10 backdrop-blur-sm shadow-xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
              <Link2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground">Réseaux Sociaux</h3>
              <p className="text-sm text-muted-foreground">Liens vers les profils</p>
            </div>
          </div>

          <div className="space-y-4">
            <SocialInput
              icon={<Linkedin className="w-5 h-5" />}
              iconBg="bg-[#0A66C2]"
              placeholder="https://linkedin.com/company/..."
              value={formData.linkedin_url || ""}
              onChange={(v) => updateField("linkedin_url", v)}
              label="LinkedIn"
            />
            <SocialInput
              icon={<Instagram className="w-5 h-5" />}
              iconBg="bg-gradient-to-br from-[#833AB4] via-[#FD1D1D] to-[#F77737]"
              placeholder="https://instagram.com/..."
              value={formData.instagram_url || ""}
              onChange={(v) => updateField("instagram_url", v)}
              label="Instagram"
            />
            <SocialInput
              icon={<Twitter className="w-5 h-5" />}
              iconBg="bg-black"
              placeholder="https://x.com/..."
              value={formData.twitter_url || ""}
              onChange={(v) => updateField("twitter_url", v)}
              label="X (Twitter)"
            />
            <SocialInput
              icon={<Youtube className="w-5 h-5" />}
              iconBg="bg-[#FF0000]"
              placeholder="https://youtube.com/@..."
              value={formData.youtube_url || ""}
              onChange={(v) => updateField("youtube_url", v)}
              label="YouTube"
            />
            <SocialInput
              icon={<Facebook className="w-5 h-5" />}
              iconBg="bg-[#1877F2]"
              placeholder="https://facebook.com/..."
              value={formData.facebook_url || ""}
              onChange={(v) => updateField("facebook_url", v)}
              label="Facebook"
            />
            <SocialInput
              icon={<Globe className="w-5 h-5" />}
              iconBg="bg-gradient-to-br from-emerald-500 to-teal-600"
              placeholder="https://www.votresite.com"
              value={formData.website_url || ""}
              onChange={(v) => updateField("website_url", v)}
              label="Site Web"
            />
          </div>
        </div>

        <div className="bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-red-500/10 rounded-3xl p-6 border border-white/10 backdrop-blur-sm shadow-xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground">Informations Entreprise</h3>
              <p className="text-sm text-muted-foreground">Identité et positionnement</p>
            </div>
          </div>

          <div className="space-y-4">
            <InfoInput
              icon={<Building2 className="w-4 h-4" />}
              label="Nom de l'entreprise"
              placeholder="Nom officiel"
              value={formData.company_name || ""}
              onChange={(v) => updateField("company_name", v)}
            />
            <InfoInput
              icon={<Briefcase className="w-4 h-4" />}
              label="Secteur d'activité"
              placeholder="Ex: Tech, Santé, Finance..."
              value={formData.industry || ""}
              onChange={(v) => updateField("industry", v)}
            />
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
                <FileText className="w-4 h-4 text-muted-foreground" />
                Description
              </label>
              <Textarea
                placeholder="Présentation de l'entreprise, activités principales..."
                value={formData.company_description || ""}
                onChange={(e) => updateField("company_description", e.target.value)}
                className="min-h-[100px] bg-background/50 border-white/10 rounded-xl resize-none"
              />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-500/10 via-green-500/5 to-teal-500/10 rounded-3xl p-6 border border-white/10 backdrop-blur-sm shadow-xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-lg">
              <Target className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground">Stratégie de Contenu</h3>
              <p className="text-sm text-muted-foreground">Cibles et messages clés</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
                <Users className="w-4 h-4 text-muted-foreground" />
                Audience cible
              </label>
              <Textarea
                placeholder="Décrivez votre audience cible (démographie, intérêts, besoins...)"
                value={formData.target_audience || ""}
                onChange={(e) => updateField("target_audience", e.target.value)}
                className="min-h-[80px] bg-background/50 border-white/10 rounded-xl resize-none"
              />
            </div>
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
                <Sparkles className="w-4 h-4 text-muted-foreground" />
                Messages clés
              </label>
              <Textarea
                placeholder="Les messages principaux à faire passer dans votre communication"
                value={formData.key_messages || ""}
                onChange={(e) => updateField("key_messages", e.target.value)}
                className="min-h-[80px] bg-background/50 border-white/10 rounded-xl resize-none"
              />
            </div>
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
                <MessageSquare className="w-4 h-4 text-muted-foreground" />
                Ton de voix
              </label>
              <Input
                placeholder="Ex: Professionnel, Décontracté, Inspirant..."
                value={formData.tone_of_voice || ""}
                onChange={(e) => updateField("tone_of_voice", e.target.value)}
                className="bg-background/50 border-white/10 rounded-xl"
              />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-violet-500/10 via-purple-500/5 to-fuchsia-500/10 rounded-3xl p-6 border border-white/10 backdrop-blur-sm shadow-xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground">Veille & Analyse</h3>
              <p className="text-sm text-muted-foreground">Hashtags et concurrents</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
                <Hash className="w-4 h-4 text-muted-foreground" />
                Hashtags préférés
              </label>
              <Textarea
                placeholder="#innovation #startup #business (un par ligne ou séparés par des espaces)"
                value={formData.hashtags || ""}
                onChange={(e) => updateField("hashtags", e.target.value)}
                className="min-h-[80px] bg-background/50 border-white/10 rounded-xl resize-none font-mono text-sm"
              />
            </div>
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
                <Target className="w-4 h-4 text-muted-foreground" />
                Concurrents à surveiller
              </label>
              <Textarea
                placeholder="Noms ou URLs des concurrents (un par ligne)"
                value={formData.competitors || ""}
                onChange={(e) => updateField("competitors", e.target.value)}
                className="min-h-[80px] bg-background/50 border-white/10 rounded-xl resize-none"
              />
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 bg-gradient-to-br from-slate-500/10 via-gray-500/5 to-zinc-500/10 rounded-3xl p-6 border border-white/10 backdrop-blur-sm shadow-xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-500 to-gray-600 flex items-center justify-center shadow-lg">
              <Mail className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground">Contact</h3>
              <p className="text-sm text-muted-foreground">Coordonnées de l'entreprise</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <InfoInput
              icon={<Mail className="w-4 h-4" />}
              label="Email"
              placeholder="contact@entreprise.com"
              value={formData.contact_email || ""}
              onChange={(v) => updateField("contact_email", v)}
              type="email"
            />
            <InfoInput
              icon={<Phone className="w-4 h-4" />}
              label="Téléphone"
              placeholder="+33 1 23 45 67 89"
              value={formData.contact_phone || ""}
              onChange={(v) => updateField("contact_phone", v)}
            />
            <InfoInput
              icon={<MapPin className="w-4 h-4" />}
              label="Adresse"
              placeholder="Ville, Pays"
              value={formData.address || ""}
              onChange={(v) => updateField("address", v)}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

interface SocialInputProps {
  icon: React.ReactNode;
  iconBg: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  label: string;
}

const SocialInput = ({ icon, iconBg, placeholder, value, onChange, label }: SocialInputProps) => (
  <div className="flex items-center gap-3 group">
    <div className={cn(
      "w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 shadow-md transition-transform group-hover:scale-105",
      iconBg
    )}>
      {icon}
    </div>
    <div className="flex-1">
      <Input
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-background/50 border-white/10 rounded-xl h-10 text-sm placeholder:text-muted-foreground/50"
      />
    </div>
  </div>
);

interface InfoInputProps {
  icon: React.ReactNode;
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}

const InfoInput = ({ icon, label, placeholder, value, onChange, type = "text" }: InfoInputProps) => (
  <div>
    <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
      <span className="text-muted-foreground">{icon}</span>
      {label}
    </label>
    <Input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="bg-background/50 border-white/10 rounded-xl"
    />
  </div>
);
