import { useState } from "react";
import { cn } from "@/lib/utils";
import { Plus, Sparkles, Upload, Search } from "lucide-react";
import { useCreativeLibraryInspirations } from "@/hooks/useCreativeLibraryInspirations";
import { usePinterestCreatives } from "@/hooks/usePinterestCreatives";
import { PaidPlatformFilter } from "./PaidPlatformFilter";
import { InspirationCard } from "./InspirationCard";
import { PinterestCreativeCard } from "./PinterestCreativeCard";
import { AddInspirationModal } from "./AddInspirationModal";
import { SearchCreativesModal } from "./SearchCreativesModal";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import type { PaidPlatform } from "./PaidDashboardView";

type LibrarySection = "scraped" | "manual";

export const PaidCreativeLibraryView = () => {
  const [activeSection, setActiveSection] = useState<LibrarySection>("scraped");
  const [selectedPlatform, setSelectedPlatform] = useState<PaidPlatform>("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);

  const {
    creatives: pinterestCreatives,
    isLoading: pinterestLoading,
    deleteCreative: deletePinterest,
  } = usePinterestCreatives();

  const {
    inspirations: manualInspirations,
    isLoading: manualLoading,
    deleteInspiration: deleteManual,
  } = useCreativeLibraryInspirations("manual", selectedPlatform === "all" ? "all" : selectedPlatform);

  const handleDeletePinterest = (id: string) => {
    deletePinterest.mutate(id);
  };

  const handleDeleteManual = (id: string) => {
    deleteManual.mutate(id);
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
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          <Sparkles className="w-4 h-4" />
          Les créations
        </button>
        <button
          onClick={() => setActiveSection("manual")}
          className={cn(
            "flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
            activeSection === "manual"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground",
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
            </div>
            <Button
              onClick={() => setShowSearchModal(true)}
              className="gap-2 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700"
            >
              <Search className="w-4 h-4" />
              Rechercher des créas
            </Button>
          </div>

          {pinterestLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <Skeleton key={i} className="aspect-[3/4] rounded-2xl" />
              ))}
            </div>
          ) : pinterestCreatives.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-rose-500/20 to-pink-500/10 flex items-center justify-center mb-6">
                <Sparkles className="w-10 h-10 text-rose-500" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Aucune création Pinterest</h3>
              <p className="text-sm text-muted-foreground max-w-md mb-6">
                Recherchez des créations sur Pinterest pour les ajouter à votre librairie.
              </p>
              <Button
                onClick={() => setShowSearchModal(true)}
                className="gap-2 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700"
              >
                <Search className="w-4 h-4" />
                Rechercher des créas
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {pinterestCreatives.map((creative) => (
                <PinterestCreativeCard 
                  key={creative.id} 
                  creative={creative} 
                  onDelete={handleDeletePinterest} 
                />
              ))}
            </div>
          )}
        </>
      ) : (
        <>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap gap-3">
              <PaidPlatformFilter selectedPlatform={selectedPlatform} onSelect={setSelectedPlatform} />
            </div>
            <Button onClick={() => setShowAddModal(true)} className="gap-2">
              <Plus className="w-4 h-4" />
              Ajouter une inspiration
            </Button>
          </div>

          {manualLoading ? (
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
              <h3 className="text-xl font-semibold text-foreground mb-2">Aucune inspiration ajoutée</h3>
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
                <InspirationCard key={inspiration.id} inspiration={inspiration} onDelete={handleDeleteManual} />
              ))}
            </div>
          )}
        </>
      )}

      <AddInspirationModal isOpen={showAddModal} onClose={() => setShowAddModal(false)} />
      <SearchCreativesModal isOpen={showSearchModal} onClose={() => setShowSearchModal(false)} />
    </div>
  );
};
