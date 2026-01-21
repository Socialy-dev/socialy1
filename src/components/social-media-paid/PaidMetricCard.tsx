import { TrendingUp, TrendingDown, LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface PaidMetricCardProps {
  title: string;
  value: string;
  change: number;
  icon: LucideIcon;
  isLoading?: boolean;
  invertTrend?: boolean;
  small?: boolean;
}

export const PaidMetricCard = ({
  title,
  value,
  change,
  icon: Icon,
  isLoading,
  invertTrend = false,
  small = false,
}: PaidMetricCardProps) => {
  const isPositive = invertTrend ? change < 0 : change > 0;
  const isNegative = invertTrend ? change > 0 : change < 0;

  if (isLoading) {
    return (
      <Card className="bg-card/50 border-border/50">
        <CardContent className={cn("pt-4", small ? "pb-4" : "pb-6")}>
          <Skeleton className="h-4 w-20 mb-2" />
          <Skeleton className="h-8 w-24 mb-1" />
          <Skeleton className="h-4 w-16" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card/50 border-border/50 hover:bg-card/80 transition-all duration-200">
      <CardContent className={cn("pt-4", small ? "pb-4" : "pb-6")}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground">{title}</span>
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Icon className="w-4 h-4 text-primary" />
          </div>
        </div>
        <div className={cn("font-bold text-foreground", small ? "text-xl" : "text-2xl")}>
          {value}
        </div>
        <div className="flex items-center gap-1 mt-1">
          {isPositive ? (
            <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
          ) : isNegative ? (
            <TrendingDown className="w-3.5 h-3.5 text-rose-500" />
          ) : null}
          <span
            className={cn(
              "text-xs font-medium",
              isPositive && "text-emerald-500",
              isNegative && "text-rose-500",
              !isPositive && !isNegative && "text-muted-foreground"
            )}
          >
            {change > 0 ? "+" : ""}
            {change.toFixed(1)}%
          </span>
          <span className="text-xs text-muted-foreground">vs période préc.</span>
        </div>
      </CardContent>
    </Card>
  );
};
