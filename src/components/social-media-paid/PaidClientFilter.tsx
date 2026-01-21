import { ChevronDown, Building2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface PaidClient {
  id: string;
  name: string;
  logo_url?: string | null;
}

interface PaidClientFilterProps {
  clients: PaidClient[];
  selectedClientId: string | null;
  onSelect: (clientId: string | null) => void;
  isLoading?: boolean;
}

export const PaidClientFilter = ({
  clients,
  selectedClientId,
  onSelect,
  isLoading,
}: PaidClientFilterProps) => {
  const selectedClient = clients.find((c) => c.id === selectedClientId);

  if (isLoading) {
    return <Skeleton className="h-10 w-40" />;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="bg-secondary/50 border-border/50 hover:bg-secondary"
        >
          <Building2 className="w-4 h-4 mr-2" />
          {selectedClient ? selectedClient.name : "Tous les clients"}
          <ChevronDown className="w-4 h-4 ml-2" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        <DropdownMenuItem onClick={() => onSelect(null)}>
          Tous les clients
        </DropdownMenuItem>
        {clients.map((client) => (
          <DropdownMenuItem key={client.id} onClick={() => onSelect(client.id)}>
            {client.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
