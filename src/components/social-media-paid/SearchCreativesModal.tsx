import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Search, Info } from "lucide-react";

interface SearchCreativesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SearchCreativesModal = ({ isOpen, onClose }: SearchCreativesModalProps) => {
  const { effectiveOrgId, user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const isValidInput = searchTerm.trim().length >= 2;

  const handleSearch = async () => {
    if (!isValidInput) {
      toast.error("Veuillez entrer au moins 2 caractères");
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
          search_term: searchTerm.trim(),
          search_type: searchTerm.includes("pinterest.com") ? "url" : "keyword",
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
    setSearchTerm("");
    onClose();
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
          <div className="flex items-start gap-3 rounded-xl bg-muted/50 p-4">
            <Info className="w-5 h-5 text-primary mt-0.5 shrink-0" />
            <p className="text-sm text-muted-foreground">
              Les recherches sont effectuées sur <span className="font-medium text-foreground">Pinterest</span>. 
              Entrez une URL Pinterest ou un mot-clé pour trouver des inspirations créatives.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="search-term">URL Pinterest ou mot-clé</Label>
            <Input
              id="search-term"
              placeholder="https://pinterest.com/... ou Nike sneakers"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && isValidInput && handleSearch()}
            />
          </div>
        </div>

        <Button
          onClick={handleSearch}
          disabled={isSearching || !isValidInput}
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
