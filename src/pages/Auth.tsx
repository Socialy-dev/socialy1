import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import socialyLogo from "@/assets/socialy-logo.png";

interface InvitationData {
  id: string;
  email: string;
  role: string;
  pages: string[];
  token: string;
  expires_at: string;
  used_at: string | null;
}

const Auth = () => {
  const [searchParams] = useSearchParams();
  const inviteToken = searchParams.get("token");

  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checkingInvitation, setCheckingInvitation] = useState(!!inviteToken);
  const [invitation, setInvitation] = useState<InvitationData | null>(null);
  const [invitationError, setInvitationError] = useState<string | null>(null);
  const [isFirstUser, setIsFirstUser] = useState(false);
  const [checkingFirstUser, setCheckingFirstUser] = useState(true);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Security: Strong password validation
  const validatePassword = (pwd: string): { valid: boolean; error?: string } => {
    if (pwd.length < 12) {
      return { valid: false, error: "Le mot de passe doit contenir au moins 12 caractères" };
    }
    if (!/[A-Z]/.test(pwd)) {
      return { valid: false, error: "Le mot de passe doit contenir au moins une majuscule" };
    }
    if (!/[a-z]/.test(pwd)) {
      return { valid: false, error: "Le mot de passe doit contenir au moins une minuscule" };
    }
    if (!/[0-9]/.test(pwd)) {
      return { valid: false, error: "Le mot de passe doit contenir au moins un chiffre" };
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(pwd)) {
      return { valid: false, error: "Le mot de passe doit contenir au moins un caractère spécial" };
    }
    return { valid: true };
  };

  // Check if first user
  useEffect(() => {
    const checkFirstUser = async () => {
      try {
        const { count, error } = await supabase
          .from("user_roles")
          .select("*", { count: "exact", head: true });

        if (error) throw error;
        setIsFirstUser(count === 0);
      } catch (error) {
        console.error("Error checking first user:", error);
      } finally {
        setCheckingFirstUser(false);
      }
    };
    checkFirstUser();
  }, []);

  // Check invitation token
  useEffect(() => {
    if (!inviteToken) {
      setCheckingInvitation(false);
      return;
    }

    const checkInvitation = async () => {
      try {
        const { data, error } = await supabase
          .from("invitations")
          .select("*")
          .eq("token", inviteToken)
          .single();

        if (error || !data) {
          setInvitationError("Invitation invalide ou non trouvée");
          return;
        }

        if (data.used_at) {
          setInvitationError("Cette invitation a déjà été utilisée");
          return;
        }

        if (new Date(data.expires_at) < new Date()) {
          setInvitationError("Cette invitation a expiré");
          return;
        }

        setInvitation(data as InvitationData);
        setEmail(data.email);
        setIsLogin(false); // Switch to signup mode
      } catch (error) {
        console.error("Error checking invitation:", error);
        setInvitationError("Erreur lors de la vérification de l'invitation");
      } finally {
        setCheckingInvitation(false);
      }
    };

    checkInvitation();
  }, [inviteToken]);

  // Auth state listener
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        navigate("/dashboard");
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate("/dashboard");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (error) throw error;
        toast.success("Connexion réussie !");
      } else {
        // Check if signup is allowed
        if (!isFirstUser && !invitation) {
          toast.error("L'inscription n'est possible que sur invitation");
          setLoading(false);
          return;
        }

        // Check email matches invitation
        if (invitation && email.trim().toLowerCase() !== invitation.email.toLowerCase()) {
          toast.error("L'email doit correspondre à l'invitation");
          setLoading(false);
          return;
        }

        // Security: Validate password strength
        const passwordValidation = validatePassword(password);
        if (!passwordValidation.valid) {
          toast.error(passwordValidation.error);
          setPasswordError(passwordValidation.error || null);
          setLoading(false);
          return;
        }

        const { error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: {
              first_name: firstName.trim(),
              last_name: lastName.trim(),
            },
          },
        });
        if (error) throw error;
        toast.success("Inscription réussie ! Vérifiez votre email pour confirmer votre compte.");
      }
    } catch (error: any) {
      toast.error(error.message || "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  // Show loading while checking
  if (checkingInvitation || checkingFirstUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  // Block access without invitation token (except for first user or login)
  if (!inviteToken && !isFirstUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-8">
        <div className="glass-card p-8 rounded-3xl max-w-md text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            <img src={socialyLogo} alt="Socialy" className="w-12 h-12" />
            <span className="text-2xl font-bold text-foreground">Socialy</span>
          </div>
          <h2 className="text-xl font-bold text-foreground mb-4">Accès restreint</h2>
          <p className="text-muted-foreground mb-6">
            Cette page est accessible uniquement via un lien d'invitation.
            Contactez un administrateur pour obtenir votre lien d'accès.
          </p>
        </div>
      </div>
    );
  }

  // Can signup only if first user OR has valid invitation
  const canSignup = isFirstUser || invitation !== null;

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-sidebar via-sidebar to-black relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-72 h-72 bg-primary/20 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary/5 rounded-full blur-2xl" />
        </div>
        
        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="h-full w-full" style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)`,
            backgroundSize: '50px 50px'
          }} />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center px-16">
          <div className="flex items-center gap-3 mb-8">
            <img src={socialyLogo} alt="Socialy" className="w-16 h-16" />
            <span className="text-4xl font-bold text-white">Socialy</span>
          </div>
          
          <h1 className="text-5xl font-bold text-white leading-tight mb-6">
            Gérez vos projets<br />
            <span className="text-primary">comme jamais</span>
          </h1>
          
          <p className="text-lg text-white/60 max-w-md mb-12">
            La plateforme tout-en-un pour gérer vos projets, suivre vos tâches 
            et collaborer efficacement avec votre équipe.
          </p>

          {/* Features with bullet points */}
          <ul className="space-y-4">
            {[
              "Dashboard intuitif et moderne",
              "Suivi des tâches en temps réel",
              "Gestion des projets simplifiée",
            ].map((feature, index) => (
              <li key={index} className="flex items-center gap-3 text-white/80">
                <span className="w-2 h-2 rounded-full bg-primary" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Right Panel - Auth Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <img src={socialyLogo} alt="Socialy" className="w-12 h-12" />
            <span className="text-2xl font-bold text-foreground">Socialy</span>
          </div>

          {/* Invitation Error */}
          {invitationError && (
            <div className="mb-6 p-4 rounded-xl bg-destructive/10 border border-destructive/30 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-destructive">{invitationError}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Contactez un administrateur pour obtenir une nouvelle invitation.
                </p>
              </div>
            </div>
          )}

          {/* Invitation Banner */}
          {invitation && (
            <div className="mb-6 p-4 rounded-xl bg-primary/10 border border-primary/30">
              <p className="font-medium text-primary">
                Invitation pour {invitation.email}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Rôle: {invitation.role === "admin" ? "Administrateur" : "Utilisateur"}
              </p>
            </div>
          )}


          {/* Glass Card */}
          <div className="glass-card p-8 rounded-3xl">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-2">
                {isLogin ? "Bon retour !" : "Créer un compte"}
              </h2>
              <p className="text-muted-foreground">
                {isLogin 
                  ? "Connectez-vous pour accéder à votre espace" 
                  : "Rejoignez-nous et commencez à gérer vos projets"}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {!isLogin && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName" className="text-foreground font-medium">
                      Prénom
                    </Label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        id="firstName"
                        type="text"
                        placeholder="Jean"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="pl-12 h-12 rounded-xl bg-white/50 border-border/50 focus:border-primary focus:ring-primary/20 transition-all"
                        required={!isLogin}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="text-foreground font-medium">
                      Nom
                    </Label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        id="lastName"
                        type="text"
                        placeholder="Dupont"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="pl-12 h-12 rounded-xl bg-white/50 border-border/50 focus:border-primary focus:ring-primary/20 transition-all"
                        required={!isLogin}
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-foreground font-medium">
                  Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="vous@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-12 h-12 rounded-xl bg-white/50 border-border/50 focus:border-primary focus:ring-primary/20 transition-all"
                    required
                    disabled={invitation !== null}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-foreground font-medium">
                  Mot de passe
                </Label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (!isLogin && e.target.value) {
                        const validation = validatePassword(e.target.value);
                        setPasswordError(validation.error || null);
                      } else {
                        setPasswordError(null);
                      }
                    }}
                    className="pl-12 pr-12 h-12 rounded-xl bg-white/50 border-border/50 focus:border-primary focus:ring-primary/20 transition-all"
                    required
                    minLength={12}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {!isLogin && passwordError && (
                  <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {passwordError}
                  </p>
                )}
                {!isLogin && !passwordError && password.length > 0 && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Min. 12 caractères avec majuscule, minuscule, chiffre et caractère spécial
                  </p>
                )}
              </div>

              {isLogin && (
                <div className="text-right">
                  <button
                    type="button"
                    className="text-sm text-primary hover:underline"
                  >
                    Mot de passe oublié ?
                  </button>
                </div>
              )}

              <Button
                type="submit"
                disabled={loading || (!isLogin && !canSignup)}
                className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 text-white font-semibold text-base group transition-all duration-300"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    {isLogin ? "Se connecter" : "S'inscrire"}
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </Button>
            </form>

            <div className="mt-8 text-center">
              {isLogin ? (
                <p className="text-muted-foreground">
                  Pas encore de compte ?
                  {canSignup ? (
                    <button
                      type="button"
                      onClick={() => setIsLogin(false)}
                      className="ml-2 text-primary font-semibold hover:underline"
                    >
                      S'inscrire
                    </button>
                  ) : (
                    <span className="ml-2 text-muted-foreground/70">
                      Inscription sur invitation uniquement
                    </span>
                  )}
                </p>
              ) : (
                <p className="text-muted-foreground">
                  Déjà un compte ?
                  <button
                    type="button"
                    onClick={() => setIsLogin(true)}
                    className="ml-2 text-primary font-semibold hover:underline"
                  >
                    Se connecter
                  </button>
                </p>
              )}
            </div>
          </div>

          {/* Footer */}
          <p className="text-center text-sm text-muted-foreground mt-8">
            En continuant, vous acceptez nos{" "}
            <a href="#" className="text-primary hover:underline">conditions d'utilisation</a>
            {" "}et notre{" "}
            <a href="#" className="text-primary hover:underline">politique de confidentialité</a>.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
