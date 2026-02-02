import { ChevronDown, Globe } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import type { PaidPlatform } from "./PaidDashboardView";

interface PaidPlatformFilterProps {
  selectedPlatform: PaidPlatform;
  onSelect: (platform: PaidPlatform) => void;
}

const platforms: { id: PaidPlatform; label: string }[] = [
  { id: "all", label: "Toutes les plateformes" },
  { id: "meta", label: "Meta Ads" },
  { id: "google", label: "Google Ads" },
  { id: "linkedin", label: "LinkedIn Ads" },
  { id: "pinterest", label: "Pinterest Ads" },
  { id: "tiktok", label: "TikTok Ads" },
];

export const PaidPlatformFilter = ({
  selectedPlatform,
  onSelect,
}: PaidPlatformFilterProps) => {
  const selected = platforms.find((p) => p.id === selectedPlatform);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="bg-secondary/50 border-border/50 hover:bg-secondary"
        >
          <Globe className="w-4 h-4 mr-2" />
          {selected?.label || "Toutes les plateformes"}
          <ChevronDown className="w-4 h-4 ml-2" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        {platforms.map((platform) => (
          <DropdownMenuItem
            key={platform.id}
            onClick={() => onSelect(platform.id)}
          >
            {platform.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
