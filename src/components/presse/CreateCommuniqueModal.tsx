import { useState, useRef } from "react";
import { X, FileText, File, ExternalLink, Upload, Send, Target, Calendar, Users, Phone, MessageSquare, Check, Briefcase, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface CreateCommuniqueModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const CP_TYPES = [
  { id: "partenariat", label: "Annonce de partenariat" },
  { id: "lancement", label: "Lancement produit/campagne" },
  { id: "client", label: "Nouveau client gagné" },
  { id: "evenement", label: "Événement/Actualité" },
  { id: "autre", label: "Autre (précisez)" },
];

type FormMode = "upload" | "create";

export const CreateCommuniqueModal = ({ isOpen, onClose, onSuccess }: CreateCommuniqueModalProps) => {
  const [mode, setMode] = useState<FormMode>("upload");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const pdfInputRef = useRef<HTMLInputElement>(null);
  const wordInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const [formCommuniqueName, setFormCommuniqueName] = useState("");
  const [formCommuniquePdf, setFormCommuniquePdf] = useState<File | null>(null);
  const [formCommuniqueWord, setFormCommuniqueWord] = useState<File | null>(null);
  const [formCommuniqueAssetsLink, setFormCommuniqueAssetsLink] = useState("");

  const [cpType, setCpType] = useState<string>("");
  const [cpTypeOther, setCpTypeOther] = useState("");
  const [clientMarque, setClientMarque] = useState("");
  const [titre, setTitre] = useState("");
  const [sousTitre, setSousTitre] = useState("");
  const [sujetPrincipal, setSujetPrincipal] = useState("");
  const [angleCreatif, setAngleCreatif] = useState("");
  const [messagesCles, setMessagesCles] = useState("");
  const [dateDiffusion, setDateDiffusion] = useState("");
  const [lienAssets, setLienAssets] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [equipeClient, setEquipeClient] = useState("");
  const [equipeSocialy, setEquipeSocialy] = useState("");
  const [contactNom, setContactNom] = useState("");
  const [contactFonction, setContactFonction] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactTelephone, setContactTelephone] = useState("");
  const [infosSupplementaires, setInfosSupplementaires] = useState("");

  const resetForm = () => {
    setMode("upload");
    setFormCommuniqueName("");
    setFormCommuniquePdf(null);
    setFormCommuniqueWord(null);
    setFormCommuniqueAssetsLink("");
    setCpType("");
    setCpTypeOther("");
    setClientMarque("");
    setTitre("");
    setSousTitre("");
    setSujetPrincipal("");
    setAngleCreatif("");
    setMessagesCles("");
    setDateDiffusion("");
    setLienAssets("");
    setImageFile(null);
    setEquipeClient("");
    setEquipeSocialy("");
    setContactNom("");
    setContactFonction("");
    setContactEmail("");
    setContactTelephone("");
    setInfosSupplementaires("");
    if (pdfInputRef.current) pdfInputRef.current.value = "";
    if (wordInputRef.current) wordInputRef.current.value = "";
    if (imageInputRef.current) imageInputRef.current.value = "";
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleUploadSubmit = async () => {
    if (!formCommuniqueName.trim()) {
      toast({ title: "Champ obligatoire manquant", description: "Veuillez saisir un nom pour le communiqué", variant: "destructive" });
      return;
    }

    if (!formCommuniquePdf && !formCommuniqueWord && !formCommuniqueAssetsLink.trim()) {
      toast({ title: "Fichier ou lien requis", description: "Veuillez ajouter un PDF, un fichier Word ou un lien vers les assets", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      let pdfUrl: string | null = null;
      let wordUrl: string | null = null;

      if (formCommuniquePdf) {
        const fileExt = formCommuniquePdf.name.split(".").pop();
        const fileName = `${Date.now()}-pdf-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `${user.id}/${fileName}`;
        const { error: uploadError } = await supabase.storage.from("communique_presse").upload(filePath, formCommuniquePdf);
        if (uploadError) throw uploadError;
        const { data: urlData } = supabase.storage.from("communique_presse").getPublicUrl(filePath);
        pdfUrl = urlData.publicUrl;
      }

      if (formCommuniqueWord) {
        const fileExt = formCommuniqueWord.name.split(".").pop();
        const fileName = `${Date.now()}-word-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `${user.id}/${fileName}`;
        const { error: uploadError } = await supabase.storage.from("communique_presse").upload(filePath, formCommuniqueWord);
        if (uploadError) throw uploadError;
        const { data: urlData } = supabase.storage.from("communique_presse").getPublicUrl(filePath);
        wordUrl = urlData.publicUrl;
      }

      const { error } = await supabase.from("communique_presse").insert({
        name: formCommuniqueName.trim(),
        pdf_url: pdfUrl,
        word_url: wordUrl,
        assets_link: formCommuniqueAssetsLink.trim() || null,
        created_by: user.id,
      });

      if (error) throw error;

      toast({ title: "Communiqué créé avec succès", description: "Votre communiqué de presse a été enregistré" });
      resetForm();
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error("Error adding communique:", error);
      toast({ title: "Échec de la création", description: "Une erreur s'est produite lors de l'ajout du communiqué. Veuillez réessayer.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateSubmit = async () => {
    if (!clientMarque.trim()) {
      toast({ title: "Champ obligatoire manquant", description: "Veuillez saisir le nom du client/marque", variant: "destructive" });
      return;
    }
    if (!sujetPrincipal.trim()) {
      toast({ title: "Champ obligatoire manquant", description: "Veuillez saisir le sujet principal", variant: "destructive" });
      return;
    }
    if (!dateDiffusion) {
      toast({ title: "Champ obligatoire manquant", description: "Veuillez sélectionner une date de diffusion", variant: "destructive" });
      return;
    }
    if (!contactNom.trim() || !contactEmail.trim() || !contactTelephone.trim()) {
      toast({ title: "Champs contact manquants", description: "Veuillez remplir les informations de contact presse obligatoires", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      let imageUrl: string | null = null;
      if (imageFile) {
        const fileExt = imageFile.name.split(".").pop();
        const fileName = `${Date.now()}-img-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `${user.id}/${fileName}`;
        const { error: uploadError } = await supabase.storage.from("communique_presse").upload(filePath, imageFile);
        if (uploadError) throw uploadError;
        const { data: urlData } = supabase.storage.from("communique_presse").getPublicUrl(filePath);
        imageUrl = urlData.publicUrl;
      }

      const cpName = titre.trim() || `${clientMarque} - ${cpType === "autre" ? cpTypeOther : CP_TYPES.find(t => t.id === cpType)?.label || "Communiqué"}`;

      const { error } = await supabase.from("communique_presse").insert({
        name: cpName,
        assets_link: lienAssets.trim() || imageUrl || null,
        created_by: user.id,
      });

      if (error) throw error;

      toast({ title: "Communiqué créé avec succès", description: "Votre communiqué de presse a été enregistré et sera généré prochainement" });
      resetForm();
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error("Error creating communique:", error);
      toast({ title: "Échec de la création", description: "Une erreur s'est produite. Veuillez réessayer.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card rounded-3xl w-full max-w-6xl h-[95vh] border border-border shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-300">
        <div className="flex items-center justify-between px-8 py-6 border-b border-border bg-gradient-to-r from-primary/10 via-primary/5 to-transparent flex-shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-primary/15 flex items-center justify-center">
              <FileText className="w-7 h-7 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground">Nouveau communiqué de presse</h2>
              <p className="text-sm text-muted-foreground mt-0.5">Créez ou importez votre communiqué</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="rounded-full h-12 w-12" onClick={handleClose}>
            <X className="w-6 h-6" />
          </Button>
        </div>

        <div className="flex items-center gap-2 px-8 py-4 border-b border-border bg-secondary/30 flex-shrink-0">
          <button
            onClick={() => setMode("upload")}
            className={cn(
              "px-6 py-3 rounded-xl font-semibold text-sm transition-all",
              mode === "upload"
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                : "bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground"
            )}
          >
            Importer un CP existant
          </button>
          <button
            onClick={() => setMode("create")}
            className={cn(
              "px-6 py-3 rounded-xl font-semibold text-sm transition-all",
              mode === "create"
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                : "bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground"
            )}
          >
            Créer un CP
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8">
          {mode === "upload" ? (
            <div className="space-y-6 max-w-3xl mx-auto">
              <div className="bg-secondary/30 rounded-2xl p-6 border border-border">
                <Label className="text-base font-semibold mb-3 block">Nom du communiqué</Label>
                <Input
                  value={formCommuniqueName}
                  onChange={(e) => setFormCommuniqueName(e.target.value)}
                  placeholder="Ex: Lancement nouveau produit 2026"
                  className="h-12 text-base"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-secondary/30 rounded-2xl p-6 border border-border">
                  <Label className="text-base font-semibold mb-4 block">Communiqué PDF</Label>
                  <input
                    ref={pdfInputRef}
                    type="file"
                    onChange={(e) => e.target.files?.[0] && setFormCommuniquePdf(e.target.files[0])}
                    className="hidden"
                    accept=".pdf"
                  />
                  <div
                    onClick={() => pdfInputRef.current?.click()}
                    className={cn(
                      "border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all hover:scale-[1.02]",
                      formCommuniquePdf 
                        ? "border-red-500 bg-red-500/10" 
                        : "border-red-500/30 hover:border-red-500/60 hover:bg-red-500/5"
                    )}
                  >
                    {formCommuniquePdf ? (
                      <div className="space-y-3">
                        <div className="w-14 h-14 rounded-xl bg-red-500/20 flex items-center justify-center mx-auto">
                          <FileText className="w-7 h-7 text-red-500" />
                        </div>
                        <p className="text-sm font-medium text-foreground truncate">{formCommuniquePdf.name}</p>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setFormCommuniquePdf(null);
                            if (pdfInputRef.current) pdfInputRef.current.value = "";
                          }}
                        >
                          Supprimer
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="w-14 h-14 rounded-xl bg-red-500/10 flex items-center justify-center mx-auto">
                          <FileText className="w-7 h-7 text-red-500/60" />
                        </div>
                        <p className="text-sm text-muted-foreground">Cliquez pour ajouter un PDF</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-secondary/30 rounded-2xl p-6 border border-border">
                  <Label className="text-base font-semibold mb-4 block">Communiqué Word</Label>
                  <input
                    ref={wordInputRef}
                    type="file"
                    onChange={(e) => e.target.files?.[0] && setFormCommuniqueWord(e.target.files[0])}
                    className="hidden"
                    accept=".doc,.docx"
                  />
                  <div
                    onClick={() => wordInputRef.current?.click()}
                    className={cn(
                      "border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all hover:scale-[1.02]",
                      formCommuniqueWord 
                        ? "border-blue-500 bg-blue-500/10" 
                        : "border-blue-500/30 hover:border-blue-500/60 hover:bg-blue-500/5"
                    )}
                  >
                    {formCommuniqueWord ? (
                      <div className="space-y-3">
                        <div className="w-14 h-14 rounded-xl bg-blue-500/20 flex items-center justify-center mx-auto">
                          <File className="w-7 h-7 text-blue-500" />
                        </div>
                        <p className="text-sm font-medium text-foreground truncate">{formCommuniqueWord.name}</p>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setFormCommuniqueWord(null);
                            if (wordInputRef.current) wordInputRef.current.value = "";
                          }}
                        >
                          Supprimer
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="w-14 h-14 rounded-xl bg-blue-500/10 flex items-center justify-center mx-auto">
                          <File className="w-7 h-7 text-blue-500/60" />
                        </div>
                        <p className="text-sm text-muted-foreground">Cliquez pour ajouter un Word</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-secondary/30 rounded-2xl p-6 border border-border">
                  <Label className="text-base font-semibold mb-4 block">Lien Assets</Label>
                  <div
                    className={cn(
                      "border-2 border-dashed rounded-xl p-8 text-center transition-all",
                      formCommuniqueAssetsLink 
                        ? "border-purple-500 bg-purple-500/10" 
                        : "border-purple-500/30"
                    )}
                  >
                    <div className="space-y-3">
                      <div className={cn(
                        "w-14 h-14 rounded-xl flex items-center justify-center mx-auto",
                        formCommuniqueAssetsLink ? "bg-purple-500/20" : "bg-purple-500/10"
                      )}>
                        <ExternalLink className={cn(
                          "w-7 h-7",
                          formCommuniqueAssetsLink ? "text-purple-500" : "text-purple-500/60"
                        )} />
                      </div>
                      <Input
                        value={formCommuniqueAssetsLink}
                        onChange={(e) => setFormCommuniqueAssetsLink(e.target.value)}
                        placeholder="https://drive.google.com/..."
                        className="text-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-8 max-w-4xl mx-auto">
              <div className="bg-secondary/30 rounded-2xl p-6 border border-border">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Target className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground">Type de CP</h3>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {CP_TYPES.map((type) => (
                    <button
                      key={type.id}
                      onClick={() => setCpType(type.id)}
                      className={cn(
                        "relative p-4 rounded-xl border-2 transition-all text-left",
                        cpType === type.id
                          ? "border-primary bg-primary/10"
                          : "border-border bg-card hover:border-primary/40"
                      )}
                    >
                      <span className="text-sm font-medium">{type.label}</span>
                      {cpType === type.id && (
                        <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                          <Check className="w-3 h-3 text-primary-foreground" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
                {cpType === "autre" && (
                  <Input
                    value={cpTypeOther}
                    onChange={(e) => setCpTypeOther(e.target.value)}
                    placeholder="Précisez le type de communiqué..."
                    className="mt-4"
                  />
                )}
              </div>

              <div className="bg-secondary/30 rounded-2xl p-6 border border-border">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                    <Briefcase className="w-5 h-5 text-blue-500" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground">Informations principales</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <Label className="text-sm font-semibold mb-2 block">Client/Marque *</Label>
                    <Input
                      value={clientMarque}
                      onChange={(e) => setClientMarque(e.target.value)}
                      placeholder="Nom du client ou de la marque"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-semibold mb-2 block">Titre du CP</Label>
                    <Input
                      value={titre}
                      onChange={(e) => setTitre(e.target.value)}
                      placeholder="Laissez vide pour génération auto"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label className="text-sm font-semibold mb-2 block">Sous-titre/Chapô</Label>
                    <Input
                      value={sousTitre}
                      onChange={(e) => setSousTitre(e.target.value)}
                      placeholder="Résumé accrocheur en une ligne"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label className="text-sm font-semibold mb-2 block">Sujet principal * (contexte)</Label>
                    <Textarea
                      value={sujetPrincipal}
                      onChange={(e) => setSujetPrincipal(e.target.value)}
                      placeholder="Décrivez le contexte et le sujet principal du communiqué..."
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-semibold mb-2 block">Angle créatif / Concept clé</Label>
                    <Input
                      value={angleCreatif}
                      onChange={(e) => setAngleCreatif(e.target.value)}
                      placeholder="L'angle unique de cette annonce"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-semibold mb-2 block">Messages clés (3-5 points max)</Label>
                    <Textarea
                      value={messagesCles}
                      onChange={(e) => setMessagesCles(e.target.value)}
                      placeholder="Un message par ligne"
                      rows={3}
                    />
                  </div>
                </div>
              </div>

              <div className="bg-secondary/30 rounded-2xl p-6 border border-border">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-green-500" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground">Infos pratiques</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div>
                    <Label className="text-sm font-semibold mb-2 block">Date de diffusion *</Label>
                    <Input
                      type="date"
                      value={dateDiffusion}
                      onChange={(e) => setDateDiffusion(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-semibold mb-2 block">Lien assets (logos, vidéos, visuels)</Label>
                    <Input
                      value={lienAssets}
                      onChange={(e) => setLienAssets(e.target.value)}
                      placeholder="https://drive.google.com/..."
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-semibold mb-2 block">Upload image</Label>
                    <input
                      ref={imageInputRef}
                      type="file"
                      onChange={(e) => e.target.files?.[0] && setImageFile(e.target.files[0])}
                      className="hidden"
                      accept="image/*"
                    />
                    <div
                      onClick={() => imageInputRef.current?.click()}
                      className={cn(
                        "border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all hover:scale-[1.02]",
                        imageFile 
                          ? "border-green-500 bg-green-500/10" 
                          : "border-border hover:border-green-500/60"
                      )}
                    >
                      {imageFile ? (
                        <p className="text-xs font-medium truncate">{imageFile.name}</p>
                      ) : (
                        <Upload className="w-5 h-5 text-muted-foreground mx-auto" />
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-secondary/30 rounded-2xl p-6 border border-border">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                    <Users className="w-5 h-5 text-purple-500" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground">Crédits</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <Label className="text-sm font-semibold mb-2 block">Équipe client (noms + rôles)</Label>
                    <Textarea
                      value={equipeClient}
                      onChange={(e) => setEquipeClient(e.target.value)}
                      placeholder="Format: Nom - Rôle (un par ligne)"
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-semibold mb-2 block">Équipe Socialy</Label>
                    <Textarea
                      value={equipeSocialy}
                      onChange={(e) => setEquipeSocialy(e.target.value)}
                      placeholder="Auto-rempli ou modifiable"
                      rows={3}
                    />
                  </div>
                </div>
              </div>

              <div className="bg-secondary/30 rounded-2xl p-6 border border-border">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
                    <Phone className="w-5 h-5 text-orange-500" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground">Contact presse</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <Label className="text-sm font-semibold mb-2 block">Nom *</Label>
                    <Input
                      value={contactNom}
                      onChange={(e) => setContactNom(e.target.value)}
                      placeholder="Nom du contact presse"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-semibold mb-2 block">Fonction</Label>
                    <Input
                      value={contactFonction}
                      onChange={(e) => setContactFonction(e.target.value)}
                      placeholder="Ex: Responsable communication"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-semibold mb-2 block">Email *</Label>
                    <Input
                      type="email"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      placeholder="email@example.com"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-semibold mb-2 block">Téléphone *</Label>
                    <Input
                      value={contactTelephone}
                      onChange={(e) => setContactTelephone(e.target.value)}
                      placeholder="+33 6 12 34 56 78"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-secondary/30 rounded-2xl p-6 border border-border">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-xl bg-gray-500/10 flex items-center justify-center">
                    <MessageSquare className="w-5 h-5 text-gray-500" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground">Autres</h3>
                </div>
                <div>
                  <Label className="text-sm font-semibold mb-2 block">Informations supplémentaires</Label>
                  <Textarea
                    value={infosSupplementaires}
                    onChange={(e) => setInfosSupplementaires(e.target.value)}
                    placeholder="Ajoutez toute information complémentaire utile..."
                    rows={4}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-4 px-8 py-6 border-t border-border bg-secondary/30 flex-shrink-0">
          <Button variant="outline" size="lg" onClick={handleClose}>
            Annuler
          </Button>
          <Button 
            size="lg" 
            onClick={mode === "upload" ? handleUploadSubmit : handleCreateSubmit} 
            disabled={isSubmitting}
            className="min-w-40"
          >
            {isSubmitting ? (
              <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
            ) : (
              <>
                <Send className="w-5 h-5 mr-2" />
                Envoyer
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};
