import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  FolderOpen,
  Upload,
  FileText,
  Presentation,
  File,
  Trash2,
  Download,
  Plus,
  X,
  ArrowLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Resource {
  id: string;
  name: string;
  type: string;
  description: string | null;
  file_url: string | null;
  content: string | null;
  created_at: string;
}

const RESOURCE_TYPES = [
  { value: "communique", label: "Communiqué de presse", icon: FileText },
  { value: "presentation", label: "Présentation", icon: Presentation },
  { value: "template", label: "Template", icon: File },
  { value: "autre", label: "Autre", icon: FolderOpen },
];

interface ResourcesPanelProps {
  onBack: () => void;
}

export const ResourcesPanel = ({ onBack }: ResourcesPanelProps) => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [activeType, setActiveType] = useState<string>("all");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form state
  const [formName, setFormName] = useState("");
  const [formType, setFormType] = useState("communique");
  const [formDescription, setFormDescription] = useState("");
  const [formContent, setFormContent] = useState("");
  const [formFile, setFormFile] = useState<File | null>(null);

  const { user } = useAuth();

  const fetchResources = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("admin_resources")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setResources(data as Resource[]);
    } catch (error: any) {
      console.error("Error fetching resources:", error);
      toast.error("Erreur lors du chargement des ressources");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFormFile(file);
      if (!formName) {
        setFormName(file.name.replace(/\.[^/.]+$/, ""));
      }
    }
  };

  const handleSubmit = async () => {
    if (!formName.trim()) {
      toast.error("Le nom est requis");
      return;
    }

    if (!formContent.trim() && !formFile) {
      toast.error("Ajoutez du contenu ou un fichier");
      return;
    }

    setUploading(true);
    try {
      let fileUrl: string | null = null;

      // Upload file if present
      if (formFile) {
        const fileExt = formFile.name.split(".").pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `${user?.id}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("resources")
          .upload(filePath, formFile);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from("resources")
          .getPublicUrl(filePath);

        fileUrl = urlData.publicUrl;
      }

      // Insert resource
      const { error } = await supabase.from("admin_resources").insert({
        name: formName.trim(),
        type: formType,
        description: formDescription.trim() || null,
        content: formContent.trim() || null,
        file_url: fileUrl,
        uploaded_by: user?.id,
      });

      if (error) throw error;

      toast.success("Ressource ajoutée !");
      resetForm();
      fetchResources();
    } catch (error: any) {
      console.error("Error adding resource:", error);
      toast.error("Erreur lors de l'ajout");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (resource: Resource) => {
    try {
      // Delete file from storage if exists
      if (resource.file_url) {
        const pathMatch = resource.file_url.match(/resources\/(.+)$/);
        if (pathMatch) {
          await supabase.storage.from("resources").remove([pathMatch[1]]);
        }
      }

      const { error } = await supabase
        .from("admin_resources")
        .delete()
        .eq("id", resource.id);

      if (error) throw error;

      toast.success("Ressource supprimée");
      fetchResources();
    } catch (error: any) {
      toast.error("Erreur lors de la suppression");
    }
  };

  const resetForm = () => {
    setFormName("");
    setFormType("communique");
    setFormDescription("");
    setFormContent("");
    setFormFile(null);
    setShowAddForm(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const filteredResources =
    activeType === "all"
      ? resources
      : resources.filter((r) => r.type === activeType);

  const getTypeIcon = (type: string) => {
    const found = RESOURCE_TYPES.find((t) => t.value === type);
    return found ? found.icon : File;
  };

  const getTypeLabel = (type: string) => {
    const found = RESOURCE_TYPES.find((t) => t.value === type);
    return found ? found.label : type;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h2 className="text-2xl font-semibold text-foreground">Ressources</h2>
            <p className="text-muted-foreground">
              Templates et documents pour la génération de contenu
            </p>
          </div>
        </div>
        <Button onClick={() => setShowAddForm(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          Ajouter
        </Button>
      </div>

      {/* Type filters */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setActiveType("all")}
          className={cn(
            "px-4 py-2 rounded-full text-sm font-medium transition-all",
            activeType === "all"
              ? "bg-primary text-primary-foreground"
              : "bg-muted/50 text-muted-foreground hover:bg-muted"
          )}
        >
          Tous ({resources.length})
        </button>
        {RESOURCE_TYPES.map((type) => {
          const count = resources.filter((r) => r.type === type.value).length;
          return (
            <button
              key={type.value}
              onClick={() => setActiveType(type.value)}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2",
                activeType === type.value
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted/50 text-muted-foreground hover:bg-muted"
              )}
            >
              <type.icon className="w-4 h-4" />
              {type.label} ({count})
            </button>
          );
        })}
      </div>

      {/* Add form modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-card rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-border shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-foreground">
                Nouvelle ressource
              </h3>
              <Button variant="ghost" size="icon" onClick={resetForm}>
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Nom</Label>
                  <Input
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="Nom de la ressource"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Type</Label>
                  <Select value={formType} onValueChange={setFormType}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {RESOURCE_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          <div className="flex items-center gap-2">
                            <type.icon className="w-4 h-4" />
                            {type.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Description (optionnel)</Label>
                <Input
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Brève description"
                  className="mt-1"
                />
              </div>

              <div>
                <Label>Contenu texte</Label>
                <Textarea
                  value={formContent}
                  onChange={(e) => setFormContent(e.target.value)}
                  placeholder="Collez le texte du communiqué, template, etc."
                  className="mt-1 min-h-[200px] font-mono text-sm"
                />
              </div>

              <div>
                <Label>Ou importer un fichier</Label>
                <div className="mt-1">
                  <input
                    ref={fileInputRef}
                    type="file"
                    onChange={handleFileChange}
                    className="hidden"
                    accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.md"
                  />
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className={cn(
                      "border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors",
                      formFile
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-muted-foreground"
                    )}
                  >
                    {formFile ? (
                      <div className="flex items-center justify-center gap-3">
                        <File className="w-8 h-8 text-primary" />
                        <div className="text-left">
                          <p className="font-medium text-foreground">
                            {formFile.name}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {(formFile.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            setFormFile(null);
                            if (fileInputRef.current) {
                              fileInputRef.current.value = "";
                            }
                          }}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ) : (
                      <div>
                        <Upload className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                        <p className="text-muted-foreground">
                          Cliquez ou glissez un fichier
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          PDF, Word, PowerPoint, TXT
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={resetForm}>
                  Annuler
                </Button>
                <Button onClick={handleSubmit} disabled={uploading}>
                  {uploading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    "Enregistrer"
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Resources grid */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      ) : filteredResources.length === 0 ? (
        <div className="text-center py-16">
          <FolderOpen className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
          <p className="text-muted-foreground text-lg">Aucune ressource</p>
          <p className="text-sm text-muted-foreground mt-1">
            Ajoutez vos premiers templates et communiqués
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredResources.map((resource) => {
            const TypeIcon = getTypeIcon(resource.type);
            return (
              <div
                key={resource.id}
                className="glass-card p-5 rounded-xl group hover:shadow-lg transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <TypeIcon className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {resource.file_url && (
                      <a
                        href={resource.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Download className="w-4 h-4" />
                        </Button>
                      </a>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => handleDelete(resource)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <h4 className="font-semibold text-foreground mb-1 line-clamp-1">
                  {resource.name}
                </h4>
                <p className="text-xs text-muted-foreground mb-2">
                  {getTypeLabel(resource.type)}
                </p>

                {resource.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                    {resource.description}
                  </p>
                )}

                {resource.content && (
                  <div className="bg-muted/50 rounded-lg p-3 max-h-24 overflow-hidden relative">
                    <p className="text-xs text-muted-foreground font-mono line-clamp-4">
                      {resource.content}
                    </p>
                    <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-muted/50 to-transparent" />
                  </div>
                )}

                <p className="text-xs text-muted-foreground mt-3">
                  Ajouté le{" "}
                  {new Date(resource.created_at).toLocaleDateString("fr-FR")}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
