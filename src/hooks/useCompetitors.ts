import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export type CompetitorCategory = "organic_social_media" | "presse" | "ads" | "general";

export interface Competitor {
  id: string;
  name: string;
  logo_url: string | null;
  website: string | null;
  linkedin: string | null;
  tiktok_url: string | null;
  instagram_url: string | null;
  facebook_url: string | null;
  specialty: string | null;
  notes: string | null;
  category: CompetitorCategory;
  created_at: string;
}

export interface NewCompetitor {
  name: string;
  logo_url?: string;
  website?: string;
  linkedin?: string;
  tiktok_url?: string;
  instagram_url?: string;
  facebook_url?: string;
  category?: CompetitorCategory;
}

export const useCompetitors = (categoryFilter?: CompetitorCategory) => {
  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [loading, setLoading] = useState(true);
  const { effectiveOrgId } = useAuth();

  const fetchCompetitors = async () => {
    if (!effectiveOrgId) {
      setCompetitors([]);
      setLoading(false);
      return;
    }

    try {
      let query = supabase
        .from("competitor_agencies")
        .select("*")
        .eq("organization_id", effectiveOrgId)
        .order("created_at", { ascending: false });

      if (categoryFilter) {
        query = query.eq("category", categoryFilter);
      }

      const { data, error } = await query;

      if (error) throw error;
      setCompetitors((data as Competitor[]) || []);
    } catch (error) {
      console.error("Error fetching competitors:", error);
      toast.error("Erreur lors du chargement des concurrents");
    } finally {
      setLoading(false);
    }
  };

  const addCompetitor = async (competitor: NewCompetitor): Promise<boolean> => {
    if (!effectiveOrgId) {
      toast.error("Aucune organisation sélectionnée");
      return false;
    }

    try {
      const { error } = await supabase.from("competitor_agencies").insert({
        organization_id: effectiveOrgId,
        name: competitor.name,
        logo_url: competitor.logo_url || null,
        website: competitor.website || null,
        linkedin: competitor.linkedin || null,
        tiktok_url: competitor.tiktok_url || null,
        instagram_url: competitor.instagram_url || null,
        facebook_url: competitor.facebook_url || null,
        category: competitor.category || "organic_social_media",
      });

      if (error) throw error;

      toast.success("Concurrent ajouté avec succès");
      await fetchCompetitors();
      return true;
    } catch (error: unknown) {
      console.error("Error adding competitor:", error);
      const message = error instanceof Error ? error.message : "Erreur lors de l'ajout du concurrent";
      toast.error(message);
      return false;
    }
  };

  const updateCompetitor = async (id: string, competitor: NewCompetitor): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from("competitor_agencies")
        .update({
          name: competitor.name,
          logo_url: competitor.logo_url || null,
          website: competitor.website || null,
          linkedin: competitor.linkedin || null,
          tiktok_url: competitor.tiktok_url || null,
          instagram_url: competitor.instagram_url || null,
          facebook_url: competitor.facebook_url || null,
        })
        .eq("id", id);

      if (error) throw error;

      toast.success("Concurrent mis à jour");
      await fetchCompetitors();
      return true;
    } catch (error: unknown) {
      console.error("Error updating competitor:", error);
      const message = error instanceof Error ? error.message : "Erreur lors de la mise à jour";
      toast.error(message);
      return false;
    }
  };

  const deleteCompetitor = async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from("competitor_agencies")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast.success("Concurrent supprimé");
      await fetchCompetitors();
      return true;
    } catch (error) {
      console.error("Error deleting competitor:", error);
      toast.error("Erreur lors de la suppression");
      return false;
    }
  };

  useEffect(() => {
    fetchCompetitors();
  }, [effectiveOrgId, categoryFilter]);

  return {
    competitors,
    loading,
    addCompetitor,
    updateCompetitor,
    deleteCompetitor,
    refetch: fetchCompetitors,
  };
};
