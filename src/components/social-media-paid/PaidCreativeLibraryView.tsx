import { useState } from "react";
import { cn } from "@/lib/utils";
import { Plus, Sparkles, Upload } from "lucide-react";
import { usePaidClients } from "@/hooks/usePaidClients";
import { useCreativesWithInsights } from "@/hooks/useCreativesWithInsights";
import { useCreativeLibraryInspirations } from "@/hooks/useCreativeLibraryInspirations";
import { PaidClientFilter } from "./PaidClientFilter";
import { PaidPlatformFilter } from "./PaidPlatformFilter";
import { CreativeLibraryFilters } from "./CreativeLibraryFilters";
import { CreativeLibraryCard } from "./CreativeLibraryCard";
import { InspirationCard } from "./InspirationCard";
import { AddInspirationModal } from "./AddInspirationModal";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import type { PaidPlatform } from "./PaidDashboardView";

type LibrarySection = "scraped" | "manual";

export const PaidCreativeLibraryView = () => {
  const [activeSection, setActiveSection] = useState<LibrarySection>("scraped");
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [selectedPlatform, setSelectedPlatform] = useState<PaidPlatform>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("ctr_desc");
  const [showAddModal, setShowAddModal] = useState(false);

  const { clients, isLoading: clientsLoading } = usePaidClients();
  const { creatives, isLoading: creativesLoading } = useCreativesWithInsights(
    selectedClientId,
    selectedPlatform,
    statusFilter,
    sortBy
  );
  const {
    inspirations: manualInspirations,
    isLoading: inspirationsLoading,
    deleteInspiration,
  } = useCreativeLibraryInspirations("manual", selectedPlatform === "all" ? "all" : selectedPlatform);

  const handleDeleteInspiration = (id: string) => {
    deleteInspiration.mutate(id);
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-2 p-1 bg-muted/30 rounded-xl w-fit">
        <button
          onClick={() => setActiveSection("scraped")}
          className={cn(
            "flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
            activeSection === "scraped"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Sparkles className="w-4 h-4" />
          Créas Scrapées
        </button>
        <button
          onClick={() => setActiveSection("manual")}
          className={cn(
            "flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
            activeSection === "manual"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Upload className="w-4 h-4" />
          Mes Inspirations
        </button>
      </div>

      {activeSection === "scraped" ? (
        <>
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
                <Sparkles className="w-10 h-10 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Aucune création scrapée
              </h3>
              <p className="text-sm text-muted-foreground max-w-md">
                Les créations publicitaires scrapées depuis Meta Ads Library, Google Ads etc. apparaîtront ici.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {creatives.map((creative) => (
                <CreativeLibraryCard key={creative.id} creative={creative} />
              ))}
            </div>
          )}
        </>
      ) : (
        <>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap gap-3">
              <PaidPlatformFilter
                selectedPlatform={selectedPlatform}
                onSelect={setSelectedPlatform}
              />
            </div>
            <Button onClick={() => setShowAddModal(true)} className="gap-2">
              <Plus className="w-4 h-4" />
              Ajouter une inspiration
            </Button>
          </div>

          {inspirationsLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-80 rounded-2xl" />
              ))}
            </div>
          ) : manualInspirations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-6">
                <Upload className="w-10 h-10 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Aucune inspiration ajoutée
              </h3>
              <p className="text-sm text-muted-foreground max-w-md mb-6">
                Ajoutez vos propres inspirations créatives pour les retrouver facilement.
              </p>
              <Button onClick={() => setShowAddModal(true)} className="gap-2">
                <Plus className="w-4 h-4" />
                Ajouter une inspiration
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {manualInspirations.map((inspiration) => (
                <InspirationCard
                  key={inspiration.id}
                  inspiration={inspiration}
                  onDelete={handleDeleteInspiration}
                />
              ))}
            </div>
          )}
        </>
      )}

      <AddInspirationModal isOpen={showAddModal} onClose={() => setShowAddModal(false)} />
    </div>
  );
};
