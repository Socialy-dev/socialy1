
CREATE TABLE IF NOT EXISTS public.organization_social_media_organique_linkedin (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  post_id TEXT NOT NULL,
  full_urn TEXT,
  post_url TEXT NOT NULL,
  company_source_url TEXT,
  posted_at TIMESTAMP WITH TIME ZONE,
  posted_relative TEXT,
  timestamp BIGINT,
  scraped_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  caption TEXT,
  post_type TEXT,
  is_edited BOOLEAN DEFAULT false,
  language TEXT,
  total_reactions INTEGER DEFAULT 0,
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  reposts_count INTEGER DEFAULT 0,
  love_count INTEGER DEFAULT 0,
  celebrate_count INTEGER DEFAULT 0,
  support_count INTEGER DEFAULT 0,
  insight_count INTEGER DEFAULT 0,
  author_name TEXT,
  author_followers INTEGER,
  author_company_url TEXT,
  author_logo_url TEXT,
  media_type TEXT,
  media_url TEXT,
  media_title TEXT,
  media_thumbnail TEXT,
  video_duration TEXT,
  document_title TEXT,
  document_url TEXT,
  document_page_count INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(organization_id, post_url)
);

ALTER TABLE public.organization_social_media_organique_linkedin ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Organization members can view LinkedIn posts"
ON public.organization_social_media_organique_linkedin
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.organization_members
    WHERE organization_members.organization_id = organization_social_media_organique_linkedin.organization_id
    AND organization_members.user_id = auth.uid()
  )
  OR public.is_super_admin(auth.uid())
);

CREATE POLICY "Admins can manage LinkedIn posts"
ON public.organization_social_media_organique_linkedin
FOR ALL
USING (
  public.is_super_admin(auth.uid())
  OR EXISTS (
    SELECT 1 FROM public.organization_members
    WHERE organization_members.organization_id = organization_social_media_organique_linkedin.organization_id
    AND organization_members.user_id = auth.uid()
    AND organization_members.role = 'org_admin'
  )
);

CREATE INDEX idx_linkedin_org_id ON public.organization_social_media_organique_linkedin(organization_id);
CREATE INDEX idx_linkedin_posted_at ON public.organization_social_media_organique_linkedin(posted_at DESC);

CREATE TRIGGER update_linkedin_updated_at
BEFORE UPDATE ON public.organization_social_media_organique_linkedin
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
