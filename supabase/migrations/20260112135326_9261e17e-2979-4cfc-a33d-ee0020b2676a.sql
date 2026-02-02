
ALTER TABLE public.invitations 
ADD COLUMN organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
ADD COLUMN org_role org_role NOT NULL DEFAULT 'org_user';

UPDATE public.invitations 
SET organization_id = (SELECT id FROM public.organizations WHERE slug = 'socialy'),
    org_role = CASE 
      WHEN role = 'admin' THEN 'org_admin'::org_role 
      ELSE 'org_user'::org_role 
    END;

ALTER TABLE public.invitations 
ALTER COLUMN organization_id SET NOT NULL;

ALTER TABLE public.invitations 
DROP COLUMN role;

ALTER TABLE public.invitations 
DROP COLUMN pages;
