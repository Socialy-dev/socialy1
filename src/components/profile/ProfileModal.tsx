import { useState, useEffect } from "react";
import { X, Globe, Linkedin, Mail, Plus, Trash2, Building2, Users, Newspaper } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Agency {
  name: string;
  website: string;
  linkedin: string;
  email: string;
  specialty: string;
}

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const tabs = [
  { id: "relations-presse", label: "Relations Presse", icon: Newspaper },
  { id: "ressources-memoire", label: "Ressources Mémoire", icon: Building2 },
  { id: "donnees-clients", label: "Données Clients", icon: Users },
];

export const ProfileModal = ({ isOpen, onClose }: ProfileModalProps) => {
  const [activeTab, setActiveTab] = useState("relations-presse");
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newAgency, setNewAgency] = useState<Agency>({
    name: "",
    website: "",
    linkedin: "",
    email: "",
    specialty: "",
  });

  useEffect(() => {
    if (isOpen) {
      fetchAgencies();
    }
  }, [isOpen]);

  const fetchAgencies = async () => {
    setIsLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("competitor_agencies")
        .eq("user_id", user.id)
        .single();

      if (profile?.competitor_agencies) {
        // Parse the stored agencies (stored as JSON strings in the array)
        const parsedAgencies = profile.competitor_agencies
          .map((item: string) => {
            try {
              return JSON.parse(item);
            } catch {
              // Legacy format: just agency name as string
              return { name: item, website: "", linkedin: "", email: "", specialty: "" };
            }
          });
        setAgencies(parsedAgencies);
      }
    }
    setIsLoading(false);
  };

  const saveAgencies = async (updatedAgencies: Agency[]) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const agencyStrings = updatedAgencies.map(agency => JSON.stringify(agency));
      const { error } = await supabase
        .from("profiles")
        .update({ competitor_agencies: agencyStrings })
        .eq("user_id", user.id);

      if (error) {
        toast.error("Erreur lors de la sauvegarde");
        return false;
      }
      return true;
    }
    return false;
  };

  const handleAddAgency = async () => {
    if (!newAgency.name.trim()) {
      toast.error("Le nom de l'agence est requis");
      return;
    }

    const updatedAgencies = [...agencies, newAgency];
    const success = await saveAgencies(updatedAgencies);
    
    if (success) {
      setAgencies(updatedAgencies);
      setNewAgency({ name: "", website: "", linkedin: "", email: "", specialty: "" });
      setShowAddForm(false);
      toast.success("Agence ajoutée");
    }
  };

  const handleDeleteAgency = async (index: number) => {
    const updatedAgencies = agencies.filter((_, i) => i !== index);
    const success = await saveAgencies(updatedAgencies);
    
    if (success) {
      setAgencies(updatedAgencies);
      toast.success("Agence supprimée");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-8">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-foreground/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-6xl h-[90vh] bg-card rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-border">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Mon Profil</h2>
            <p className="text-sm text-muted-foreground mt-1">Gérez vos informations et préférences</p>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-secondary hover:bg-muted flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5 text-foreground" />
          </button>
        </div>

        {/* Tabs */}
        <div className="px-8 pt-4 border-b border-border">
          <div className="flex gap-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-5 py-3 rounded-t-xl text-sm font-medium transition-all ${
                    activeTab === tab.id
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8">
          {activeTab === "relations-presse" && (
            <div className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-secondary/50 rounded-xl p-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Building2 className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-foreground">{agencies.length}</p>
                      <p className="text-xs text-muted-foreground">Agences suivies</p>
                    </div>
                  </div>
                </div>
                <div className="bg-secondary/50 rounded-xl p-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                      <Users className="w-5 h-5 text-success" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-foreground">--</p>
                      <p className="text-xs text-muted-foreground">Journalistes</p>
                    </div>
                  </div>
                </div>
                <div className="bg-secondary/50 rounded-xl p-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
                      <Newspaper className="w-5 h-5 text-warning" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-foreground">--</p>
                      <p className="text-xs text-muted-foreground">Médias identifiés</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Add Agency Form */}
              {showAddForm ? (
                <div className="bg-secondary/30 rounded-xl p-6 border border-border">
                  <h3 className="text-lg font-semibold text-foreground mb-4">Nouvelle agence concurrente</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Nom de l'agence <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        value={newAgency.name}
                        onChange={(e) => setNewAgency({ ...newAgency, name: e.target.value })}
                        placeholder="Ex: Agence XYZ"
                        className="w-full h-11 px-4 rounded-lg bg-card border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Site web</label>
                      <input
                        type="url"
                        value={newAgency.website}
                        onChange={(e) => setNewAgency({ ...newAgency, website: e.target.value })}
                        placeholder="https://..."
                        className="w-full h-11 px-4 rounded-lg bg-card border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">LinkedIn</label>
                      <input
                        type="url"
                        value={newAgency.linkedin}
                        onChange={(e) => setNewAgency({ ...newAgency, linkedin: e.target.value })}
                        placeholder="https://linkedin.com/company/..."
                        className="w-full h-11 px-4 rounded-lg bg-card border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Email de contact</label>
                      <input
                        type="email"
                        value={newAgency.email}
                        onChange={(e) => setNewAgency({ ...newAgency, email: e.target.value })}
                        placeholder="contact@agence.com"
                        className="w-full h-11 px-4 rounded-lg bg-card border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-foreground mb-2">Spécialité</label>
                      <input
                        type="text"
                        value={newAgency.specialty}
                        onChange={(e) => setNewAgency({ ...newAgency, specialty: e.target.value })}
                        placeholder="Ex: Tech, Luxe, B2B..."
                        className="w-full h-11 px-4 rounded-lg bg-card border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-3 mt-6">
                    <button
                      onClick={() => setShowAddForm(false)}
                      className="px-5 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-secondary transition-colors"
                    >
                      Annuler
                    </button>
                    <button
                      onClick={handleAddAgency}
                      className="px-5 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
                    >
                      Ajouter l'agence
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowAddForm(true)}
                  className="w-full py-4 rounded-xl border-2 border-dashed border-border hover:border-primary/50 flex items-center justify-center gap-2 text-muted-foreground hover:text-primary transition-colors"
                >
                  <Plus className="w-5 h-5" />
                  <span className="text-sm font-medium">Ajouter une agence concurrente</span>
                </button>
              )}

              {/* Agencies List */}
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              ) : agencies.length > 0 ? (
                <div className="space-y-3">
                  {agencies.map((agency, index) => (
                    <div
                      key={index}
                      className="bg-card border border-border rounded-xl p-5 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="text-lg font-semibold text-foreground">{agency.name}</h4>
                          {agency.specialty && (
                            <span className="inline-block mt-1 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                              {agency.specialty}
                            </span>
                          )}
                          <div className="flex flex-wrap gap-4 mt-3">
                            {agency.website && (
                              <a
                                href={agency.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors"
                              >
                                <Globe className="w-4 h-4" />
                                Site web
                              </a>
                            )}
                            {agency.linkedin && (
                              <a
                                href={agency.linkedin}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors"
                              >
                                <Linkedin className="w-4 h-4" />
                                LinkedIn
                              </a>
                            )}
                            {agency.email && (
                              <a
                                href={`mailto:${agency.email}`}
                                className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors"
                              >
                                <Mail className="w-4 h-4" />
                                {agency.email}
                              </a>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => handleDeleteAgency(index)}
                          className="p-2 rounded-lg hover:bg-danger/10 text-muted-foreground hover:text-danger transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Building2 className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
                  <p className="text-muted-foreground">Aucune agence concurrente ajoutée</p>
                  <p className="text-sm text-muted-foreground/70 mt-1">
                    Ajoutez vos concurrents pour suivre leur activité
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === "ressources-memoire" && (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mb-4">
                <Building2 className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">Ressources Mémoire</h3>
              <p className="text-sm text-muted-foreground mt-2 text-center max-w-md">
                Stockez et gérez vos ressources, documents et références pour vos projets RP.
              </p>
              <span className="mt-4 px-3 py-1 rounded-full bg-warning/10 text-warning text-xs font-medium">
                Bientôt disponible
              </span>
            </div>
          )}

          {activeTab === "donnees-clients" && (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mb-4">
                <Users className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">Données Clients</h3>
              <p className="text-sm text-muted-foreground mt-2 text-center max-w-md">
                Centralisez les informations de vos clients et leurs préférences.
              </p>
              <span className="mt-4 px-3 py-1 rounded-full bg-warning/10 text-warning text-xs font-medium">
                Bientôt disponible
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
