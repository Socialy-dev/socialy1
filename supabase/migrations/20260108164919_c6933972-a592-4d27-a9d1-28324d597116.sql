-- Supprimer la policy trop permissive
DROP POLICY "System can insert roles" ON public.user_roles;

-- Créer une policy plus restrictive : seul le trigger (via SECURITY DEFINER) peut insérer
-- Les admins peuvent aussi insérer pour créer des rôles manuellement
CREATE POLICY "Admins can insert roles"
ON public.user_roles FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));