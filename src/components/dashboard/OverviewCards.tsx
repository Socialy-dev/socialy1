import { TrendingUp, TrendingDown, DollarSign, Briefcase, Clock, Users, ArrowUpRight } from "lucide-react";
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
  };
}

const overviewData: OverviewCard[] = [
  {
    icon: DollarSign,
    iconBg: "bg-gradient-to-br from-violet-500 to-purple-600",
    iconColor: "text-white",
    label: "Total revenue",
    value: "$53,009",
    trend: { value: "+12%", positive: true },
  },
  {
    icon: Briefcase,
    iconBg: "bg-gradient-to-br from-emerald-400 to-teal-500",
    iconColor: "text-white",
    label: "Projects",
    value: "95",
    subValue: "/100",
    trend: { value: "-10%", positive: false },
  },
  {
    icon: Clock,
    iconBg: "bg-gradient-to-br from-blue-400 to-cyan-500",
    iconColor: "text-white",
    label: "Time spent",
    value: "1,022",
    subValue: "hrs",
    trend: { value: "+8%", positive: true },
  },
  {
    icon: Users,
    iconBg: "bg-gradient-to-br from-amber-400 to-orange-500",
    iconColor: "text-white",
    label: "Resources",
    value: "101",
    subValue: "/120",
    trend: { value: "+2%", positive: true },
  },
];

export const OverviewCards = () => {
  return (
    <section className="mb-2">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-bold text-foreground">Aperçu</h2>
        <button className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground bg-secondary/50 border border-border/50 rounded-xl hover:bg-secondary transition-all duration-200">
          30 derniers jours
          <TrendingDown className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {overviewData.map((card, index) => (
          <div
            key={index}
            className="group relative p-5 rounded-2xl bg-card border border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 cursor-pointer"
          >
            {/* Top Row */}
            <div className="flex items-start justify-between mb-4">
              <div className={cn(
                "w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg",
                card.iconBg
              )}>
                <card.icon className={cn("w-6 h-6", card.iconColor)} />
              </div>

              {/* Trend Badge */}
              <div className={cn(
                "flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold",
                card.trend.positive
                  ? "bg-success/10 text-success"
                  : "bg-danger/10 text-danger"
              )}>
                {card.trend.positive ? (
                  <TrendingUp className="w-3 h-3" />
                ) : (
                  <TrendingDown className="w-3 h-3" />
                )}
                {card.trend.value}
              </div>
            </div>

            {/* Value */}
            <div className="flex items-baseline gap-1 mb-1">
              <span className="text-2xl font-bold text-foreground tracking-tight">{card.value}</span>
              {card.subValue && (
                <span className="text-sm font-medium text-muted-foreground">{card.subValue}</span>
              )}
            </div>

            {/* Label */}
            <p className="text-sm text-muted-foreground font-medium">{card.label}</p>

            {/* Hover Arrow */}
            <div className="absolute top-5 right-5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <ArrowUpRight className="w-4 h-4 text-primary" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
