import { useState } from "react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Header } from "@/components/dashboard/Header";
import { OverviewCards } from "@/components/dashboard/OverviewCards";
import { ProjectSummary } from "@/components/dashboard/ProjectSummary";
import { OverallProgress } from "@/components/dashboard/OverallProgress";
import { TodayTask } from "@/components/dashboard/TodayTask";
import { ProjectsWorkload } from "@/components/dashboard/ProjectsWorkload";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";

const Index = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Sidebar collapsed={sidebarCollapsed} />
      
      {/* Toggle Button - Outside sidebar to avoid overflow clipping */}
      <button
        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
        className={cn(
          "fixed top-7 w-7 h-7 bg-white rounded-full border-2 border-gray-200 flex items-center justify-center shadow-lg hover:bg-gray-100 transition-all duration-300 z-[100]",
          sidebarCollapsed ? "left-[68px]" : "left-[252px]"
        )}
      >
        {sidebarCollapsed ? (
          <ChevronRight className="w-4 h-4 text-foreground" />
        ) : (
          <ChevronLeft className="w-4 h-4 text-foreground" />
        )}
      </button>
      
      <main
        className={cn(
          "min-h-screen p-8 content-transition",
          sidebarCollapsed ? "ml-20" : "ml-64"
        )}
      >
        <Header />
        
        <OverviewCards />
        
        {/* Middle Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2">
            <ProjectSummary />
          </div>
          <div className="lg:col-span-1">
            <OverallProgress />
          </div>
        </div>
        
        {/* Bottom Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TodayTask />
          <ProjectsWorkload />
        </div>
      </main>
    </div>
  );
};

export default Index;
