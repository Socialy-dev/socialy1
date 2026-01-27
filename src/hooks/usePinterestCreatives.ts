import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export interface PinterestCreative {
  id: string;
  organization_id: string;
  pinterest_id: string;
  pinterest_link: string;
  type: string;
  download_url: string | null;
  thumbnail_url: string | null;
  title: string | null;
  description: string | null;
  alt_text: string | null;
  likes: number;
  is_promoted: boolean;
  creator_name: string | null;
  creator_url: string | null;
  dominant_color: string | null;
  pinterest_created_at: string | null;
  storage_path: string | null;
  created_at: string;
  updated_at: string;
}

export const usePinterestCreatives = (filterType?: "image" | "video" | "all") => {
  const { effectiveOrgId } = useAuth();
  const queryClient = useQueryClient();

  const { data: creatives = [], isLoading, refetch } = useQuery({
    queryKey: ["pinterest-creatives", effectiveOrgId, filterType],
    queryFn: async () => {
      if (!effectiveOrgId) return [];

      let query = supabase
        .from("pinterest_creatives")
        .select("*")
        .eq("organization_id", effectiveOrgId)
        .order("created_at", { ascending: false });

      if (filterType && filterType !== "all") {
        query = query.eq("type", filterType);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching pinterest creatives:", error);
        throw error;
      }

      return data as PinterestCreative[];
    },
    enabled: !!effectiveOrgId,
  });

  const deleteCreative = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("pinterest_creatives")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pinterest-creatives"] });
      toast.success("Création supprimée");
    },
    onError: (error) => {
      console.error("Error deleting creative:", error);
      toast.error("Erreur lors de la suppression");
    },
  });

  return {
    creatives,
    isLoading,
    refetch,
    deleteCreative,
  };
};
