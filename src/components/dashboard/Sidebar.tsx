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
        "fixed left-0 top-0 h-screen flex flex-col z-50 sidebar-transition overflow-hidden border-r border-border/10",
        collapsed ? "w-20" : "w-64"
      )}
      style={{
        background: 'linear-gradient(180deg, hsl(var(--sidebar-background)) 0%, hsl(222 47% 8%) 100%)',
      }}
    >
      {/* Toggle Button */}
      <div className={cn(
        "flex items-center px-4 pt-5",
        collapsed ? "justify-center" : "justify-end"
      )}>
        <button
          onClick={onToggle}
          className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all duration-200 group border border-white/5"
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4 text-white/50 group-hover:text-white" />
          ) : (
            <ChevronLeft className="w-4 h-4 text-white/50 group-hover:text-white" />
          )}
        </button>
      </div>

      {/* Logo */}
      <div className={cn(
        "flex items-center gap-3 px-6 pb-6 pt-4",
        collapsed && "justify-center px-4"
      )}>
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-violet-600 flex items-center justify-center shadow-lg shadow-primary/20 flex-shrink-0">
          <span className="text-white font-bold text-lg">S</span>
        </div>
        {!collapsed && (
          <span className="text-white font-bold text-xl tracking-tight">Socialy</span>
        )}
      </div>


      {/* Navigation Menu */}
      <nav className="flex-1 px-3 overflow-y-auto scrollbar-hide">
        <ul className="space-y-1">
          {menuItems.map((item, index) => {
            const isActive = currentPath === item.path;
            return (
              <li key={index}>
                <button
                  onClick={() => navigate(item.path)}
                  className={cn(
                    "w-full flex items-center gap-3 py-3 rounded-xl transition-all duration-200",
                    collapsed ? "px-3 justify-center" : "px-4",
                    isActive
                      ? "bg-white/10 text-white shadow-lg shadow-black/5"
                      : "text-white/50 hover:bg-white/5 hover:text-white/80"
                  )}
                >
                  <item.icon className={cn(
                    "w-5 h-5 flex-shrink-0 transition-colors",
                    isActive && "text-primary dark:text-primary-foreground"
                  )} />
                  {!collapsed && (
                    <span className="text-sm font-medium">{item.label}</span>
                  )}
                  {isActive && !collapsed && (
                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_8px_rgba(139,92,246,0.6)]" />
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Help Button */}
      <div className={cn("p-4", collapsed && "flex justify-center")}>
        <button className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-violet-600 flex items-center justify-center hover:opacity-90 transition-all shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30">
          <HelpCircle className="w-5 h-5 text-white" />
        </button>
      </div>
    </aside>
  );
};