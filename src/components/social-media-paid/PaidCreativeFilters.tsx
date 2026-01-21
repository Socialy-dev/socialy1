import { ChevronDown, Filter, SortDesc } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

interface PaidCreativeFiltersProps {
  statusFilter: string;
  onStatusChange: (value: string) => void;
  formatFilter: string;
  onFormatChange: (value: string) => void;
  sortBy: string;
  onSortChange: (value: string) => void;
}

const statusOptions = [
  { id: "all", label: "Tous les statuts" },
  { id: "active", label: "Actif" },
  { id: "paused", label: "En pause" },
  { id: "archived", label: "Archivé" },
];

const formatOptions = [
  { id: "all", label: "Tous les formats" },
  { id: "image", label: "Image" },
  { id: "video", label: "Vidéo" },
  { id: "carousel", label: "Carrousel" },
];

const sortOptions = [
  { id: "performance", label: "Meilleure performance" },
  { id: "impressions", label: "Impressions" },
  { id: "clicks", label: "Clics" },
  { id: "spend", label: "Dépenses" },
  { id: "recent", label: "Plus récent" },
];

export const PaidCreativeFilters = ({
  statusFilter,
  onStatusChange,
  formatFilter,
  onFormatChange,
  sortBy,
  onSortChange,
}: PaidCreativeFiltersProps) => {
  const selectedStatus = statusOptions.find((s) => s.id === statusFilter);
  const selectedFormat = formatOptions.find((f) => f.id === formatFilter);
  const selectedSort = sortOptions.find((s) => s.id === sortBy);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="bg-secondary/50 border-border/50 hover:bg-secondary"
          >
            <Filter className="w-3.5 h-3.5 mr-2" />
            {selectedStatus?.label || "Statut"}
            <ChevronDown className="w-3.5 h-3.5 ml-2" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          {statusOptions.map((option) => (
            <DropdownMenuItem
              key={option.id}
              onClick={() => onStatusChange(option.id)}
            >
              {option.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="bg-secondary/50 border-border/50 hover:bg-secondary"
          >
            <Filter className="w-3.5 h-3.5 mr-2" />
            {selectedFormat?.label || "Format"}
            <ChevronDown className="w-3.5 h-3.5 ml-2" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          {formatOptions.map((option) => (
            <DropdownMenuItem
              key={option.id}
              onClick={() => onFormatChange(option.id)}
            >
              {option.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="bg-secondary/50 border-border/50 hover:bg-secondary"
          >
            <SortDesc className="w-3.5 h-3.5 mr-2" />
            {selectedSort?.label || "Trier par"}
            <ChevronDown className="w-3.5 h-3.5 ml-2" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          {sortOptions.map((option) => (
            <DropdownMenuItem
              key={option.id}
              onClick={() => onSortChange(option.id)}
            >
              {option.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};
