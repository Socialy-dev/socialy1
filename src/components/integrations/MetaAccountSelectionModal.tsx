import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Loader2, Building2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

interface AdAccountDetail {
  id: string;
  name: string;
  business_name: string;
}

interface MetaAccountSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  pendingConnectionId: string | null;
  allAccounts: AdAccountDetail[];
  onSuccess: () => void;
}

export const MetaAccountSelectionModal = ({
  isOpen,
  onClose,
  pendingConnectionId,
  allAccounts,
  onSuccess,
}: MetaAccountSelectionModalProps) => {
  const { effectiveOrgId } = useAuth();
  const [selectedAccounts, setSelectedAccounts] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && allAccounts.length > 0) {
      setSelectedAccounts(allAccounts.map(a => a.id));
    }
  }, [isOpen, allAccounts]);

  const handleToggleAccount = (accountId: string) => {
    setSelectedAccounts(prev => 
      prev.includes(accountId)
        ? prev.filter(id => id !== accountId)
        : [...prev, accountId]
    );
  };

  const handleToggleAll = () => {
    if (selectedAccounts.length === allAccounts.length) {
      setSelectedAccounts([]);
    } else {
      setSelectedAccounts(allAccounts.map(a => a.id));
    }
  };

  const handleConfirm = async () => {
    if (!pendingConnectionId || !effectiveOrgId) {
      toast.error("Erreur de configuration");
      return;
    }

    if (selectedAccounts.length === 0) {
      toast.error("Sélectionnez au moins un compte publicitaire");
      return;
    }

    setIsSubmitting(true);

    try {
      const selectedDetails = allAccounts
        .filter(a => selectedAccounts.includes(a.id))
        .map(a => ({ id: a.id, name: a.name, business_name: a.business_name }));
      
      const { error } = await supabase
        .from("meta_connections")
        .update({
          ad_account_ids: selectedAccounts,
          ad_account_details: selectedDetails as unknown as null,
        })
        .eq("id", pendingConnectionId);

      if (error) throw error;

      toast.success(`${selectedAccounts.length} compte(s) publicitaire(s) synchronisé(s)`);
      onSuccess();
      onClose();
    } catch (error: unknown) {
      console.error("Error saving selected accounts:", error);
      toast.error("Erreur lors de la sauvegarde");
    } finally {
      setIsSubmitting(false);
    }
  };

  const groupedAccounts = allAccounts.reduce((acc, account) => {
    const businessName = account.business_name || "Comptes personnels";
    if (!acc[businessName]) {
      acc[businessName] = [];
    }
    acc[businessName].push(account);
    return acc;
  }, {} as Record<string, AdAccountDetail[]>);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Sélectionner les comptes à synchroniser</DialogTitle>
          <DialogDescription>
            Choisissez les comptes publicitaires Meta que vous souhaitez synchroniser avec Socialy.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto py-4 space-y-6">
          <div className="flex items-center justify-between px-1">
            <span className="text-sm text-muted-foreground">
              {selectedAccounts.length} sur {allAccounts.length} sélectionné(s)
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleToggleAll}
              className="text-xs"
            >
              {selectedAccounts.length === allAccounts.length ? "Tout désélectionner" : "Tout sélectionner"}
            </Button>
          </div>

          {Object.entries(groupedAccounts).map(([businessName, accounts]) => (
            <div key={businessName} className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                <Building2 className="w-4 h-4 text-muted-foreground" />
                {businessName}
              </div>
              <div className="space-y-2 pl-6">
                {accounts.map((account) => (
                  <div
                    key={account.id}
                    className="flex items-center gap-3 p-3 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-colors cursor-pointer"
                    onClick={() => handleToggleAccount(account.id)}
                  >
                    <Checkbox
                      id={account.id}
                      checked={selectedAccounts.includes(account.id)}
                      onCheckedChange={() => handleToggleAccount(account.id)}
                    />
                    <Label
                      htmlFor={account.id}
                      className="flex-1 cursor-pointer"
                    >
                      <span className="font-medium">{account.name}</span>
                      <span className="block text-xs text-muted-foreground mt-0.5">
                        {account.id}
                      </span>
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {allAccounts.length === 0 && (
            <div className="py-8 text-center text-muted-foreground">
              Aucun compte publicitaire trouvé
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Annuler
          </Button>
          <Button onClick={handleConfirm} disabled={isSubmitting || selectedAccounts.length === 0}>
            {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Confirmer ({selectedAccounts.length})
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
