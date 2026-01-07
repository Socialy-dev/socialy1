import { Check, Circle } from "lucide-react";
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
  { label: "All", count: 10 },
  { label: "Important", count: null },
  { label: "Notes", count: 5 },
  { label: "Links", count: 10 },
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
  const [activeTab, setActiveTab] = useState("All");

  return (
    <div className="glass-card rounded-2xl p-6 h-full">
      <h3 className="text-lg font-bold text-foreground mb-4">Today task</h3>
      
      {/* Tabs */}
      <div className="flex gap-6 mb-6 border-b border-border/30">
        {tabs.map((tab) => (
          <button
            key={tab.label}
            onClick={() => setActiveTab(tab.label)}
            className={cn(
              "pb-3 text-sm font-medium relative flex items-center gap-1.5 transition-colors",
              activeTab === tab.label
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {tab.label}
            {tab.count !== null && (
              <span className={cn(
                "text-xs px-1.5 py-0.5 rounded",
                activeTab === tab.label
                  ? "bg-primary/10 text-primary"
                  : "bg-muted text-muted-foreground"
              )}>
                {tab.count}
              </span>
            )}
            {activeTab === tab.label && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-foreground rounded-full" />
            )}
          </button>
        ))}
      </div>

      {/* Task List */}
      <ul className="space-y-4">
        {tasks.map((task) => (
          <li key={task.id} className="flex items-start gap-3">
            <button
              className={cn(
                "w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors",
                task.completed
                  ? "bg-primary border-primary"
                  : "border-muted-foreground hover:border-primary"
              )}
            >
              {task.completed && <Check className="w-3 h-3 text-primary-foreground" />}
            </button>
            <div className="flex-1 flex items-center justify-between gap-4">
              <p className="text-sm text-foreground leading-relaxed">{task.title}</p>
              <span className={cn(
                "px-3 py-1 text-xs font-medium rounded-full whitespace-nowrap flex-shrink-0",
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
