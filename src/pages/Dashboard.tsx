import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Header } from "@/components/dashboard/Header";
import { QuickStats } from "@/components/dashboard/QuickStats";
import { TodayOverview } from "@/components/dashboard/TodayOverview";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { ProjectSummary } from "@/components/dashboard/ProjectSummary";
import { OverallProgress } from "@/components/dashboard/OverallProgress";
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
          sidebarCollapsed ? "ml-20" : "ml-72"
        )}
      >
        {/* Header - Fixed top, adapts to sidebar */}
        <Header sidebarCollapsed={sidebarCollapsed} />

        {/* Scrollable Content */}
        <main className="flex-1 p-6 pt-4 overflow-y-auto">
          <div className="max-w-[1600px] mx-auto space-y-6">
            {/* Quick Stats - Top Section */}
            <QuickStats />

            {/* Main Grid - Bento Style */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - 2/3 width */}
              <div className="lg:col-span-2 space-y-6">
                <ProjectSummary />
                <TodayOverview />
              </div>

              {/* Right Column - 1/3 width */}
              <div className="lg:col-span-1 space-y-6">
                <OverallProgress />
                <RecentActivity />
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* AI Assistant - Floating Button */}
      <button
        onClick={() => setAiAssistantOpen(true)}
        className="fixed bottom-8 right-8 w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-violet-600 text-white shadow-2xl shadow-primary/40 hover:shadow-3xl hover:shadow-primary/50 hover:scale-110 transition-all duration-300 flex items-center justify-center z-30 group"
        title="Open AI Assistant"
      >
        <Sparkles className="w-6 h-6 group-hover:rotate-12 transition-transform duration-300" />
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-success rounded-full border-2 border-background animate-pulse" />
      </button>

      {/* AI Assistant Panel */}
      <AIAssistant isOpen={aiAssistantOpen} onClose={() => setAiAssistantOpen(false)} />
    </div>
  );
};

export default Dashboard;
