import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Trash2, Building2, Globe, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";

const Profile = () => {
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [agencies, setAgencies] = useState<string[]>([]);
  const [newAgency, setNewAgency] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const checkAuthAndFetch = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("competitor_agencies")
        .eq("user_id", session.user.id)
        .single();

      if (profile?.competitor_agencies) {
        setAgencies(profile.competitor_agencies);
      }
      setIsLoading(false);
    };

    checkAuthAndFetch();
  }, [navigate]);

  const handleAddAgency = async () => {
    const trimmedAgency = newAgency.trim();
    if (!trimmedAgency) return;

    // Security: Validate agency name length
    if (trimmedAgency.length > 255) {
      toast.error("Le nom de l'agence est trop long (max 255 caractères)");
      return;
    }

    // Security: Limit total number of agencies
    if (agencies.length >= 50) {
      toast.error("Vous ne pouvez pas ajouter plus de 50 agences");
      return;
    }

    if (agencies.includes(trimmedAgency)) {
      toast.error("Cette agence est déjà dans votre liste");
      return;
    }

    const updatedAgencies = [...agencies, trimmedAgency];
    await saveAgencies(updatedAgencies);
    setNewAgency("");
  };

  const handleRemoveAgency = async (agencyToRemove: string) => {
    const updatedAgencies = agencies.filter(a => a !== agencyToRemove);
    await saveAgencies(updatedAgencies);
  };

  const saveAgencies = async (updatedAgencies: string[]) => {
    setIsSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from("profiles")
      .update({ competitor_agencies: updatedAgencies })
      .eq("user_id", user.id);

    if (error) {
      toast.error("Erreur lors de la sauvegarde");
    } else {
      setAgencies(updatedAgencies);
    }
    setIsSaving(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleAddAgency();
    }
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
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-foreground">Mon profil</h1>
          <p className="text-muted-foreground mt-1">Gérez vos préférences et paramètres</p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-pulse text-muted-foreground">Chargement...</div>
          </div>
        ) : (
          <div className="max-w-4xl">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-card rounded-2xl p-5 border border-border/30">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-primary" />
                  </div>
                  <span className="text-sm text-muted-foreground">Agences suivies</span>
                </div>
                <p className="text-3xl font-bold text-foreground">{agencies.length}</p>
              </div>
              
              <div className="bg-card rounded-2xl p-5 border border-border/30">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center">
                    <Users className="w-5 h-5 text-success" />
                  </div>
                  <span className="text-sm text-muted-foreground">Journalistes trouvés</span>
                </div>
                <p className="text-3xl font-bold text-foreground">—</p>
              </div>
              
              <div className="bg-card rounded-2xl p-5 border border-border/30">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-warning/10 flex items-center justify-center">
                    <Globe className="w-5 h-5 text-warning" />
                  </div>
                  <span className="text-sm text-muted-foreground">Médias identifiés</span>
                </div>
                <p className="text-3xl font-bold text-foreground">—</p>
              </div>
            </div>

            {/* Main Section */}
            <div className="bg-card rounded-2xl border border-border/30 overflow-hidden">
              {/* Section Header */}
              <div className="px-6 py-5 border-b border-border/30">
                <h2 className="text-lg font-semibold text-foreground">Veille Concurrentielle</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Ajoutez les agences concurrentes que vous souhaitez surveiller
                </p>
              </div>

              {/* Add Agency Input */}
              <div className="p-6 border-b border-border/30 bg-secondary/20">
                <div className="flex gap-3">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      placeholder="Nom de l'agence (ex: BETC, Publicis, DDB...)"
                      value={newAgency}
                      onChange={(e) => setNewAgency(e.target.value)}
                      onKeyPress={handleKeyPress}
                      disabled={isSaving}
                      maxLength={255}
                      className="w-full h-12 px-4 rounded-xl border border-border/50 bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all"
                    />
                  </div>
                  <button
                    onClick={handleAddAgency}
                    disabled={!newAgency.trim() || isSaving}
                    className="h-12 px-6 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Ajouter</span>
                  </button>
                </div>
              </div>

              {/* Agencies List */}
              <div className="p-6">
                {agencies.length === 0 ? (
                  <div className="py-16 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-secondary/50 flex items-center justify-center">
                      <Building2 className="w-8 h-8 text-muted-foreground/40" />
                    </div>
                    <p className="text-muted-foreground font-medium">Aucune agence ajoutée</p>
                    <p className="text-sm text-muted-foreground/60 mt-1">
                      Commencez par ajouter une agence concurrente
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {agencies.map((agency, index) => (
                      <div
                        key={index}
                        className="group flex items-center justify-between p-4 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-all"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                            <span className="text-sm font-semibold text-primary">
                              {agency.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <span className="font-medium text-foreground">{agency}</span>
                        </div>
                        <button
                          onClick={() => handleRemoveAgency(agency)}
                          disabled={isSaving}
                          className="p-2.5 rounded-lg text-muted-foreground hover:text-danger hover:bg-danger/10 opacity-0 group-hover:opacity-100 transition-all disabled:opacity-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Profile;
