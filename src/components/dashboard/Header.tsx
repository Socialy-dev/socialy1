import { Search, Bell, ChevronDown } from "lucide-react";

export const Header = () => {
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
        
        {/* User Profile */}
        <div className="flex items-center gap-3 pl-3">
          <div className="w-11 h-11 rounded-full bg-gradient-to-br from-primary to-warning overflow-hidden">
            <img 
              src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face"
              alt="Alex meian"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-sm text-foreground">Alex meian</span>
            <span className="text-xs text-muted-foreground">Product manager</span>
          </div>
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        </div>
      </div>
    </header>
  );
};
