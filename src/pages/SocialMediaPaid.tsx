import { useState } from "react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Header } from "@/components/dashboard/Header";
import { cn } from "@/lib/utils";
import { Calendar, ChevronDown, BarChart3, Image } from "lucide-react";
import { PaidDashboardView } from "@/components/social-media-paid/PaidDashboardView";
import { PaidCreativesView } from "@/components/social-media-paid/PaidCreativesView";

type PaidSection = "dashboard" | "creatives";

const SocialMediaPaid = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeSection, setActiveSection] = useState<PaidSection>("dashboard");

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

              <button className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground bg-secondary/50 border border-border/50 rounded-xl hover:bg-secondary transition-all duration-200">
                <Calendar className="w-4 h-4" />
                30 derniers jours
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex gap-2 mb-6">
              <button
                onClick={() => setActiveSection("dashboard")}
                className={cn(
                  "flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                  activeSection === "dashboard"
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                    : "bg-secondary/50 text-muted-foreground hover:text-foreground hover:bg-secondary"
                )}
              >
                <BarChart3 className="w-4 h-4" />
                Dashboards & Automatisation
              </button>
              <button
                onClick={() => setActiveSection("creatives")}
                className={cn(
                  "flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                  activeSection === "creatives"
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                    : "bg-secondary/50 text-muted-foreground hover:text-foreground hover:bg-secondary"
                )}
              >
                <Image className="w-4 h-4" />
                Créations Publicitaires
              </button>
            </div>

            {activeSection === "dashboard" && <PaidDashboardView />}
            {activeSection === "creatives" && <PaidCreativesView />}
          </div>
        </main>
      </div>
    </div>
  );
};

export default SocialMediaPaid;
