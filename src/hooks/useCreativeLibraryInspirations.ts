import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

export interface CreativeInspiration {
  id: string;
  organization_id: string;
  platform: string;
  title: string | null;
  description: string | null;
  image_url: string | null;
  video_url: string | null;
  source_url: string | null;
  source_type: string;
  tags: string[] | null;
  industry: string | null;
  format: string | null;
  is_scraped: boolean;
  scraped_at: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  storage_path: string | null;
  original_url: string | null;
}

export interface CreateInspirationInput {
  platform: string;
  title?: string;
  description?: string;
  image_url?: string;
  video_url?: string;
  source_url?: string;
  tags?: string[];
  industry?: string;
  format?: string;
  file?: File;
}

async function uploadInspirationFile(
  file: File,
  organizationId: string
): Promise<{ storagePath: string; signedUrl: string } | null> {
  try {
    const fileExt = file.name.split(".").pop()?.toLowerCase();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `${organizationId}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("creative_inspirations")
      .upload(filePath, file);

    if (uploadError) {
      console.error("Upload error:", uploadError);
      return null;
    }

    const { data: signedData, error: signError } = await supabase.storage
      .from("creative_inspirations")
      .createSignedUrl(filePath, 3600);

    if (signError || !signedData) {
      console.error("Sign URL error:", signError);
      return null;
    }

    return { storagePath: filePath, signedUrl: signedData.signedUrl };
  } catch (error) {
    console.error("Error uploading file:", error);
    return null;
  }
}

export async function getInspirationSignedUrl(storagePath: string): Promise<string | null> {
  try {
    const { data, error } = await supabase.storage
      .from("creative_inspirations")
      .createSignedUrl(storagePath, 3600);

    if (error) {
      console.error("Error creating signed URL:", error);
      return null;
    }

    return data.signedUrl;
  } catch (error) {
    console.error("Error in getInspirationSignedUrl:", error);
    return null;
  }
}

export function useCreativeLibraryInspirations(
  sourceType: "scraped" | "manual" | "all" = "all",
  platform: string = "all"
) {
  const { effectiveOrgId } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: inspirations = [], isLoading } = useQuery({
    queryKey: ["creative-inspirations", effectiveOrgId, sourceType, platform],
    queryFn: async () => {
      if (!effectiveOrgId) return [];

      let query = supabase
        .from("creative_library_inspirations")
        .select("*")
        .eq("organization_id", effectiveOrgId)
        .order("created_at", { ascending: false });

      if (sourceType === "scraped") {
        query = query.eq("is_scraped", true);
      } else if (sourceType === "manual") {
        query = query.eq("is_scraped", false);
      }

      if (platform !== "all") {
        query = query.eq("platform", platform);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching inspirations:", error);
        return [];
      }

      const inspirationsWithUrls = await Promise.all(
        (data as CreativeInspiration[]).map(async (item) => {
          if (item.storage_path) {
            const signedUrl = await getInspirationSignedUrl(item.storage_path);
            if (signedUrl) {
              const isVideo = item.storage_path.match(/\.(mp4|webm|mov|avi)$/i);
              return {
                ...item,
                image_url: isVideo ? item.image_url : signedUrl,
                video_url: isVideo ? signedUrl : item.video_url,
              };
            }
          }
          return item;
        })
      );

      return inspirationsWithUrls;
    },
    enabled: !!effectiveOrgId,
  });

  const createInspiration = useMutation({
    mutationFn: async (input: CreateInspirationInput) => {
      if (!effectiveOrgId) throw new Error("No organization");

      const { data: session } = await supabase.auth.getSession();
      if (!session.session) throw new Error("Not authenticated");

      let storagePath: string | null = null;
      let imageUrl = input.image_url || null;
      let videoUrl = input.video_url || null;
      let originalUrl: string | null = null;

      if (input.file) {
        const uploadResult = await uploadInspirationFile(input.file, effectiveOrgId);
        if (uploadResult) {
          storagePath = uploadResult.storagePath;
          const isVideo = input.file.type.startsWith("video/");
          if (isVideo) {
            videoUrl = uploadResult.signedUrl;
          } else {
            imageUrl = uploadResult.signedUrl;
          }
        }
      } else if (input.image_url) {
        originalUrl = input.image_url;
      } else if (input.video_url) {
        originalUrl = input.video_url;
      }

      const { data, error } = await supabase
        .from("creative_library_inspirations")
        .insert({
          organization_id: effectiveOrgId,
          platform: input.platform,
          title: input.title,
          description: input.description,
          image_url: storagePath ? null : imageUrl,
          video_url: storagePath ? null : videoUrl,
          source_url: input.source_url,
          tags: input.tags,
          industry: input.industry,
          format: input.format,
          source_type: "manual",
          is_scraped: false,
          created_by: session.session.user.id,
          storage_path: storagePath,
          original_url: originalUrl,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["creative-inspirations"] });
      toast({
        title: "Créa ajoutée",
        description: "L'inspiration a été ajoutée à votre librairie.",
      });
    },
    onError: (error) => {
      console.error("Error creating inspiration:", error);
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter l'inspiration.",
        variant: "destructive",
      });
    },
  });

  const deleteInspiration = useMutation({
    mutationFn: async (id: string) => {
      const inspiration = inspirations.find((i) => i.id === id);
      
      if (inspiration?.storage_path) {
        const { error: storageError } = await supabase.storage
          .from("creative_inspirations")
          .remove([inspiration.storage_path]);
        
        if (storageError) {
          console.error("Error deleting file from storage:", storageError);
        }
      }

      const { error } = await supabase
        .from("creative_library_inspirations")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["creative-inspirations"] });
      toast({
        title: "Créa supprimée",
        description: "L'inspiration a été supprimée.",
      });
    },
    onError: (error) => {
      console.error("Error deleting inspiration:", error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer l'inspiration.",
        variant: "destructive",
      });
    },
  });

  return {
    inspirations,
    isLoading,
    createInspiration,
    deleteInspiration,
  };
}
