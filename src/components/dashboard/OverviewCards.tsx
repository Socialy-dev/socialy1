import { TrendingUp, TrendingDown, ChartBar, Briefcase, Clock, Users } from "lucide-react";
import { cn } from "@/lib/utils";

interface OverviewCard {
  icon: React.ElementType;
  iconBg: string;
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
    icon: ChartBar,
    iconBg: "bg-accent-purple/20",
    label: "Total revenue",
    value: "$53,00989",
    trend: { value: "12%", positive: true, label: "increase from last month" },
  },
  {
    icon: Briefcase,
    iconBg: "bg-primary/20",
    label: "Projects",
    value: "95",
    subValue: "/100",
    trend: { value: "10%", positive: false, label: "decrease from last month" },
  },
  {
    icon: Clock,
    iconBg: "bg-accent-blue/20",
    label: "Time spent",
    value: "1022",
    subValue: "/1300 Hrs",
    trend: { value: "8%", positive: true, label: "increase from last month" },
  },
  {
    icon: Users,
    iconBg: "bg-accent-yellow/20",
    label: "Resources",
    value: "101",
    subValue: "/120",
    trend: { value: "2%", positive: true, label: "increase from last month" },
  },
];

export const OverviewCards = () => {
  return (
    <section className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-foreground">Overview</h2>
        <button className="flex items-center gap-2 px-4 py-2 text-sm text-foreground bg-card rounded-lg hover:bg-secondary transition-colors">
          Last 30 days
          <TrendingDown className="w-4 h-4" />
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {overviewData.map((card, index) => (
          <div
            key={index}
            className="glass-card rounded-2xl p-5 hover:shadow-lg transition-shadow"
          >
            <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center mb-4", card.iconBg)}>
              <card.icon className={cn(
                "w-6 h-6",
                index === 0 && "text-accent-purple",
                index === 1 && "text-primary",
                index === 2 && "text-accent-blue",
                index === 3 && "text-accent-yellow"
              )} />
            </div>
            
            <p className="text-sm text-muted-foreground mb-1">{card.label}</p>
            <div className="flex items-baseline gap-1 mb-3">
              <span className="text-2xl font-bold text-foreground">{card.value}</span>
              {card.subValue && (
                <span className="text-sm text-muted-foreground">{card.subValue}</span>
              )}
            </div>
            
            <div className="flex items-center gap-1.5">
              {card.trend.positive ? (
                <TrendingUp className="w-4 h-4 text-success" />
              ) : (
                <TrendingDown className="w-4 h-4 text-danger" />
              )}
              <span className={cn(
                "text-xs font-medium",
                card.trend.positive ? "text-success" : "text-danger"
              )}>
                {card.trend.value}
              </span>
              <span className="text-xs text-muted-foreground">
                {card.trend.label}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
