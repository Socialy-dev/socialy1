import { useState } from "react";
import { ChevronDown, Check, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";

interface OrganizationSelectorProps {
  collapsed: boolean;
}

export const OrganizationSelector = ({ collapsed }: OrganizationSelectorProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { 
    currentOrganization, 
    allOrganizations, 
    isSuperAdmin, 
    switchOrganization,
    viewAsOrgId,
    setViewAsOrgId 
  } = useAuth();

  const orgsToShow = isSuperAdmin ? allOrganizations : [currentOrganization].filter(Boolean);
  const activeOrg = isSuperAdmin && viewAsOrgId 
    ? allOrganizations.find(o => o.id === viewAsOrgId) || currentOrganization
    : currentOrganization;

  if (!activeOrg) return null;

  const handleOrgSelect = (orgId: string) => {
    if (isSuperAdmin) {
      if (orgId === currentOrganization?.id) {
        setViewAsOrgId(null);
      } else {
        setViewAsOrgId(orgId);
      }
    } else {
      switchOrganization(orgId);
    }
    setIsOpen(false);
  };

  const handleOpenChange = (open: boolean) => {
    if (collapsed) {
      setIsOpen(false);
      return;
    }
    setIsOpen(open);
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger asChild disabled={collapsed}>
        <button
          className={cn(
            "flex items-center w-full rounded-xl transition-all duration-200",
            collapsed ? "justify-center p-2 cursor-default" : "px-3 py-2.5 gap-3 hover:bg-white/5 group cursor-pointer"
          )}
          onClick={(e) => {
            if (collapsed) {
              e.preventDefault();
              e.stopPropagation();
            }
          }}
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary via-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-primary/30 flex-shrink-0">
            {activeOrg.logo_url ? (
              <img src={activeOrg.logo_url} alt={activeOrg.name} className="w-full h-full rounded-xl object-cover" />
            ) : (
              <span className="text-white font-bold text-sm">{activeOrg.name.charAt(0).toUpperCase()}</span>
            )}
          </div>
          {!collapsed && (
            <>
              <div className="flex-1 text-left min-w-0">
                <span className="text-white font-semibold text-sm block truncate">{activeOrg.name}</span>
                {isSuperAdmin && viewAsOrgId && (
                  <span className="text-primary/70 text-xs">Vue en tant que</span>
                )}
              </div>
              <ChevronDown className={cn(
                "w-4 h-4 text-white/50 group-hover:text-white/80 transition-all flex-shrink-0",
                isOpen && "rotate-180"
              )} />
            </>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="start" 
        side="bottom"
        sideOffset={8}
        className="w-64 bg-popover border border-border shadow-2xl rounded-xl p-1.5 z-[100]"
      >
        <DropdownMenuLabel className="px-3 py-2 text-xs text-muted-foreground font-medium">
          {isSuperAdmin ? "Changer d'organisation" : "Vos organisations"}
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-border/50" />
        <div className="max-h-[300px] overflow-y-auto">
          {orgsToShow.map((org) => {
            if (!org) return null;
            const isActive = activeOrg.id === org.id;
            return (
              <DropdownMenuItem
                key={org.id}
                onClick={() => handleOrgSelect(org.id)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors",
                  isActive ? "bg-primary/10 text-primary" : "hover:bg-secondary"
                )}
              >
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/20 to-violet-500/20 flex items-center justify-center flex-shrink-0">
                  {org.logo_url ? (
                    <img src={org.logo_url} alt={org.name} className="w-full h-full rounded-lg object-cover" />
                  ) : (
                    <Building2 className="w-4 h-4 text-primary" />
                  )}
                </div>
                <span className="flex-1 truncate text-sm font-medium">{org.name}</span>
                {isActive && <Check className="w-4 h-4 text-primary flex-shrink-0" />}
              </DropdownMenuItem>
            );
          })}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
