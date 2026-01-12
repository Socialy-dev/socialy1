
DROP POLICY IF EXISTS "Users can view org members of their orgs" ON public.organization_members;
DROP POLICY IF EXISTS "Org admins can insert members" ON public.organization_members;
DROP POLICY IF EXISTS "Org admins can update members" ON public.organization_members;
DROP POLICY IF EXISTS "Org admins can delete members" ON public.organization_members;

CREATE POLICY "Admins can insert members"
ON public.organization_members FOR INSERT
WITH CHECK (
  (SELECT role FROM public.organization_members WHERE user_id = auth.uid() LIMIT 1) IN ('org_admin', 'super_admin')
);

CREATE POLICY "Admins can update members"
ON public.organization_members FOR UPDATE
USING (
  (SELECT role FROM public.organization_members WHERE user_id = auth.uid() LIMIT 1) IN ('org_admin', 'super_admin')
);

CREATE POLICY "Admins can delete non-self members"
ON public.organization_members FOR DELETE
USING (
  (SELECT role FROM public.organization_members WHERE user_id = auth.uid() LIMIT 1) IN ('org_admin', 'super_admin')
  AND user_id != auth.uid()
);
