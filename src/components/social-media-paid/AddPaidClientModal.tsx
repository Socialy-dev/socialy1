import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { useMetaConnections } from "@/hooks/useMetaConnections";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Link2 } from "lucide-react";

interface AddPaidClientModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface PlatformConfig {
  id: string;
  label: string;
  enabled: boolean;
  accountId: string;
}

const initialPlatforms: PlatformConfig[] = [
  { id: "meta", label: "Meta Ads", enabled: false, accountId: "" },
  { id: "google", label: "Google Ads", enabled: false, accountId: "" },
  { id: "linkedin", label: "LinkedIn Ads", enabled: false, accountId: "" },
  { id: "pinterest", label: "Pinterest Ads", enabled: false, accountId: "" },
  { id: "tiktok", label: "TikTok Ads", enabled: false, accountId: "" },
];

export const AddPaidClientModal = ({ isOpen, onClose }: AddPaidClientModalProps) => {
  const { effectiveOrgId } = useAuth();
  const { connections } = useMetaConnections();
  const [clientName, setClientName] = useState("");
  const [platforms, setPlatforms] = useState<PlatformConfig[]>(initialPlatforms);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const availableMetaAccounts = connections.flatMap(
    (conn) => conn.ad_account_details?.map((detail) => ({ 
      id: detail.id, 
      name: detail.name,
      businessName: detail.business_name,
      userName: conn.user_name 
    })) || conn.ad_account_ids?.map((id) => ({ 
      id, 
      name: id,
      businessName: "",
      userName: conn.user_name 
    })) || []
  );

  const handlePlatformToggle = (platformId: string) => {
    setPlatforms((prev) =>
      prev.map((p) =>
        p.id === platformId ? { ...p, enabled: !p.enabled } : p
      )
    );
  };

  const handleAccountIdChange = (platformId: string, value: string) => {
    setPlatforms((prev) =>
      prev.map((p) =>
        p.id === platformId ? { ...p, accountId: value } : p
      )
    );
  };

  const handleSubmit = async () => {
    if (!clientName.trim()) {
      toast.error("Veuillez entrer un nom de client");
      return;
    }

    if (!effectiveOrgId) {
      toast.error("Organisation non trouvée");
      return;
    }

    const enabledPlatforms = platforms.filter((p) => p.enabled);
    if (enabledPlatforms.length === 0) {
      toast.error("Veuillez sélectionner au moins une plateforme");
      return;
    }

    const missingAccountIds = enabledPlatforms.filter((p) => !p.accountId.trim());
    if (missingAccountIds.length > 0) {
      toast.error("Veuillez renseigner tous les IDs de compte publicitaire");
      return;
    }

    setIsSubmitting(true);

    try {
      const { data: clientData, error: clientError } = await supabase
        .from("paid_clients")
        .insert({
          organization_id: effectiveOrgId,
          name: clientName.trim(),
        })
        .select()
        .single();

      if (clientError) throw clientError;

      const adAccountsToInsert = enabledPlatforms.map((p) => ({
        organization_id: effectiveOrgId,
        client_id: clientData.id,
        platform: p.id,
        account_id: p.accountId.trim(),
        account_name: `${clientName} - ${p.label}`,
      }));

      const { error: accountsError } = await supabase
        .from("paid_ad_accounts")
        .insert(adAccountsToInsert);

      if (accountsError) throw accountsError;

      toast.success("Client ajouté avec succès");
      handleClose();
    } catch (error: any) {
      console.error("Error adding client:", error);
      if (error.code === "23505") {
        toast.error("Ce client existe déjà");
      } else {
        toast.error("Erreur lors de l'ajout du client");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setClientName("");
    setPlatforms(initialPlatforms);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Ajouter un client</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="clientName">Nom du client</Label>
            <Input
              id="clientName"
              placeholder="Ex: Acme Corporation"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
            />
          </div>

          <div className="space-y-4">
            <Label>Plateformes actives</Label>
            <div className="space-y-4">
              {platforms.map((platform) => (
                <div key={platform.id} className="space-y-2">
                  <div className="flex items-center gap-3">
                    <Checkbox
                      id={platform.id}
                      checked={platform.enabled}
                      onCheckedChange={() => handlePlatformToggle(platform.id)}
                    />
                    <Label
                      htmlFor={platform.id}
                      className="text-sm font-medium cursor-pointer"
                    >
                      {platform.label}
                    </Label>
                  </div>
                  {platform.enabled && (
                    <div className="ml-6 space-y-2">
                      {platform.id === "meta" && availableMetaAccounts.length > 0 ? (
                        <div className="space-y-2">
                          <Select
                            value={platform.accountId}
                            onValueChange={(value) => handleAccountIdChange(platform.id, value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Sélectionner un compte détecté" />
                            </SelectTrigger>
                            <SelectContent>
                              {availableMetaAccounts.map((acc) => (
                                <SelectItem key={acc.id} value={acc.id}>
                                  <div className="flex items-center gap-2">
                                    <Link2 className="w-3 h-3 flex-shrink-0" />
                                    <span className="font-medium">{acc.name}</span>
                                    {acc.businessName && (
                                      <span className="text-muted-foreground text-xs">• {acc.businessName}</span>
                                    )}
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Input
                            placeholder="Ou entrer manuellement"
                            value={platform.accountId}
                            onChange={(e) => handleAccountIdChange(platform.id, e.target.value)}
                            className="text-sm"
                          />
                        </div>
                      ) : (
                        <Input
                          placeholder={`ID compte ${platform.label}`}
                          value={platform.accountId}
                          onChange={(e) => handleAccountIdChange(platform.id, e.target.value)}
                        />
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
            Annuler
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Ajouter
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
