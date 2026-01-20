import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  X,
  Plus,
  Building2,
  Globe,
  Trash2,
  ExternalLink,
  AlertCircle,
} from "lucide-react";
import { useCompetitors, NewCompetitor } from "@/hooks/useCompetitors";

const LinkedInIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
);

const TikTokIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z" />
  </svg>
);

const InstagramIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
  </svg>
);

const FacebookIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

interface ManageCompetitorsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ManageCompetitorsModal = ({
  open,
  onOpenChange,
}: ManageCompetitorsModalProps) => {
  const { competitors, loading, addCompetitor, deleteCompetitor } = useCompetitors("organic_social_media");
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<NewCompetitor>({
    name: "",
    logo_url: "",
    website: "",
    linkedin: "",
    tiktok_url: "",
    instagram_url: "",
    facebook_url: "",
    category: "organic_social_media",
  });

  const resetForm = () => {
    setFormData({
      name: "",
      logo_url: "",
      website: "",
      linkedin: "",
      tiktok_url: "",
      instagram_url: "",
      facebook_url: "",
      category: "organic_social_media",
    });
    setShowForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    setSaving(true);
    const success = await addCompetitor(formData);
    if (success) {
      resetForm();
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    await deleteCompetitor(id);
  };

  const getPlatformCount = (competitor: typeof competitors[0]) => {
    let count = 0;
    if (competitor.linkedin) count++;
    if (competitor.tiktok_url) count++;
    if (competitor.instagram_url) count++;
    if (competitor.facebook_url) count++;
    return count;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-full h-[100vh] p-0 border-0 rounded-none bg-background/95 backdrop-blur-xl">
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between px-8 py-6 border-b border-border/50 bg-card/50">
            <div>
              <h2 className="text-2xl font-bold text-foreground">
                Gérer les concurrents
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Concurrents pour le suivi <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary ml-1">Social Media Organique</span>
              </p>
            </div>
            <div className="flex items-center gap-3">
              {!showForm && (
                <Button
                  onClick={() => setShowForm(true)}
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Ajouter un concurrent
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onOpenChange(false)}
                className="rounded-full hover:bg-destructive/10 hover:text-destructive"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-8 bg-muted/30">
            {showForm && (
              <div className="mb-8 relative">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent rounded-3xl" />
                <div className="relative p-6 rounded-3xl bg-card border border-border shadow-xl">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-foreground">
                      Nouveau concurrent
                    </h3>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={resetForm}
                      className="rounded-full hover:bg-muted"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="p-4 rounded-2xl bg-muted/50 border border-border/50">
                      <h4 className="text-sm font-medium text-muted-foreground mb-4">Informations générales</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="name" className="text-sm font-medium">
                            Nom de l'entreprise *
                          </Label>
                          <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) =>
                              setFormData({ ...formData, name: e.target.value })
                            }
                            placeholder="Ex: Agence XYZ"
                            className="h-11 rounded-xl bg-background border-border"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="logo_url" className="text-sm font-medium">
                            URL du logo
                          </Label>
                          <Input
                            id="logo_url"
                            value={formData.logo_url}
                            onChange={(e) =>
                              setFormData({ ...formData, logo_url: e.target.value })
                            }
                            placeholder="https://..."
                            className="h-11 rounded-xl bg-background border-border"
                          />
                        </div>
                      </div>

                      <div className="mt-4 space-y-2">
                        <Label htmlFor="website" className="text-sm font-medium flex items-center gap-2">
                          <Globe className="w-4 h-4 text-muted-foreground" />
                          Site web
                        </Label>
                        <Input
                          id="website"
                          value={formData.website}
                          onChange={(e) =>
                            setFormData({ ...formData, website: e.target.value })
                          }
                          placeholder="https://www.example.com"
                          className="h-11 rounded-xl bg-background border-border"
                        />
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-muted/50 border border-border/50">
                      <h4 className="text-sm font-medium text-muted-foreground mb-4">Réseaux sociaux</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label
                            htmlFor="linkedin"
                            className="text-sm font-medium flex items-center gap-2"
                          >
                            <span className="text-[#0A66C2]">
                              <LinkedInIcon />
                            </span>
                            LinkedIn
                          </Label>
                          <Input
                            id="linkedin"
                            value={formData.linkedin}
                            onChange={(e) =>
                              setFormData({ ...formData, linkedin: e.target.value })
                            }
                            placeholder="https://linkedin.com/company/..."
                            className="h-11 rounded-xl bg-background border-border"
                          />
                          <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                            <AlertCircle className="w-3 h-3" />
                            Utilisez l'URL de la page entreprise LinkedIn
                          </p>
                        </div>
                        <div className="space-y-2">
                          <Label
                            htmlFor="instagram"
                            className="text-sm font-medium flex items-center gap-2"
                          >
                            <span className="text-[#E4405F]">
                              <InstagramIcon />
                            </span>
                            Instagram
                          </Label>
                          <Input
                            id="instagram"
                            value={formData.instagram_url}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                instagram_url: e.target.value,
                              })
                            }
                            placeholder="https://instagram.com/..."
                            className="h-11 rounded-xl bg-background border-border"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label
                            htmlFor="tiktok"
                            className="text-sm font-medium flex items-center gap-2"
                          >
                            <span className="text-foreground">
                              <TikTokIcon />
                            </span>
                            TikTok
                          </Label>
                          <Input
                            id="tiktok"
                            value={formData.tiktok_url}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                tiktok_url: e.target.value,
                              })
                            }
                            placeholder="https://tiktok.com/@..."
                            className="h-11 rounded-xl bg-background border-border"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label
                            htmlFor="facebook"
                            className="text-sm font-medium flex items-center gap-2"
                          >
                            <span className="text-[#1877F2]">
                              <FacebookIcon />
                            </span>
                            Facebook
                          </Label>
                          <Input
                            id="facebook"
                            value={formData.facebook_url}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                facebook_url: e.target.value,
                              })
                            }
                            placeholder="https://facebook.com/..."
                            className="h-11 rounded-xl bg-background border-border"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 pt-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={resetForm}
                        className="rounded-xl"
                      >
                        Annuler
                      </Button>
                      <Button
                        type="submit"
                        disabled={saving || !formData.name.trim()}
                        className="rounded-xl bg-primary text-primary-foreground hover:bg-primary/90"
                      >
                        {saving ? "Enregistrement..." : "Enregistrer le concurrent"}
                      </Button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {loading ? (
              <div className="flex items-center justify-center py-16">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : competitors.length === 0 && !showForm ? (
              <div className="text-center py-16">
                <div className="w-20 h-20 rounded-3xl bg-muted/50 flex items-center justify-center mx-auto mb-4">
                  <Building2 className="w-10 h-10 text-muted-foreground/50" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Aucun concurrent
                </h3>
                <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
                  Ajoutez des concurrents pour commencer à surveiller leur activité sur les réseaux sociaux
                </p>
                <Button
                  onClick={() => setShowForm(true)}
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Ajouter votre premier concurrent
                </Button>
              </div>
            ) : (
              <div>
                {competitors.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">
                      {competitors.length} concurrent{competitors.length > 1 ? "s" : ""} configuré{competitors.length > 1 ? "s" : ""}
                    </h3>
                  </div>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {competitors.map((competitor) => (
                    <div
                      key={competitor.id}
                      className={cn(
                        "group relative rounded-3xl overflow-hidden",
                        "bg-card border border-border shadow-sm",
                        "hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5",
                        "transition-all duration-300"
                      )}
                    >
                      <div className="relative h-24 bg-gradient-to-br from-primary/20 via-primary/10 to-transparent">
                        {competitor.logo_url ? (
                          <img
                            src={competitor.logo_url}
                            alt={competitor.name}
                            className="absolute inset-0 w-full h-full object-cover opacity-50"
                          />
                        ) : null}
                        <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent" />
                        <button
                          onClick={() => handleDelete(competitor.id)}
                          className="absolute top-3 right-3 p-2 rounded-xl bg-destructive/10 text-destructive opacity-0 group-hover:opacity-100 hover:bg-destructive/20 transition-all duration-200"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="p-5 -mt-8 relative">
                        <div className="w-14 h-14 rounded-2xl bg-card border border-border flex items-center justify-center mb-4 shadow-lg">
                          {competitor.logo_url ? (
                            <img
                              src={competitor.logo_url}
                              alt={competitor.name}
                              className="w-10 h-10 rounded-xl object-cover"
                            />
                          ) : (
                            <Building2 className="w-6 h-6 text-muted-foreground" />
                          )}
                        </div>

                        <h3 className="text-lg font-bold text-foreground mb-2 line-clamp-1">
                          {competitor.name}
                        </h3>

                        {competitor.website && (
                          <a
                            href={
                              competitor.website.startsWith("http")
                                ? competitor.website
                                : `https://${competitor.website}`
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors mb-4"
                          >
                            <Globe className="w-3 h-3" />
                            <span className="line-clamp-1">
                              {competitor.website.replace(/^https?:\/\//, "")}
                            </span>
                            <ExternalLink className="w-3 h-3 opacity-50" />
                          </a>
                        )}

                        <div className="flex items-center gap-2 flex-wrap">
                          {competitor.linkedin && (
                            <a
                              href={competitor.linkedin}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 rounded-lg bg-[#0A66C2]/10 text-[#0A66C2] hover:bg-[#0A66C2]/20 transition-colors"
                            >
                              <LinkedInIcon />
                            </a>
                          )}
                          {competitor.instagram_url && (
                            <a
                              href={competitor.instagram_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 rounded-lg bg-[#E4405F]/10 text-[#E4405F] hover:bg-[#E4405F]/20 transition-colors"
                            >
                              <InstagramIcon />
                            </a>
                          )}
                          {competitor.tiktok_url && (
                            <a
                              href={competitor.tiktok_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 rounded-lg bg-foreground/10 text-foreground hover:bg-foreground/20 transition-colors"
                            >
                              <TikTokIcon />
                            </a>
                          )}
                          {competitor.facebook_url && (
                            <a
                              href={competitor.facebook_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 rounded-lg bg-[#1877F2]/10 text-[#1877F2] hover:bg-[#1877F2]/20 transition-colors"
                            >
                              <FacebookIcon />
                            </a>
                          )}
                          {getPlatformCount(competitor) === 0 && (
                            <span className="text-xs text-muted-foreground">
                              Aucun réseau configuré
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
