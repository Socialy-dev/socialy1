import { useState } from "react";
import { cn } from "@/lib/utils";
import { Lightbulb, Sparkles, Users, Target, Filter } from "lucide-react";
import { SuggestionCard } from "./SuggestionCard";

type CategoryFilter = "all" | "content" | "timing" | "engagement" | "strategy" | "clients";

const mockSuggestions = [
  {
    id: "1",
    title: "Publiez plus de contenu vidéo sur LinkedIn",
    description: "Vos posts vidéo génèrent 3x plus d'engagement que vos images. Augmentez la fréquence de publication vidéo.",
    category: "content" as const,
    priority: "high" as const,
    platform: "linkedin" as const,
    impact: "+45% engagement potentiel",
    actionLabel: "Créer une vidéo"
  },
  {
    id: "2",
    title: "Optimisez vos horaires de publication",
    description: "Vos meilleurs posts ont été publiés entre 9h et 11h. Concentrez vos publications sur ce créneau.",
    category: "timing" as const,
    priority: "high" as const,
    platform: "linkedin" as const,
    impact: "+28% de reach",
    actionLabel: "Planifier"
  },
  {
    id: "3",
    title: "Répondez plus rapidement aux commentaires",
    description: "Les posts avec des réponses rapides (<1h) ont un engagement 2x supérieur. Améliorez votre réactivité.",
    category: "engagement" as const,
    priority: "medium" as const,
    impact: "+35% interactions",
    actionLabel: "Voir les commentaires"
  },
  {
    id: "4",
    title: "Utilisez plus de hashtags sur Instagram",
    description: "Vos posts Instagram sous-utilisent les hashtags. Ajoutez 5-10 hashtags pertinents pour augmenter la découvrabilité.",
    category: "strategy" as const,
    priority: "medium" as const,
    platform: "instagram" as const,
    impact: "+52% impressions",
    actionLabel: "Voir les tendances"
  },
  {
    id: "5",
    title: "Contenu client : Témoignage Tech Solutions",
    description: "Votre client Tech Solutions a eu une excellente couverture presse. Créez un post de félicitations pour renforcer la relation.",
    category: "clients" as const,
    priority: "high" as const,
    platform: "linkedin" as const,
    impact: "Renforce la relation client",
    actionLabel: "Créer le post"
  },
  {
    id: "6",
    title: "Mentionnez vos clients dans vos success stories",
    description: "Les posts mentionnant des clients génèrent 40% plus d'engagement. Partagez leurs réussites.",
    category: "clients" as const,
    priority: "medium" as const,
    impact: "+40% engagement",
    actionLabel: "Créer une story"
  },
  {
    id: "7",
    title: "Lancez une série de contenu thématique",
    description: "Les séries de contenu fidélisent l'audience. Créez une série hebdomadaire sur un sujet de votre expertise.",
    category: "strategy" as const,
    priority: "low" as const,
    impact: "+25% followers",
    actionLabel: "Planifier la série"
  },
  {
    id: "8",
    title: "Contenu client : Webinar avec Innovate Corp",
    description: "Innovate Corp organise un webinar la semaine prochaine. Proposez une collaboration de promotion croisée.",
    category: "clients" as const,
    priority: "medium" as const,
    platform: "linkedin" as const,
    impact: "Visibilité partagée",
    actionLabel: "Contacter le client"
  }
];

const categoryFilters = [
  { id: "all" as CategoryFilter, label: "Toutes", icon: Filter },
  { id: "content" as CategoryFilter, label: "Contenu", icon: Sparkles },
  { id: "clients" as CategoryFilter, label: "Clients", icon: Users },
  { id: "strategy" as CategoryFilter, label: "Stratégie", icon: Target },
  { id: "engagement" as CategoryFilter, label: "Engagement", icon: Lightbulb }
];

export const SuggestionsView = () => {
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("all");

  const filteredSuggestions = categoryFilter === "all"
    ? mockSuggestions
    : mockSuggestions.filter(s => s.category === categoryFilter);

  const highPrioritySuggestions = filteredSuggestions.filter(s => s.priority === "high");
  const otherSuggestions = filteredSuggestions.filter(s => s.priority !== "high");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 p-1.5 bg-secondary/30 rounded-2xl border border-border/30 w-fit">
        {categoryFilters.map((filter) => {
          const Icon = filter.icon;
          const isActive = categoryFilter === filter.id;

          return (
            <button
              key={filter.id}
              onClick={() => setCategoryFilter(filter.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-card/50"
              )}
            >
              <Icon className="w-4 h-4" />
              {filter.label}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-gradient-to-br from-violet-500/10 to-purple-600/10 border border-violet-500/20">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
              <Lightbulb className="w-5 h-5 text-white" />
            </div>
          </div>
          <p className="text-2xl font-bold text-foreground">{mockSuggestions.length}</p>
          <p className="text-sm text-muted-foreground">Suggestions actives</p>
        </div>

        <div className="p-5 rounded-2xl bg-gradient-to-br from-danger/10 to-orange-500/10 border border-danger/20">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-danger to-orange-500 flex items-center justify-center">
              <span className="text-white text-lg">🔥</span>
            </div>
          </div>
          <p className="text-2xl font-bold text-foreground">{mockSuggestions.filter(s => s.priority === "high").length}</p>
          <p className="text-sm text-muted-foreground">Haute priorité</p>
        </div>

        <div className="p-5 rounded-2xl bg-gradient-to-br from-pink-500/10 to-rose-600/10 border border-pink-500/20">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center">
              <Users className="w-5 h-5 text-white" />
            </div>
          </div>
          <p className="text-2xl font-bold text-foreground">{mockSuggestions.filter(s => s.category === "clients").length}</p>
          <p className="text-sm text-muted-foreground">Suggestions clients</p>
        </div>

        <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-teal-600/10 border border-emerald-500/20">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
              <span className="text-white text-lg">📈</span>
            </div>
          </div>
          <p className="text-2xl font-bold text-foreground">+38%</p>
          <p className="text-sm text-muted-foreground">Impact potentiel</p>
        </div>
      </div>

      {highPrioritySuggestions.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-2 rounded-full bg-danger animate-pulse" />
            <h2 className="text-lg font-bold text-foreground">Priorité haute</h2>
            <span className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">
              {highPrioritySuggestions.length} suggestions
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {highPrioritySuggestions.map((suggestion) => (
              <SuggestionCard key={suggestion.id} suggestion={suggestion} />
            ))}
          </div>
        </div>
      )}

      {otherSuggestions.length > 0 && (
        <div>
          <h2 className="text-lg font-bold text-foreground mb-4">Autres suggestions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {otherSuggestions.map((suggestion) => (
              <SuggestionCard key={suggestion.id} suggestion={suggestion} />
            ))}
          </div>
        </div>
      )}

      {filteredSuggestions.length === 0 && (
        <div className="text-center py-16 rounded-2xl bg-card border border-dashed border-border">
          <Lightbulb className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-base font-medium text-muted-foreground mb-2">
            Aucune suggestion pour cette catégorie
          </p>
          <p className="text-sm text-muted-foreground">
            Essayez une autre catégorie ou revenez plus tard
          </p>
        </div>
      )}
    </div>
  );
};
