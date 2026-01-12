
CREATE TYPE org_role AS ENUM ('super_admin', 'org_admin', 'org_user');

CREATE TABLE public.organizations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  logo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.organization_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role org_role NOT NULL DEFAULT 'org_user',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT unique_org_member UNIQUE (organization_id, user_id)
);

ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_super_admin(check_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.organization_members
    WHERE user_id = check_user_id AND role = 'super_admin'
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.get_user_org_role(check_user_id UUID, check_org_id UUID)
RETURNS org_role
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_role org_role;
BEGIN
  SELECT role INTO user_role FROM public.organization_members
  WHERE user_id = check_user_id AND organization_id = check_org_id;
  RETURN user_role;
END;
$$;

CREATE OR REPLACE FUNCTION public.user_belongs_to_org(check_user_id UUID, check_org_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.organization_members
    WHERE user_id = check_user_id AND organization_id = check_org_id
  );
END;
$$;

CREATE POLICY "Super admins can view all organizations"
ON public.organizations FOR SELECT
USING (is_super_admin(auth.uid()));

CREATE POLICY "Super admins can manage all organizations"
ON public.organizations FOR ALL
USING (is_super_admin(auth.uid()));

CREATE POLICY "Org members can view their organization"
ON public.organizations FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.organization_members
    WHERE organization_id = organizations.id AND user_id = auth.uid()
  )
);

CREATE POLICY "Super admins can view all members"
ON public.organization_members FOR SELECT
USING (is_super_admin(auth.uid()));

CREATE POLICY "Super admins can manage all members"
ON public.organization_members FOR ALL
USING (is_super_admin(auth.uid()));

CREATE POLICY "Org admins can view their org members"
ON public.organization_members FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.organization_members om
    WHERE om.organization_id = organization_members.organization_id
    AND om.user_id = auth.uid()
    AND om.role IN ('org_admin', 'super_admin')
  )
);

CREATE POLICY "Org admins can manage their org members"
ON public.organization_members FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.organization_members om
    WHERE om.organization_id = organization_members.organization_id
    AND om.user_id = auth.uid()
    AND om.role = 'org_admin'
  )
  AND role != 'super_admin'
);

CREATE POLICY "Users can view their own membership"
ON public.organization_members FOR SELECT
USING (user_id = auth.uid());

INSERT INTO public.organizations (name, slug) VALUES ('Socialy', 'socialy');

INSERT INTO public.organization_members (organization_id, user_id, role)
SELECT 
  (SELECT id FROM public.organizations WHERE slug = 'socialy'),
  ur.user_id,
  CASE 
    WHEN ur.role = 'admin' THEN 'org_admin'::org_role 
    ELSE 'org_user'::org_role 
  END
FROM public.user_roles ur
ON CONFLICT (organization_id, user_id) DO NOTHING;

UPDATE public.organization_members
SET role = 'super_admin'
WHERE user_id IN (
  SELECT ur.user_id FROM public.user_roles ur WHERE ur.role = 'admin'
);

CREATE TRIGGER update_organizations_updated_at
BEFORE UPDATE ON public.organizations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
