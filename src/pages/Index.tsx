import { useState } from "react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Header } from "@/components/dashboard/Header";
import { OverviewCards } from "@/components/dashboard/OverviewCards";
import { ProjectSummary } from "@/components/dashboard/ProjectSummary";
import { OverallProgress } from "@/components/dashboard/OverallProgress";
import { TodayTask } from "@/components/dashboard/TodayTask";
import { ProjectsWorkload } from "@/components/dashboard/ProjectsWorkload";
import { cn } from "@/lib/utils";

const Index = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Sidebar 
        collapsed={sidebarCollapsed} 
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} 
      />
      
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
