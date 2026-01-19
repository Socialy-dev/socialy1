import { cn } from "@/lib/utils";
import { Calendar, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { TimePeriod } from "@/hooks/useTikTokAnalytics";

interface TikTokAnalyticsFiltersProps {
  period: TimePeriod;
  onPeriodChange: (period: TimePeriod) => void;
  customDateRange: { start: Date; end: Date } | null;
  onCustomDateRangeChange: (range: { start: Date; end: Date } | null) => void;
}

const periodOptions: { value: TimePeriod; label: string }[] = [
  { value: "7d", label: "7 jours" },
  { value: "30d", label: "30 jours" },
  { value: "3m", label: "3 mois" },
  { value: "6m", label: "6 mois" },
  { value: "1y", label: "1 an" }
];

export const TikTokAnalyticsFilters = ({
  period,
  onPeriodChange,
  customDateRange,
  onCustomDateRangeChange
}: TikTokAnalyticsFiltersProps) => {
  const handleSelectDate = (date: Date | undefined, type: "start" | "end") => {
    if (!date) return;

    if (type === "start") {
      onCustomDateRangeChange({
        start: date,
        end: customDateRange?.end || new Date()
      });
    } else {
      onCustomDateRangeChange({
        start: customDateRange?.start || date,
        end: date
      });
    }
    onPeriodChange("custom");
  };

  return (
    <div className="flex flex-wrap items-center gap-2 p-4 rounded-2xl bg-card border border-border/50">
      <CalendarDays className="w-4 h-4 text-muted-foreground" />
      <span className="text-sm font-medium text-muted-foreground mr-2">Période</span>

      <div className="flex flex-wrap items-center gap-1.5">
        {periodOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => onPeriodChange(option.value)}
            className={cn(
              "px-3 py-1.5 text-sm font-medium rounded-lg transition-all duration-200",
              period === option.value
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            {option.label}
          </button>
        ))}

        <Popover>
          <PopoverTrigger asChild>
            <button
              className={cn(
                "px-3 py-1.5 text-sm font-medium rounded-lg transition-all duration-200 flex items-center gap-1.5",
                period === "custom"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Calendar className="w-3.5 h-3.5" />
              {period === "custom" && customDateRange
                ? `${format(customDateRange.start, "dd MMM", { locale: fr })} - ${format(customDateRange.end, "dd MMM", { locale: fr })}`
                : "Personnalisé"}
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <div className="flex">
              <div className="border-r border-border p-2">
                <p className="text-xs font-medium text-muted-foreground mb-2 px-2">Début</p>
                <CalendarComponent
                  mode="single"
                  selected={customDateRange?.start}
                  onSelect={(date) => handleSelectDate(date, "start")}
                  locale={fr}
                  className="pointer-events-auto"
                />
              </div>
              <div className="p-2">
                <p className="text-xs font-medium text-muted-foreground mb-2 px-2">Fin</p>
                <CalendarComponent
                  mode="single"
                  selected={customDateRange?.end}
                  onSelect={(date) => handleSelectDate(date, "end")}
                  locale={fr}
                  className="pointer-events-auto"
                />
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
};
