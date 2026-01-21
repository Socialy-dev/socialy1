import { TrendingUp, TrendingDown, type LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface PaidDetailedMetricCardProps {
  title: string;
  value: string;
  change: number;
  icon: LucideIcon;
  isLoading?: boolean;
  invertTrend?: boolean;
  small?: boolean;
}

export const PaidDetailedMetricCard = ({
  title,
  value,
  change,
  icon: Icon,
  isLoading,
  invertTrend = false,
  small = false,
}: PaidDetailedMetricCardProps) => {
  const isPositive = invertTrend ? change < 0 : change > 0;
  const isNegative = invertTrend ? change > 0 : change < 0;

  if (isLoading) {
    return (
      <Card className="p-4 bg-card/50 border-border/50 backdrop-blur-sm">
        <Skeleton className="h-4 w-20 mb-3" />
        <Skeleton className="h-8 w-24 mb-2" />
        <Skeleton className="h-4 w-16" />
      </Card>
    );
  }

  return (
    <Card className={cn(
      "group relative overflow-hidden bg-card/50 border-border/50 backdrop-blur-sm transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 hover:border-primary/20",
      small ? "p-3" : "p-4"
    )}>
      <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-primary/5 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <div className="flex items-center gap-2 mb-2">
        <div className={cn(
          "flex items-center justify-center rounded-lg bg-primary/10 text-primary",
          small ? "w-7 h-7" : "w-8 h-8"
        )}>
          <Icon className={cn(small ? "w-3.5 h-3.5" : "w-4 h-4")} />
        </div>
        <span className={cn(
          "text-muted-foreground font-medium",
          small ? "text-xs" : "text-sm"
        )}>
          {title}
        </span>
      </div>
      
      <p className={cn(
        "font-bold text-foreground mb-1",
        small ? "text-lg" : "text-2xl"
      )}>
        {value}
      </p>
      
      <div className="flex items-center gap-1">
        {isPositive && <TrendingUp className="w-3.5 h-3.5 text-success" />}
        {isNegative && <TrendingDown className="w-3.5 h-3.5 text-destructive" />}
        <span className={cn(
          "text-xs font-medium",
          isPositive && "text-success",
          isNegative && "text-destructive",
          !isPositive && !isNegative && "text-muted-foreground"
        )}>
          {change > 0 ? "+" : ""}{change.toFixed(1)}%
        </span>
        <span className="text-xs text-muted-foreground">vs période préc.</span>
      </div>
    </Card>
  );
};
