import { useState } from "react";
import { X, Plus, Image, Video, Link, Tag, Loader2 } from "lucide-react";
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

interface AddInspirationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

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

export function AddInspirationModal({ isOpen, onClose }: AddInspirationModalProps) {
  const { createInspiration } = useCreativeLibraryInspirations();
  const [isSubmitting, setIsSubmitting] = useState(false);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await createInspiration.mutateAsync({
        ...formData,
        tags: formData.tags?.length ? formData.tags : undefined,
      });
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
    } finally {
      setIsSubmitting(false);
    }
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-xl mx-4 bg-background border border-border rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-bold text-foreground">Ajouter une inspiration</h2>
          <button
            onClick={onClose}
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

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Image className="w-4 h-4" />
              URL de l'image
            </Label>
            <Input
              type="url"
              value={formData.image_url}
              onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
              placeholder="https://..."
            />
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Video className="w-4 h-4" />
              URL de la vidéo
            </Label>
            <Input
              type="url"
              value={formData.video_url}
              onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
              placeholder="https://..."
            />
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Link className="w-4 h-4" />
              URL source
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
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
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
