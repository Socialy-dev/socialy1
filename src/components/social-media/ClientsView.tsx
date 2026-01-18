import { useState } from "react";
import { cn } from "@/lib/utils";
import { Plus, Briefcase, TrendingUp, TrendingDown, ExternalLink, Globe, BarChart3, UsersRound, FileText } from "lucide-react";
import { PlatformDropdown, Platform } from "./PlatformDropdown";

interface Client {
  id: string;
  name: string;
  logo?: string;
  type: "startup" | "enterprise" | "agency";
  website?: string;
  stats: {
    followers: number;
    engagement: number;
    posts: number;
    trend: number;
  };
  platforms: string[];
}

const mockClients: Client[] = [
  {
    id: "1",
    name: "Tech Solutions",
    logo: undefined,
    type: "enterprise",
    website: "techsolutions.fr",
    stats: { followers: 45200, engagement: 5.8, posts: 234, trend: 18 },
    platforms: ["linkedin", "twitter", "facebook"]
  },
  {
    id: "2",
    name: "Startup Factory",
    logo: undefined,
    type: "startup",
    website: "startupfactory.io",
    stats: { followers: 12800, engagement: 7.2, posts: 156, trend: 32 },
    platforms: ["linkedin", "instagram", "twitter"]
  },
  {
    id: "3",
    name: "Digital Agency Pro",
    logo: undefined,
    type: "agency",
    website: "digitalagencypro.com",
    stats: { followers: 28900, engagement: 4.5, posts: 312, trend: -3 },
    platforms: ["linkedin", "instagram", "facebook"]
  },
  {
    id: "4",
    name: "Innovate Corp",
    logo: undefined,
    type: "enterprise",
    website: "innovatecorp.eu",
    stats: { followers: 67500, engagement: 3.9, posts: 189, trend: 8 },
    platforms: ["linkedin", "twitter"]
  },
  {
    id: "5",
    name: "Green Tech",
    logo: undefined,
    type: "startup",
    website: "greentech.eco",
    stats: { followers: 8900, engagement: 8.1, posts: 98, trend: 45 },
    platforms: ["instagram", "linkedin", "facebook"]
  }
];

const typeConfig = {
  startup: { label: "Startup", gradient: "from-emerald-400 via-teal-500 to-cyan-600" },
  enterprise: { label: "Enterprise", gradient: "from-blue-500 via-indigo-600 to-purple-700" },
  agency: { label: "Agency", gradient: "from-orange-400 via-pink-500 to-rose-600" }
};

interface ClientCardProps {
  client: Client;
}

const formatNumber = (num: number) => {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
};

