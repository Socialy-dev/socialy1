import { ChevronDown, Filter, SortDesc } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface CreativeLibraryFiltersProps {
  statusFilter: string;
  onStatusChange: (value: string) => void;
  sortBy: string;
  onSortChange: (value: string) => void;
}

const statusOptions = [
  { id: "all", label: "Tous les statuts" },
  { id: "active", label: "Actives" },
  { id: "paused", label: "En pause" },
  { id: "archived", label: "Archivées" },
];

const sortOptions = [
  { id: "ctr_desc", label: "Meilleur CTR" },
  { id: "ctr_asc", label: "Plus faible CTR" },
  { id: "impressions", label: "Plus d'impressions" },
  { id: "clicks", label: "Plus de clics" },
  { id: "spend", label: "Plus de dépenses" },
];

export const CreativeLibraryFilters = ({
  statusFilter,
  onStatusChange,
  sortBy,
  onSortChange,
}: CreativeLibraryFiltersProps) => {
  const getStatusLabel = () => statusOptions.find((o) => o.id === statusFilter)?.label || "Statut";
  const getSortLabel = () => sortOptions.find((o) => o.id === sortBy)?.label || "Trier par";

  return (
    <div className="flex items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="bg-secondary/50 border-border/50 text-sm">
            <Filter className="w-4 h-4 mr-2" />
            {getStatusLabel()}
            <ChevronDown className="w-3.5 h-3.5 ml-2" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {statusOptions.map((option) => (
            <DropdownMenuItem
              key={option.id}
              onClick={() => onStatusChange(option.id)}
              className={statusFilter === option.id ? "bg-accent" : ""}
            >
              {option.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="bg-secondary/50 border-border/50 text-sm">
            <SortDesc className="w-4 h-4 mr-2" />
            {getSortLabel()}
            <ChevronDown className="w-3.5 h-3.5 ml-2" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {sortOptions.map((option) => (
            <DropdownMenuItem
              key={option.id}
              onClick={() => onSortChange(option.id)}
              className={sortBy === option.id ? "bg-accent" : ""}
            >
              {option.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
