import { Calendar, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import type { PeriodType } from "@/hooks/usePaidDetailedInsights";

interface PaidPeriodFilterProps {
  period: PeriodType;
  onPeriodChange: (period: PeriodType) => void;
  customStartDate?: Date;
  customEndDate?: Date;
  onCustomStartDateChange: (date: Date | undefined) => void;
  onCustomEndDateChange: (date: Date | undefined) => void;
}

const periodOptions = [
  { id: "7d" as PeriodType, label: "7 derniers jours" },
  { id: "30d" as PeriodType, label: "30 derniers jours" },
];

export const PaidPeriodFilter = ({
  period,
  onPeriodChange,
  customStartDate,
  customEndDate,
  onCustomStartDateChange,
  onCustomEndDateChange,
}: PaidPeriodFilterProps) => {
  const getLabel = () => {
    if (period === "custom" && customStartDate && customEndDate) {
      return `${format(customStartDate, "dd MMM", { locale: fr })} - ${format(customEndDate, "dd MMM", { locale: fr })}`;
    }
    return periodOptions.find((p) => p.id === period)?.label || "30 derniers jours";
  };

  return (
    <div className="flex items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="bg-secondary/50 border-border/50 hover:bg-secondary text-sm"
          >
            <Calendar className="w-4 h-4 mr-2" />
            {getLabel()}
            <ChevronDown className="w-3.5 h-3.5 ml-2" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          {periodOptions.map((option) => (
            <DropdownMenuItem
              key={option.id}
              onClick={() => onPeriodChange(option.id)}
              className={period === option.id ? "bg-accent" : ""}
            >
              {option.label}
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
            Période personnalisée
          </div>
          <div className="flex gap-2 px-2 pb-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="flex-1 text-xs">
                  {customStartDate ? format(customStartDate, "dd/MM", { locale: fr }) : "Début"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent
                  mode="single"
                  selected={customStartDate}
                  onSelect={(date) => {
                    onCustomStartDateChange(date);
                    if (date && customEndDate) onPeriodChange("custom");
                  }}
                  locale={fr}
                />
              </PopoverContent>
            </Popover>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="flex-1 text-xs">
                  {customEndDate ? format(customEndDate, "dd/MM", { locale: fr }) : "Fin"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <CalendarComponent
                  mode="single"
                  selected={customEndDate}
                  onSelect={(date) => {
                    onCustomEndDateChange(date);
                    if (customStartDate && date) onPeriodChange("custom");
                  }}
                  locale={fr}
                />
              </PopoverContent>
            </Popover>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
