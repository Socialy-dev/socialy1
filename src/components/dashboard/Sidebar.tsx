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
} from "lucide-react";
import { cn } from "@/lib/utils";
import socialyLogo from "@/assets/socialy-logo.png";

interface MenuItem {
  icon: React.ElementType;
  label: string;
  active?: boolean;
}

const menuItems: MenuItem[] = [
  { icon: LayoutGrid, label: "Accueil", active: true },
  { icon: Briefcase, label: "Studio" },
  { icon: ListTodo, label: "Concurrent" },
  { icon: Globe, label: "Dashboard" },
  { icon: Clock, label: "Création" },
  { icon: Users2, label: "Resource mgmt" },
  { icon: UserCog, label: "Users" },
  { icon: FileText, label: "Project template" },
  { icon: Settings, label: "Menu settings" },
];

interface SidebarProps {
  collapsed: boolean;
}

export const Sidebar = ({ collapsed }: SidebarProps) => {
  return (
    <aside
      className={cn(
        "fixed left-0 top-0 h-screen bg-sidebar flex flex-col z-50 sidebar-transition overflow-hidden",
        collapsed ? "w-20" : "w-64"
      )}
    >
      {/* Logo */}
      <div className={cn(
        "flex items-center gap-3 p-6",
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
          {menuItems.map((item, index) => (
            <li key={index}>
              <button
                className={cn(
                  "w-full flex items-center gap-3 py-3 rounded-xl transition-all duration-200",
                  collapsed ? "px-3 justify-center" : "px-4",
                  item.active
                    ? "bg-card/10 text-primary"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-foreground/5 hover:text-sidebar-foreground"
                )}
              >
                <item.icon className={cn("w-5 h-5 flex-shrink-0", item.active && "text-primary")} />
                {!collapsed && (
                  <span className="text-sm font-medium">{item.label}</span>
                )}
                {item.active && !collapsed && (
                  <div className="ml-auto w-2 h-2 rounded-full bg-primary" />
                )}
              </button>
            </li>
          ))}
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
