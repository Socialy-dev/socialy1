import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Trash2, Radar, Building2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const Profile = () => {
  const navigate = useNavigate();
  const [agencies, setAgencies] = useState<string[]>([]);
  const [newAgency, setNewAgency] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("competitor_agencies")
        .eq("user_id", user.id)
        .single();

      if (profile?.competitor_agencies) {
        setAgencies(profile.competitor_agencies);
      }
      setIsLoading(false);
    };

    fetchProfile();
  }, [navigate]);

  const handleAddAgency = async () => {
    const trimmedAgency = newAgency.trim();
    if (!trimmedAgency) return;
    
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
      toast.success("Modifications enregistrées");
    }
    setIsSaving(false);
  };

  const handleLaunchVeille = () => {
    toast.info("La veille automatique sera configurée prochainement");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleAddAgency();
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
      {/* Header */}
      <header className="border-b border-border/40 bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center gap-4">
          <button
            onClick={() => navigate("/dashboard")}
            className="p-2 rounded-xl hover:bg-secondary transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <div>
            <h1 className="text-xl font-semibold text-foreground">Mon profil</h1>
            <p className="text-sm text-muted-foreground">Gérez vos préférences et paramètres</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-8">
        {/* Veille Concurrentielle Section */}
        <section className="bg-card rounded-2xl border border-border/50 overflow-hidden">
          {/* Section Header */}
          <div className="p-6 border-b border-border/40 bg-gradient-to-r from-primary/5 to-transparent">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-primary/10">
                <Radar className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-semibold text-foreground mb-1">
                  Veille Concurrentielle
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Ajoutez les agences concurrentes que vous souhaitez surveiller. 
                  Nous identifierons automatiquement les médias qui publient leurs 
                  communiqués de presse et récupérerons les contacts journalistes pertinents.
                </p>
              </div>
            </div>
          </div>

          {/* Section Content */}
          <div className="p-6 space-y-6">
            {/* Add Agency Input */}
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Nom de l'agence (ex: BETC, Publicis, DDB...)"
                  value={newAgency}
                  onChange={(e) => setNewAgency(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="pl-11 h-12 rounded-xl border-border/60 bg-background focus:border-primary/50 focus:ring-primary/20"
                />
              </div>
              <Button
                onClick={handleAddAgency}
                disabled={!newAgency.trim() || isSaving}
                className="h-12 px-5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Ajouter</span>
              </Button>
            </div>

            {/* Agencies List */}
            <div className="space-y-2">
              {agencies.length === 0 ? (
                <div className="py-12 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-secondary/50 flex items-center justify-center">
                    <Building2 className="w-8 h-8 text-muted-foreground/50" />
                  </div>
                  <p className="text-muted-foreground text-sm">
                    Aucune agence ajoutée pour le moment
                  </p>
                  <p className="text-muted-foreground/60 text-xs mt-1">
                    Commencez par ajouter une agence concurrente ci-dessus
                  </p>
                </div>
              ) : (
                <div className="grid gap-2">
                  {agencies.map((agency, index) => (
                    <div
                      key={index}
                      className="group flex items-center justify-between p-4 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                          <span className="text-sm font-medium text-primary">
                            {agency.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <span className="font-medium text-foreground">{agency}</span>
                      </div>
                      <button
                        onClick={() => handleRemoveAgency(agency)}
                        disabled={isSaving}
                        className="p-2 rounded-lg text-muted-foreground hover:text-danger hover:bg-danger/10 opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Launch Button */}
            <div className="pt-4 border-t border-border/40">
              <Button
                onClick={handleLaunchVeille}
                disabled={agencies.length === 0}
                className="w-full h-12 rounded-xl bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground font-medium gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Radar className="w-5 h-5" />
                Lancer la veille automatique
              </Button>
              {agencies.length === 0 && (
                <p className="text-center text-xs text-muted-foreground mt-2">
                  Ajoutez au moins une agence pour activer la veille
                </p>
              )}
            </div>
          </div>
        </section>

        {/* Future Sections Placeholder */}
        <div className="mt-6 p-6 rounded-2xl border border-dashed border-border/40 bg-card/30">
          <p className="text-center text-sm text-muted-foreground">
            D'autres paramètres seront disponibles prochainement
          </p>
        </div>
      </main>
    </div>
  );
};

export default Profile;
