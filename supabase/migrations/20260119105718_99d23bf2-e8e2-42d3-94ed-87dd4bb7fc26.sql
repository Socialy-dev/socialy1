
CREATE TABLE public.organization_marche_public (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  source TEXT,
  external_id TEXT,
  titre TEXT,
  acheteur TEXT,
  montant NUMERIC,
  date_publication DATE,
  deadline TIMESTAMPTZ,
  url TEXT NOT NULL,
  dedup_key TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(organization_id, url)
);

ALTER TABLE public.organization_marche_public ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their organization marche public"
ON public.organization_marche_public
FOR SELECT
USING (
  public.is_super_admin(auth.uid())
  OR public.user_belongs_to_org(organization_id, auth.uid())
);

CREATE POLICY "Admins can insert marche public"
ON public.organization_marche_public
FOR INSERT
WITH CHECK (
  public.is_super_admin(auth.uid())
  OR public.get_user_org_role(organization_id, auth.uid()) IN ('super_admin', 'org_admin')
);

CREATE POLICY "Admins can update marche public"
ON public.organization_marche_public
FOR UPDATE
USING (
  public.is_super_admin(auth.uid())
  OR public.get_user_org_role(organization_id, auth.uid()) IN ('super_admin', 'org_admin')
);

CREATE POLICY "Admins can delete marche public"
ON public.organization_marche_public
FOR DELETE
USING (
  public.is_super_admin(auth.uid())
  OR public.get_user_org_role(organization_id, auth.uid()) IN ('super_admin', 'org_admin')
);

CREATE TRIGGER update_organization_marche_public_updated_at
BEFORE UPDATE ON public.organization_marche_public
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_organization_marche_public_org_id ON public.organization_marche_public(organization_id);
CREATE INDEX idx_organization_marche_public_deadline ON public.organization_marche_public(deadline);
CREATE INDEX idx_organization_marche_public_source ON public.organization_marche_public(source);