const ClientCard = ({ client }: ClientCardProps) => {
  const isPositiveTrend = client.stats.trend >= 0;
  const config = typeConfig[client.type];

  return (
    <div className="group relative overflow-hidden rounded-2xl bg-card border border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-xl hover:shadow-primary/5">
      <div className={cn(
        "h-20 bg-gradient-to-br relative overflow-hidden",
        config.gradient
      )}>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAgTSAwIDIwIEwgNDAgMjAgTSAyMCAwIEwgMjAgNDAgTSAwIDMwIEwgNDAgMzAgTSAzMCAwIEwgMzAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjA1KSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-50" />
        
        <div className="absolute top-3 right-3">
          <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-white/20 text-white backdrop-blur-sm">
            {config.label}
          </span>
        </div>

        <div className="absolute bottom-3 left-4 right-4">
          <h3 className="text-base font-bold text-white truncate drop-shadow-lg">
            {client.name}
          </h3>
        </div>
      </div>

      <div className="p-4">
        {client.website && (
          <div className="flex items-center gap-2 mb-3">
          <div className="w-4 h-4 rounded bg-muted flex items-center justify-center">
              <Globe className="w-2.5 h-2.5 text-muted-foreground" />
            </div>
            <a 
              href={client.website.startsWith("http") ? client.website : `https://${client.website}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-muted-foreground hover:text-primary truncate max-w-[160px] transition-colors"
            >
              {client.website}
            </a>
          </div>
        )}

        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="p-2 rounded-xl bg-secondary/30">
            <p className="text-[10px] text-muted-foreground mb-0.5">Followers</p>
            <p className="text-sm font-bold text-foreground">{formatNumber(client.stats.followers)}</p>
          </div>
          <div className="p-2 rounded-xl bg-secondary/30">
            <p className="text-[10px] text-muted-foreground mb-0.5">Engagement</p>
            <div className="flex items-center gap-1">
              <p className="text-sm font-bold text-foreground">{client.stats.engagement}%</p>
              {isPositiveTrend ? (
                <TrendingUp className="w-3 h-3 text-success" />
              ) : (
                <TrendingDown className="w-3 h-3 text-danger" />
              )}
            </div>
          </div>
        </div>

        <button className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-secondary/50 hover:bg-primary/10 text-xs font-medium text-muted-foreground hover:text-primary transition-all duration-200">
          <ExternalLink className="w-3 h-3" />
          Voir les analyses
        </button>
      </div>
    </div>
  );
};

interface ClientFilterProps {
  clients: { id: string; name: string }[];
  value: string;
  onChange: (id: string) => void;
}

const ClientFilter = ({ clients, value, onChange }: ClientFilterProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const allClients = [{ id: "all", name: "Tous les clients" }, ...clients];
  const currentClient = allClients.find(c => c.id === value) || allClients[0];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "group flex items-center gap-3 px-4 py-2.5 rounded-2xl",
          "bg-card border border-border/50 hover:border-primary/30",
          "transition-all duration-300 hover:shadow-lg hover:shadow-primary/5",
          "min-w-[200px]"
        )}
      >
        <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-gradient-to-br from-blue-500 to-indigo-600 shadow-md">
          <Briefcase className="w-4 h-4 text-white" />
        </div>
        <div className="flex-1 text-left">
          <p className="text-sm font-semibold text-foreground truncate max-w-[120px]">
            {currentClient.name}
          </p>
        </div>
        <svg className={cn("w-4 h-4 text-muted-foreground transition-transform duration-200", isOpen && "rotate-180")} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className={cn(
            "absolute top-full left-0 mt-2 w-full min-w-[240px]",
            "bg-card border border-border/50 rounded-2xl shadow-xl",
            "z-50 overflow-hidden max-h-[280px] overflow-y-auto",
            "animate-in fade-in-0 zoom-in-95 duration-200"
          )}>
            <div className="p-2">
              {allClients.map((client) => {
                const isSelected = value === client.id;

                return (
                  <button
                    key={client.id}
                    onClick={() => {
                      onChange(client.id);
                      setIsOpen(false);
                    }}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl",
                      "transition-all duration-200",
                      isSelected ? "bg-primary/10" : "hover:bg-secondary/50"
                    )}
                  >
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-gradient-to-br from-slate-400 to-slate-600">
                      <span className="text-white text-xs font-bold">
                        {client.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <span className={cn(
                      "flex-1 text-left text-sm font-medium truncate",
                      isSelected ? "text-primary" : "text-foreground"
                    )}>
                      {client.name}
                    </span>
                    {isSelected && (
                      <svg className="w-4 h-4 text-primary flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

interface ClientsViewProps {
  selectedPlatform: Platform;
  onPlatformChange: (platform: Platform) => void;
}

export const ClientsView = ({ selectedPlatform, onPlatformChange }: ClientsViewProps) => {
  const [selectedClient, setSelectedClient] = useState<string>("all");

  const filteredClients = selectedClient === "all"
    ? mockClients
    : mockClients.filter(c => c.id === selectedClient);

  const platformFilteredClients = selectedPlatform === "global"
    ? filteredClients
    : filteredClients.filter(c => c.platforms.includes(selectedPlatform));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <ClientFilter
            clients={mockClients.map(c => ({ id: c.id, name: c.name }))}
            value={selectedClient}
            onChange={setSelectedClient}
          />
          <PlatformDropdown value={selectedPlatform} onChange={onPlatformChange} />
        </div>

        <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200 text-sm font-medium shadow-lg shadow-primary/25">
          <Plus className="w-4 h-4" />
          Ajouter un client
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-card border border-border/50">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-white" />
            </div>
          </div>
          <p className="text-2xl font-bold text-foreground">{platformFilteredClients.length}</p>
          <p className="text-sm text-muted-foreground">Clients actifs</p>
        </div>

        <div className="p-5 rounded-2xl bg-card border border-border/50">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
          </div>
          <p className="text-2xl font-bold text-foreground">
            {(platformFilteredClients.reduce((sum, c) => sum + c.stats.engagement, 0) / platformFilteredClients.length || 0).toFixed(1)}%
          </p>
          <p className="text-sm text-muted-foreground">Engagement moyen</p>
        </div>

        <div className="p-5 rounded-2xl bg-card border border-border/50">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
              <UsersRound className="w-5 h-5 text-white" />
            </div>
          </div>
          <p className="text-2xl font-bold text-foreground">
            {(platformFilteredClients.reduce((sum, c) => sum + c.stats.followers, 0) / 1000).toFixed(1)}K
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
            {platformFilteredClients.reduce((sum, c) => sum + c.stats.posts, 0)}
          </p>
          <p className="text-sm text-muted-foreground">Posts gérés</p>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-bold text-foreground mb-4">Vos clients</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {platformFilteredClients.map((client) => (
            <ClientCard key={client.id} client={client} />
          ))}
        </div>

        {platformFilteredClients.length === 0 && (
          <div className="text-center py-16 rounded-2xl bg-card border border-dashed border-border">
            <Briefcase className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-base font-medium text-muted-foreground mb-2">
              Aucun client trouvé
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              Ajoutez des clients pour suivre leur performance
            </p>
            <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm font-medium mx-auto">
              <Plus className="w-4 h-4" />
              Ajouter un client
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
