import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Search, ExternalLink } from "lucide-react";

interface SearchCreativesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const MEDIA_TYPES = [
  { value: "all", label: "Tous les types" },
  { value: "image", label: "Image" },
  { value: "video", label: "Vidéo" },
];

const META_ADS_LIBRARY_URL = "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=FR&is_targeted_country=false&media_type=all&search_type=page&sort_data[direction]=desc&sort_data[mode]=total_impressions&source=fb-logo&view_all_page_id=434174436675167";

export const SearchCreativesModal = ({ isOpen, onClose }: SearchCreativesModalProps) => {
  const { effectiveOrgId, user } = useAuth();
  const [metaUrl, setMetaUrl] = useState("");
  const [mediaType, setMediaType] = useState("all");
  const [isSearching, setIsSearching] = useState(false);
  const [urlError, setUrlError] = useState("");

  const validateUrl = (url: string): boolean => {
    if (!url.trim()) {
      setUrlError("Veuillez entrer une URL");
      return false;
    }
    if (!url.includes("facebook.com/ads/library")) {
      setUrlError("L'URL doit provenir de Meta Ads Library");
      return false;
    }
    setUrlError("");
    return true;
  };

  const handleSearch = async () => {
    if (!validateUrl(metaUrl)) {
      return;
    }

    if (!effectiveOrgId) {
      toast.error("Organisation non trouvée");
      return;
    }

    setIsSearching(true);

    try {
      const { data, error } = await supabase.functions.invoke("search-creatives", {
        body: {
          meta_url: metaUrl.trim(),
          media_type: mediaType,
          organization_id: effectiveOrgId,
          user_id: user?.id,
        },
      });

      if (error) throw error;

      toast.success("Recherche lancée ! Les créations apparaîtront bientôt.");
      handleClose();
    } catch (error) {
      console.error("Erreur recherche créas:", error);
      toast.error("Erreur lors du lancement de la recherche");
    } finally {
      setIsSearching(false);
    }
  };

  const handleClose = () => {
    setMetaUrl("");
    setMediaType("all");
    setUrlError("");
    onClose();
  };

  const handleUrlChange = (value: string) => {
    setMetaUrl(value);
    if (urlError) {
      validateUrl(value);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            Rechercher des créations
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-4">
          <div className="rounded-xl bg-muted/50 p-4 space-y-3">
            <p className="text-sm font-medium text-foreground">
              1. Accédez à Meta Ads Library
            </p>
            <Button
              variant="outline"
              className="w-full gap-2 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white border-0"
              onClick={() => window.open(META_ADS_LIBRARY_URL, "_blank")}
            >
              <ExternalLink className="w-4 h-4" />
              Ouvrir Meta Ads Library
            </Button>
          </div>

          <div className="space-y-1">
            <p className="text-sm font-medium text-foreground">
              2. Cherchez votre marque (ex: Nike, Apple, SFR...)
            </p>
          </div>

          <div className="space-y-1">
            <p className="text-sm font-medium text-foreground">
              3. Copiez l'URL complète de la page
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="meta-url">URL Meta Ads Library</Label>
            <Input
              id="meta-url"
              placeholder="https://www.facebook.com/ads/library/?..."
              value={metaUrl}
              onChange={(e) => handleUrlChange(e.target.value)}
              className={urlError ? "border-destructive" : ""}
            />
            {urlError && (
              <p className="text-xs text-destructive">{urlError}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Type de média</Label>
            <Select value={mediaType} onValueChange={setMediaType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MEDIA_TYPES.map((m) => (
                  <SelectItem key={m.value} value={m.value}>
                    {m.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button
          onClick={handleSearch}
          disabled={isSearching || !metaUrl.trim()}
          className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700"
        >
          {isSearching ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Recherche en cours...
            </>
          ) : (
            <>
              <Search className="w-4 h-4" />
              Lancer la recherche
            </>
          )}
        </Button>
      </DialogContent>
    </Dialog>
  );
};
