CREATE TABLE public.organization_resources (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL UNIQUE REFERENCES public.organizations(id) ON DELETE CASCADE,
  linkedin_url TEXT,
  instagram_url TEXT,
  twitter_url TEXT,
  youtube_url TEXT,
  facebook_url TEXT,
  website_url TEXT,
  company_name TEXT,
  company_description TEXT,
  industry TEXT,
  target_audience TEXT,
  key_messages TEXT,
  tone_of_voice TEXT,
  hashtags TEXT,
  competitors TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  address TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.organization_resources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admins have full access to organization_resources"
ON public.organization_resources
FOR ALL
USING (public.is_super_admin(auth.uid()));

CREATE POLICY "Org members can view their organization resources"
ON public.organization_resources
FOR SELECT
USING (public.user_belongs_to_org(organization_id, auth.uid()));

CREATE POLICY "Org admins can manage their organization resources"
ON public.organization_resources
FOR ALL
USING (
  public.get_user_org_role(organization_id, auth.uid()) IN ('org_admin', 'super_admin')
);

CREATE TRIGGER update_organization_resources_updated_at
BEFORE UPDATE ON public.organization_resources
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();