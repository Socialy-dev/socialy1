import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface Campaign {
  id: string;
  campaign_id: string;
  campaign_name: string | null;
  status: string | null;
  platform: string;
  impressions: number;
  clicks: number;
  spend: number;
  ctr: number;
  cpc: number;
}

interface PaidCampaignsTableProps {
  campaigns: Campaign[];
  isLoading?: boolean;
}

export const PaidCampaignsTable = ({ campaigns, isLoading }: PaidCampaignsTableProps) => {
  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toFixed(0);
  };

  const formatCurrency = (num: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num);
  };

  const getStatusColor = (status: string | null) => {
    const s = status?.toLowerCase();
    if (s === "active" || s === "enabled") return "bg-success/10 text-success border-success/20";
    if (s === "paused") return "bg-warning/10 text-warning border-warning/20";
    if (s === "archived" || s === "removed") return "bg-muted text-muted-foreground border-border";
    return "bg-secondary text-secondary-foreground border-border";
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-12 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (campaigns.length === 0) {
    return (
      <div className="py-12 text-center text-muted-foreground">
        <p className="text-sm">Aucune campagne trouvée</p>
        <p className="text-xs mt-1">Les campagnes apparaîtront une fois synchronisées</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border/50 overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/30 hover:bg-muted/30">
            <TableHead className="font-semibold">Nom</TableHead>
            <TableHead className="font-semibold">Statut</TableHead>
            <TableHead className="font-semibold text-right">Impressions</TableHead>
            <TableHead className="font-semibold text-right">Clics</TableHead>
            <TableHead className="font-semibold text-right">Dépenses</TableHead>
            <TableHead className="font-semibold text-right">CTR</TableHead>
            <TableHead className="font-semibold text-right">CPC</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {campaigns.map((campaign) => (
            <TableRow key={campaign.id} className="group hover:bg-muted/20 transition-colors">
              <TableCell className="font-medium">
                {campaign.campaign_name || campaign.campaign_id}
              </TableCell>
              <TableCell>
                <Badge
                  variant="outline"
                  className={cn("text-xs font-medium", getStatusColor(campaign.status))}
                >
                  {campaign.status || "Unknown"}
                </Badge>
              </TableCell>
              <TableCell className="text-right tabular-nums">
                {formatNumber(campaign.impressions)}
              </TableCell>
              <TableCell className="text-right tabular-nums">
                {formatNumber(campaign.clicks)}
              </TableCell>
              <TableCell className="text-right tabular-nums font-medium">
                {formatCurrency(campaign.spend)}
              </TableCell>
              <TableCell className="text-right tabular-nums">
                {campaign.ctr.toFixed(2)}%
              </TableCell>
              <TableCell className="text-right tabular-nums">
                {formatCurrency(campaign.cpc)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
