import { cn } from "@/lib/utils";
import { BarChart3, Users, Lightbulb, Briefcase } from "lucide-react";

type TabType = "organique" | "concurrents" | "clients" | "suggestions";

interface SocialMediaTabsProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

const tabs = [
  { id: "organique" as TabType, label: "Organique", icon: BarChart3 },
  { id: "concurrents" as TabType, label: "Concurrents", icon: Users },
  { id: "clients" as TabType, label: "Clients", icon: Briefcase },
  { id: "suggestions" as TabType, label: "Suggestions", icon: Lightbulb }
];

export const SocialMediaTabs = ({ activeTab, onTabChange }: SocialMediaTabsProps) => {
  return (
    <div className="flex items-center gap-1 p-1 bg-secondary/30 rounded-2xl border border-border/30 w-fit">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
              isActive
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-card/50"
            )}
          >
            <Icon className="w-4 h-4" />
            {tab.label}
          </button>
        );
      })}
    </div>
  );
};

export type { TabType };
