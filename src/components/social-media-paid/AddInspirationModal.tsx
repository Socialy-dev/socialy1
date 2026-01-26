import { useState, useRef } from "react";
import { X, Plus, Image, Video, Link, Tag, Loader2, Upload, FileImage, FileVideo } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCreativeLibraryInspirations, CreateInspirationInput } from "@/hooks/useCreativeLibraryInspirations";
import { cn } from "@/lib/utils";

interface AddInspirationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type UploadMode = "file" | "url";

const platforms = [
  { value: "meta", label: "Meta Ads" },
  { value: "google", label: "Google Ads" },
  { value: "linkedin", label: "LinkedIn Ads" },
  { value: "tiktok", label: "TikTok Ads" },
  { value: "pinterest", label: "Pinterest Ads" },
];

const formats = [
  { value: "image", label: "Image" },
  { value: "video", label: "Vidéo" },
  { value: "carousel", label: "Carrousel" },
  { value: "story", label: "Story" },
  { value: "reel", label: "Reel" },
];

const ACCEPTED_IMAGE_TYPES = "image/jpeg,image/png,image/gif,image/webp";
const ACCEPTED_VIDEO_TYPES = "video/mp4,video/webm,video/quicktime";
const MAX_FILE_SIZE = 20 * 1024 * 1024;

