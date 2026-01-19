import { cn } from "@/lib/utils";

type TabType = "organique" | "concurrents" | "clients" | "suggestions";

interface SocialMediaTabsProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

const tabs = [
  { id: "organique" as TabType, label: "Organique" },
  { id: "concurrents" as TabType, label: "Concurrents" },
  { id: "clients" as TabType, label: "Clients" },
  { id: "suggestions" as TabType, label: "Suggestions" }
];

export const SocialMediaTabs = ({ activeTab, onTabChange }: SocialMediaTabsProps) => {
  return (
    <div className="flex items-center gap-1 p-1 bg-secondary/30 rounded-2xl border border-border/30 w-fit">
      {tabs.map((tab) => {
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
            {tab.label}
          </button>
        );
      })}
    </div>
  );
};

export type { TabType };
