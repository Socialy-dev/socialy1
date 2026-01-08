import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Bell, ChevronDown, LogOut, User, Settings } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export const Header = () => {
  const [userName, setUserName] = useState("Utilisateur");
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

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

  return (
    <header className="flex items-center justify-between mb-8">
      <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
      
      <div className="flex items-center gap-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search for anything..."
            className="w-80 h-11 pl-12 pr-4 rounded-full bg-card border-0 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
        
        {/* Notification */}
        <button className="w-11 h-11 rounded-full bg-card flex items-center justify-center hover:bg-secondary transition-colors">
          <Bell className="w-5 h-5 text-foreground" />
        </button>
        
        {/* User Profile with Popover */}
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <button className="flex items-center gap-3 pl-3 hover:opacity-80 transition-opacity">
              <div className="w-11 h-11 rounded-full bg-gradient-to-br from-primary to-warning overflow-hidden">
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
          <PopoverContent align="end" className="w-48 p-2 bg-white border border-border shadow-lg z-50">
            <div className="flex flex-col">
              <button 
                onClick={() => { setIsOpen(false); navigate("/profile"); }}
                className="flex items-center gap-2 px-3 py-2 text-sm text-foreground rounded-md hover:bg-secondary transition-colors text-left w-full"
              >
                <User className="w-4 h-4" />
                Mon profil
              </button>
              <button className="flex items-center gap-2 px-3 py-2 text-sm text-foreground rounded-md hover:bg-secondary transition-colors text-left">
                <Settings className="w-4 h-4" />
                Paramètres
              </button>
              <div className="h-px bg-border my-1" />
              <button 
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 py-2 text-sm text-danger rounded-md hover:bg-danger/10 transition-colors text-left"
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
