DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Org members can view limited profile info" ON public.profiles;

CREATE POLICY "Users can view their own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Org members can view team member names only"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  user_id IN (
    SELECT om2.user_id
    FROM organization_members om1
    JOIN organization_members om2 ON om1.organization_id = om2.organization_id
    WHERE om1.user_id = auth.uid()
    AND om2.user_id != auth.uid()
  )
);

DROP POLICY IF EXISTS "Users can view gmail connections in their org" ON public.gmail_connections;

CREATE POLICY "Users can only view their own gmail connections"
ON public.gmail_connections
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Super admins can view all gmail connections metadata"
ON public.gmail_connections
FOR SELECT
TO authenticated
USING (is_super_admin(auth.uid()));