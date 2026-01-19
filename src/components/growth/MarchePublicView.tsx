import { useState, useEffect } from "react";
import { 
  Briefcase, 
  Calendar, 
  Building2, 
  Euro, 
  ExternalLink, 
  Clock,
  FileText,
  MapPin,
  Loader2,
  RefreshCw,
  Search,
  Filter,
  TrendingUp
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface MarchePublic {
  id: string;
  organization_id: string;
  source: string | null;
  external_id: string | null;
  titre: string | null;
  acheteur: string | null;
  montant: number | null;
  date_publication: string | null;
  deadline: string | null;
  url: string | null;
  created_at: string;
  updated_at: string;
}

const formatDate = (dateString: string | null) => {
  if (!dateString) return null;
  const date = new Date(dateString);
  return date.toLocaleDateString("fr-FR", { 
    day: "numeric", 
    month: "short", 
    year: "numeric" 
  });
};

const formatMontant = (montant: number | null) => {
  if (montant === null) return null;
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0
  }).format(montant);
};

const getSourceColor = (source: string | null) => {
  switch (source?.toUpperCase()) {
    case "BOAMP":
      return "bg-blue-500/10 text-blue-600 border-blue-500/20";
    case "DECP_2022":
    case "DECP_V3":
      return "bg-emerald-500/10 text-emerald-600 border-emerald-500/20";
    default:
      return "bg-gray-500/10 text-gray-600 border-gray-500/20";
  }
};

const isDeadlineClose = (deadline: string | null) => {
  if (!deadline) return false;
  const deadlineDate = new Date(deadline);
  const now = new Date();
  const diffDays = Math.ceil((deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  return diffDays <= 7 && diffDays >= 0;
};

const isDeadlinePassed = (deadline: string | null) => {
  if (!deadline) return false;
  const deadlineDate = new Date(deadline);
  const now = new Date();
  return deadlineDate < now;
};

export const MarchePublicView = () => {
  const { effectiveOrgId } = useAuth();
  const [marches, setMarches] = useState<MarchePublic[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sourceFilter, setSourceFilter] = useState<string | null>(null);

  const fetchMarches = async () => {
    if (!effectiveOrgId) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("organization_marche_public")
        .select("*")
        .eq("organization_id", effectiveOrgId)
        .order("date_publication", { ascending: false });

      if (error) throw error;
      setMarches(data || []);
    } catch (error) {
      console.error("Error fetching marches publics:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMarches();
  }, [effectiveOrgId]);

  const sources = [...new Set(marches.map(m => m.source).filter(Boolean))];

  const filteredMarches = marches.filter(m => {
    const matchesSearch = !searchQuery || 
      m.titre?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.acheteur?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSource = !sourceFilter || m.source === sourceFilter;
    return matchesSearch && matchesSource;
  });

  const stats = {
    total: marches.length,
    withMontant: marches.filter(m => m.montant !== null).length,
    totalMontant: marches.reduce((acc, m) => acc + (m.montant || 0), 0)
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl p-5 border border-primary/20">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
              <FileText className="w-5 h-5 text-primary" />
            </div>
            <span className="text-sm text-muted-foreground">Opportunités</span>
          </div>
          <p className="text-3xl font-bold text-foreground">{stats.total}</p>
        </div>

        <div className="bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 rounded-2xl p-5 border border-emerald-500/20">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
              <Euro className="w-5 h-5 text-emerald-600" />
            </div>
            <span className="text-sm text-muted-foreground">Valeur totale</span>
          </div>
          <p className="text-3xl font-bold text-foreground">{formatMontant(stats.totalMontant)}</p>
        </div>

        <div className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 rounded-2xl p-5 border border-blue-500/20">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-sm text-muted-foreground">Avec montant</span>
          </div>
          <p className="text-3xl font-bold text-foreground">{stats.withMontant}</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher un marché..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-card border-border"
          />
        </div>
        
        <div className="flex gap-2 flex-wrap">
          <Button
            variant={sourceFilter === null ? "default" : "outline"}
            size="sm"
            onClick={() => setSourceFilter(null)}
            className="rounded-full"
          >
            Tous
          </Button>
          {sources.map(source => (
            <Button
              key={source}
              variant={sourceFilter === source ? "default" : "outline"}
              size="sm"
              onClick={() => setSourceFilter(source)}
              className="rounded-full"
            >
              {source}
            </Button>
          ))}
          <Button
            variant="outline"
            size="sm"
            onClick={fetchMarches}
            className="rounded-full"
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {filteredMarches.length === 0 ? (
        <div className="text-center py-16 bg-secondary/20 rounded-2xl">
          <Briefcase className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-muted-foreground font-medium">Aucun marché public trouvé</p>
          <p className="text-sm text-muted-foreground/70 mt-1">
            Les opportunités apparaîtront ici automatiquement
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredMarches.map((marche) => (
            <div
              key={marche.id}
              className={cn(
                "group relative bg-card rounded-3xl border border-border p-6 transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 hover:border-primary/30",
                isDeadlinePassed(marche.deadline) && "opacity-60"
              )}
            >
              <div className="absolute top-4 right-4 flex gap-2">
                {marche.source && (
                  <Badge variant="outline" className={cn("text-xs font-medium", getSourceColor(marche.source))}>
                    {marche.source}
                  </Badge>
                )}
                {isDeadlineClose(marche.deadline) && !isDeadlinePassed(marche.deadline) && (
                  <Badge className="bg-orange-500/10 text-orange-600 border-orange-500/20 text-xs">
                    <Clock className="w-3 h-3 mr-1" />
                    Urgent
                  </Badge>
                )}
                {isDeadlinePassed(marche.deadline) && (
                  <Badge className="bg-red-500/10 text-red-600 border-red-500/20 text-xs">
                    Expiré
                  </Badge>
                )}
              </div>

              <div className="pr-24 mb-4">
                <h3 className="font-semibold text-foreground text-lg leading-tight line-clamp-2 group-hover:text-primary transition-colors">
                  {marche.titre || "Sans titre"}
                </h3>
                {marche.external_id && (
                  <p className="text-xs text-muted-foreground mt-1">Réf: {marche.external_id}</p>
                )}
              </div>

              <div className="space-y-3">
                {marche.acheteur && (
                  <div className="flex items-start gap-2">
                    <Building2 className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                    <span className="text-sm text-foreground line-clamp-2">{marche.acheteur}</span>
                  </div>
                )}

                <div className="flex items-center gap-4 flex-wrap">
                  {marche.montant !== null && (
                    <div className="flex items-center gap-2">
                      <Euro className="w-4 h-4 text-emerald-500" />
                      <span className="text-sm font-semibold text-emerald-600">{formatMontant(marche.montant)}</span>
                    </div>
                  )}

                  {marche.date_publication && (
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">{formatDate(marche.date_publication)}</span>
                    </div>
                  )}

                  {marche.deadline && (
                    <div className={cn(
                      "flex items-center gap-2",
                      isDeadlineClose(marche.deadline) && !isDeadlinePassed(marche.deadline) && "text-orange-600"
                    )}>
                      <Clock className="w-4 h-4" />
                      <span className="text-sm font-medium">Limite: {formatDate(marche.deadline)}</span>
                    </div>
                  )}
                </div>
              </div>

              {marche.url && (
                <div className="mt-4 pt-4 border-t border-border">
                  <a
                    href={marche.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-primary hover:text-primary/80 font-medium transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Voir l'appel d'offres
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