export function AddInspirationModal({ isOpen, onClose }: AddInspirationModalProps) {
  const { createInspiration } = useCreativeLibraryInspirations();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadMode, setUploadMode] = useState<UploadMode>("file");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState<CreateInspirationInput>({
    platform: "meta",
    title: "",
    description: "",
    image_url: "",
    video_url: "",
    source_url: "",
    format: "",
    tags: [],
  });
  const [tagInput, setTagInput] = useState("");

  if (!isOpen) return null;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      alert("Le fichier est trop volumineux. Taille max: 20MB");
      return;
    }

    setSelectedFile(file);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      setFilePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    if (file.type.startsWith("video/")) {
      setFormData({ ...formData, format: "video" });
    } else {
      setFormData({ ...formData, format: "image" });
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
    setFilePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await createInspiration.mutateAsync({
        ...formData,
        file: selectedFile || undefined,
        tags: formData.tags?.length ? formData.tags : undefined,
      });
      handleClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    onClose();
    setFormData({
      platform: "meta",
      title: "",
      description: "",
      image_url: "",
      video_url: "",
      source_url: "",
      format: "",
      tags: [],
    });
    setTagInput("");
    clearFile();
    setUploadMode("file");
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags?.includes(tagInput.trim())) {
      setFormData({
        ...formData,
        tags: [...(formData.tags || []), tagInput.trim()],
      });
      setTagInput("");
    }
  };

  const removeTag = (tag: string) => {
    setFormData({
      ...formData,
      tags: formData.tags?.filter((t) => t !== tag) || [],
    });
  };

  const isVideo = selectedFile?.type.startsWith("video/");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleClose} />
      
      <div className="relative w-full max-w-xl mx-4 bg-background border border-border rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-bold text-foreground">Ajouter une inspiration</h2>
          <button
            onClick={handleClose}
            className="w-10 h-10 rounded-full bg-secondary/80 hover:bg-secondary flex items-center justify-center transition-all"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Plateforme</Label>
              <Select
                value={formData.platform}
                onValueChange={(value) => setFormData({ ...formData, platform: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {platforms.map((p) => (
                    <SelectItem key={p.value} value={p.value}>
                      {p.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Format</Label>
              <Select
                value={formData.format || ""}
                onValueChange={(value) => setFormData({ ...formData, format: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner..." />
                </SelectTrigger>
                <SelectContent>
                  {formats.map((f) => (
                    <SelectItem key={f.value} value={f.value}>
                      {f.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Titre</Label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Nom de la créa..."
            />
          </div>

          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Décrivez ce qui rend cette créa efficace..."
              rows={3}
            />
          </div>

          <div className="space-y-3">
            <Label>Média</Label>
            <div className="flex gap-2 p-1 bg-muted/30 rounded-lg w-fit">
              <button
                type="button"
                onClick={() => { setUploadMode("file"); setFormData({ ...formData, image_url: "", video_url: "" }); }}
                className={cn(
                  "px-3 py-1.5 rounded-md text-sm font-medium transition-all",
                  uploadMode === "file"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Upload className="w-4 h-4 inline-block mr-1" />
                Uploader
              </button>
              <button
                type="button"
                onClick={() => { setUploadMode("url"); clearFile(); }}
                className={cn(
                  "px-3 py-1.5 rounded-md text-sm font-medium transition-all",
                  uploadMode === "url"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Link className="w-4 h-4 inline-block mr-1" />
                URL externe
              </button>
            </div>

            {uploadMode === "file" ? (
              <div className="space-y-3">
                {filePreview ? (
                  <div className="relative rounded-xl overflow-hidden bg-muted/30 border border-border">
                    {isVideo ? (
                      <video
                        src={filePreview}
                        className="w-full h-48 object-contain bg-black"
                        controls
                      />
                    ) : (
                      <img
                        src={filePreview}
                        alt="Preview"
                        className="w-full h-48 object-contain"
                      />
                    )}
                    <button
                      type="button"
                      onClick={clearFile}
                      className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/60 hover:bg-black/80 flex items-center justify-center transition-all"
                    >
                      <X className="w-4 h-4 text-white" />
                    </button>
                    <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/60 rounded-md text-xs text-white flex items-center gap-1">
                      {isVideo ? <FileVideo className="w-3 h-3" /> : <FileImage className="w-3 h-3" />}
                      {selectedFile?.name}
                    </div>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center h-40 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-primary/50 hover:bg-muted/20 transition-all">
                    <Upload className="w-10 h-10 text-muted-foreground mb-3" />
                    <span className="text-sm text-muted-foreground">
                      Cliquez ou glissez un fichier
                    </span>
                    <span className="text-xs text-muted-foreground mt-1">
                      Images ou vidéos (max 20MB)
                    </span>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept={`${ACCEPTED_IMAGE_TYPES},${ACCEPTED_VIDEO_TYPES}`}
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                  </label>
                )}
                <p className="text-xs text-muted-foreground">
                  ✅ Les fichiers uploadés sont stockés de façon permanente et ne peuvent pas expirer.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Image className="w-4 h-4 text-muted-foreground" />
                    <Label className="text-sm">URL de l'image</Label>
                  </div>
                  <Input
                    type="url"
                    value={formData.image_url}
                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                    placeholder="https://..."
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Video className="w-4 h-4 text-muted-foreground" />
                    <Label className="text-sm">URL de la vidéo</Label>
                  </div>
                  <Input
                    type="url"
                    value={formData.video_url}
                    onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                    placeholder="https://..."
                  />
                </div>
                <p className="text-xs text-amber-500">
                  ⚠️ Les URLs externes peuvent expirer si le site source supprime le fichier.
                </p>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Link className="w-4 h-4" />
              URL source (optionnel)
            </Label>
            <Input
              type="url"
              value={formData.source_url}
              onChange={(e) => setFormData({ ...formData, source_url: e.target.value })}
              placeholder="https://..."
            />
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Tag className="w-4 h-4" />
              Tags
            </Label>
            <div className="flex gap-2">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                placeholder="Ajouter un tag..."
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addTag();
                  }
                }}
              />
              <Button type="button" variant="outline" size="icon" onClick={addTag}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            {formData.tags && formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary text-xs rounded-full"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="hover:text-destructive"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" className="flex-1" onClick={handleClose}>
              Annuler
            </Button>
            <Button type="submit" className="flex-1" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Ajout...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Ajouter
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
