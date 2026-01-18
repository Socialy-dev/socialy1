import { cn } from "@/lib/utils";
import {
  Lightbulb,
  TrendingUp,
  Clock,
  Target,
  Sparkles,
  ArrowRight,
  Linkedin,
  Instagram,
  Twitter,
  Facebook,
  Users,
  ChevronRight
} from "lucide-react";

type SuggestionCategory = "content" | "timing" | "engagement" | "strategy" | "clients";

interface SuggestionCardProps {
  suggestion: {
    id: string;
    title: string;
    description: string;
    category: SuggestionCategory;
    priority: "high" | "medium" | "low";
    platform?: "linkedin" | "instagram" | "twitter" | "facebook";
    impact?: string;
    actionLabel?: string;
  };
}

const categoryConfig: Record<SuggestionCategory, { icon: React.ElementType; gradient: string; label: string }> = {
  content: {
    icon: Sparkles,
    gradient: "from-violet-500 to-purple-600",
    label: "Contenu"
  },
  timing: {
    icon: Clock,
    gradient: "from-blue-500 to-cyan-600",
    label: "Timing"
  },
  engagement: {
    icon: TrendingUp,
    gradient: "from-emerald-500 to-teal-600",
    label: "Engagement"
  },
  strategy: {
    icon: Target,
    gradient: "from-orange-500 to-red-600",
    label: "Stratégie"
  },
  clients: {
    icon: Users,
    gradient: "from-pink-500 to-rose-600",
    label: "Clients"
  }
};

const platformIcons: Record<string, React.ElementType> = {
  linkedin: Linkedin,
  instagram: Instagram,
  twitter: Twitter,
  facebook: Facebook
};

const priorityConfig = {
  high: { color: "bg-danger/10 text-danger", label: "Haute priorité" },
  medium: { color: "bg-warning/10 text-warning", label: "Priorité moyenne" },
  low: { color: "bg-muted text-muted-foreground", label: "Suggestion" }
};

export const SuggestionCard = ({ suggestion }: SuggestionCardProps) => {
  const category = categoryConfig[suggestion.category];
  const priority = priorityConfig[suggestion.priority];
  const CategoryIcon = category.icon;
  const PlatformIcon = suggestion.platform ? platformIcons[suggestion.platform] : null;

  return (
    <div className="group relative p-5 rounded-2xl bg-card border border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-xl hover:shadow-primary/5">
      <div className="flex items-start gap-4">
        <div className={cn(
          "w-12 h-12 rounded-2xl flex items-center justify-center bg-gradient-to-br shrink-0",
          category.gradient,
          "shadow-lg"
        )}>
          <CategoryIcon className="w-6 h-6 text-white" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className={cn(
              "px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide",
              priority.color
            )}>
              {priority.label}
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-secondary text-muted-foreground">
              {category.label}
            </span>
            {PlatformIcon && (
              <div className="w-5 h-5 rounded-md bg-secondary flex items-center justify-center">
                <PlatformIcon className="w-3 h-3 text-muted-foreground" />
              </div>
            )}
          </div>

          <h3 className="text-sm font-semibold text-foreground mb-1.5 line-clamp-2">
            {suggestion.title}
          </h3>

          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 mb-3">
            {suggestion.description}
          </p>

          {suggestion.impact && (
            <div className="flex items-center gap-1.5 mb-3">
              <TrendingUp className="w-3 h-3 text-success" />
              <span className="text-xs font-medium text-success">
                {suggestion.impact}
              </span>
            </div>
          )}

          <button className="flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary/80 transition-colors">
            {suggestion.actionLabel || "Appliquer"}
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
