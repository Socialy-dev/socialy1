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
import { AIAssistant } from "@/components/dashboard/AIAssistant";
import { cn } from "@/lib/utils";
import { Sparkles } from "lucide-react";

const Dashboard = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [aiAssistantOpen, setAiAssistantOpen] = useState(false);
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
          "md:ml-20 lg:ml-72",
          sidebarCollapsed ? "md:ml-20" : "lg:ml-72"
        )}
      >
        {/* Header - Fixed top, adapts to sidebar */}
        <Header sidebarCollapsed={sidebarCollapsed} />

        {/* Scrollable Content */}
        <main className="flex-1 p-4 md:p-6 pt-4 overflow-y-auto">
          <div className="max-w-[1600px] mx-auto space-y-6">
            {/* Overview Stats */}
            <OverviewCards />

            {/* Middle Section - Bento Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              <div className="md:col-span-2 lg:col-span-2">
                <ProjectSummary />
              </div>
              <div className="md:col-span-2 lg:col-span-1">
                <OverallProgress />
              </div>
            </div>

            {/* Bottom Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <TodayTask />
              <ProjectsWorkload />
            </div>
          </div>
        </main>
      </div>

      {/* AI Assistant - Floating Button */}
      <button
        onClick={() => setAiAssistantOpen(true)}
        className="fixed bottom-4 right-4 md:bottom-8 md:right-8 w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-gradient-to-br from-primary to-violet-600 text-white shadow-2xl shadow-primary/40 hover:shadow-3xl hover:shadow-primary/50 hover:scale-110 transition-all duration-300 flex items-center justify-center z-30 group"
        title="Open AI Assistant"
      >
        <Sparkles className="w-5 h-5 md:w-6 md:h-6 group-hover:rotate-12 transition-transform duration-300" />
        <span className="absolute -top-1 -right-1 w-3 h-3 md:w-4 md:h-4 bg-success rounded-full border-2 border-background animate-pulse" />
      </button>

      {/* AI Assistant Panel */}
      <AIAssistant isOpen={aiAssistantOpen} onClose={() => setAiAssistantOpen(false)} />
    </div>
  );
};

export default Dashboard;
