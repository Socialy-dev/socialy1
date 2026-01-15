import {
  LayoutGrid,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
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
  Sparkles,
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

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 h-screen flex flex-col z-50 sidebar-transition overflow-hidden",
        collapsed ? "w-20" : "w-72"
      )}
      style={{
        background: 'linear-gradient(180deg, hsl(var(--sidebar-background)) 0%, hsl(222 47% 5%) 100%)',
      }}
    >
      {/* Logo & Toggle - Fixed height to prevent content jumping */}
      <div className={cn(
        "flex px-4 border-b border-white/5 transition-all duration-300 h-24",
        collapsed
          ? "flex-col items-center justify-center gap-3 py-4"
          : "items-center justify-between py-4"
      )}>
        {/* Toggle Button for Collapsed State (Top) */}
        {collapsed && (
          <button
            onClick={onToggle}
            className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all duration-200 group border border-white/5"
            title="Expand sidebar"
          >
            <ChevronRight className="w-5 h-5 text-white/70 group-hover:text-white" />
          </button>
        )}

        <div className={cn(
          "flex items-center gap-3",
          collapsed && "justify-center"
        )}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary via-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-primary/30 flex-shrink-0">
            <span className="text-white font-bold text-lg">S</span>
          </div>
          {!collapsed && (
            <span className="text-white font-bold text-xl tracking-tight">Socialy</span>
          )}
        </div>

        {/* Toggle Button for Expanded State (Right) */}
        {!collapsed && (
          <button
            onClick={onToggle}
            className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all duration-200 group border border-white/5"
            title="Collapse sidebar"
          >
            <ChevronLeft className="w-4 h-4 text-white/50 group-hover:text-white" />
          </button>
        )}
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto scrollbar-hide">
        <div className="space-y-1">
          {menuItems.map((item, index) => {
            const isActive = currentPath === item.path;
            return (
              <button
                key={index}
                onClick={() => navigate(item.path)}
                className={cn(
                  "w-full flex items-center gap-3 py-3 rounded-2xl transition-all duration-200 group",
                  collapsed ? "px-3 justify-center" : "px-4",
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
                {!collapsed && (
                  <>
                    <span className="text-sm font-medium flex-1 text-left">{item.label}</span>
                    {isActive && (
                      <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_10px_rgba(139,92,246,0.8)]" />
                    )}
                  </>
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Bottom Section */}
      <div className={cn(
        "p-4 border-t border-white/5",
        collapsed && "flex flex-col items-center gap-3"
      )}>
        {/* Help Button */}
        <button className={cn(
          "rounded-xl bg-gradient-to-br from-primary to-violet-600 flex items-center justify-center hover:opacity-90 transition-all shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30",
          collapsed ? "w-12 h-12" : "w-full py-3 gap-2"
        )}>
          <HelpCircle className="w-5 h-5 text-white" />
          {!collapsed && <span className="text-sm font-medium text-white">Aide & Support</span>}
        </button>
      </div>
    </aside>
  );
};