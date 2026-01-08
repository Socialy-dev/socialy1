import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Header } from "@/components/dashboard/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Users,
  Mail,
  Shield,
  Trash2,
  Plus,
  Clock,
  CheckCircle,
  XCircle,
  Copy,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

type AppRole = "admin" | "user";
type AppPage = "dashboard" | "relations-presse" | "social-media" | "profile";

interface UserWithRole {
  user_id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  role: AppRole;
  permissions: AppPage[];
}

interface Invitation {
  id: string;
  email: string;
  role: AppRole;
  pages: AppPage[];
  token: string;
  expires_at: string;
  used_at: string | null;
  created_at: string;
}

const ALL_PAGES: { value: AppPage; label: string }[] = [
  { value: "dashboard", label: "Dashboard" },
  { value: "relations-presse", label: "Relations Presse" },
  { value: "social-media", label: "Social Media" },
  { value: "profile", label: "Profil" },
];

const Admin = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingInvitations, setLoadingInvitations] = useState(true);
  
  // New invitation form
  const [newEmail, setNewEmail] = useState("");
  const [newRole, setNewRole] = useState<AppRole>("user");
  const [newPages, setNewPages] = useState<AppPage[]>(["dashboard", "profile"]);
  const [sendingInvitation, setSendingInvitation] = useState(false);

  const { user } = useAuth();

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      // Get all profiles with roles
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("user_id, email, first_name, last_name");

      if (profilesError) throw profilesError;

      // Get all roles
      const { data: roles, error: rolesError } = await supabase
        .from("user_roles")
        .select("user_id, role");

      if (rolesError) throw rolesError;

      // Get all permissions
      const { data: permissions, error: permError } = await supabase
        .from("user_permissions")
        .select("user_id, page");

      if (permError) throw permError;

      // Combine data
      const usersWithRoles: UserWithRole[] = (profiles || []).map((profile) => {
        const userRole = roles?.find((r) => r.user_id === profile.user_id);
        const userPerms = permissions?.filter((p) => p.user_id === profile.user_id) || [];
        
        return {
          user_id: profile.user_id,
          email: profile.email || "",
          first_name: profile.first_name,
          last_name: profile.last_name,
          role: (userRole?.role as AppRole) || "user",
          permissions: userPerms.map((p) => p.page as AppPage),
        };
      });

      setUsers(usersWithRoles);
    } catch (error: any) {
      console.error("Error fetching users:", error);
      toast.error("Erreur lors du chargement des utilisateurs");
    } finally {
      setLoadingUsers(false);
    }
  };

  const fetchInvitations = async () => {
    setLoadingInvitations(true);
    try {
      const { data, error } = await supabase
        .from("invitations")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setInvitations(data as Invitation[]);
    } catch (error: any) {
      console.error("Error fetching invitations:", error);
      toast.error("Erreur lors du chargement des invitations");
    } finally {
      setLoadingInvitations(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchInvitations();
  }, []);

  const handleCreateInvitation = async () => {
    if (!newEmail.trim()) {
      toast.error("Veuillez entrer un email");
      return;
    }

    setSendingInvitation(true);
    try {
      const { data, error } = await supabase
        .from("invitations")
        .insert({
          email: newEmail.trim().toLowerCase(),
          role: newRole,
          pages: newPages,
          invited_by: user?.id,
        })
        .select()
        .single();

      if (error) throw error;

      toast.success("Invitation créée avec succès !");
      setNewEmail("");
      setNewRole("user");
      setNewPages(["dashboard", "profile"]);
      fetchInvitations();

      // Copy link to clipboard
      const inviteLink = `${window.location.origin}/auth?token=${data.token}`;
      await navigator.clipboard.writeText(inviteLink);
      toast.success("Lien d'invitation copié dans le presse-papiers !");
    } catch (error: any) {
      console.error("Error creating invitation:", error);
      toast.error(error.message || "Erreur lors de la création de l'invitation");
    } finally {
      setSendingInvitation(false);
    }
  };

  const handleDeleteInvitation = async (id: string) => {
    try {
      const { error } = await supabase.from("invitations").delete().eq("id", id);
      if (error) throw error;
      toast.success("Invitation supprimée");
      fetchInvitations();
    } catch (error: any) {
      toast.error("Erreur lors de la suppression");
    }
  };

  const handleCopyInviteLink = async (token: string) => {
    const inviteLink = `${window.location.origin}/auth?token=${token}`;
    await navigator.clipboard.writeText(inviteLink);
    toast.success("Lien copié !");
  };

  const handleDeleteUser = async (userId: string) => {
    if (userId === user?.id) {
      toast.error("Vous ne pouvez pas vous supprimer vous-même");
      return;
    }

    try {
      // Delete role
      await supabase.from("user_roles").delete().eq("user_id", userId);
      // Delete permissions
      await supabase.from("user_permissions").delete().eq("user_id", userId);
      // Note: Profile and auth user deletion should be handled carefully
      // For now, we just remove access
      
      toast.success("Accès utilisateur supprimé");
      fetchUsers();
    } catch (error: any) {
      toast.error("Erreur lors de la suppression");
    }
  };

  const handleUpdateRole = async (userId: string, newRole: AppRole) => {
    try {
      const { error } = await supabase
        .from("user_roles")
        .update({ role: newRole })
        .eq("user_id", userId);

      if (error) throw error;
      toast.success("Rôle mis à jour");
      fetchUsers();
    } catch (error: any) {
      toast.error("Erreur lors de la mise à jour");
    }
  };

  const togglePageSelection = (page: AppPage) => {
    setNewPages((prev) =>
      prev.includes(page)
        ? prev.filter((p) => p !== page)
        : [...prev, page]
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />

      <main
        className={cn(
          "transition-all duration-300 ease-in-out",
          collapsed ? "ml-20" : "ml-64"
        )}
      >
        <Header />

        <div className="p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <Shield className="w-8 h-8 text-primary" />
              Administration
            </h1>
            <p className="text-muted-foreground mt-2">
              Gérez les utilisateurs et les invitations
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Create Invitation */}
            <div className="glass-card p-6 rounded-2xl">
              <h2 className="text-xl font-semibold text-foreground mb-6 flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Nouvelle invitation
              </h2>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="utilisateur@example.com"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label>Rôle</Label>
                  <Select value={newRole} onValueChange={(v) => setNewRole(v as AppRole)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">Utilisateur</SelectItem>
                      <SelectItem value="admin">Administrateur</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Pages autorisées</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {ALL_PAGES.map((page) => (
                      <label
                        key={page.value}
                        className="flex items-center gap-2 p-2 rounded-lg border border-border hover:bg-muted/50 cursor-pointer"
                      >
                        <Checkbox
                          checked={newPages.includes(page.value)}
                          onCheckedChange={() => togglePageSelection(page.value)}
                        />
                        <span className="text-sm">{page.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <Button
                  onClick={handleCreateInvitation}
                  disabled={sendingInvitation}
                  className="w-full"
                >
                  {sendingInvitation ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Mail className="w-4 h-4 mr-2" />
                      Créer l'invitation
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Pending Invitations */}
            <div className="glass-card p-6 rounded-2xl">
              <h2 className="text-xl font-semibold text-foreground mb-6 flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Invitations ({invitations.length})
              </h2>

              {loadingInvitations ? (
                <div className="flex justify-center py-8">
                  <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                </div>
              ) : invitations.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  Aucune invitation
                </p>
              ) : (
                <div className="space-y-3 max-h-[400px] overflow-y-auto">
                  {invitations.map((inv) => {
                    const isExpired = new Date(inv.expires_at) < new Date();
                    const isUsed = inv.used_at !== null;

                    return (
                      <div
                        key={inv.id}
                        className={cn(
                          "p-4 rounded-xl border",
                          isUsed
                            ? "border-green-500/30 bg-green-500/5"
                            : isExpired
                            ? "border-red-500/30 bg-red-500/5"
                            : "border-border bg-muted/30"
                        )}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium text-foreground">{inv.email}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span
                                className={cn(
                                  "text-xs px-2 py-0.5 rounded-full",
                                  inv.role === "admin"
                                    ? "bg-primary/20 text-primary"
                                    : "bg-muted text-muted-foreground"
                                )}
                              >
                                {inv.role}
                              </span>
                              {isUsed ? (
                                <span className="text-xs text-green-600 flex items-center gap-1">
                                  <CheckCircle className="w-3 h-3" />
                                  Utilisée
                                </span>
                              ) : isExpired ? (
                                <span className="text-xs text-red-600 flex items-center gap-1">
                                  <XCircle className="w-3 h-3" />
                                  Expirée
                                </span>
                              ) : (
                                <span className="text-xs text-muted-foreground">
                                  Expire le{" "}
                                  {new Date(inv.expires_at).toLocaleDateString("fr-FR")}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {!isUsed && !isExpired && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleCopyInviteLink(inv.token)}
                              >
                                <Copy className="w-4 h-4" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteInvitation(inv.id)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Users List */}
          <div className="glass-card p-6 rounded-2xl mt-8">
            <h2 className="text-xl font-semibold text-foreground mb-6 flex items-center gap-2">
              <Users className="w-5 h-5" />
              Utilisateurs ({users.length})
            </h2>

            {loadingUsers ? (
              <div className="flex justify-center py-8">
                <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
              </div>
            ) : users.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                Aucun utilisateur
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                        Utilisateur
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                        Email
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                        Rôle
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                        Pages
                      </th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u.user_id} className="border-b border-border/50 hover:bg-muted/30">
                        <td className="py-3 px-4">
                          <span className="font-medium text-foreground">
                            {u.first_name} {u.last_name}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-muted-foreground">{u.email}</td>
                        <td className="py-3 px-4">
                          <Select
                            value={u.role}
                            onValueChange={(v) => handleUpdateRole(u.user_id, v as AppRole)}
                            disabled={u.user_id === user?.id}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="user">Utilisateur</SelectItem>
                              <SelectItem value="admin">Admin</SelectItem>
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex flex-wrap gap-1">
                            {u.permissions.map((p) => (
                              <span
                                key={p}
                                className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary"
                              >
                                {p}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteUser(u.user_id)}
                            disabled={u.user_id === user?.id}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Admin;
