CREATE TABLE public.organization_social_media_organique_tiktok (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  post_id TEXT NOT NULL,
  tiktok_url TEXT NOT NULL,
  
  caption TEXT,
  text_language TEXT,
  hashtags TEXT[],
  
  likes_count INTEGER DEFAULT 0,
  shares_count INTEGER DEFAULT 0,
  views_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  collect_count INTEGER DEFAULT 0,
  
  author_id TEXT,
  author_name TEXT,
  followers_at_time INTEGER,
  author_total_likes INTEGER,
  author_total_videos INTEGER,
  
  video_duration INTEGER,
  video_height INTEGER,
  video_width INTEGER,
  video_cover_url TEXT,
  
  music_name TEXT,
  music_author TEXT,
  music_id TEXT,
  
  effects_used JSONB DEFAULT '[]'::jsonb,
  
  is_slideshow BOOLEAN DEFAULT false,
  is_pinned BOOLEAN DEFAULT false,
  is_sponsored BOOLEAN DEFAULT false,
  is_ad BOOLEAN DEFAULT false,
  
  location_created TEXT,
  
  posted_at TIMESTAMP WITH TIME ZONE,
  scraped_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  CONSTRAINT organization_tiktok_organique_unique UNIQUE (organization_id, post_id)
);

CREATE INDEX idx_org_tiktok_organique_organization_id ON public.organization_social_media_organique_tiktok(organization_id);
CREATE INDEX idx_org_tiktok_organique_posted_at ON public.organization_social_media_organique_tiktok(posted_at DESC);
CREATE INDEX idx_org_tiktok_organique_views ON public.organization_social_media_organique_tiktok(views_count DESC);

ALTER TABLE public.organization_social_media_organique_tiktok ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Organization members can view tiktok organique posts"
ON public.organization_social_media_organique_tiktok
FOR SELECT
USING (
  public.is_super_admin(auth.uid()) 
  OR public.user_belongs_to_org(organization_id, auth.uid())
);

CREATE POLICY "Super admins and org admins can insert tiktok organique posts"
ON public.organization_social_media_organique_tiktok
FOR INSERT
WITH CHECK (
  public.is_super_admin(auth.uid()) 
  OR public.get_user_org_role(organization_id, auth.uid()) IN ('super_admin', 'org_admin')
);

CREATE POLICY "Super admins and org admins can update tiktok organique posts"
ON public.organization_social_media_organique_tiktok
FOR UPDATE
USING (
  public.is_super_admin(auth.uid()) 
  OR public.get_user_org_role(organization_id, auth.uid()) IN ('super_admin', 'org_admin')
);

CREATE POLICY "Super admins and org admins can delete tiktok organique posts"
ON public.organization_social_media_organique_tiktok
FOR DELETE
USING (
  public.is_super_admin(auth.uid()) 
  OR public.get_user_org_role(organization_id, auth.uid()) IN ('super_admin', 'org_admin')
);

CREATE TRIGGER update_org_tiktok_organique_updated_at
BEFORE UPDATE ON public.organization_social_media_organique_tiktok
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();