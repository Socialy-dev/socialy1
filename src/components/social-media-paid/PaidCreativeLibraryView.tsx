import { useState } from "react";
import { usePaidClients } from "@/hooks/usePaidClients";
import { useCreativesWithInsights } from "@/hooks/useCreativesWithInsights";
import { PaidClientFilter } from "./PaidClientFilter";
import { PaidPlatformFilter } from "./PaidPlatformFilter";
import { CreativeLibraryFilters } from "./CreativeLibraryFilters";
import { CreativeLibraryCard } from "./CreativeLibraryCard";
import { Skeleton } from "@/components/ui/skeleton";
import type { PaidPlatform } from "./PaidDashboardView";

export const PaidCreativeLibraryView = () => {
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [selectedPlatform, setSelectedPlatform] = useState<PaidPlatform>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("ctr_desc");

  const { clients, isLoading: clientsLoading } = usePaidClients();
  const { creatives, isLoading: creativesLoading } = useCreativesWithInsights(
    selectedClientId,
    selectedPlatform,
    statusFilter,
    sortBy
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-3">
          <PaidClientFilter
            clients={clients}
            selectedClientId={selectedClientId}
            onSelect={setSelectedClientId}
            isLoading={clientsLoading}
          />
          <PaidPlatformFilter
            selectedPlatform={selectedPlatform}
            onSelect={setSelectedPlatform}
          />
        </div>
        <CreativeLibraryFilters
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
          sortBy={sortBy}
          onSortChange={setSortBy}
        />
      </div>

      {creativesLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <Skeleton key={i} className="h-80 rounded-2xl" />
          ))}
        </div>
      ) : creatives.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-6">
            <span className="text-4xl">🎨</span>
          </div>
          <h3 className="text-xl font-semibold text-foreground mb-2">
            Aucune création publicitaire
          </h3>
          <p className="text-sm text-muted-foreground max-w-md">
            Les créations publicitaires avec leurs performances apparaîtront ici une fois synchronisées depuis vos comptes publicitaires.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {creatives.map((creative) => (
            <CreativeLibraryCard key={creative.id} creative={creative} />
          ))}
        </div>
      )}
    </div>
  );
};
