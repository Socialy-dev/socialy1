import { TrendingUp, TrendingDown, DollarSign, Briefcase, Clock, Users } from "lucide-react";
import { cn } from "@/lib/utils";

interface OverviewCard {
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  label: string;
  value: string;
  subValue?: string;
  trend: {
    value: string;
    positive: boolean;
    label: string;
  };
}

const overviewData: OverviewCard[] = [
  {
    icon: DollarSign,
    iconBg: "bg-gradient-to-br from-violet-500 to-purple-600 shadow-purple-500/20",
    iconColor: "text-white",
    label: "Total revenue",
    value: "$53,00989",
    trend: { value: "12%", positive: true, label: "increase from last month" },
  },
  {
    icon: Briefcase,
    iconBg: "bg-gradient-to-br from-emerald-400 to-teal-500 shadow-emerald-500/20",
    iconColor: "text-white",
    label: "Projects",
    value: "95",
    subValue: "/100",
    trend: { value: "10%", positive: false, label: "decrease from last month" },
  },
  {
    icon: Clock,
    iconBg: "bg-gradient-to-br from-blue-400 to-cyan-500 shadow-blue-500/20",
    iconColor: "text-white",
    label: "Time spent",
    value: "1022",
    subValue: "/1300 Hrs",
    trend: { value: "8%", positive: true, label: "increase from last month" },
  },
  {
    icon: Users,
    iconBg: "bg-gradient-to-br from-amber-400 to-orange-500 shadow-amber-500/20",
    iconColor: "text-white",
    label: "Resources",
    value: "101",
    subValue: "/120",
    trend: { value: "2%", positive: true, label: "increase from last month" },
  },
];

export const OverviewCards = () => {
  return (
    <section className="mb-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-foreground tracking-tight">Overview</h2>
        <button className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-foreground bg-card border border-border rounded-xl hover:bg-secondary transition-all duration-200 shadow-sm">
          <span>Last 30 days</span>
          <TrendingDown className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {overviewData.map((card, index) => (
          <div
            key={index}
            className="stat-card group"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            {/* Icon */}
            <div className={cn(
              "w-14 h-14 rounded-2xl flex items-center justify-center mb-5 shadow-lg relative overflow-hidden",
              card.iconBg
            )}>
              <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <card.icon className={cn("w-7 h-7 relative z-10", card.iconColor)} />
            </div>

            {/* Label */}
            <p className="text-sm font-medium text-muted-foreground mb-2 group-hover:text-foreground transition-colors">{card.label}</p>

            {/* Value */}
            <div className="flex items-baseline gap-1 mb-4">
              <span className="text-3xl font-bold text-foreground tracking-tight">{card.value}</span>
              {card.subValue && (
                <span className="text-base font-medium text-muted-foreground">{card.subValue}</span>
              )}
            </div>

            {/* Trend */}
            <div className="flex items-center gap-2 pt-4 border-t border-border/50">
              <div className={cn(
                "flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold backdrop-blur-sm",
                card.trend.positive
                  ? "bg-success/10 text-success border border-success/20"
                  : "bg-danger/10 text-danger border border-danger/20"
              )}>
                {card.trend.positive ? (
                  <TrendingUp className="w-3.5 h-3.5" />
                ) : (
                  <TrendingDown className="w-3.5 h-3.5" />
                )}
                {card.trend.value}
              </div>
              <span className="text-xs text-muted-foreground whitespace-nowrap overflow-hidden text-ellipsis">
                {card.trend.label}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
