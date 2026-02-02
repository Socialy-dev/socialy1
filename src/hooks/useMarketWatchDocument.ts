import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface MarketWatchDocument {
  id: string;
  organization_id: string;
  title: string;
  content: string | null;
  month: string;
  status: string;
  generated_at: string | null;
  created_at: string;
  updated_at: string;
}

export function useMarketWatchDocument(organizationId: string | null) {
  const [document, setDocument] = useState<MarketWatchDocument | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const fetchCurrentDocument = useCallback(async () => {
    if (!organizationId) return;

    setIsLoading(true);
    try {
      const now = new Date();
      const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

      const { data, error } = await supabase
        .from("market_watch_documents")
        .select("*")
        .eq("organization_id", organizationId)
        .eq("month", currentMonth)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error("Error fetching document:", error);
      }

      setDocument(data || null);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  }, [organizationId]);

  const generateDocument = useCallback(async (forceRegenerate = false) => {
    if (!organizationId) return;

    setIsGenerating(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: "Erreur",
          description: "Vous devez être connecté",
          variant: "destructive",
        });
        return;
      }

      const response = await supabase.functions.invoke("generate-market-watch-document", {
        body: {
          organization_id: organizationId,
          force_regenerate: forceRegenerate,
        },
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      if (response.data?.already_exists && response.data?.document) {
        setDocument(response.data.document);
        toast({
          title: "Document disponible",
          description: "Le document de veille est prêt à être consulté.",
        });
      } else {
        toast({
          title: "Génération lancée",
          description: "Le document est en cours de génération. Veuillez patienter...",
        });
        
        const interval = setInterval(async () => {
          await fetchCurrentDocument();
        }, 5000);

        setTimeout(() => clearInterval(interval), 120000);
      }
    } catch (error) {
      console.error("Error generating document:", error);
      toast({
        title: "Erreur",
        description: "Impossible de générer le document",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  }, [organizationId, toast, fetchCurrentDocument]);

  useEffect(() => {
    fetchCurrentDocument();
  }, [fetchCurrentDocument]);

  useEffect(() => {
    if (!organizationId) return;

    const channel = supabase
      .channel(`market-watch-doc-${organizationId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'market_watch_documents',
          filter: `organization_id=eq.${organizationId}`,
        },
        (payload) => {
          if (payload.new) {
            setDocument(payload.new as MarketWatchDocument);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [organizationId]);

  return {
    document,
    isLoading,
    isGenerating,
    generateDocument,
    refetch: fetchCurrentDocument,
  };
}
