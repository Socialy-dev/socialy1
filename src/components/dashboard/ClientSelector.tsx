import { ChevronDown, Check, Users, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useClientContext } from "@/hooks/useClientContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";

export const ClientSelector = () => {
  const { clients, selectedClientId, setSelectedClientId, selectedClient, isLoading } = useClientContext();

  if (isLoading) {
    return <Skeleton className="h-10 w-64 rounded-xl" />;
  }

  return (
    <div className="flex items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className={cn(
              "flex items-center gap-2.5 h-10 px-4 rounded-xl transition-all duration-200",
              "bg-secondary/50 border border-border/50 hover:bg-secondary hover:border-border",
              selectedClientId && "border-primary/50 bg-primary/5"
            )}
          >
            <Users className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">
              {selectedClient ? selectedClient.name : "Tous les clients"}
            </span>
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent 
          align="start"
          className="w-72 bg-card border border-border shadow-xl rounded-xl p-1.5"
        >
          <DropdownMenuLabel className="px-3 py-2 text-xs text-muted-foreground font-medium">
            Filtrer par client
          </DropdownMenuLabel>
          <DropdownMenuSeparator className="bg-border/50" />
          
          <DropdownMenuItem
            onClick={() => setSelectedClientId(null)}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors",
              !selectedClientId ? "bg-primary/10 text-primary" : "hover:bg-secondary"
            )}
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
              <Users className="w-4 h-4 text-muted-foreground" />
            </div>
            <span className="flex-1 text-sm font-medium">Tous les clients</span>
            {!selectedClientId && <Check className="w-4 h-4 text-primary" />}
          </DropdownMenuItem>

          <DropdownMenuSeparator className="bg-border/50 my-1" />

          <div className="max-h-[280px] overflow-y-auto">
            {clients.length === 0 ? (
              <div className="px-3 py-4 text-center text-sm text-muted-foreground">
                Aucun client disponible
              </div>
            ) : (
              clients.map((client) => {
                const isActive = selectedClientId === client.id;
                return (
                  <DropdownMenuItem
                    key={client.id}
                    onClick={() => setSelectedClientId(client.id)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors",
                      isActive ? "bg-primary/10 text-primary" : "hover:bg-secondary"
                    )}
                  >
                    <div className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold",
                      isActive 
                        ? "bg-primary text-primary-foreground" 
                        : "bg-gradient-to-br from-secondary to-muted text-muted-foreground"
                    )}>
                      {client.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="flex-1 truncate text-sm font-medium">{client.name}</span>
                    {isActive && <Check className="w-4 h-4 text-primary" />}
                  </DropdownMenuItem>
                );
              })
            )}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      {selectedClientId && (
        <button
          onClick={() => setSelectedClientId(null)}
          className="w-8 h-8 rounded-lg bg-secondary/50 border border-border/50 flex items-center justify-center hover:bg-destructive/10 hover:border-destructive/50 hover:text-destructive transition-all"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
