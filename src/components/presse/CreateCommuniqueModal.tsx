import { useState, useRef } from "react";
import { X, FileText, File, ExternalLink, Upload, Save, Sparkles, Target, Calendar, Users, Phone, MessageSquare, Check, Briefcase } from "lucide-react";
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

      let pdfPath: string | null = null;
      let wordPath: string | null = null;

      if (formCommuniquePdf) {
        const fileExt = formCommuniquePdf.name.split(".").pop();
        const fileName = `${Date.now()}-pdf-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `${user.id}/${fileName}`;
        const { error: uploadError } = await supabase.storage.from("communique_presse").upload(filePath, formCommuniquePdf);
        if (uploadError) throw uploadError;
        pdfPath = filePath;
      }

      if (formCommuniqueWord) {
        const fileExt = formCommuniqueWord.name.split(".").pop();
        const fileName = `${Date.now()}-word-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `${user.id}/${fileName}`;
        const { error: uploadError } = await supabase.storage.from("communique_presse").upload(filePath, formCommuniqueWord);
        if (uploadError) throw uploadError;
        wordPath = filePath;
      }

      const { error } = await supabase.from("communique_presse").insert({
        name: formCommuniqueName.trim(),
        pdf_url: pdfPath,
        word_url: wordPath,
        assets_link: formCommuniqueAssetsLink.trim() || null,
        created_by: user.id,
      });

      if (error) throw error;

      toast({ title: "Communiqué sauvegardé", description: "Votre communiqué de presse a été enregistré" });
      resetForm();
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error("Error adding communique:", error);
      toast({ title: "Échec de la sauvegarde", description: "Une erreur s'est produite. Veuillez réessayer.", variant: "destructive" });
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
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({ title: "Session expirée", description: "Veuillez vous reconnecter", variant: "destructive" });
        return;
      }

      let imagePath: string | null = null;
      if (imageFile) {
        const fileExt = imageFile.name.split(".").pop();
        const fileName = `${Date.now()}-img-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `${session.user.id}/${fileName}`;
        const { error: uploadError } = await supabase.storage.from("communique_presse").upload(filePath, imageFile);
        if (uploadError) throw uploadError;
        imagePath = filePath;
      }

      const { data, error } = await supabase.functions.invoke("create-communique", {
        body: {
          cpType,
          cpTypeOther,
          clientMarque,
          titre,
          sousTitre,
          sujetPrincipal,
          angleCreatif,
          messagesCles,
          dateDiffusion,
          lienAssets,
          imagePath,
          equipeClient,
          equipeSocialy,
          contactNom,
          contactFonction,
          contactEmail,
          contactTelephone,
          infosSupplementaires,
        },
      });

      if (error) throw error;

      toast({ title: "Communiqué créé", description: "Votre communiqué de presse va être généré" });
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
      <div className="bg-card rounded-3xl w-full max-w-7xl h-[95vh] border border-border shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-300">
        <div className="flex items-center justify-between px-8 py-5 border-b border-border bg-gradient-to-r from-primary/10 via-primary/5 to-transparent flex-shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary/15 flex items-center justify-center">
              <FileText className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">Nouveau communiqué de presse</h2>
              <p className="text-sm text-muted-foreground">Créez ou importez votre communiqué</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="rounded-full h-10 w-10" onClick={handleClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="flex items-center gap-2 px-8 py-3 border-b border-border bg-secondary/30 flex-shrink-0">
          <button
            onClick={() => setMode("upload")}
            className={cn(
              "px-5 py-2.5 rounded-xl font-semibold text-sm transition-all",
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
              "px-5 py-2.5 rounded-xl font-semibold text-sm transition-all",
              mode === "create"
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                : "bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground"
            )}
          >
            Créer un CP
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {mode === "upload" ? (
            <div className="space-y-5 max-w-3xl mx-auto">
              <div className="bg-secondary/30 rounded-2xl p-5 border border-border">
                <Label className="text-sm font-semibold mb-2 block">Nom du communiqué</Label>
                <Input
                  value={formCommuniqueName}
                  onChange={(e) => setFormCommuniqueName(e.target.value)}
                  placeholder="Ex: Lancement nouveau produit 2026"
                  className="h-11"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="bg-secondary/30 rounded-2xl p-5 border border-border">
                  <Label className="text-sm font-semibold mb-3 block">Communiqué PDF</Label>
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
                      "border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all hover:scale-[1.02]",
                      formCommuniquePdf 
                        ? "border-red-500 bg-red-500/10" 
                        : "border-red-500/30 hover:border-red-500/60 hover:bg-red-500/5"
                    )}
                  >
                    {formCommuniquePdf ? (
                      <div className="space-y-2">
                        <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center mx-auto">
                          <FileText className="w-6 h-6 text-red-500" />
                        </div>
                        <p className="text-xs font-medium text-foreground truncate">{formCommuniquePdf.name}</p>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs"
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
                      <div className="space-y-2">
                        <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center mx-auto">
                          <FileText className="w-6 h-6 text-red-500/60" />
                        </div>
                        <p className="text-xs text-muted-foreground">Cliquez pour ajouter</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-secondary/30 rounded-2xl p-5 border border-border">
                  <Label className="text-sm font-semibold mb-3 block">Communiqué Word</Label>
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
                      "border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all hover:scale-[1.02]",
                      formCommuniqueWord 
                        ? "border-blue-500 bg-blue-500/10" 
                        : "border-blue-500/30 hover:border-blue-500/60 hover:bg-blue-500/5"
                    )}
                  >
                    {formCommuniqueWord ? (
                      <div className="space-y-2">
                        <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center mx-auto">
                          <File className="w-6 h-6 text-blue-500" />
                        </div>
                        <p className="text-xs font-medium text-foreground truncate">{formCommuniqueWord.name}</p>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs"
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
                      <div className="space-y-2">
                        <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center mx-auto">
                          <File className="w-6 h-6 text-blue-500/60" />
                        </div>
                        <p className="text-xs text-muted-foreground">Cliquez pour ajouter</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-secondary/30 rounded-2xl p-5 border border-border">
                  <Label className="text-sm font-semibold mb-3 block">Lien Assets</Label>
                  <div
                    className={cn(
                      "border-2 border-dashed rounded-xl p-6 text-center transition-all",
                      formCommuniqueAssetsLink 
                        ? "border-purple-500 bg-purple-500/10" 
                        : "border-purple-500/30"
                    )}
                  >
                    <div className="space-y-2">
                      <div className={cn(
                        "w-12 h-12 rounded-xl flex items-center justify-center mx-auto",
                        formCommuniqueAssetsLink ? "bg-purple-500/20" : "bg-purple-500/10"
                      )}>
                        <ExternalLink className={cn(
                          "w-6 h-6",
                          formCommuniqueAssetsLink ? "text-purple-500" : "text-purple-500/60"
                        )} />
                      </div>
                      <Input
                        value={formCommuniqueAssetsLink}
                        onChange={(e) => setFormCommuniqueAssetsLink(e.target.value)}
                        placeholder="https://drive..."
                        className="text-xs h-8"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-5 max-w-6xl mx-auto">
              <div className="space-y-4">
                <div className="bg-secondary/30 rounded-2xl p-5 border border-border">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Target className="w-4 h-4 text-primary" />
                    </div>
                    <h3 className="font-bold text-foreground">Type de CP</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {CP_TYPES.map((type) => (
                      <button
                        key={type.id}
                        onClick={() => setCpType(type.id)}
                        className={cn(
                          "relative p-3 rounded-lg border transition-all text-left text-xs",
                          cpType === type.id
                            ? "border-primary bg-primary/10"
                            : "border-border bg-card hover:border-primary/40"
                        )}
                      >
                        <span className="font-medium">{type.label}</span>
                        {cpType === type.id && (
                          <Check className="absolute top-2 right-2 w-3.5 h-3.5 text-primary" />
                        )}
                      </button>
                    ))}
                  </div>
                  {cpType === "autre" && (
                    <Input
                      value={cpTypeOther}
                      onChange={(e) => setCpTypeOther(e.target.value)}
                      placeholder="Précisez..."
                      className="mt-3 h-9 text-sm"
                    />
                  )}
                </div>

                <div className="bg-secondary/30 rounded-2xl p-5 border border-border">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                      <Briefcase className="w-4 h-4 text-blue-500" />
                    </div>
                    <h3 className="font-bold text-foreground">Informations principales</h3>
                  </div>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs font-semibold mb-1 block">Client/Marque *</Label>
                        <Input value={clientMarque} onChange={(e) => setClientMarque(e.target.value)} placeholder="Nom du client" className="h-9 text-sm" />
                      </div>
                      <div>
                        <Label className="text-xs font-semibold mb-1 block">Titre du CP</Label>
                        <Input value={titre} onChange={(e) => setTitre(e.target.value)} placeholder="Auto si vide" className="h-9 text-sm" />
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs font-semibold mb-1 block">Sous-titre/Chapô</Label>
                      <Input value={sousTitre} onChange={(e) => setSousTitre(e.target.value)} placeholder="Résumé accrocheur" className="h-9 text-sm" />
                    </div>
                    <div>
                      <Label className="text-xs font-semibold mb-1 block">Sujet principal * (contexte)</Label>
                      <Textarea value={sujetPrincipal} onChange={(e) => setSujetPrincipal(e.target.value)} placeholder="Contexte et sujet..." rows={2} className="text-sm" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs font-semibold mb-1 block">Angle créatif</Label>
                        <Input value={angleCreatif} onChange={(e) => setAngleCreatif(e.target.value)} placeholder="Concept clé" className="h-9 text-sm" />
                      </div>
                      <div>
                        <Label className="text-xs font-semibold mb-1 block">Messages clés</Label>
                        <Input value={messagesCles} onChange={(e) => setMessagesCles(e.target.value)} placeholder="3-5 points max" className="h-9 text-sm" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-secondary/30 rounded-2xl p-5 border border-border">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
                      <Users className="w-4 h-4 text-purple-500" />
                    </div>
                    <h3 className="font-bold text-foreground">Crédits</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs font-semibold mb-1 block">Équipe client</Label>
                      <Textarea value={equipeClient} onChange={(e) => setEquipeClient(e.target.value)} placeholder="Nom - Rôle" rows={2} className="text-sm" />
                    </div>
                    <div>
                      <Label className="text-xs font-semibold mb-1 block">Équipe Socialy</Label>
                      <Textarea value={equipeSocialy} onChange={(e) => setEquipeSocialy(e.target.value)} placeholder="Auto-rempli" rows={2} className="text-sm" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-secondary/30 rounded-2xl p-5 border border-border">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center">
                      <Calendar className="w-4 h-4 text-green-500" />
                    </div>
                    <h3 className="font-bold text-foreground">Infos pratiques</h3>
                  </div>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs font-semibold mb-1 block">Date de diffusion *</Label>
                        <Input type="date" value={dateDiffusion} onChange={(e) => setDateDiffusion(e.target.value)} className="h-9 text-sm" />
                      </div>
                      <div>
                        <Label className="text-xs font-semibold mb-1 block">Lien assets</Label>
                        <Input value={lienAssets} onChange={(e) => setLienAssets(e.target.value)} placeholder="https://drive..." className="h-9 text-sm" />
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs font-semibold mb-1 block">Upload image</Label>
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
                          "border-2 border-dashed rounded-lg p-3 text-center cursor-pointer transition-all hover:scale-[1.01]",
                          imageFile 
                            ? "border-green-500 bg-green-500/10" 
                            : "border-border hover:border-green-500/60"
                        )}
                      >
                        {imageFile ? (
                          <p className="text-xs font-medium truncate">{imageFile.name}</p>
                        ) : (
                          <div className="flex items-center justify-center gap-2 text-muted-foreground">
                            <Upload className="w-4 h-4" />
                            <span className="text-xs">Cliquez pour ajouter</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-secondary/30 rounded-2xl p-5 border border-border">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center">
                      <Phone className="w-4 h-4 text-orange-500" />
                    </div>
                    <h3 className="font-bold text-foreground">Contact presse</h3>
                  </div>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs font-semibold mb-1 block">Nom *</Label>
                        <Input value={contactNom} onChange={(e) => setContactNom(e.target.value)} placeholder="Nom du contact" className="h-9 text-sm" />
                      </div>
                      <div>
                        <Label className="text-xs font-semibold mb-1 block">Fonction</Label>
                        <Input value={contactFonction} onChange={(e) => setContactFonction(e.target.value)} placeholder="Responsable comm." className="h-9 text-sm" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs font-semibold mb-1 block">Email *</Label>
                        <Input type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} placeholder="email@..." className="h-9 text-sm" />
                      </div>
                      <div>
                        <Label className="text-xs font-semibold mb-1 block">Téléphone *</Label>
                        <Input value={contactTelephone} onChange={(e) => setContactTelephone(e.target.value)} placeholder="+33 6..." className="h-9 text-sm" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-secondary/30 rounded-2xl p-5 border border-border">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-gray-500/10 flex items-center justify-center">
                      <MessageSquare className="w-4 h-4 text-gray-500" />
                    </div>
                    <h3 className="font-bold text-foreground">Autres</h3>
                  </div>
                  <div>
                    <Label className="text-xs font-semibold mb-1 block">Informations supplémentaires</Label>
                    <Textarea value={infosSupplementaires} onChange={(e) => setInfosSupplementaires(e.target.value)} placeholder="Infos complémentaires..." rows={3} className="text-sm" />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 px-8 py-4 border-t border-border bg-secondary/30 flex-shrink-0">
          <Button variant="outline" onClick={handleClose}>
            Annuler
          </Button>
          <Button 
            onClick={mode === "upload" ? handleUploadSubmit : handleCreateSubmit} 
            disabled={isSubmitting}
            className="min-w-36"
          >
            {isSubmitting ? (
              <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
            ) : mode === "upload" ? (
              <>
                <Save className="w-4 h-4 mr-2" />
                Sauvegarder
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Créer le CP
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};
