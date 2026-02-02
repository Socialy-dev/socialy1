
CREATE TABLE public.organization_linkedin_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  activity_urn TEXT,
  post_url TEXT NOT NULL,
  text TEXT,
  posted_at_date TIMESTAMP WITH TIME ZONE,
  author_name TEXT,
  author_headline TEXT,
  author_profile_url TEXT,
  author_avatar_url TEXT,
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  reposts_count INTEGER DEFAULT 0,
  impressions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  engagement_rate NUMERIC(5,2) DEFAULT 0,
  media_items JSONB DEFAULT '[]'::jsonb,
  raw_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(organization_id, post_url)
);

ALTER TABLE public.organization_linkedin_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Organization members can view their posts"
ON public.organization_linkedin_posts
FOR SELECT
USING (
  organization_id IN (
    SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid()
  )
  OR public.is_super_admin(auth.uid())
);

CREATE POLICY "Super admins can manage all posts"
ON public.organization_linkedin_posts
FOR ALL
USING (public.is_super_admin(auth.uid()));

CREATE POLICY "Org admins can insert posts"
ON public.organization_linkedin_posts
FOR INSERT
WITH CHECK (
  organization_id IN (
    SELECT organization_id FROM public.organization_members 
    WHERE user_id = auth.uid() AND role IN ('org_admin', 'super_admin')
  )
  OR public.is_super_admin(auth.uid())
);

CREATE POLICY "Org admins can update posts"
ON public.organization_linkedin_posts
FOR UPDATE
USING (
  organization_id IN (
    SELECT organization_id FROM public.organization_members 
    WHERE user_id = auth.uid() AND role IN ('org_admin', 'super_admin')
  )
  OR public.is_super_admin(auth.uid())
);

CREATE POLICY "Org admins can delete posts"
ON public.organization_linkedin_posts
FOR DELETE
USING (
  organization_id IN (
    SELECT organization_id FROM public.organization_members 
    WHERE user_id = auth.uid() AND role IN ('org_admin', 'super_admin')
  )
  OR public.is_super_admin(auth.uid())
);

CREATE TRIGGER update_organization_linkedin_posts_updated_at
BEFORE UPDATE ON public.organization_linkedin_posts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
