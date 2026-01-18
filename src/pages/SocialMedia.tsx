import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Header } from "@/components/dashboard/Header";
import { cn } from "@/lib/utils";
import { Calendar, ChevronDown } from "lucide-react";
import { SocialMediaTabs, TabType } from "@/components/social-media/SocialMediaTabs";
import { OrganicView } from "@/components/social-media/OrganicView";
import { CompetitorsView } from "@/components/social-media/CompetitorsView";
import { SuggestionsView } from "@/components/social-media/SuggestionsView";
import { Platform } from "@/components/social-media/PlatformDropdown";

const SocialMedia = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>("organique");
  const [selectedPlatform, setSelectedPlatform] = useState<Platform>("global");

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab === "concurrents" || tab === "suggestions" || tab === "organique") {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      <div
        className={cn(
          "flex-1 flex flex-col min-h-screen content-transition",
          sidebarCollapsed ? "ml-20" : "ml-72"
        )}
      >
        <Header showTitle={false} sidebarCollapsed={sidebarCollapsed} />

        <main className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-[1600px] mx-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-xl font-bold text-foreground mb-1">
                  Social Media
                </h1>
                <p className="text-sm text-muted-foreground">
                  Performances et analyses de vos réseaux sociaux
                </p>
              </div>

              <button className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground bg-secondary/50 border border-border/50 rounded-xl hover:bg-secondary transition-all duration-200">
                <Calendar className="w-4 h-4" />
                30 derniers jours
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="mb-6">
              <SocialMediaTabs activeTab={activeTab} onTabChange={handleTabChange} />
            </div>

            {activeTab === "organique" && (
              <OrganicView 
                selectedPlatform={selectedPlatform} 
                onPlatformChange={setSelectedPlatform} 
              />
            )}

            {activeTab === "concurrents" && (
              <CompetitorsView 
                selectedPlatform={selectedPlatform} 
                onPlatformChange={setSelectedPlatform} 
              />
            )}

            {activeTab === "suggestions" && (
              <SuggestionsView />
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default SocialMedia;
