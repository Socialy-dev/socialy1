import { useState, useEffect } from "react";
import { 
  Briefcase, 
  Calendar, 
  Building2, 
  Euro, 
  ExternalLink, 
  Clock,
  FileText,
  Loader2,
  RefreshCw,
  Search,
  TrendingUp,
  Check,
  Star,
  X,
  Users
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

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

interface UserSelection {
  id: string;
  user_id: string;
  marche_public_id: string;
  status: string;
}

interface TeamSelection {
  id: string;
  user_id: string;
  marche_public_id: string;
  status: string;
  user_name: string;
  user_initials: string;
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
  const { effectiveOrgId, user } = useAuth();
  const [marches, setMarches] = useState<MarchePublic[]>([]);
  const [selections, setSelections] = useState<UserSelection[]>([]);
  const [teamSelections, setTeamSelections] = useState<TeamSelection[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sourceFilter, setSourceFilter] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"all" | "selected" | "team" | "dismissed">("all");
  const [lastVisitAt, setLastVisitAt] = useState<Date | null>(null);
  const [newMarchesCount, setNewMarchesCount] = useState(0);

  const fetchLastVisit = async () => {
    if (!effectiveOrgId || !user?.id) return null;
    
    try {
      const { data, error } = await supabase
        .from("user_marche_last_visit" as any)
        .select("last_visit_at")
        .eq("user_id", user.id)
        .eq("organization_id", effectiveOrgId)
        .maybeSingle();

      if (error) throw error;
      const record = data as unknown as { last_visit_at: string } | null;
      return record?.last_visit_at ? new Date(record.last_visit_at) : null;
    } catch (error) {
      console.error("Error fetching last visit:", error);
      return null;
    }
  };

  const updateLastVisit = async () => {
    if (!effectiveOrgId || !user?.id) return;
    
    try {
      const { error } = await supabase
        .from("user_marche_last_visit" as any)
        .upsert({
          user_id: user.id,
          organization_id: effectiveOrgId,
          last_visit_at: new Date().toISOString()
        } as any, {
          onConflict: "user_id,organization_id"
        });

      if (error) throw error;
    } catch (error) {
      console.error("Error updating last visit:", error);
    }
  };

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

  const fetchSelections = async () => {
    if (!effectiveOrgId || !user?.id) return;
    
    try {
      const { data, error } = await supabase
        .from("user_marche_selections" as any)
        .select("id, user_id, marche_public_id, status")
        .eq("organization_id", effectiveOrgId);

      if (error) throw error;
      
      const allSelections = (data || []) as unknown as UserSelection[];
      
      const mySelections = allSelections.filter(s => s.user_id === user.id);
      setSelections(mySelections);
      
      const otherSelectionsLocal = allSelections.filter(s => s.user_id !== user.id && s.status === "selected");
      
      if (otherSelectionsLocal.length > 0) {
        const { data: teamData, error: teamError } = await supabase.functions.invoke("get-team-marche-selections", {
          body: { organization_id: effectiveOrgId }
        });
        
        if (teamError) {
          console.error("Error fetching team selections:", teamError);
          setTeamSelections([]);
        } else {
          setTeamSelections(teamData?.teamSelections || []);
        }
      } else {
        setTeamSelections([]);
      }
    } catch (error) {
      console.error("Error fetching selections:", error);
    }
  };

  useEffect(() => {
    const initializeData = async () => {
      const lastVisit = await fetchLastVisit();
      setLastVisitAt(lastVisit);
      
      await Promise.all([fetchMarches(), fetchSelections()]);
      
      await updateLastVisit();
    };
    
    initializeData();
  }, [effectiveOrgId, user?.id]);

  useEffect(() => {
    if (marches.length > 0 && lastVisitAt) {
      const newCount = marches.filter(m => new Date(m.created_at) > lastVisitAt).length;
      setNewMarchesCount(newCount);
    } else if (marches.length > 0 && !lastVisitAt) {
      setNewMarchesCount(marches.length);
    }
  }, [marches, lastVisitAt]);

  const toggleSelection = async (marcheId: string) => {
    if (!effectiveOrgId || !user?.id) return;

    const existingSelection = selections.find(s => s.marche_public_id === marcheId);
    
    try {
      if (existingSelection) {
        if (existingSelection.status === "selected") {
          const { error } = await supabase
            .from("user_marche_selections" as any)
            .delete()
            .eq("id", existingSelection.id);
          
          if (error) throw error;
          setSelections(prev => prev.filter(s => s.id !== existingSelection.id));
          toast.success("Marché retiré de vos favoris");
        } else {
          const { error } = await supabase
            .from("user_marche_selections" as any)
            .update({ status: "selected" } as any)
            .eq("id", existingSelection.id);
          
          if (error) throw error;
          setSelections(prev => prev.map(s => 
            s.id === existingSelection.id ? { ...s, status: "selected" } : s
          ));
          toast.success("Marché ajouté à vos favoris");
        }
      } else {
        const { data, error } = await supabase
          .from("user_marche_selections" as any)
          .insert({
            user_id: user.id,
            organization_id: effectiveOrgId,
            marche_public_id: marcheId,
            status: "selected"
          } as any)
          .select()
          .single();
        
        if (error) throw error;
        const newSelection = data as unknown as UserSelection;
        setSelections(prev => [...prev, { ...newSelection, user_id: user.id }]);
        toast.success("Marché ajouté à vos favoris");
      }
    } catch (error) {
      console.error("Error toggling selection:", error);
      toast.error("Erreur lors de la modification");
    }
  };

  const dismissMarche = async (marcheId: string) => {
    if (!effectiveOrgId || !user?.id) return;

    const existingSelection = selections.find(s => s.marche_public_id === marcheId);
    
    try {
      if (existingSelection) {
        const { error } = await supabase
          .from("user_marche_selections" as any)
          .update({ status: "dismissed" } as any)
          .eq("id", existingSelection.id);
        
        if (error) throw error;
        setSelections(prev => prev.map(s => 
          s.id === existingSelection.id ? { ...s, status: "dismissed" } : s
        ));
      } else {
        const { data, error } = await supabase
          .from("user_marche_selections" as any)
          .insert({
            user_id: user.id,
            organization_id: effectiveOrgId,
            marche_public_id: marcheId,
            status: "dismissed"
          } as any)
          .select()
          .single();
        
        if (error) throw error;
        const newSelection = data as unknown as UserSelection;
        setSelections(prev => [...prev, { ...newSelection, user_id: user.id }]);
      }
      toast.success("Marché masqué");
    } catch (error) {
      console.error("Error dismissing marche:", error);
      toast.error("Erreur lors du masquage");
    }
  };

  const getSelectionStatus = (marcheId: string): string | null => {
    const selection = selections.find(s => s.marche_public_id === marcheId);
    return selection?.status || null;
  };

  const getTeamMembersForMarche = (marcheId: string): TeamSelection[] => {
    return teamSelections.filter(s => s.marche_public_id === marcheId);
  };

  const sources = [...new Set(marches.map(m => m.source).filter(Boolean))];

  const myFavoritesCount = selections.filter(s => s.status === "selected").length;
  const teamFavoritesCount = [...new Set(teamSelections.map(s => s.marche_public_id))].length;
  const teamMembersCount = [...new Set(teamSelections.map(s => s.user_id))].length;

  const filteredMarches = marches.filter(m => {
    const matchesSearch = !searchQuery || 
      m.titre?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.acheteur?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSource = !sourceFilter || m.source === sourceFilter;
    
    const status = getSelectionStatus(m.id);
    const hasTeamSelection = teamSelections.some(ts => ts.marche_public_id === m.id);
    
    if (viewMode === "selected") {
      return matchesSearch && status === "selected";
    } else if (viewMode === "team") {
      return matchesSearch && hasTeamSelection;
    } else if (viewMode === "dismissed") {
      return matchesSearch && status === "dismissed";
    } else {
      return matchesSearch && matchesSource && status !== "dismissed";
    }
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
              <TrendingUp className="w-5 h-5 text-emerald-600" />
            </div>
            <span className="text-sm text-muted-foreground">Nouveaux</span>
          </div>
          <p className="text-3xl font-bold text-foreground">{newMarchesCount}</p>
          <p className="text-xs text-muted-foreground mt-1">depuis votre dernière visite</p>
        </div>

        <div 
          className={cn(
            "rounded-2xl p-5 border cursor-pointer transition-all duration-300",
            viewMode === "selected"
              ? "bg-gradient-to-br from-amber-500/20 to-amber-500/10 border-amber-500/40 ring-2 ring-amber-500/30"
              : "bg-gradient-to-br from-amber-500/10 to-amber-500/5 border-amber-500/20 hover:border-amber-500/40"
          )}
          onClick={() => setViewMode(viewMode === "selected" ? "all" : "selected")}
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
              <Star className="w-5 h-5 text-amber-600" />
            </div>
            <span className="text-sm text-muted-foreground">Mes favoris</span>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-3xl font-bold text-foreground">{myFavoritesCount}</p>
            {myFavoritesCount > 0 && (
              <Badge className="bg-amber-500 text-white border-0">
                {viewMode === "selected" ? "Voir tout" : "Voir"}
              </Badge>
            )}
          </div>
        </div>

        <div 
          className={cn(
            "rounded-2xl p-5 border cursor-pointer transition-all duration-300",
            viewMode === "team"
              ? "bg-gradient-to-br from-violet-500/20 to-violet-500/10 border-violet-500/40 ring-2 ring-violet-500/30"
              : "bg-gradient-to-br from-violet-500/10 to-violet-500/5 border-violet-500/20 hover:border-violet-500/40"
          )}
          onClick={() => setViewMode(viewMode === "team" ? "all" : "team")}
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-violet-500/20 flex items-center justify-center">
              <Users className="w-5 h-5 text-violet-600" />
            </div>
            <span className="text-sm text-muted-foreground">Favoris équipe</span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-bold text-foreground">{teamFavoritesCount}</p>
              {teamMembersCount > 0 && (
                <p className="text-xs text-muted-foreground mt-1">par {teamMembersCount} membre{teamMembersCount > 1 ? "s" : ""}</p>
              )}
            </div>
            {teamFavoritesCount > 0 && (
              <Badge className="bg-violet-500 text-white border-0">
                {viewMode === "team" ? "Voir tout" : "Voir"}
              </Badge>
            )}
          </div>
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
            variant={viewMode === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("all")}
            className="rounded-full"
          >
            Tous
          </Button>
          <Button
            variant={viewMode === "selected" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("selected")}
            className={cn(
              "rounded-full gap-1",
              viewMode === "selected" && "bg-amber-500 hover:bg-amber-600"
            )}
          >
            <Star className="w-3 h-3" />
            Favoris ({myFavoritesCount})
          </Button>
          <Button
            variant={viewMode === "team" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("team")}
            className={cn(
              "rounded-full gap-1",
              viewMode === "team" && "bg-violet-500 hover:bg-violet-600"
            )}
          >
            <Users className="w-3 h-3" />
            Équipe ({teamFavoritesCount})
          </Button>
          <Button
            variant={viewMode === "dismissed" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("dismissed")}
            className="rounded-full"
          >
            Masqués
          </Button>
          <div className="h-6 w-px bg-border mx-1" />
          {sources.map(source => (
            <Button
              key={source}
              variant={sourceFilter === source ? "default" : "outline"}
              size="sm"
              onClick={() => setSourceFilter(sourceFilter === source ? null : source)}
              className="rounded-full"
            >
              {source}
            </Button>
          ))}
          <Button
            variant="outline"
            size="sm"
            onClick={() => { fetchMarches(); fetchSelections(); }}
            className="rounded-full"
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {filteredMarches.length === 0 ? (
        <div className="text-center py-16 bg-secondary/20 rounded-2xl">
          <Briefcase className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-muted-foreground font-medium">
            {viewMode === "selected" 
              ? "Aucun marché en favoris" 
              : viewMode === "team"
                ? "Aucun favori d'équipe"
                : viewMode === "dismissed"
                  ? "Aucun marché masqué"
                  : "Aucun marché public trouvé"}
          </p>
          <p className="text-sm text-muted-foreground/70 mt-1">
            {viewMode === "selected" 
              ? "Cliquez sur l'étoile pour ajouter des marchés en favoris" 
              : viewMode === "team"
                ? "Les marchés sélectionnés par votre équipe apparaîtront ici"
                : viewMode === "dismissed"
                  ? "Les marchés masqués apparaîtront ici"
                  : "Les opportunités apparaîtront ici automatiquement"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredMarches.map((marche) => {
            const status = getSelectionStatus(marche.id);
            const isSelected = status === "selected";
            const teamMembers = getTeamMembersForMarche(marche.id);
            
            return (
              <div
                key={marche.id}
                className={cn(
                  "group relative bg-card rounded-3xl border p-6 transition-all duration-300 hover:shadow-xl hover:shadow-primary/5",
                  isSelected 
                    ? "border-amber-500/50 ring-2 ring-amber-500/20" 
                    : teamMembers.length > 0
                      ? "border-violet-500/30"
                      : "border-border hover:border-primary/30",
                  isDeadlinePassed(marche.deadline) && "opacity-60"
                )}
              >
                <div className="absolute top-4 right-4 flex gap-2">
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleSelection(marche.id); }}
                    className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200",
                      isSelected
                        ? "bg-amber-500 text-white shadow-lg shadow-amber-500/30"
                        : "bg-muted/50 text-muted-foreground hover:bg-amber-500/20 hover:text-amber-600"
                    )}
                  >
                    <Star className={cn("w-4 h-4", isSelected && "fill-current")} />
                  </button>
                  {status !== "dismissed" && (
                    <button
                      onClick={(e) => { e.stopPropagation(); dismissMarche(marche.id); }}
                      className="w-8 h-8 rounded-full bg-muted/50 text-muted-foreground hover:bg-red-500/20 hover:text-red-600 flex items-center justify-center transition-all duration-200"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="flex items-start gap-3 mb-4 pr-20">
                  {isSelected && (
                    <div className="w-6 h-6 rounded-full bg-amber-500/20 flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-3.5 h-3.5 text-amber-600" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground text-lg leading-tight line-clamp-2 group-hover:text-primary transition-colors">
                      {marche.titre || "Sans titre"}
                    </h3>
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      {marche.source && (
                        <Badge variant="outline" className={cn("text-xs font-medium", getSourceColor(marche.source))}>
                          {marche.source}
                        </Badge>
                      )}
                      {marche.external_id && (
                        <span className="text-xs text-muted-foreground">Réf: {marche.external_id}</span>
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
                  </div>
                </div>

                {teamMembers.length > 0 && (
                  <div className="mb-4 p-3 bg-violet-500/5 rounded-xl border border-violet-500/10">
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="w-4 h-4 text-violet-600" />
                      <span className="text-xs font-medium text-violet-600">Sélectionné par l'équipe</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {teamMembers.map((member) => (
                        <div key={member.id} className="flex items-center gap-1.5 bg-violet-500/10 rounded-full px-2 py-1">
                          <Avatar className="w-5 h-5">
                            <AvatarFallback className="text-[10px] bg-violet-500 text-white">
                              {member.user_initials}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-xs text-violet-700 dark:text-violet-300">{member.user_name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

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
            );
          })}
        </div>
      )}
    </div>
  );
};
