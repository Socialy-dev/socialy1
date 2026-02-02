import { useState, useEffect } from "react";
import { MessageSquare, Save } from "lucide-react";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { getInitials, capitalizeFullName } from "@/lib/text-utils";

interface Journalist {
  id: string;
  name: string;
  media: string | null;
  job: string | null;
  notes: string | null;
}

interface JournalistNotesDrawerProps {
  journalist: Journalist | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: string, notes: string) => Promise<void>;
}

export const JournalistNotesDrawer = ({
  journalist,
  isOpen,
  onClose,
  onSave,
}: JournalistNotesDrawerProps) => {
  const [notes, setNotes] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (journalist) {
      setNotes(journalist.notes || "");
    }
  }, [journalist?.id, journalist?.notes]);

  const handleSave = async () => {
    if (!journalist) return;
    setIsSaving(true);
    try {
      await onSave(journalist.id, notes);
      toast({
        title: "Enregistré",
        description: "Les notes ont été sauvegardées.",
      });
      onClose();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder les notes.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      onClose();
    }
  };

  if (!journalist) return null;

  return (
    <Drawer open={isOpen} onOpenChange={handleOpenChange}>
      <DrawerContent className="max-h-[85vh]">
        <div className="mx-auto w-full max-w-lg">
          <DrawerHeader className="text-left">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-primary-foreground font-bold text-lg shadow-lg shadow-primary/25">
                {getInitials(journalist.name)}
              </div>
              <div className="flex-1 min-w-0">
                <DrawerTitle className="text-xl">
                  {capitalizeFullName(journalist.name)}
                </DrawerTitle>
                <DrawerDescription className="mt-1">
                  {journalist.media && (
                    <span className="text-primary font-medium">{journalist.media}</span>
                  )}
                  {journalist.media && journalist.job && " • "}
                  {journalist.job && <span>{journalist.job}</span>}
                  {!journalist.media && !journalist.job && "Aucune information"}
                </DrawerDescription>
              </div>
            </div>
          </DrawerHeader>

          <div className="px-4 pb-4">
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <MessageSquare className="w-4 h-4 text-primary" />
                Notes & commentaires
              </label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ajoutez vos notes sur ce journaliste..."
                className="min-h-[150px] resize-none bg-secondary/30 border-border focus:border-primary"
              />
              <p className="text-xs text-muted-foreground">
                Ces notes sont privées et visibles uniquement par votre équipe.
              </p>
            </div>
          </div>

          <DrawerFooter className="pt-2">
            <Button onClick={handleSave} disabled={isSaving} className="gap-2">
              {isSaving ? (
                <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              Enregistrer
            </Button>
            <DrawerClose asChild>
              <Button variant="outline">Annuler</Button>
            </DrawerClose>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
};
