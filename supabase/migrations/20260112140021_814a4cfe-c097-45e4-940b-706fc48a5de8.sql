
DROP POLICY IF EXISTS "Super admins can view all members" ON public.organization_members;
DROP POLICY IF EXISTS "Super admins can manage all members" ON public.organization_members;
DROP POLICY IF EXISTS "Org admins can view their org members" ON public.organization_members;
DROP POLICY IF EXISTS "Org admins can manage their org members" ON public.organization_members;
DROP POLICY IF EXISTS "Users can view their own membership" ON public.organization_members;

CREATE POLICY "Users can view their own membership"
ON public.organization_members FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Users can view org members of their orgs"
ON public.organization_members FOR SELECT
USING (
  organization_id IN (
    SELECT om.organization_id FROM public.organization_members om WHERE om.user_id = auth.uid()
  )
);

CREATE POLICY "Org admins can insert members"
ON public.organization_members FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.organization_members om
    WHERE om.organization_id = organization_members.organization_id
    AND om.user_id = auth.uid()
    AND om.role IN ('org_admin', 'super_admin')
  )
);

CREATE POLICY "Org admins can update members"
ON public.organization_members FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.organization_members om
    WHERE om.organization_id = organization_members.organization_id
    AND om.user_id = auth.uid()
    AND om.role IN ('org_admin', 'super_admin')
  )
);

CREATE POLICY "Org admins can delete members"
ON public.organization_members FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.organization_members om
    WHERE om.organization_id = organization_members.organization_id
    AND om.user_id = auth.uid()
    AND om.role IN ('org_admin', 'super_admin')
  )
  AND user_id != auth.uid()
);
