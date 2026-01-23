DROP POLICY IF EXISTS "Users can view profiles of organization members" ON public.profiles;

CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Org members can view limited profile info" 
ON public.profiles 
FOR SELECT 
USING (
  user_id IN (
    SELECT om2.user_id
    FROM organization_members om1
    JOIN organization_members om2 ON om1.organization_id = om2.organization_id
    WHERE om1.user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Users can only verify their own invitation by token" ON public.invitations;
DROP POLICY IF EXISTS "Admins can manage invitations" ON public.invitations;

CREATE POLICY "Admins can manage their org invitations" 
ON public.invitations 
FOR ALL 
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role) 
  AND EXISTS (
    SELECT 1 FROM organization_members om
    WHERE om.user_id = auth.uid()
    AND om.organization_id = invitations.organization_id
  )
);

CREATE POLICY "Super admins can manage all invitations" 
ON public.invitations 
FOR ALL 
TO authenticated
USING (is_super_admin(auth.uid()));

DROP POLICY IF EXISTS "Users can view their organization gmail connections" ON public.gmail_connections;
DROP POLICY IF EXISTS "Users can insert gmail connections for their organization" ON public.gmail_connections;
DROP POLICY IF EXISTS "Users can update their own gmail connections" ON public.gmail_connections;
DROP POLICY IF EXISTS "Users can delete their own gmail connections" ON public.gmail_connections;

CREATE POLICY "Users can view gmail connections in their org" 
ON public.gmail_connections 
FOR SELECT 
TO authenticated
USING (
  user_belongs_to_org(auth.uid(), organization_id)
);

CREATE POLICY "Users can insert gmail connections for their org" 
ON public.gmail_connections 
FOR INSERT 
TO authenticated
WITH CHECK (
  auth.uid() = user_id 
  AND user_belongs_to_org(auth.uid(), organization_id)
);

CREATE POLICY "Users can update their own gmail connections" 
ON public.gmail_connections 
FOR UPDATE 
TO authenticated
USING (
  auth.uid() = user_id 
  AND user_belongs_to_org(auth.uid(), organization_id)
);

CREATE POLICY "Users can delete their own gmail connections" 
ON public.gmail_connections 
FOR DELETE 
TO authenticated
USING (
  auth.uid() = user_id 
  AND user_belongs_to_org(auth.uid(), organization_id)
);

CREATE POLICY "Super admins can manage all gmail connections" 
ON public.gmail_connections 
FOR ALL 
TO authenticated
USING (is_super_admin(auth.uid()));