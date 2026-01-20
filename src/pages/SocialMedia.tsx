import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Header } from "@/components/dashboard/Header";
import { cn } from "@/lib/utils";
import { Calendar, ChevronDown } from "lucide-react";
import { SocialMediaTabs, TabType } from "@/components/social-media/SocialMediaTabs";
import { OrganicView } from "@/components/social-media/OrganicView";
import { CompetitorsView } from "@/components/social-media/CompetitorsView";
import { ClientsView } from "@/components/social-media/ClientsView";
import { SuggestionsView } from "@/components/social-media/SuggestionsView";
import { Platform } from "@/components/social-media/PlatformDropdown";

const SocialMedia = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>("organique");
  const [selectedPlatform, setSelectedPlatform] = useState<Platform>("global");

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab === "concurrents" || tab === "clients" || tab === "suggestions" || tab === "organique") {
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
          "flex-1 flex flex-col min-h-screen content-transition overflow-x-hidden",
          "md:ml-20 lg:ml-72",
          sidebarCollapsed ? "md:ml-20" : "lg:ml-72"
        )}
      >
        <Header showTitle={false} sidebarCollapsed={sidebarCollapsed} />

        <main className="flex-1 p-4 md:p-6 overflow-y-auto overflow-x-hidden">
          <div className="max-w-[1600px] mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div>
                <h1 className="text-lg md:text-xl font-bold text-foreground mb-1">
                  Social Media
                </h1>
                <p className="text-xs md:text-sm text-muted-foreground">
                  Performances et analyses de vos réseaux sociaux
                </p>
              </div>

              <button className="flex items-center gap-2 px-3 py-1.5 text-xs md:text-sm font-medium text-muted-foreground hover:text-foreground bg-secondary/50 border border-border/50 rounded-xl hover:bg-secondary transition-all duration-200 self-start md:self-auto">
                <Calendar className="w-3.5 h-3.5 md:w-4 md:h-4" />
                <span className="whitespace-nowrap">30 derniers jours</span>
                <ChevronDown className="w-3 h-3 md:w-3.5 md:h-3.5" />
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

            {activeTab === "clients" && (
              <ClientsView 
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
