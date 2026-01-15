import {
  LayoutGrid,
  HelpCircle,
  ChevronLeft,
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
        "fixed left-4 top-4 shadow-2xl sidebar-transition z-50 rounded-[32px] border border-white/5",
        "bg-[#0A0E17]/95 backdrop-blur-xl flex flex-col", // Dark glass aesthetics
        collapsed
          ? "w-[80px] h-[calc(100vh-32px)]"
          : "w-[280px] h-[calc(100vh-32px)]"
      )}
    >
      {/* Brand & Toggle */}
      <div className={cn(
        "relative flex items-center px-6 py-8",
        collapsed ? "justify-center" : "justify-between"
      )}>
        <button
          onClick={() => collapsed && onToggle()}
          className="flex items-center gap-4 overflow-hidden group/brand focus:outline-none"
        >
          <div className={cn(
            "w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20 transition-all duration-300",
            "bg-gradient-to-tr from-primary via-violet-500 to-indigo-500",
            collapsed ? "scale-100" : "group-hover/brand:scale-105"
          )}>
            <span className="text-white font-bold text-xl">S</span>
          </div>
          <span className={cn(
            "text-white font-bold text-xl tracking-tight transition-all duration-300 whitespace-nowrap",
            collapsed ? "opacity-0 w-0" : "opacity-100 w-auto"
          )}>
            Socialy
          </span>
        </button>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 px-4 overflow-y-auto scrollbar-hide py-2">
        <ul className="space-y-2">
          {menuItems.map((item, index) => {
            const isActive = currentPath === item.path;

            return (
              <li key={index}>
                <button
                  onClick={() => navigate(item.path)}
                  className={cn(
                    "relative group flex items-center w-full py-3.5 rounded-2xl transition-all duration-300 ease-out",
                    collapsed ? "justify-center px-0" : "px-4",
                    isActive
                      ? "text-white"
                      : "text-gray-400 hover:text-white hover:bg-white/5"
                  )}
                >
                  {/* Active Background Indicator */}
                  {isActive && (
                    <div className={cn(
                      "absolute inset-0 rounded-2xl bg-gradient-to-r from-primary/20 to-violet-500/20 opacity-100",
                      collapsed ? "w-12 h-12 left-1/2 -translate-x-1/2" : "w-full"
                    )} />
                  )}

                  {/* Icon */}
                  <div className={cn(
                    "relative z-10 transition-all duration-300",
                    isActive ? "text-primary scale-110" : "group-hover:text-white"
                  )}>
                    <item.icon className="w-[22px] h-[22px]" />
                  </div>

                  {/* Label (Expanded Only) */}
                  <div className={cn(
                    "relative z-10 flex-1 text-left ml-4 whitespace-nowrap overflow-hidden transition-all duration-300",
                    collapsed ? "w-0 opacity-0 ml-0" : "w-auto opacity-100"
                  )}>
                    <span className={cn(
                      "text-[15px] font-medium block truncate",
                      isActive ? "font-semibold" : ""
                    )}>
                      {item.label}
                    </span>
                  </div>

                  {/* Active Dot (Expanded Only) */}
                  {!collapsed && isActive && (
                    <div className="w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_8px_currentColor] ml-2" />
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Bottom Actions */}
      <div className="p-4 mt-auto space-y-2 relative z-20">

        {/* Help Button */}
        <button
          className={cn(
            "w-full rounded-2xl flex items-center transition-all duration-300 group border border-transparent",
            "hover:bg-white/5 hover:border-white/5",
            collapsed ? "justify-center h-12" : "px-4 py-3 gap-3"
          )}
        >
          <div className="w-9 h-9 rounded-xl bg-violet-500/10 flex items-center justify-center group-hover:bg-violet-500/20 transition-colors">
            <HelpCircle className="w-5 h-5 text-violet-400" />
          </div>
          {!collapsed && (
            <span className="text-sm font-medium text-gray-400 group-hover:text-gray-200">
              Aide & Support
            </span>
          )}
        </button>

        {/* Separator */}
        <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent my-2" />

        {/* Collapse Toggle (Bottom) */}
        <button
          onClick={onToggle}
          className={cn(
            "w-full flex items-center justify-center hover:bg-white/5 rounded-xl transition-all duration-300 text-gray-500 hover:text-white h-8",
            collapsed ? "rotate-180" : ""
          )}
        >
          <div className="flex items-center gap-2">
            {!collapsed && <span className="text-xs font-medium uppercase tracking-widest opacity-50">Réduire</span>}
            <ChevronLeft className="w-4 h-4" />
          </div>
        </button>
      </div>
    </aside>
  );
};