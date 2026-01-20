
CREATE TABLE public.organization_social_media_organique_competitor_instagram (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  competitor_id UUID NOT NULL REFERENCES public.organization_competitor(id) ON DELETE CASCADE,
  competitor_name TEXT,
  post_id TEXT,
  post_url TEXT NOT NULL,
  caption TEXT,
  likes_count INTEGER,
  comments_count INTEGER,
  views_count INTEGER,
  video_play_count INTEGER,
  images TEXT[],
  profile_picture_url TEXT,
  company_name TEXT,
  logo_url TEXT,
  content_type TEXT,
  is_video BOOLEAN,
  video_url TEXT,
  video_duration TEXT,
  dimensions_width INTEGER,
  dimensions_height INTEGER,
  hashtags TEXT[],
  mentions TEXT[],
  latest_comments TEXT,
  followers_count INTEGER,
  following_count INTEGER,
  posts_count INTEGER,
  posted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(organization_id, competitor_id, post_url)
);

CREATE TABLE public.organization_social_media_organique_competitor_facebook (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  competitor_id UUID NOT NULL REFERENCES public.organization_competitor(id) ON DELETE CASCADE,
  competitor_name TEXT,
  post_id TEXT NOT NULL,
  post_url TEXT NOT NULL,
  page_id TEXT,
  page_name TEXT,
  page_url TEXT,
  page_profile_pic TEXT,
  page_profile_url TEXT,
  caption TEXT,
  post_type TEXT,
  image_url TEXT,
  video_url TEXT,
  likes_count INTEGER,
  comments_count INTEGER,
  shares_count INTEGER,
  views_count INTEGER,
  has_collaborators BOOLEAN,
  posted_at TIMESTAMP WITH TIME ZONE,
  scraped_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(organization_id, competitor_id, post_url)
);

CREATE TABLE public.organization_social_media_organique_competitor_tiktok (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  competitor_id UUID NOT NULL REFERENCES public.organization_competitor(id) ON DELETE CASCADE,
  competitor_name TEXT,
  post_id TEXT NOT NULL,
  tiktok_url TEXT NOT NULL,
  author_id TEXT,
  author_name TEXT,
  author_total_likes INTEGER,
  author_total_videos INTEGER,
  caption TEXT,
  likes_count INTEGER,
  comments_count INTEGER,
  shares_count INTEGER,
  views_count INTEGER,
  collect_count INTEGER,
  video_cover_url TEXT,
  video_duration INTEGER,
  video_width INTEGER,
  video_height INTEGER,
  hashtags TEXT[],
  music_id TEXT,
  music_name TEXT,
  music_author TEXT,
  effects_used JSONB,
  text_language TEXT,
  location_created TEXT,
  is_ad BOOLEAN,
  is_pinned BOOLEAN,
  is_slideshow BOOLEAN,
  is_sponsored BOOLEAN,
  followers_at_time INTEGER,
  posted_at TIMESTAMP WITH TIME ZONE,
  scraped_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(organization_id, competitor_id, post_id)
);

CREATE TABLE public.organization_social_media_organique_competitor_linkedin (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  competitor_id UUID NOT NULL REFERENCES public.organization_competitor(id) ON DELETE CASCADE,
  competitor_name TEXT,
  post_id TEXT NOT NULL,
  post_url TEXT NOT NULL,
  caption TEXT,
  author_name TEXT,
  author_logo_url TEXT,
  author_company_url TEXT,
  author_followers INTEGER,
  company_source_url TEXT,
  post_type TEXT,
  media_type TEXT,
  media_url TEXT,
  media_thumbnail TEXT,
  media_title TEXT,
  document_url TEXT,
  document_title TEXT,
  document_page_count INTEGER,
  likes_count INTEGER,
  comments_count INTEGER,
  reposts_count INTEGER,
  total_reactions INTEGER,
  celebrate_count INTEGER,
  support_count INTEGER,
  love_count INTEGER,
  insight_count INTEGER,
  is_edited BOOLEAN,
  language TEXT,
  full_urn TEXT,
  timestamp INTEGER,
  video_duration TEXT,
  posted_at TIMESTAMP WITH TIME ZONE,
  posted_relative TEXT,
  scraped_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(organization_id, competitor_id, post_url)
);

ALTER TABLE public.organization_social_media_organique_competitor_instagram ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_social_media_organique_competitor_facebook ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_social_media_organique_competitor_tiktok ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_social_media_organique_competitor_linkedin ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Organization members can view competitor instagram posts"
ON public.organization_social_media_organique_competitor_instagram FOR SELECT
USING (user_belongs_to_org(organization_id, auth.uid()) OR is_super_admin(auth.uid()));

CREATE POLICY "Admins can manage competitor instagram posts"
ON public.organization_social_media_organique_competitor_instagram FOR ALL
USING (
  is_super_admin(auth.uid()) OR 
  get_user_org_role(organization_id, auth.uid()) IN ('super_admin', 'org_admin')
);

CREATE POLICY "Organization members can view competitor facebook posts"
ON public.organization_social_media_organique_competitor_facebook FOR SELECT
USING (user_belongs_to_org(organization_id, auth.uid()) OR is_super_admin(auth.uid()));

CREATE POLICY "Admins can manage competitor facebook posts"
ON public.organization_social_media_organique_competitor_facebook FOR ALL
USING (
  is_super_admin(auth.uid()) OR 
  get_user_org_role(organization_id, auth.uid()) IN ('super_admin', 'org_admin')
);

CREATE POLICY "Organization members can view competitor tiktok posts"
ON public.organization_social_media_organique_competitor_tiktok FOR SELECT
USING (user_belongs_to_org(organization_id, auth.uid()) OR is_super_admin(auth.uid()));

CREATE POLICY "Admins can manage competitor tiktok posts"
ON public.organization_social_media_organique_competitor_tiktok FOR ALL
USING (
  is_super_admin(auth.uid()) OR 
  get_user_org_role(organization_id, auth.uid()) IN ('super_admin', 'org_admin')
);

CREATE POLICY "Organization members can view competitor linkedin posts"
ON public.organization_social_media_organique_competitor_linkedin FOR SELECT
USING (user_belongs_to_org(organization_id, auth.uid()) OR is_super_admin(auth.uid()));

CREATE POLICY "Admins can manage competitor linkedin posts"
ON public.organization_social_media_organique_competitor_linkedin FOR ALL
USING (
  is_super_admin(auth.uid()) OR 
  get_user_org_role(organization_id, auth.uid()) IN ('super_admin', 'org_admin')
);

CREATE INDEX idx_competitor_instagram_org ON public.organization_social_media_organique_competitor_instagram(organization_id);
CREATE INDEX idx_competitor_instagram_competitor ON public.organization_social_media_organique_competitor_instagram(competitor_id);
CREATE INDEX idx_competitor_facebook_org ON public.organization_social_media_organique_competitor_facebook(organization_id);
CREATE INDEX idx_competitor_facebook_competitor ON public.organization_social_media_organique_competitor_facebook(competitor_id);
CREATE INDEX idx_competitor_tiktok_org ON public.organization_social_media_organique_competitor_tiktok(organization_id);
CREATE INDEX idx_competitor_tiktok_competitor ON public.organization_social_media_organique_competitor_tiktok(competitor_id);
CREATE INDEX idx_competitor_linkedin_org ON public.organization_social_media_organique_competitor_linkedin(organization_id);
CREATE INDEX idx_competitor_linkedin_competitor ON public.organization_social_media_organique_competitor_linkedin(competitor_id);
