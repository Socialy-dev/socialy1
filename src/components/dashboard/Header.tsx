import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ModeToggle } from "@/components/mode-toggle";
import { Bell, ChevronDown, LogOut, User, Settings, Shield, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { ClientSelector } from "./ClientSelector";

interface HeaderProps {
  title?: string;
  showTitle?: boolean;
  sidebarCollapsed?: boolean;
}

export const Header = ({ title = "Dashboard", showTitle = true, sidebarCollapsed = false }: HeaderProps) => {
  const [userName, setUserName] = useState("Utilisateur");
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const { isOrgAdmin } = useAuth();

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("first_name, last_name")
          .eq("user_id", user.id)
          .single();

        if (profile) {
          const fullName = [profile.first_name, profile.last_name].filter(Boolean).join(" ");
          setUserName(fullName || "Utilisateur");
        }
      }
    };
    fetchProfile();
  }, []);

  const handleLogout = async () => {
    setIsOpen(false);
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("Erreur lors de la déconnexion");
    } else {
      toast.success("Déconnexion réussie");
      navigate("/auth");
    }
  };

  const handleOpenProfile = () => {
    setIsOpen(false);
    navigate("/profile");
  };

  return (
    <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/50">
      <div className="flex items-center justify-between h-16 px-6">
        {showTitle ? (
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-xl font-bold text-foreground tracking-tight">{title}</h1>
              <p className="text-sm text-muted-foreground">Bienvenue ! Voici un aperçu de votre journée.</p>
            </div>
          </div>
        ) : (
          <div />
        )}

        <div className="flex items-center gap-3">
          <ClientSelector />

          {/* Add Button */}
          <button className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center hover:bg-primary/90 transition-all shadow-lg shadow-primary/20">
            <Plus className="w-5 h-5" />
          </button>

          {/* Notifications */}
          <button className="relative w-10 h-10 rounded-xl bg-secondary/50 border border-border/50 flex items-center justify-center hover:bg-secondary transition-all">
            <Bell className="w-4 h-4 text-foreground" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full border-2 border-background" />
          </button>

          {/* Theme Toggle */}
          <ModeToggle />

          {/* User Menu */}
          <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
              <button className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl hover:bg-secondary/50 border border-transparent hover:border-border/50 transition-all duration-200">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-violet-600 overflow-hidden shadow-lg shadow-primary/20">
                  <img
                    src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face"
                    alt={userName}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="hidden sm:flex flex-col text-left">
                  <span className="font-semibold text-sm text-foreground leading-tight">{userName}</span>
                  <span className="text-xs text-muted-foreground leading-tight">Product manager</span>
                </div>
                <ChevronDown className="w-4 h-4 text-muted-foreground hidden sm:block" />
              </button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-56 p-2 bg-card border border-border shadow-xl rounded-xl z-50">
              <div className="flex flex-col">
                <button
                  onClick={handleOpenProfile}
                  className="flex items-center gap-3 px-3 py-2.5 text-sm text-foreground rounded-lg hover:bg-secondary transition-colors text-left w-full font-medium"
                >
                  <User className="w-4 h-4 text-muted-foreground" />
                  Mon profil
                </button>
                <button className="flex items-center gap-3 px-3 py-2.5 text-sm text-foreground rounded-lg hover:bg-secondary transition-colors text-left w-full font-medium">
                  <Settings className="w-4 h-4 text-muted-foreground" />
                  Paramètres
                </button>
                {isOrgAdmin && (
                  <>
                    <div className="h-px bg-border my-1.5" />
                    <button
                      onClick={() => {
                        setIsOpen(false);
                        navigate("/admin");
                      }}
                      className="flex items-center gap-3 px-3 py-2.5 text-sm text-foreground rounded-lg hover:bg-secondary transition-colors text-left w-full font-medium"
                    >
                      <Shield className="w-4 h-4 text-muted-foreground" />
                      Administration
                    </button>
                  </>
                )}
                <div className="h-px bg-border my-1.5" />
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-3 py-2.5 text-sm text-danger rounded-lg hover:bg-danger/10 transition-colors text-left w-full font-medium"
                >
                  <LogOut className="w-4 h-4" />
                  Se déconnecter
                </button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </header>
  );
};
