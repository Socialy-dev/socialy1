CREATE TABLE public.creative_library_inspirations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  title TEXT,
  description TEXT,
  image_url TEXT,
  video_url TEXT,
  source_url TEXT,
  source_type TEXT NOT NULL DEFAULT 'manual',
  tags TEXT[],
  industry TEXT,
  format TEXT,
  is_scraped BOOLEAN NOT NULL DEFAULT false,
  scraped_at TIMESTAMP WITH TIME ZONE,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.creative_library_inspirations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Org admins can manage creative inspirations"
ON public.creative_library_inspirations
FOR ALL
USING (
  is_super_admin(auth.uid()) OR 
  (get_user_org_role(organization_id, auth.uid()) = ANY (ARRAY['super_admin'::org_role, 'org_admin'::org_role]))
);

CREATE POLICY "Org members can view creative inspirations"
ON public.creative_library_inspirations
FOR SELECT
USING (
  is_super_admin(auth.uid()) OR 
  user_belongs_to_org(organization_id, auth.uid())
);

CREATE INDEX idx_creative_library_org_platform ON public.creative_library_inspirations(organization_id, platform);
CREATE INDEX idx_creative_library_source_type ON public.creative_library_inspirations(source_type);

CREATE TRIGGER update_creative_library_inspirations_updated_at
BEFORE UPDATE ON public.creative_library_inspirations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();