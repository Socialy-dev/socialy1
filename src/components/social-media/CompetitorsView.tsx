import { useState } from "react";
import { cn } from "@/lib/utils";
import { Plus, Users, BarChart3, UsersRound, FileText, Building2, Globe, ExternalLink } from "lucide-react";
import { CompetitorFilter } from "./CompetitorFilter";
import { PlatformDropdown, Platform } from "./PlatformDropdown";
import { ManageCompetitorsModal } from "./ManageCompetitorsModal";
import { useCompetitors } from "@/hooks/useCompetitors";

const LinkedInIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
);

const TikTokIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z" />
  </svg>
);

const InstagramIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
  </svg>
);

const FacebookIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

interface CompetitorsViewProps {
  selectedPlatform: Platform;
  onPlatformChange: (platform: Platform) => void;
}

export const CompetitorsView = ({ selectedPlatform, onPlatformChange }: CompetitorsViewProps) => {
  const [selectedCompetitor, setSelectedCompetitor] = useState<string>("all");
  const [modalOpen, setModalOpen] = useState(false);
  const { competitors, loading } = useCompetitors();

  const filteredCompetitors = selectedCompetitor === "all"
    ? competitors
    : competitors.filter(c => c.id === selectedCompetitor);

  const platformFilteredCompetitors = selectedPlatform === "global"
    ? filteredCompetitors
    : filteredCompetitors.filter(c => {
        if (selectedPlatform === "linkedin") return !!c.linkedin;
        if (selectedPlatform === "tiktok") return !!c.tiktok_url;
        if (selectedPlatform === "instagram") return !!c.instagram_url;
        if (selectedPlatform === "facebook") return !!c.facebook_url;
        return true;
      });

  const getPlatformCount = (competitor: typeof competitors[0]) => {
    let count = 0;
    if (competitor.linkedin) count++;
    if (competitor.tiktok_url) count++;
    if (competitor.instagram_url) count++;
    if (competitor.facebook_url) count++;
    return count;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <CompetitorFilter
            competitors={competitors.map(c => ({ id: c.id, name: c.name, logo: c.logo_url || undefined }))}
            value={selectedCompetitor}
            onChange={setSelectedCompetitor}
          />
          <PlatformDropdown value={selectedPlatform} onChange={onPlatformChange} />
        </div>

        <button 
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200 text-sm font-medium shadow-lg shadow-primary/25"
        >
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
          <p className="text-2xl font-bold text-foreground">--</p>
          <p className="text-sm text-muted-foreground">Engagement moyen</p>
        </div>

        <div className="p-5 rounded-2xl bg-card border border-border/50">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
              <UsersRound className="w-5 h-5 text-white" />
            </div>
          </div>
          <p className="text-2xl font-bold text-foreground">--</p>
          <p className="text-sm text-muted-foreground">Followers total</p>
        </div>

        <div className="p-5 rounded-2xl bg-card border border-border/50">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
          </div>
          <p className="text-2xl font-bold text-foreground">--</p>
          <p className="text-sm text-muted-foreground">Posts analysés</p>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-bold text-foreground mb-4">Vos concurrents</h2>
        
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : platformFilteredCompetitors.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {platformFilteredCompetitors.map((competitor) => (
              <div
                key={competitor.id}
                className={cn(
                  "group relative rounded-3xl overflow-hidden",
                  "bg-card border border-border/50",
                  "hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5",
                  "transition-all duration-300"
                )}
              >
                <div className="relative h-20 bg-gradient-to-br from-primary/20 via-primary/10 to-transparent">
                  {competitor.logo_url ? (
                    <img
                      src={competitor.logo_url}
                      alt={competitor.name}
                      className="absolute inset-0 w-full h-full object-cover opacity-30"
                    />
                  ) : null}
                  <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent" />
                </div>

                <div className="p-5 -mt-6 relative">
                  <div className="w-12 h-12 rounded-xl bg-card border border-border/50 flex items-center justify-center mb-3 shadow-lg">
                    {competitor.logo_url ? (
                      <img
                        src={competitor.logo_url}
                        alt={competitor.name}
                        className="w-8 h-8 rounded-lg object-cover"
                      />
                    ) : (
                      <Building2 className="w-5 h-5 text-muted-foreground" />
                    )}
                  </div>

                  <h3 className="text-base font-bold text-foreground mb-1 line-clamp-1">
                    {competitor.name}
                  </h3>

                  {competitor.website && (
                    <a
                      href={
                        competitor.website.startsWith("http")
                          ? competitor.website
                          : `https://${competitor.website}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors mb-3"
                    >
                      <Globe className="w-3 h-3" />
                      <span className="line-clamp-1">
                        {competitor.website.replace(/^https?:\/\//, "")}
                      </span>
                      <ExternalLink className="w-3 h-3 opacity-50" />
                    </a>
                  )}

                  <div className="flex items-center gap-1.5 flex-wrap">
                    {competitor.linkedin && (
                      <a
                        href={competitor.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-lg bg-[#0A66C2]/10 text-[#0A66C2] hover:bg-[#0A66C2]/20 transition-colors"
                      >
                        <LinkedInIcon />
                      </a>
                    )}
                    {competitor.instagram_url && (
                      <a
                        href={competitor.instagram_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-lg bg-[#E4405F]/10 text-[#E4405F] hover:bg-[#E4405F]/20 transition-colors"
                      >
                        <InstagramIcon />
                      </a>
                    )}
                    {competitor.tiktok_url && (
                      <a
                        href={competitor.tiktok_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-lg bg-foreground/10 text-foreground hover:bg-foreground/20 transition-colors"
                      >
                        <TikTokIcon />
                      </a>
                    )}
                    {competitor.facebook_url && (
                      <a
                        href={competitor.facebook_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-lg bg-[#1877F2]/10 text-[#1877F2] hover:bg-[#1877F2]/20 transition-colors"
                      >
                        <FacebookIcon />
                      </a>
                    )}
                    {getPlatformCount(competitor) === 0 && (
                      <span className="text-xs text-muted-foreground">
                        Aucun réseau
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 rounded-2xl bg-card border border-dashed border-border">
            <Users className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-base font-medium text-muted-foreground mb-2">
              Aucun concurrent trouvé
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              Ajoutez des concurrents pour analyser leur performance
            </p>
            <button 
              onClick={() => setModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm font-medium mx-auto"
            >
              <Plus className="w-4 h-4" />
              Ajouter un concurrent
            </button>
          </div>
        )}
      </div>

      <ManageCompetitorsModal open={modalOpen} onOpenChange={setModalOpen} />
    </div>
  );
};
