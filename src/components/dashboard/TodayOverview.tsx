import { Calendar, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export const TodayOverview = () => {
    const tasks = [
        { id: 1, title: "Review LinkedIn campaign performance", status: "completed", time: "09:00 AM", priority: "high" },
        { id: 2, title: "Team meeting - Q1 strategy", status: "in-progress", time: "11:30 AM", priority: "high" },
        { id: 3, title: "Update client presentation", status: "pending", time: "02:00 PM", priority: "medium" },
        { id: 4, title: "Review press releases", status: "pending", time: "04:00 PM", priority: "low" },
    ];

    const getStatusColor = (status: string) => {
        switch (status) {
            case "completed": return "text-success bg-success/10";
            case "in-progress": return "text-primary bg-primary/10";
            case "pending": return "text-muted-foreground bg-secondary";
            default: return "text-muted-foreground bg-secondary";
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case "high": return "bg-danger";
            case "medium": return "bg-warning";
            case "low": return "bg-success";
            default: return "bg-muted";
        }
    };

    return (
        <div className="rounded-3xl bg-card border border-border p-6 shadow-sm hover:shadow-lg hover:shadow-black/5 dark:hover:shadow-black/20 transition-all duration-300">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-violet-600 flex items-center justify-center shadow-lg shadow-primary/30">
                        <Calendar className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-foreground">Today's Tasks</h3>
                        <p className="text-sm text-muted-foreground">
                            {tasks.filter(t => t.status === "completed").length} of {tasks.length} completed
                        </p>
                    </div>
                </div>
                <button className="text-sm font-medium text-primary hover:text-primary/80 transition-colors">
                    View all
                </button>
            </div>

            {/* Progress Bar */}
            <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-muted-foreground">Daily Progress</span>
                    <span className="text-xs font-bold text-foreground">
                        {Math.round((tasks.filter(t => t.status === "completed").length / tasks.length) * 100)}%
                    </span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-primary to-violet-600 rounded-full transition-all duration-500"
                        style={{ width: `${(tasks.filter(t => t.status === "completed").length / tasks.length) * 100}%` }}
                    />
                </div>
            </div>

            {/* Tasks List */}
            <div className="space-y-3">
                {tasks.map((task) => (
                    <div
                        key={task.id}
                        className="group flex items-center gap-3 p-3 rounded-2xl hover:bg-secondary/50 transition-all duration-200 cursor-pointer"
                    >
                        {/* Priority Indicator */}
                        <div className={cn("w-1 h-8 rounded-full", getPriorityColor(task.priority))} />

                        {/* Status Icon */}
                        <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center transition-colors", getStatusColor(task.status))}>
                            {task.status === "completed" ? (
                                <CheckCircle2 className="w-4 h-4" />
                            ) : task.status === "in-progress" ? (
                                <Clock className="w-4 h-4" />
                            ) : (
                                <AlertCircle className="w-4 h-4" />
                            )}
                        </div>

                        {/* Task Info */}
                        <div className="flex-1 min-w-0">
                            <p className={cn(
                                "text-sm font-medium truncate",
                                task.status === "completed" ? "line-through text-muted-foreground" : "text-foreground"
                            )}>
                                {task.title}
                            </p>
                            <p className="text-xs text-muted-foreground">{task.time}</p>
                        </div>

                        {/* Action */}
                        <button className="opacity-0 group-hover:opacity-100 w-6 h-6 rounded-lg hover:bg-background flex items-center justify-center transition-all">
                            <span className="text-xs">→</span>
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};
