import { useState } from "react";
import { cn } from "@/lib/utils";
import { Plus, Users, BarChart3, UsersRound, FileText } from "lucide-react";
import { CompetitorFilter } from "./CompetitorFilter";
import { CompetitorCard } from "./CompetitorCard";
import { PlatformDropdown, Platform } from "./PlatformDropdown";

const mockCompetitors = [
  {
    id: "1",
    name: "Socialy",
    logo: undefined,
    type: "personal" as const,
    website: "expectra.fr/agence/occitanie/34/montpellier_34000/1122",
    stats: { followers: 15420, engagement: 4.2, posts: 156, trend: 12 },
    platforms: ["linkedin", "twitter", "instagram"]
  },
  {
    id: "2",
    name: "Montbrun Invest",
    logo: undefined,
    type: "company" as const,
    website: "montbrun-invest.fr",
    stats: { followers: 8900, engagement: 3.8, posts: 89, trend: -5 },
    platforms: ["linkedin", "facebook"]
  },
  {
    id: "3",
    name: "Digital Factory",
    logo: undefined,
    type: "company" as const,
    website: "digitalfactory.com",
    stats: { followers: 25600, engagement: 5.1, posts: 234, trend: 18 },
    platforms: ["linkedin", "twitter", "instagram", "facebook"]
  },
  {
    id: "4",
    name: "Tech Innovate",
    logo: undefined,
    type: "personal" as const,
    website: "techinnovate.io",
    stats: { followers: 12300, engagement: 4.5, posts: 178, trend: 8 },
    platforms: ["twitter", "linkedin"]
  },
  {
    id: "5",
    name: "Growth Partners",
    logo: undefined,
    type: "company" as const,
    website: "growthpartners.fr",
    stats: { followers: 6780, engagement: 3.2, posts: 67, trend: -2 },
    platforms: ["linkedin", "facebook"]
  },
  {
    id: "6",
    name: "Startup Studio",
    logo: undefined,
    type: "personal" as const,
    website: "startupstudio.co",
    stats: { followers: 18900, engagement: 6.2, posts: 312, trend: 25 },
    platforms: ["instagram", "twitter", "linkedin"]
  }
];

interface CompetitorsViewProps {
  selectedPlatform: Platform;
  onPlatformChange: (platform: Platform) => void;
}

export const CompetitorsView = ({ selectedPlatform, onPlatformChange }: CompetitorsViewProps) => {
  const [selectedCompetitor, setSelectedCompetitor] = useState<string>("all");

  const filteredCompetitors = selectedCompetitor === "all"
    ? mockCompetitors
    : mockCompetitors.filter(c => c.id === selectedCompetitor);

  const platformFilteredCompetitors = selectedPlatform === "global"
    ? filteredCompetitors
    : filteredCompetitors.filter(c => c.platforms.includes(selectedPlatform));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <CompetitorFilter
            competitors={mockCompetitors.map(c => ({ id: c.id, name: c.name, logo: c.logo }))}
            value={selectedCompetitor}
            onChange={setSelectedCompetitor}
          />
          <PlatformDropdown value={selectedPlatform} onChange={onPlatformChange} />
        </div>

        <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200 text-sm font-medium shadow-lg shadow-primary/25">
          <Plus className="w-4 h-4" />
          Ajouter un concurrent
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-card border border-border/50">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <Users className="w-5 h-5 text-white" />
            </div>
          </div>
          <p className="text-2xl font-bold text-foreground">{platformFilteredCompetitors.length}</p>
          <p className="text-sm text-muted-foreground">Concurrents suivis</p>
        </div>

        <div className="p-5 rounded-2xl bg-card border border-border/50">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
          </div>
          <p className="text-2xl font-bold text-foreground">
            {(platformFilteredCompetitors.reduce((sum, c) => sum + c.stats.engagement, 0) / platformFilteredCompetitors.length || 0).toFixed(1)}%
          </p>
          <p className="text-sm text-muted-foreground">Engagement moyen</p>
        </div>

        <div className="p-5 rounded-2xl bg-card border border-border/50">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
              <UsersRound className="w-5 h-5 text-white" />
            </div>
          </div>
          <p className="text-2xl font-bold text-foreground">
            {(platformFilteredCompetitors.reduce((sum, c) => sum + c.stats.followers, 0) / 1000).toFixed(1)}K
          </p>
          <p className="text-sm text-muted-foreground">Followers total</p>
        </div>

        <div className="p-5 rounded-2xl bg-card border border-border/50">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
          </div>
          <p className="text-2xl font-bold text-foreground">
            {platformFilteredCompetitors.reduce((sum, c) => sum + c.stats.posts, 0)}
          </p>
          <p className="text-sm text-muted-foreground">Posts analysés</p>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-bold text-foreground mb-4">Vos concurrents</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {platformFilteredCompetitors.map((competitor) => (
            <CompetitorCard key={competitor.id} competitor={competitor} />
          ))}
        </div>

        {platformFilteredCompetitors.length === 0 && (
          <div className="text-center py-16 rounded-2xl bg-card border border-dashed border-border">
            <Users className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-base font-medium text-muted-foreground mb-2">
              Aucun concurrent trouvé
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              Ajoutez des concurrents pour analyser leur performance
            </p>
            <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm font-medium mx-auto">
              <Plus className="w-4 h-4" />
              Ajouter un concurrent
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
