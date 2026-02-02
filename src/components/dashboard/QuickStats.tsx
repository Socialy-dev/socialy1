import { TrendingUp, TrendingDown, DollarSign, Users, Target, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
    title: string;
    value: string;
    change: string;
    trend: "up" | "down";
    icon: React.ElementType;
    color: string;
}

const StatCard = ({ title, value, change, trend, icon: Icon, color }: StatCardProps) => {
    return (
        <div className="group relative overflow-hidden rounded-3xl bg-card border border-border p-6 hover:shadow-lg hover:shadow-black/5 dark:hover:shadow-black/20 transition-all duration-300">
            {/* Background Gradient */}
            <div className={cn(
                "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300",
                color
            )} />

            <div className="relative z-10">
                {/* Icon */}
                <div className={cn(
                    "w-12 h-12 rounded-2xl flex items-center justify-center mb-4 shadow-lg transition-transform duration-300 group-hover:scale-110",
                    color.replace('bg-gradient-to-br', 'bg-gradient-to-br')
                )}>
                    <Icon className="w-6 h-6 text-white" />
                </div>

                {/* Title */}
                <p className="text-sm text-muted-foreground font-medium mb-1">{title}</p>

                {/* Value */}
                <h3 className="text-3xl font-bold text-foreground mb-2">{value}</h3>

                {/* Change */}
                <div className="flex items-center gap-1.5">
                    {trend === "up" ? (
                        <TrendingUp className="w-4 h-4 text-success" />
                    ) : (
                        <TrendingDown className="w-4 h-4 text-danger" />
                    )}
                    <span className={cn(
                        "text-sm font-semibold",
                        trend === "up" ? "text-success" : "text-danger"
                    )}>
                        {change}
                    </span>
                    <span className="text-xs text-muted-foreground">vs last month</span>
                </div>
            </div>
        </div>
    );
};

export const QuickStats = () => {
    const stats = [
        {
            title: "Total Revenue",
            value: "$53,009",
            change: "+12%",
            trend: "up" as const,
            icon: DollarSign,
            color: "bg-gradient-to-br from-violet-500 to-purple-600"
        },
        {
            title: "Active Projects",
            value: "95",
            change: "-10%",
            trend: "down" as const,
            icon: Target,
            color: "bg-gradient-to-br from-emerald-500 to-teal-600"
        },
        {
            title: "Team Members",
            value: "1,022",
            change: "+8%",
            trend: "up" as const,
            icon: Users,
            color: "bg-gradient-to-br from-blue-500 to-cyan-600"
        },
        {
            title: "Hours Tracked",
            value: "101",
            change: "+2%",
            trend: "up" as const,
            icon: Clock,
            color: "bg-gradient-to-br from-orange-500 to-amber-600"
        }
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
                <StatCard key={index} {...stat} />
            ))}
        </div>
    );
};
