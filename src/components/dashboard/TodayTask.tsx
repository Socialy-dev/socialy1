import { Check } from "lucide-react";
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
      return "bg-success/10 text-success border-success/20";
    case "In review":
      return "bg-warning/10 text-warning border-warning/20";
    case "On going":
      return "bg-primary/10 text-primary border-primary/20";
  }
};

export const TodayTask = () => {
  const [activeTab, setActiveTab] = useState("All");

  return (
    <div className="glass-card p-6 h-full">
      <h3 className="text-lg font-bold text-foreground mb-5">Today task</h3>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 p-1 bg-secondary/50 rounded-xl">
        {tabs.map((tab) => (
          <button
            key={tab.label}
            onClick={() => setActiveTab(tab.label)}
            className={cn(
              "px-4 py-2.5 text-sm font-medium rounded-lg flex items-center gap-2 transition-all duration-200",
              activeTab === tab.label
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {tab.label}
            {tab.count !== null && (
              <span className={cn(
                "text-xs px-2 py-0.5 rounded-md font-semibold",
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
      <ul className="space-y-3">
        {tasks.map((task) => (
          <li
            key={task.id}
            className="flex items-start gap-4 p-4 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-all duration-200 group"
          >
            <button
              className={cn(
                "w-6 h-6 rounded-lg border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all duration-200",
                task.completed
                  ? "bg-primary border-primary"
                  : "border-border hover:border-primary group-hover:border-primary/50"
              )}
            >
              {task.completed && <Check className="w-3.5 h-3.5 text-white" />}
            </button>
            <div className="flex-1 flex items-center justify-between gap-4">
              <p className={cn(
                "text-sm text-foreground leading-relaxed font-medium",
                task.completed && "text-muted-foreground"
              )}>
                {task.title}
              </p>
              <span className={cn(
                "px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap flex-shrink-0 border",
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
