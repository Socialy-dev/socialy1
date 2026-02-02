import { useState } from "react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Header } from "@/components/dashboard/Header";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Library } from "lucide-react";
import { PaidDashboardView } from "@/components/social-media-paid/PaidDashboardView";
import { PaidCreativesView } from "@/components/social-media-paid/PaidCreativesView";
import { PaidDetailedPerformanceView } from "@/components/social-media-paid/PaidDetailedPerformanceView";
import { PaidCreativeLibraryView } from "@/components/social-media-paid/PaidCreativeLibraryView";

type MainTab = "dashboard" | "library";
type DashboardSubTab = "global" | "detailed" | "creatives";

const SocialMediaPaid = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mainTab, setMainTab] = useState<MainTab>("dashboard");
  const [dashboardSubTab, setDashboardSubTab] = useState<DashboardSubTab>("global");

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      <div
        className={cn(
          "flex-1 flex flex-col min-h-screen content-transition overflow-x-hidden",
          sidebarCollapsed ? "ml-20" : "ml-72"
        )}
      >
        <Header showTitle={false} sidebarCollapsed={sidebarCollapsed} />

        <main className="flex-1 p-6 overflow-y-auto overflow-x-hidden">
          <div className="max-w-[1600px] mx-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-xl font-bold text-foreground mb-1">
                  Social Media Paid
                </h1>
                <p className="text-sm text-muted-foreground">
                  Gérez vos campagnes publicitaires multi-clients
                </p>
              </div>
            </div>

            <div className="flex gap-2 mb-6">
              <button
                onClick={() => setMainTab("dashboard")}
                className={cn(
                  "flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                  mainTab === "dashboard"
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                    : "bg-secondary/50 text-muted-foreground hover:text-foreground hover:bg-secondary"
                )}
              >
                <LayoutDashboard className="w-4 h-4" />
                Dashboard Client
              </button>
              <button
                onClick={() => setMainTab("library")}
                className={cn(
                  "flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                  mainTab === "library"
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                    : "bg-secondary/50 text-muted-foreground hover:text-foreground hover:bg-secondary"
                )}
              >
                <Library className="w-4 h-4" />
                Librairie de Création
              </button>
            </div>

            {mainTab === "dashboard" && (
              <>
                <div className="flex gap-1.5 mb-6 p-1 bg-muted/30 rounded-xl w-fit">
                  <button
                    onClick={() => setDashboardSubTab("global")}
                    className={cn(
                      "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                      dashboardSubTab === "global"
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    Performance Global
                  </button>
                  <button
                    onClick={() => setDashboardSubTab("detailed")}
                    className={cn(
                      "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                      dashboardSubTab === "detailed"
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    Performance Détaillée
                  </button>
                  <button
                    onClick={() => setDashboardSubTab("creatives")}
                    className={cn(
                      "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                      dashboardSubTab === "creatives"
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    Créations Publicitaires
                  </button>
                </div>

                {dashboardSubTab === "global" && <PaidDashboardView />}
                {dashboardSubTab === "detailed" && <PaidDetailedPerformanceView />}
                {dashboardSubTab === "creatives" && <PaidCreativesView />}
              </>
            )}

            {mainTab === "library" && <PaidCreativeLibraryView />}
          </div>
        </main>
      </div>
    </div>
  );
};

export default SocialMediaPaid;
