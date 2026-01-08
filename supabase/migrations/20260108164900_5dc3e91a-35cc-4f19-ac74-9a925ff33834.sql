-- 1. Créer l'enum pour les rôles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- 2. Créer l'enum pour les pages
CREATE TYPE public.app_page AS ENUM ('dashboard', 'relations-presse', 'social-media', 'profile');

-- 3. Table des rôles utilisateurs (séparée pour sécurité)
CREATE TABLE public.user_roles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    role app_role NOT NULL DEFAULT 'user',
    created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 4. Table des permissions par utilisateur
CREATE TABLE public.user_permissions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    page app_page NOT NULL,
    created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
    UNIQUE(user_id, page)
);

-- 5. Table des invitations
CREATE TABLE public.invitations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    email text NOT NULL,
    token uuid NOT NULL DEFAULT gen_random_uuid() UNIQUE,
    role app_role NOT NULL DEFAULT 'user',
    pages app_page[] NOT NULL DEFAULT '{}',
    invited_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    used_at timestamp with time zone,
    expires_at timestamp with time zone NOT NULL DEFAULT (timezone('utc'::text, now()) + interval '7 days'),
    created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 6. Activer RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;

-- 7. Fonction sécurisée pour vérifier les rôles (SECURITY DEFINER évite la récursion RLS)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.user_roles
        WHERE user_id = _user_id
          AND role = _role
    )
$$;

-- 8. Fonction pour vérifier si un user a accès à une page
CREATE OR REPLACE FUNCTION public.has_page_access(_user_id uuid, _page app_page)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT 
        public.has_role(_user_id, 'admin') 
        OR EXISTS (
            SELECT 1
            FROM public.user_permissions
            WHERE user_id = _user_id
              AND page = _page
        )
$$;

-- 9. Fonction pour vérifier si c'est le premier utilisateur (devient admin)
CREATE OR REPLACE FUNCTION public.is_first_user()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT NOT EXISTS (SELECT 1 FROM public.user_roles)
$$;

-- 10. Fonction pour vérifier si une invitation est valide
CREATE OR REPLACE FUNCTION public.is_valid_invitation(_email text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.invitations
        WHERE email = _email
          AND used_at IS NULL
          AND expires_at > timezone('utc'::text, now())
    )
$$;

-- 11. Policies pour user_roles
CREATE POLICY "Users can view their own role"
ON public.user_roles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
ON public.user_roles FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "System can insert roles"
ON public.user_roles FOR INSERT
WITH CHECK (true);

CREATE POLICY "Admins can update roles"
ON public.user_roles FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete roles"
ON public.user_roles FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- 12. Policies pour user_permissions
CREATE POLICY "Users can view their own permissions"
ON public.user_permissions FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all permissions"
ON public.user_permissions FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage permissions"
ON public.user_permissions FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- 13. Policies pour invitations
CREATE POLICY "Admins can manage invitations"
ON public.invitations FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Anyone can verify invitation by token"
ON public.invitations FOR SELECT
USING (true);

-- 14. Trigger pour assigner rôle et permissions après inscription
CREATE OR REPLACE FUNCTION public.handle_new_user_role()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    _invitation RECORD;
    _is_first boolean;
    _page app_page;
BEGIN
    -- Vérifier si c'est le premier utilisateur
    SELECT public.is_first_user() INTO _is_first;
    
    IF _is_first THEN
        -- Premier utilisateur = admin avec toutes les pages
        INSERT INTO public.user_roles (user_id, role)
        VALUES (NEW.id, 'admin');
        
        -- Donner accès à toutes les pages
        INSERT INTO public.user_permissions (user_id, page)
        SELECT NEW.id, unnest(enum_range(NULL::app_page));
    ELSE
        -- Chercher l'invitation
        SELECT * INTO _invitation
        FROM public.invitations
        WHERE email = NEW.email
          AND used_at IS NULL
          AND expires_at > timezone('utc'::text, now())
        LIMIT 1;
        
        IF _invitation IS NOT NULL THEN
            -- Créer le rôle
            INSERT INTO public.user_roles (user_id, role)
            VALUES (NEW.id, _invitation.role);
            
            -- Créer les permissions
            FOREACH _page IN ARRAY _invitation.pages
            LOOP
                INSERT INTO public.user_permissions (user_id, page)
                VALUES (NEW.id, _page);
            END LOOP;
            
            -- Marquer l'invitation comme utilisée
            UPDATE public.invitations
            SET used_at = timezone('utc'::text, now())
            WHERE id = _invitation.id;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$;

-- 15. Créer le trigger
CREATE TRIGGER on_auth_user_created_role
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_role();