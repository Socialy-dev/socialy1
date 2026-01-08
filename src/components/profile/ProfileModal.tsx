import { useState, useEffect } from "react";
import { X, Globe, Linkedin, Mail, Plus, Trash2, Building2, Users, Newspaper } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { RelationsPresseContent } from "./RelationsPresseContent";

interface Agency {
  id: string;
  name: string;
  website: string;
  linkedin: string;
  email: string;
  specialty: string;
}

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const tabs = [
  { id: "relations-presse", label: "Relations Presse", icon: Newspaper },
  { id: "ressources-memoire", label: "Ressources Mémoire", icon: Building2 },
  { id: "donnees-clients", label: "Données Clients", icon: Users },
];

export const ProfileModal = ({ isOpen, onClose }: ProfileModalProps) => {
  const [activeTab, setActiveTab] = useState("relations-presse");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-8">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-foreground/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-6xl h-[90vh] bg-card rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-border">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Mon Profil</h2>
            <p className="text-sm text-muted-foreground mt-1">Gérez vos informations et préférences</p>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-secondary hover:bg-muted flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5 text-foreground" />
          </button>
        </div>

        {/* Tabs */}
        <div className="px-8 pt-4 border-b border-border">
          <div className="flex gap-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-5 py-3 rounded-t-xl text-sm font-medium transition-all ${
                    activeTab === tab.id
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8">
          {activeTab === "relations-presse" && (
            <RelationsPresseContent />
          )}

          {activeTab === "ressources-memoire" && (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mb-4">
                <Building2 className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">Ressources Mémoire</h3>
              <p className="text-sm text-muted-foreground mt-2 text-center max-w-md">
                Stockez et gérez vos ressources, documents et références pour vos projets RP.
              </p>
              <span className="mt-4 px-3 py-1 rounded-full bg-warning/10 text-warning text-xs font-medium">
                Bientôt disponible
              </span>
            </div>
          )}

          {activeTab === "donnees-clients" && (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mb-4">
                <Users className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">Données Clients</h3>
              <p className="text-sm text-muted-foreground mt-2 text-center max-w-md">
                Centralisez les informations de vos clients et leurs préférences.
              </p>
              <span className="mt-4 px-3 py-1 rounded-full bg-warning/10 text-warning text-xs font-medium">
                Bientôt disponible
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
