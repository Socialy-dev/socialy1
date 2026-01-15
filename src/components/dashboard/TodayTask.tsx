import { Check, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface Task {
  id: number;
  title: string;
  status: "Approved" | "In review" | "On going";
  completed: boolean;
}

const tasks: Task[] = [
  { id: 1, title: "Create a user flow of social application design", status: "Approved", completed: true },
  { id: 2, title: "Create a user flow of social application design", status: "In review", completed: true },
  { id: 3, title: "Landing page design for Fintech project of singapore", status: "In review", completed: true },
  { id: 4, title: "Interactive prototype for app screens of deltamine project", status: "On going", completed: false },
  { id: 5, title: "Interactive prototype for app screens of deltamine project", status: "Approved", completed: true },
];

const tabs = [
  { label: "Tout", count: 10 },
  { label: "Important", count: null },
  { label: "Notes", count: 5 },
  { label: "Liens", count: 10 },
];

const getStatusStyles = (status: Task["status"]) => {
  switch (status) {
    case "Approved":
      return "bg-success/10 text-success";
    case "In review":
      return "bg-warning/10 text-warning";
    case "On going":
      return "bg-primary/10 text-primary";
  }
};

export const TodayTask = () => {
  const [activeTab, setActiveTab] = useState("Tout");

  return (
    <div className="bg-card rounded-2xl border border-border/50 p-6 h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-lg font-bold text-foreground">Tâches du jour</h3>
        <button className="w-8 h-8 rounded-lg hover:bg-secondary/50 flex items-center justify-center transition-colors">
          <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-5 p-1 bg-secondary/30 rounded-xl">
        {tabs.map((tab) => (
          <button
            key={tab.label}
            onClick={() => setActiveTab(tab.label)}
            className={cn(
              "px-3 py-2 text-xs font-medium rounded-lg flex items-center gap-1.5 transition-all duration-200",
              activeTab === tab.label
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {tab.label}
            {tab.count !== null && (
              <span className={cn(
                "text-[10px] px-1.5 py-0.5 rounded-md font-semibold",
                activeTab === tab.label
                  ? "bg-primary/10 text-primary"
                  : "bg-muted/50 text-muted-foreground"
              )}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Task List */}
      <ul className="space-y-2">
        {tasks.map((task) => (
          <li
            key={task.id}
            className="flex items-start gap-3 p-3 rounded-xl bg-secondary/20 hover:bg-secondary/40 transition-all duration-200 group cursor-pointer"
          >
            <button
              className={cn(
                "w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all duration-200",
                task.completed
                  ? "bg-primary border-primary"
                  : "border-border/60 hover:border-primary group-hover:border-primary/50"
              )}
            >
              {task.completed && <Check className="w-3 h-3 text-white" />}
            </button>
            <div className="flex-1 flex items-start justify-between gap-3 min-w-0">
              <p className={cn(
                "text-sm text-foreground leading-relaxed font-medium line-clamp-2",
                task.completed && "text-muted-foreground"
              )}>
                {task.title}
              </p>
              <span className={cn(
                "px-2 py-1 text-[10px] font-semibold rounded-md whitespace-nowrap flex-shrink-0",
                getStatusStyles(task.status)
              )}>
                {task.status}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};
