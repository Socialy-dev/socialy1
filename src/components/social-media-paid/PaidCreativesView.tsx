import { useState } from "react";
import { cn } from "@/lib/utils";
import { usePaidClients } from "@/hooks/usePaidClients";
import { usePaidCreatives } from "@/hooks/usePaidCreatives";
import { PaidClientFilter } from "./PaidClientFilter";
import { PaidCreativeCard } from "./PaidCreativeCard";
import { PaidCreativeFilters } from "./PaidCreativeFilters";
import { Skeleton } from "@/components/ui/skeleton";

type PlatformTab = "meta" | "google" | "linkedin" | "pinterest" | "tiktok";

const platformTabs: { id: PlatformTab; label: string }[] = [
  { id: "meta", label: "Meta Ads" },
  { id: "google", label: "Google Ads" },
  { id: "linkedin", label: "LinkedIn Ads" },
  { id: "pinterest", label: "Pinterest Ads" },
  { id: "tiktok", label: "TikTok Ads" },
];

export const PaidCreativesView = () => {
  const [activePlatform, setActivePlatform] = useState<PlatformTab>("meta");
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [formatFilter, setFormatFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("performance");

  const { clients, isLoading: clientsLoading } = usePaidClients();
  const { creatives, isLoading: creativesLoading } = usePaidCreatives(
    activePlatform,
    selectedClientId,
    statusFilter,
    formatFilter,
    sortBy
  );

  return (
    <div className="space-y-6">
      <div className="flex gap-2 overflow-x-auto pb-2">
        {platformTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActivePlatform(tab.id)}
            className={cn(
              "px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-200",
              activePlatform === tab.id
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                : "bg-secondary/50 text-muted-foreground hover:text-foreground hover:bg-secondary"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <PaidClientFilter
          clients={clients}
          selectedClientId={selectedClientId}
          onSelect={setSelectedClientId}
          isLoading={clientsLoading}
        />
        <PaidCreativeFilters
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
          formatFilter={formatFilter}
          onFormatChange={setFormatFilter}
          sortBy={sortBy}
          onSortChange={setSortBy}
        />
      </div>

      {creativesLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <Skeleton key={i} className="h-80 rounded-2xl" />
          ))}
        </div>
      ) : creatives.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 rounded-2xl bg-secondary/50 flex items-center justify-center mb-4">
            <span className="text-2xl">🎨</span>
          </div>
          <h3 className="text-lg font-medium text-foreground mb-2">
            Aucune création publicitaire
          </h3>
          <p className="text-sm text-muted-foreground max-w-md">
            Les créations publicitaires apparaîtront ici une fois que les données seront synchronisées depuis vos comptes publicitaires.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {creatives.map((creative) => (
            <PaidCreativeCard key={creative.id} creative={creative} />
          ))}
        </div>
      )}
    </div>
  );
};
