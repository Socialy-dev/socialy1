import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Header } from "@/components/dashboard/Header";
import { OverviewCards } from "@/components/dashboard/OverviewCards";
import { ProjectSummary } from "@/components/dashboard/ProjectSummary";
import { OverallProgress } from "@/components/dashboard/OverallProgress";
import { TodayTask } from "@/components/dashboard/TodayTask";
import { ProjectsWorkload } from "@/components/dashboard/ProjectsWorkload";
import { cn } from "@/lib/utils";

const Dashboard = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate("/auth");
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar - Fixed left */}
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />

      {/* Main Content Area */}
      <div
        className={cn(
          "flex-1 flex flex-col min-h-screen content-transition",
          sidebarCollapsed ? "ml-20" : "ml-72"
        )}
      >
        {/* Header - Fixed top, adapts to sidebar */}
        <Header sidebarCollapsed={sidebarCollapsed} />

        {/* Scrollable Content */}
        <main className="flex-1 p-6 pt-4 overflow-y-auto">
          <div className="max-w-[1600px] mx-auto space-y-6">
            {/* Overview Stats */}
            <OverviewCards />

            {/* Middle Section - Bento Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
