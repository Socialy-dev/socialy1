import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import {
  Globe,
  Linkedin,
  Twitter,
  Instagram,
  Facebook,
  ChevronDown,
  Check
} from "lucide-react";

export type Platform = "global" | "linkedin" | "twitter" | "instagram" | "facebook";

interface PlatformConfig {
  name: string;
  icon: React.ElementType;
  color: string;
  gradient: string;
}

export const platformsConfig: Record<Platform, PlatformConfig> = {
  global: {
    name: "Tous les réseaux",
    icon: Globe,
    color: "text-slate-600 dark:text-slate-300",
    gradient: "from-slate-500 to-slate-600"
  },
  linkedin: {
    name: "LinkedIn",
    icon: Linkedin,
    color: "text-[#0A66C2]",
    gradient: "from-[#0A66C2] to-[#004182]"
  },
  twitter: {
    name: "X (Twitter)",
    icon: Twitter,
    color: "text-foreground",
    gradient: "from-gray-900 to-black dark:from-white dark:to-gray-200"
  },
  instagram: {
    name: "Instagram",
    icon: Instagram,
    color: "text-pink-600",
    gradient: "from-purple-600 via-pink-500 to-orange-400"
  },
  facebook: {
    name: "Facebook",
    icon: Facebook,
    color: "text-[#1877F2]",
    gradient: "from-[#1877F2] to-[#0d5bbd]"
  }
};

interface PlatformDropdownProps {
  value: Platform;
  onChange: (platform: Platform) => void;
}

export const PlatformDropdown = ({ value, onChange }: PlatformDropdownProps) => {
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

  const currentPlatform = platformsConfig[value];
  const CurrentIcon = currentPlatform.icon;

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "group flex items-center gap-3 px-4 py-2.5 rounded-2xl",
          "bg-card border border-border/50 hover:border-primary/30",
          "transition-all duration-300 hover:shadow-lg hover:shadow-primary/5",
          "min-w-[200px]"
        )}
      >
        <div className={cn(
          "w-8 h-8 rounded-xl flex items-center justify-center bg-gradient-to-br",
          currentPlatform.gradient,
          "shadow-md"
        )}>
          <CurrentIcon className="w-4 h-4 text-white" />
        </div>
        <div className="flex-1 text-left">
          <p className="text-sm font-semibold text-foreground">{currentPlatform.name}</p>
        </div>
        <ChevronDown className={cn(
          "w-4 h-4 text-muted-foreground transition-transform duration-200",
          isOpen && "rotate-180"
        )} />
      </button>

      {isOpen && (
        <div className={cn(
          "absolute top-full left-0 mt-2 w-full min-w-[240px]",
          "bg-card border border-border/50 rounded-2xl shadow-xl",
          "z-50 overflow-hidden",
          "animate-in fade-in-0 zoom-in-95 duration-200"
        )}>
          <div className="p-2">
            {(Object.keys(platformsConfig) as Platform[]).map((platform) => {
              const config = platformsConfig[platform];
              const Icon = config.icon;
              const isSelected = value === platform;

              return (
                <button
                  key={platform}
                  onClick={() => {
                    onChange(platform);
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
                  <div className={cn(
                    "w-8 h-8 rounded-xl flex items-center justify-center bg-gradient-to-br",
                    config.gradient,
                    "shadow-sm"
                  )}>
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                  <span className={cn(
                    "flex-1 text-left text-sm font-medium",
                    isSelected ? "text-primary" : "text-foreground"
                  )}>
                    {config.name}
                  </span>
                  {isSelected && (
                    <Check className="w-4 h-4 text-primary" />
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
