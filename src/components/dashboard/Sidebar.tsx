import {
  LayoutGrid,
  Briefcase,
  ListTodo,
  Globe,
  Clock,
  Users2,
  UserCog,
  FileText,
  Settings,
  HelpCircle,
  Plus,
  ChevronLeft,
  ChevronRight,
  Newspaper,
  Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import socialyLogo from "@/assets/socialy-logo.png";

interface MenuItem {
  icon: React.ElementType;
  label: string;
  path: string;
  adminOnly?: boolean;
}

const menuItems: MenuItem[] = [
  { icon: LayoutGrid, label: "Accueil", path: "/dashboard" },
  { icon: Newspaper, label: "Relations Presse", path: "/relations-presse" },
  { icon: Briefcase, label: "Studio", path: "/studio" },
  { icon: ListTodo, label: "Concurrent", path: "/concurrent" },
  { icon: Globe, label: "Dashboard", path: "/analytics" },
  { icon: Clock, label: "Création", path: "/creation" },
  { icon: Users2, label: "Resource mgmt", path: "/resources" },
  { icon: UserCog, label: "Users", path: "/users" },
  { icon: FileText, label: "Project template", path: "/templates" },
  { icon: Settings, label: "Menu settings", path: "/settings" },
  { icon: Shield, label: "Administration", path: "/admin", adminOnly: true },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export const Sidebar = ({ collapsed, onToggle }: SidebarProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const currentPath = location.pathname;

  // Filter menu items based on admin status
  const visibleMenuItems = menuItems.filter(
    (item) => !item.adminOnly || isAdmin
  );

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 h-screen bg-sidebar flex flex-col z-50 sidebar-transition overflow-hidden",
        collapsed ? "w-20" : "w-64"
      )}
    >
      {/* Toggle Button - Inside sidebar at top */}
      <div className={cn(
        "flex items-center px-4 pt-4",
        collapsed ? "justify-center" : "justify-end"
      )}>
        <button
          onClick={onToggle}
          className="w-8 h-8 rounded-lg bg-sidebar-foreground/10 hover:bg-sidebar-foreground/20 flex items-center justify-center transition-colors group"
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4 text-sidebar-foreground/70 group-hover:text-sidebar-foreground" />
          ) : (
            <ChevronLeft className="w-4 h-4 text-sidebar-foreground/70 group-hover:text-sidebar-foreground" />
          )}
        </button>
      </div>

      {/* Logo */}
      <div className={cn(
        "flex items-center gap-3 px-6 pb-4 pt-2",
        collapsed && "justify-center px-4"
      )}>
        <img 
          src={socialyLogo} 
          alt="Socialy" 
          className="w-10 h-10 rounded-full flex-shrink-0"
        />
        {!collapsed && (
          <span className="text-sidebar-foreground font-bold text-xl">Socialy</span>
        )}
      </div>


      {/* Create New Project Button */}
      <div className={cn("px-4 mb-4", collapsed && "px-2")}>
        <button
          className={cn(
            "w-full bg-card text-foreground rounded-xl py-3 flex items-center gap-3 hover:bg-secondary transition-colors font-medium",
            collapsed ? "px-3 justify-center" : "px-4"
          )}
        >
          <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
            <Plus className="w-4 h-4 text-primary-foreground" />
          </div>
          {!collapsed && <span className="text-sm">Create new project</span>}
        </button>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 px-3 overflow-y-auto scrollbar-hide">
        <ul className="space-y-1">
          {visibleMenuItems.map((item, index) => {
            const isActive = currentPath === item.path;
            return (
              <li key={index}>
                <button
                  onClick={() => navigate(item.path)}
                  className={cn(
                    "w-full flex items-center gap-3 py-3 rounded-xl transition-all duration-200",
                    collapsed ? "px-3 justify-center" : "px-4",
                    isActive
                      ? "bg-card/10 text-primary"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-foreground/5 hover:text-sidebar-foreground"
                  )}
                >
                  <item.icon className={cn("w-5 h-5 flex-shrink-0", isActive && "text-primary")} />
                  {!collapsed && (
                    <span className="text-sm font-medium">{item.label}</span>
                  )}
                  {isActive && !collapsed && (
                    <div className="ml-auto w-2 h-2 rounded-full bg-primary" />
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Help Button */}
      <div className={cn("p-4", collapsed && "flex justify-center")}>
        <button className="w-12 h-12 rounded-full bg-primary flex items-center justify-center hover:bg-primary/90 transition-colors">
          <HelpCircle className="w-6 h-6 text-primary-foreground" />
        </button>
      </div>
    </aside>
  );
};