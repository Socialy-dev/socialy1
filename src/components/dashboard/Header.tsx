import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Bell, ChevronDown, LogOut, User, Settings, Shield } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useAuth } from "@/hooks/useAuth";

interface HeaderProps {
  title?: string;
  showTitle?: boolean;
}

export const Header = ({ title = "Dashboard", showTitle = true }: HeaderProps) => {
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
    <header className="flex items-center justify-between mb-10">
      {showTitle ? (
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">{title}</h1>
          <p className="text-muted-foreground mt-1">Welcome back! Here's what's happening.</p>
        </div>
      ) : (
        <div />
      )}

      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search for anything..."
            className="w-72 h-12 pl-12 pr-4 rounded-xl bg-card border border-border text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
          />
        </div>

        {/* Notifications */}
        <button className="relative w-12 h-12 rounded-xl bg-card border border-border flex items-center justify-center hover:bg-secondary transition-all shadow-sm">
          <Bell className="w-5 h-5 text-foreground" />
          <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-primary rounded-full border-2 border-card" />
        </button>

        {/* User Menu */}
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <button className="flex items-center gap-3 pl-3 pr-4 py-2 rounded-xl hover:bg-card border border-transparent hover:border-border transition-all duration-200">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary to-violet-600 overflow-hidden shadow-lg shadow-primary/20">
                <img
                  src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face"
                  alt={userName}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex flex-col text-left">
                <span className="font-semibold text-sm text-foreground">{userName}</span>
                <span className="text-xs text-muted-foreground">Product manager</span>
              </div>
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
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
    </header>
  );
};
