import { Globe, Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useRef, useEffect } from "react";

export type LanguageFilterValue = "all" | "fr" | "en";

interface LanguageFilterProps {
  value: LanguageFilterValue;
  onChange: (value: LanguageFilterValue) => void;
  counts?: {
    all: number;
    fr: number;
    en: number;
  };
}

const LANGUAGE_OPTIONS: { value: LanguageFilterValue; label: string; flag: string }[] = [
  { value: "all", label: "Toutes les langues", flag: "🌐" },
  { value: "fr", label: "Français", flag: "🇫🇷" },
  { value: "en", label: "Anglais", flag: "🇬🇧" },
];

export function LanguageFilter({ value, onChange, counts }: LanguageFilterProps) {
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

  const selectedOption = LANGUAGE_OPTIONS.find((opt) => opt.value === value) || LANGUAGE_OPTIONS[0];

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-secondary/60 border border-border rounded-lg hover:border-primary/40 transition-all duration-200 text-sm"
      >
        <Globe className="w-4 h-4 text-primary" />
        <span className="font-medium">{selectedOption.flag} {selectedOption.label}</span>
        <ChevronDown
          className={cn(
            "w-3 h-3 text-muted-foreground transition-transform duration-200",
            isOpen && "rotate-180"
          )}
        />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-56 bg-card border border-border rounded-xl shadow-lg z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="p-1.5">
            {LANGUAGE_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={cn(
                  "w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                  value === option.value
                    ? "bg-primary/10 text-primary"
                    : "text-foreground hover:bg-secondary"
                )}
              >
                <div className="flex items-center gap-2">
                  <span className="text-base">{option.flag}</span>
                  <span>{option.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  {counts && (
                    <span className="text-xs text-muted-foreground bg-secondary px-1.5 py-0.5 rounded">
                      {counts[option.value]}
                    </span>
                  )}
                  {value === option.value && <Check className="w-4 h-4" />}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
