import { useState, useEffect } from "react";
import { X, Globe, Linkedin, Mail, Plus, Trash2, Building2, Users, Newspaper, FileText, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Agency {
  id: string;
  name: string;
  website: string;
  linkedin: string;
  email: string;
  specialty: string;
}

interface LinkedInPost {
  id: string;
  content: string;
  posted_at: string | null;
  post_url: string | null;
}

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const tabs = [
  { id: "agences-concurrentes", label: "Agences Concurrentes", icon: Building2 },
  { id: "ressources-memoire", label: "Ressources Mémoire", icon: Newspaper },
  { id: "donnees-clients", label: "Données Clients", icon: Users },
];

export const ProfileModal = ({ isOpen, onClose }: ProfileModalProps) => {
  const [activeTab, setActiveTab] = useState("agences-concurrentes");
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newAgency, setNewAgency] = useState({
    name: "",
    website: "",
    linkedin: "",
    email: "",
    specialty: ""
  });

  // LinkedIn posts state
  const [linkedinPosts, setLinkedinPosts] = useState<LinkedInPost[]>([]);
  const [isLoadingPosts, setIsLoadingPosts] = useState(false);
  const [showAddPostForm, setShowAddPostForm] = useState(false);
  const [newPost, setNewPost] = useState({ content: "", post_url: "" });
  const [isAddingPost, setIsAddingPost] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchAgencies();
      fetchLinkedinPosts();
    }
  }, [isOpen]);

  const fetchLinkedinPosts = async () => {
    setIsLoadingPosts(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data, error } = await supabase
        .from("user_linkedin_posts")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      
      if (!error && data) {
        setLinkedinPosts(data);
      }
    }
    setIsLoadingPosts(false);
  };

  const handleAddPost = async () => {
    if (!newPost.content.trim()) {
      toast.error("Le contenu du post est requis");
      return;
    }

    setIsAddingPost(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setIsAddingPost(false);
      return;
    }

    try {
      // Insert the post
      const { data: postData, error: postError } = await supabase
        .from("user_linkedin_posts")
        .insert({
          user_id: user.id,
          content: newPost.content,
          post_url: newPost.post_url || null,
        })
        .select()
        .single();

      if (postError) throw postError;

      // Generate embedding via edge function
      const response = await fetch(
        `https://lypodfdlpbpjdsswmsni.supabase.co/functions/v1/generate-embedding`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx5cG9kZmRscGJwamRzc3dtc25pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc4Mzk1MTUsImV4cCI6MjA4MzQxNTUxNX0.T6PH-7MpJ-YpfGO4rym2eCoM-xsgFID7nxvuaVLpelo`,
          },
          body: JSON.stringify({
            content: newPost.content,
            document_type: "linkedin_post",
            source_id: postData.id,
            user_id: user.id,
            metadata: { post_url: newPost.post_url || null },
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Embedding error:", errorData);
        // Still success for the post, just log embedding error
        toast.warning("Post ajouté, mais l'indexation a échoué");
      } else {
        toast.success("Post LinkedIn ajouté et indexé");
      }

      setNewPost({ content: "", post_url: "" });
      setShowAddPostForm(false);
      fetchLinkedinPosts();
    } catch (error) {
      console.error("Error adding post:", error);
      toast.error("Erreur lors de l'ajout");
    } finally {
      setIsAddingPost(false);
    }
  };

  const handleDeletePost = async (id: string) => {
    try {
      // Delete from documents first (cascade not automatic)
      await supabase.from("documents").delete().eq("source_id", id);
      
      // Delete the post
      const { error } = await supabase
        .from("user_linkedin_posts")
        .delete()
        .eq("id", id);

      if (error) throw error;
      
      toast.success("Post supprimé");
      fetchLinkedinPosts();
    } catch (error) {
      console.error("Error deleting post:", error);
      toast.error("Erreur lors de la suppression");
    }
  };

  const fetchAgencies = async () => {
    setIsLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data, error } = await supabase
        .from("competitor_agencies")
        .select("*")
        .eq("user_id", user.id)
        .order("name");
      
      if (!error && data) {
        setAgencies(data.map(a => ({
          id: a.id,
          name: a.name,
          website: a.website || "",
          linkedin: a.linkedin || "",
          email: a.email || "",
          specialty: a.specialty || ""
        })));
      }
    }
    setIsLoading(false);
  };

  const handleAddAgency = async () => {
    if (!newAgency.name.trim()) {
      toast.error("Le nom de l'agence est requis");
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from("competitor_agencies")
      .insert({
        user_id: user.id,
        name: newAgency.name,
        website: newAgency.website || null,
        linkedin: newAgency.linkedin || null,
        email: newAgency.email || null,
        specialty: newAgency.specialty || null
      });

    if (error) {
      toast.error("Erreur lors de l'ajout");
    } else {
      toast.success("Agence ajoutée");
      setNewAgency({ name: "", website: "", linkedin: "", email: "", specialty: "" });
      setShowAddForm(false);
      fetchAgencies();
    }
  };

  const handleDeleteAgency = async (id: string) => {
    const { error } = await supabase
      .from("competitor_agencies")
      .delete()
      .eq("id", id);

    if (error) {
      toast.error("Erreur lors de la suppression");
    } else {
      toast.success("Agence supprimée");
      fetchAgencies();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-8">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-foreground/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-5xl h-[85vh] bg-card rounded-2xl shadow-2xl overflow-hidden flex flex-col">
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
          {/* AGENCES CONCURRENTES TAB */}
          {activeTab === "agences-concurrentes" && (
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-foreground">Agences Concurrentes</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Gérez les agences dont vous souhaitez suivre l'actualité
                  </p>
                </div>
                <button
                  onClick={() => setShowAddForm(!showAddForm)}
                  className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:opacity-90 transition-all shadow-lg shadow-primary/25"
                >
                  <Plus className="w-4 h-4" />
                  Ajouter
                </button>
              </div>

              {/* Add Form */}
              {showAddForm && (
                <div className="bg-secondary/30 border border-border rounded-2xl p-6 space-y-4">
                  <h4 className="text-base font-semibold text-foreground">Nouvelle agence</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Nom de l'agence *
                      </label>
                      <input
                        type="text"
                        value={newAgency.name}
                        onChange={(e) => setNewAgency({ ...newAgency, name: e.target.value })}
                        placeholder="Ex: We Are Social"
                        className="w-full px-4 py-3 bg-card border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Spécialité
                      </label>
                      <input
                        type="text"
                        value={newAgency.specialty}
                        onChange={(e) => setNewAgency({ ...newAgency, specialty: e.target.value })}
                        placeholder="Ex: Social Media Marketing"
                        className="w-full px-4 py-3 bg-card border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Site web
                      </label>
                      <input
                        type="url"
                        value={newAgency.website}
                        onChange={(e) => setNewAgency({ ...newAgency, website: e.target.value })}
                        placeholder="https://..."
                        className="w-full px-4 py-3 bg-card border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        LinkedIn
                      </label>
                      <input
                        type="url"
                        value={newAgency.linkedin}
                        onChange={(e) => setNewAgency({ ...newAgency, linkedin: e.target.value })}
                        placeholder="https://linkedin.com/company/..."
                        className="w-full px-4 py-3 bg-card border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      onClick={() => setShowAddForm(false)}
                      className="px-5 py-2.5 bg-secondary text-foreground rounded-xl font-medium hover:bg-secondary/80 transition-all"
                    >
                      Annuler
                    </button>
                    <button
                      onClick={handleAddAgency}
                      className="px-5 py-2.5 bg-primary text-primary-foreground rounded-xl font-medium hover:opacity-90 transition-all"
                    >
                      Ajouter l'agence
                    </button>
                  </div>
                </div>
              )}

              {/* Agencies List */}
              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="bg-secondary/30 rounded-2xl p-5 animate-pulse">
                      <div className="h-5 bg-secondary rounded w-1/2 mb-3" />
                      <div className="h-4 bg-secondary rounded w-3/4" />
                    </div>
                  ))}
                </div>
              ) : agencies.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {agencies.map((agency) => (
                    <div
                      key={agency.id}
                      className="group bg-card border border-border rounded-2xl p-5 hover:border-primary/30 hover:shadow-lg transition-all"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="text-base font-semibold text-foreground">{agency.name}</h4>
                          {agency.specialty && (
                            <span className="inline-block mt-1 px-2.5 py-1 bg-primary/10 text-primary rounded-lg text-xs font-medium">
                              {agency.specialty}
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() => handleDeleteAgency(agency.id)}
                          className="w-8 h-8 rounded-lg bg-destructive/10 text-destructive flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-destructive/20 transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="space-y-2">
                        {agency.website && (
                          <a
                            href={agency.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                          >
                            <Globe className="w-4 h-4" />
                            {agency.website.replace(/^https?:\/\//, '')}
                          </a>
                        )}
                        {agency.linkedin && (
                          <a
                            href={agency.linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                          >
                            <Linkedin className="w-4 h-4" />
                            LinkedIn
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 bg-secondary/20 rounded-2xl border border-dashed border-border">
                  <Building2 className="w-12 h-12 text-muted-foreground/40 mb-4" />
                  <h4 className="text-base font-semibold text-foreground">Aucune agence</h4>
                  <p className="text-sm text-muted-foreground mt-2 text-center max-w-sm">
                    Ajoutez des agences concurrentes pour suivre leur actualité dans les Relations Presse
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === "ressources-memoire" && (
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-foreground">Posts LinkedIn</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Ajoutez vos anciens posts LinkedIn pour personnaliser la génération de contenu
                  </p>
                </div>
                <button
                  onClick={() => setShowAddPostForm(!showAddPostForm)}
                  className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:opacity-90 transition-all shadow-lg shadow-primary/25"
                >
                  <Plus className="w-4 h-4" />
                  Ajouter un post
                </button>
              </div>

              {/* Add Post Form */}
              {showAddPostForm && (
                <div className="bg-secondary/30 border border-border rounded-2xl p-6 space-y-4">
                  <h4 className="text-base font-semibold text-foreground">Nouveau post LinkedIn</h4>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Contenu du post *
                      </label>
                      <textarea
                        value={newPost.content}
                        onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                        placeholder="Collez ou tapez le contenu de votre post LinkedIn..."
                        rows={6}
                        className="w-full px-4 py-3 bg-card border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all resize-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        URL du post (optionnel)
                      </label>
                      <input
                        type="url"
                        value={newPost.post_url}
                        onChange={(e) => setNewPost({ ...newPost, post_url: e.target.value })}
                        placeholder="https://linkedin.com/posts/..."
                        className="w-full px-4 py-3 bg-card border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      onClick={() => setShowAddPostForm(false)}
                      className="px-5 py-2.5 bg-secondary text-foreground rounded-xl font-medium hover:bg-secondary/80 transition-all"
                      disabled={isAddingPost}
                    >
                      Annuler
                    </button>
                    <button
                      onClick={handleAddPost}
                      disabled={isAddingPost}
                      className="px-5 py-2.5 bg-primary text-primary-foreground rounded-xl font-medium hover:opacity-90 transition-all flex items-center gap-2"
                    >
                      {isAddingPost ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Indexation...
                        </>
                      ) : (
                        "Ajouter et indexer"
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Posts List */}
              {isLoadingPosts ? (
                <div className="space-y-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="bg-secondary/30 rounded-2xl p-5 animate-pulse">
                      <div className="h-4 bg-secondary rounded w-3/4 mb-2" />
                      <div className="h-4 bg-secondary rounded w-1/2" />
                    </div>
                  ))}
                </div>
              ) : linkedinPosts.length > 0 ? (
                <div className="space-y-4">
                  {linkedinPosts.map((post) => (
                    <div
                      key={post.id}
                      className="group bg-card border border-border rounded-2xl p-5 hover:border-primary/30 hover:shadow-lg transition-all"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <Linkedin className="w-4 h-4 text-[#0A66C2]" />
                            <span className="text-xs font-medium text-muted-foreground">
                              Post LinkedIn
                            </span>
                            {post.post_url && (
                              <a
                                href={post.post_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-primary hover:underline"
                              >
                                Voir le post
                              </a>
                            )}
                          </div>
                          <p className="text-sm text-foreground line-clamp-4 whitespace-pre-wrap">
                            {post.content}
                          </p>
                        </div>
                        <button
                          onClick={() => handleDeletePost(post.id)}
                          className="w-8 h-8 rounded-lg bg-destructive/10 text-destructive flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-destructive/20 transition-all flex-shrink-0"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 bg-secondary/20 rounded-2xl border border-dashed border-border">
                  <FileText className="w-12 h-12 text-muted-foreground/40 mb-4" />
                  <h4 className="text-base font-semibold text-foreground">Aucun post LinkedIn</h4>
                  <p className="text-sm text-muted-foreground mt-2 text-center max-w-sm">
                    Ajoutez vos anciens posts LinkedIn pour que l'IA puisse reproduire votre style d'écriture
                  </p>
                </div>
              )}
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
