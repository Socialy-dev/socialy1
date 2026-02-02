import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { ChevronDown, Check, Building2 } from "lucide-react";

interface Competitor {
  id: string;
  name: string;
  logo?: string;
}

interface CompetitorFilterProps {
  competitors: Competitor[];
  value: string;
  onChange: (id: string) => void;
}

export const CompetitorFilter = ({ competitors, value, onChange }: CompetitorFilterProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const allCompetitors = [{ id: "all", name: "Tous les concurrents" }, ...competitors];
  const currentCompetitor = allCompetitors.find(c => c.id === value) || allCompetitors[0];

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "group flex items-center gap-3 px-4 py-2.5 rounded-2xl",
          "bg-card border border-border/50 hover:border-primary/30",
          "transition-all duration-300 hover:shadow-lg hover:shadow-primary/5",
          "min-w-[220px]"
        )}
      >
        <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600 shadow-md">
          <Building2 className="w-4 h-4 text-white" />
        </div>
        <div className="flex-1 text-left">
          <p className="text-sm font-semibold text-foreground truncate max-w-[140px]">
            {currentCompetitor.name}
          </p>
        </div>
        <ChevronDown className={cn(
          "w-4 h-4 text-muted-foreground transition-transform duration-200",
          isOpen && "rotate-180"
        )} />
      </button>

      {isOpen && (
        <div className={cn(
          "absolute top-full left-0 mt-2 w-full min-w-[260px]",
          "bg-card border border-border/50 rounded-2xl shadow-xl",
          "z-50 overflow-hidden max-h-[300px] overflow-y-auto",
          "animate-in fade-in-0 zoom-in-95 duration-200"
        )}>
          <div className="p-2">
            {allCompetitors.map((competitor) => {
              const isSelected = value === competitor.id;

              return (
                <button
                  key={competitor.id}
                  onClick={() => {
                    onChange(competitor.id);
                    setIsOpen(false);
                  }}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl",
                    "transition-all duration-200",
                    isSelected
                      ? "bg-primary/10"
                      : "hover:bg-secondary/50"
                  )}
                >
                  {competitor.logo ? (
                    <img
                      src={competitor.logo}
                      alt={competitor.name}
                      className="w-8 h-8 rounded-xl object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-gradient-to-br from-slate-400 to-slate-600">
                      <span className="text-white text-xs font-bold">
                        {competitor.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <span className={cn(
                    "flex-1 text-left text-sm font-medium truncate",
                    isSelected ? "text-primary" : "text-foreground"
                  )}>
                    {competitor.name}
                  </span>
                  {isSelected && (
                    <Check className="w-4 h-4 text-primary flex-shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
