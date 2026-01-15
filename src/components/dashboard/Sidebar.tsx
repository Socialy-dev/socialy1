import {
  LayoutGrid,
  HelpCircle,
  Newspaper,
  TrendingUp,
  Handshake,
  FileBarChart,
  Share2,
  Search,
  BarChart3,
  Users,
  Leaf,
  Package,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useLocation, useNavigate } from "react-router-dom";

interface MenuItem {
  icon: React.ElementType;
  label: string;
  path: string;
  adminOnly?: boolean;
}

const menuItems: MenuItem[] = [
  { icon: LayoutGrid, label: "Accueil", path: "/dashboard" },
  { icon: Newspaper, label: "Presse", path: "/relations-presse" },
  { icon: TrendingUp, label: "Growth Marketing", path: "/growth-marketing" },
  { icon: Handshake, label: "Biz Dev", path: "/biz-dev" },
  { icon: FileBarChart, label: "Reporting Client", path: "/reporting-client" },
  { icon: Share2, label: "Social Media", path: "/social-media" },
  { icon: Search, label: "SEO / GEO", path: "/seo-geo" },
  { icon: BarChart3, label: "Reporting Interne", path: "/reporting-interne" },
  { icon: Users, label: "RH", path: "/rh" },
  { icon: Leaf, label: "RSE", path: "/rse" },
  { icon: Package, label: "Fournisseurs", path: "/fournisseurs" },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export const Sidebar = ({ collapsed, onToggle }: SidebarProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;

  const handleMouseEnter = () => {
    if (collapsed) {
      onToggle();
    }
  };

  const handleMouseLeave = () => {
    if (!collapsed) {
      onToggle();
    }
  };

  return (
    <aside
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={cn(
        "fixed left-0 top-0 h-screen flex flex-col z-50 overflow-hidden",
        "transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]",
        collapsed ? "w-20" : "w-72"
      )}
      style={{
        background: 'linear-gradient(180deg, hsl(var(--sidebar-background)) 0%, hsl(222 47% 5%) 100%)',
      }}
    >
      <div className={cn(
        "flex px-4 border-b border-white/5 h-20 items-center",
        collapsed ? "justify-center" : "justify-start gap-3"
      )}>
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary via-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-primary/30 flex-shrink-0">
          <span className="text-white font-bold text-lg">S</span>
        </div>
        <span className={cn(
          "text-white font-bold text-xl tracking-tight whitespace-nowrap",
          "transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]",
          collapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100 w-auto"
        )}>
          Socialy
        </span>
      </div>

      <nav className="flex-1 py-4 overflow-y-auto scrollbar-hide">
        <div className="space-y-1 px-3">
          {menuItems.map((item, index) => {
            const isActive = currentPath === item.path;
            return (
              <button
                key={index}
                onClick={() => navigate(item.path)}
                className={cn(
                  "w-full flex items-center py-3 rounded-2xl group",
                  "transition-all duration-200 ease-out",
                  collapsed ? "justify-center px-0" : "px-4 gap-3",
                  isActive
                    ? "bg-white/10 text-white shadow-lg shadow-black/10"
                    : "text-white/50 hover:bg-white/5 hover:text-white/80"
                )}
              >
                <div className={cn(
                  "flex items-center justify-center flex-shrink-0 transition-all duration-200",
                  isActive && "text-primary"
                )}>
                  <item.icon className="w-5 h-5" />
                </div>
                <span className={cn(
                  "text-sm font-medium flex-1 text-left whitespace-nowrap",
                  "transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]",
                  collapsed ? "hidden" : "opacity-100"
                )}>
                  {item.label}
                </span>
                {!collapsed && isActive && (
                  <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_10px_rgba(139,92,246,0.8)] transition-all duration-300" />
                )}
              </button>
            );
          })}
        </div>
      </nav>

      <div className="p-3 border-t border-white/5">
        <button className={cn(
          "rounded-xl bg-gradient-to-br from-primary to-violet-600 flex items-center",
          "hover:opacity-90 transition-all duration-200",
          "shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30",
          collapsed ? "w-full h-12 justify-center" : "w-full py-3 px-4 gap-3"
        )}>
          <HelpCircle className="w-5 h-5 text-white flex-shrink-0" />
          <span className={cn(
            "text-sm font-medium text-white whitespace-nowrap flex-1 text-left",
            "transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]",
            collapsed ? "hidden" : "opacity-100"
          )}>
            Aide & Support
          </span>
        </button>
      </div>
    </aside>
  );
};
