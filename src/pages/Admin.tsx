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
  FolderOpen,
  Building2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ResourcesPanel } from "@/components/admin/ResourcesPanel";

type OrgRole = "super_admin" | "org_admin" | "org_user";

interface UserWithRole {
  user_id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  org_role: OrgRole;
  organization_name: string;
}

interface Invitation {
  id: string;
  email: string;
  org_role: OrgRole;
  organization_id: string;
  organization_name: string;
  token: string;
  expires_at: string;
  used_at: string | null;
  created_at: string;
}

interface Organization {
  id: string;
  name: string;
  slug: string;
}

const ORG_ROLE_LABELS: Record<OrgRole, string> = {
  super_admin: "Super Admin",
  org_admin: "Admin",
  org_user: "Utilisateur",
};

const Admin = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingInvitations, setLoadingInvitations] = useState(true);
  const [showResources, setShowResources] = useState(false);

  const [newEmail, setNewEmail] = useState("");
  const [newOrgRole, setNewOrgRole] = useState<OrgRole>("org_user");
  const [selectedOrgId, setSelectedOrgId] = useState<string>("");
  const [sendingInvitation, setSendingInvitation] = useState(false);

  const { user, currentOrganization, isSuperAdmin } = useAuth();

  useEffect(() => {
    if (currentOrganization) {
      setSelectedOrgId(currentOrganization.id);
    }
  }, [currentOrganization]);

  const fetchOrganizations = async () => {
    const { data, error } = await supabase
      .from("organizations")
      .select("id, name, slug")
      .order("name");
    
    if (!error && data) {
      setOrganizations(data);
    }
  };

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const { data: members, error } = await supabase
        .from("organization_members")
        .select(`
          user_id,
          role,
          organizations:organization_id (name)
        `);

      if (error) throw error;

      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, email, first_name, last_name");

      const usersWithRoles: UserWithRole[] = (members || []).map((m: any) => {
        const profile = profiles?.find((p) => p.user_id === m.user_id);
        return {
          user_id: m.user_id,
          email: profile?.email || "",
          first_name: profile?.first_name || null,
          last_name: profile?.last_name || null,
          org_role: m.role as OrgRole,
          organization_name: m.organizations?.name || "",
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
        .select(`
          *,
          organizations:organization_id (name)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const formattedInvitations: Invitation[] = (data || []).map((inv: any) => ({
        id: inv.id,
        email: inv.email,
        org_role: inv.org_role,
        organization_id: inv.organization_id,
        organization_name: inv.organizations?.name || "",
        token: inv.token,
        expires_at: inv.expires_at,
        used_at: inv.used_at,
        created_at: inv.created_at,
      }));

      setInvitations(formattedInvitations);
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
    fetchOrganizations();
  }, []);

  const handleCreateInvitation = async () => {
    if (!newEmail.trim()) {
      toast.error("Veuillez entrer un email");
      return;
    }

    if (!selectedOrgId) {
      toast.error("Veuillez sélectionner une organisation");
      return;
    }

    setSendingInvitation(true);
    try {
      const { data, error } = await supabase
        .from("invitations")
        .insert({
          email: newEmail.trim().toLowerCase(),
          org_role: newOrgRole,
          organization_id: selectedOrgId,
          invited_by: user?.id,
        })
        .select()
        .single();

      if (error) throw error;

      const inviteLink = `${window.location.origin}/auth?token=${data.token}`;

      const emailResponse = await supabase.functions.invoke("send-invitation-email", {
        body: {
          email: newEmail.trim().toLowerCase(),
          inviteLink,
          role: newOrgRole,
          organizationName: organizations.find(o => o.id === selectedOrgId)?.name || "",
        },
      });

      if (emailResponse.error) {
        console.error("Email error:", emailResponse.error);
        toast.warning("Invitation créée mais l'email n'a pas pu être envoyé");
        await navigator.clipboard.writeText(inviteLink);
        toast.info("Lien copié dans le presse-papiers");
      } else {
        toast.success("Invitation envoyée par email !");
      }

      setNewEmail("");
      setNewOrgRole("org_user");
      fetchInvitations();
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
      await supabase.from("organization_members").delete().eq("user_id", userId);
      await supabase.from("user_permissions").delete().eq("user_id", userId);

      toast.success("Accès utilisateur supprimé");
      fetchUsers();
    } catch (error: any) {
      toast.error("Erreur lors de la suppression");
    }
  };

  const handleUpdateRole = async (userId: string, newRole: OrgRole) => {
    if (newRole === "super_admin" && !isSuperAdmin) {
      toast.error("Seul un super admin peut promouvoir un autre super admin");
      return;
    }

    try {
      const { error } = await supabase
        .from("organization_members")
        .update({ role: newRole })
        .eq("user_id", userId);

      if (error) throw error;
      toast.success("Rôle mis à jour");
      fetchUsers();
    } catch (error: any) {
      toast.error("Erreur lors de la mise à jour");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />

      <main
        className={cn(
          "min-h-screen p-8 content-transition",
          collapsed ? "ml-20" : "ml-64"
        )}
      >
        <Header title="Administration" />

        {showResources ? (
          <ResourcesPanel onBack={() => setShowResources(false)} />
        ) : (
          <>
            <div className="mb-6 flex items-center justify-between">
              <p className="text-muted-foreground">
                Gérez les utilisateurs et les invitations
              </p>
              <Button
                variant="outline"
                onClick={() => setShowResources(true)}
                className="gap-2"
              >
                <FolderOpen className="w-4 h-4" />
                Ressources
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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

                  {isSuperAdmin && organizations.length > 1 && (
                    <div>
                      <Label>Organisation</Label>
                      <Select value={selectedOrgId} onValueChange={setSelectedOrgId}>
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Sélectionner une organisation" />
                        </SelectTrigger>
                        <SelectContent>
                          {organizations.map((org) => (
                            <SelectItem key={org.id} value={org.id}>
                              {org.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div>
                    <Label>Rôle</Label>
                    <Select value={newOrgRole} onValueChange={(v) => setNewOrgRole(v as OrgRole)}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="org_user">Utilisateur</SelectItem>
                        <SelectItem value="org_admin">Administrateur</SelectItem>
                        {isSuperAdmin && (
                          <SelectItem value="super_admin">Super Admin</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
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
                              <div className="flex items-center gap-2 mt-1 flex-wrap">
                                <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">
                                  {inv.organization_name}
                                </span>
                                <span
                                  className={cn(
                                    "text-xs px-2 py-0.5 rounded-full",
                                    inv.org_role === "org_admin" || inv.org_role === "super_admin"
                                      ? "bg-primary/20 text-primary"
                                      : "bg-muted text-muted-foreground"
                                  )}
                                >
                                  {ORG_ROLE_LABELS[inv.org_role]}
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
                          Organisation
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                          Rôle
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
                            <span className="text-xs px-2 py-1 rounded-full bg-secondary text-muted-foreground">
                              {u.organization_name}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <Select
                              value={u.org_role}
                              onValueChange={(v) => handleUpdateRole(u.user_id, v as OrgRole)}
                              disabled={u.user_id === user?.id}
                            >
                              <SelectTrigger className="w-36">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="org_user">Utilisateur</SelectItem>
                                <SelectItem value="org_admin">Admin</SelectItem>
                                {isSuperAdmin && (
                                  <SelectItem value="super_admin">Super Admin</SelectItem>
                                )}
                              </SelectContent>
                            </Select>
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
          </>
        )}
      </main>
    </div>
  );
};

export default Admin;
