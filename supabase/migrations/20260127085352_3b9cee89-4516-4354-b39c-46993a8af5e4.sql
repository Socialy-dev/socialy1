
CREATE TABLE public.pinterest_creatives (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  pinterest_id TEXT NOT NULL,
  pinterest_link TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'image',
  download_url TEXT,
  thumbnail_url TEXT,
  title TEXT,
  description TEXT,
  alt_text TEXT,
  likes INTEGER DEFAULT 0,
  is_promoted BOOLEAN DEFAULT false,
  creator_name TEXT,
  creator_url TEXT,
  dominant_color TEXT,
  pinterest_created_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT pinterest_creatives_org_link_unique UNIQUE (organization_id, pinterest_link)
);

ALTER TABLE public.pinterest_creatives ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Org members can view pinterest creatives"
ON public.pinterest_creatives
FOR SELECT
USING (is_super_admin(auth.uid()) OR user_belongs_to_org(organization_id, auth.uid()));

CREATE POLICY "Org admins can manage pinterest creatives"
ON public.pinterest_creatives
FOR ALL
USING (is_super_admin(auth.uid()) OR (get_user_org_role(organization_id, auth.uid()) = ANY (ARRAY['super_admin'::org_role, 'org_admin'::org_role])));

CREATE INDEX idx_pinterest_creatives_org ON public.pinterest_creatives(organization_id);
CREATE INDEX idx_pinterest_creatives_type ON public.pinterest_creatives(type);
