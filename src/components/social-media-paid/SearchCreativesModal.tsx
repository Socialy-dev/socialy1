import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Search } from "lucide-react";

interface SearchCreativesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const COUNTRIES = [
  { value: "FR", label: "France" },
  { value: "US", label: "États-Unis" },
  { value: "GB", label: "Royaume-Uni" },
  { value: "DE", label: "Allemagne" },
  { value: "ES", label: "Espagne" },
];

const MEDIA_TYPES = [
  { value: "all", label: "Tous les types" },
  { value: "image", label: "Image" },
  { value: "video", label: "Vidéo" },
];

export const SearchCreativesModal = ({ isOpen, onClose }: SearchCreativesModalProps) => {
  const { effectiveOrgId, user } = useAuth();
  const [keyword, setKeyword] = useState("");
  const [country, setCountry] = useState("FR");
  const [mediaType, setMediaType] = useState("all");
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async () => {
    if (!keyword.trim()) {
      toast.error("Veuillez entrer un mot-clé");
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
          keyword: keyword.trim(),
          country,
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
    setKeyword("");
    setCountry("FR");
    setMediaType("all");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            Rechercher des créations
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="keyword">Mot-clé</Label>
            <Input
              id="keyword"
              placeholder="Nike, Adidas, Apple..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Pays</Label>
            <Select value={country} onValueChange={setCountry}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {COUNTRIES.map((c) => (
                  <SelectItem key={c.value} value={c.value}>
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
          disabled={isSearching || !keyword.trim()}
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
