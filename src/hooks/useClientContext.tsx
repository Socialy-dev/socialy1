import { useState, useEffect, createContext, useContext, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useQuery } from "@tanstack/react-query";

interface Client {
  id: string;
  name: string;
}

interface ClientContextType {
  clients: Client[];
  selectedClientId: string | null;
  setSelectedClientId: (id: string | null) => void;
  selectedClient: Client | null;
  isLoading: boolean;
}

const ClientContext = createContext<ClientContextType | undefined>(undefined);

export const ClientProvider = ({ children }: { children: ReactNode }) => {
  const { effectiveOrgId } = useAuth();
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);

  const { data: clients = [], isLoading } = useQuery({
    queryKey: ["clients-for-filter", effectiveOrgId],
    queryFn: async () => {
      if (!effectiveOrgId) return [];

      const { data, error } = await supabase
        .from("client_agencies")
        .select("id, name")
        .eq("organization_id", effectiveOrgId)
        .order("name", { ascending: true });

      if (error) throw error;
      return data as Client[];
    },
    enabled: !!effectiveOrgId,
  });

  useEffect(() => {
    setSelectedClientId(null);
  }, [effectiveOrgId]);

  const selectedClient = clients.find(c => c.id === selectedClientId) || null;

  return (
    <ClientContext.Provider
      value={{
        clients,
        selectedClientId,
        setSelectedClientId,
        selectedClient,
        isLoading,
      }}
    >
      {children}
    </ClientContext.Provider>
  );
};

export const useClientContext = () => {
  const context = useContext(ClientContext);
  if (context === undefined) {
    throw new Error("useClientContext must be used within a ClientProvider");
  }
  return context;
};
