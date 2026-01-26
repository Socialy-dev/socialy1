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

      return data as CreativeInspiration[];
    },
    enabled: !!effectiveOrgId,
  });

  const createInspiration = useMutation({
    mutationFn: async (input: CreateInspirationInput) => {
      if (!effectiveOrgId) throw new Error("No organization");

      const { data: session } = await supabase.auth.getSession();
      if (!session.session) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("creative_library_inspirations")
        .insert({
          organization_id: effectiveOrgId,
          platform: input.platform,
          title: input.title,
          description: input.description,
          image_url: input.image_url,
          video_url: input.video_url,
          source_url: input.source_url,
          tags: input.tags,
          industry: input.industry,
          format: input.format,
          source_type: "manual",
          is_scraped: false,
          created_by: session.session.user.id,
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
