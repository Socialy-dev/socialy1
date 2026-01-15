import { Activity, FileText, Users, TrendingUp, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";

export const RecentActivity = () => {
    const activities = [
        {
            id: 1,
            type: "post",
            title: "New LinkedIn post published",
            description: "Label RSE Agences Actives campaign",
            time: "2 hours ago",
            icon: FileText,
            color: "from-blue-500 to-cyan-600"
        },
        {
            id: 2,
            type: "team",
            title: "New team member added",
            description: "Sophie Martin joined Growth Marketing",
            time: "5 hours ago",
            icon: Users,
            color: "from-violet-500 to-purple-600"
        },
        {
            id: 3,
            type: "analytics",
            title: "Campaign performance update",
            description: "+12% engagement this week",
            time: "1 day ago",
            icon: TrendingUp,
            color: "from-emerald-500 to-teal-600"
        },
        {
            id: 4,
            type: "comment",
            title: "New comment on article",
            description: "3 new comments on press release",
            time: "2 days ago",
            icon: MessageSquare,
            color: "from-orange-500 to-amber-600"
        }
    ];

    return (
        <div className="rounded-3xl bg-card border border-border p-6 shadow-sm hover:shadow-lg hover:shadow-black/5 dark:hover:shadow-black/20 transition-all duration-300">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-violet-600 flex items-center justify-center shadow-lg shadow-primary/30">
                        <Activity className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-foreground">Recent Activity</h3>
                        <p className="text-sm text-muted-foreground">Latest updates from your workspace</p>
                    </div>
                </div>
            </div>

            {/* Activity List */}
            <div className="space-y-4">
                {activities.map((activity, index) => (
                    <div key={activity.id} className="relative">
                        {/* Timeline Line */}
                        {index !== activities.length - 1 && (
                            <div className="absolute left-5 top-12 bottom-0 w-px bg-border" />
                        )}

                        {/* Activity Item */}
                        <div className="flex gap-4 group cursor-pointer">
                            {/* Icon */}
                            <div className={cn(
                                "relative z-10 w-10 h-10 rounded-xl flex items-center justify-center shadow-md transition-transform duration-300 group-hover:scale-110 bg-gradient-to-br",
                                activity.color
                            )}>
                                <activity.icon className="w-5 h-5 text-white" />
                            </div>

                            {/* Content */}
                            <div className="flex-1 pb-4">
                                <div className="flex items-start justify-between mb-1">
                                    <h4 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                                        {activity.title}
                                    </h4>
                                    <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                                        {activity.time}
                                    </span>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    {activity.description}
                                </p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* View All Button */}
            <button className="w-full mt-4 py-3 rounded-xl bg-secondary/50 hover:bg-secondary text-sm font-medium text-foreground transition-colors">
                View all activity
            </button>
        </div>
    );
};
