
CREATE TABLE public.organization_social_media_organique_instagram (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    post_id TEXT,
    post_url TEXT NOT NULL,
    caption TEXT,
    hashtags TEXT[],
    mentions TEXT[],
    likes_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    views_count INTEGER DEFAULT 0,
    video_url TEXT,
    video_duration TEXT,
    video_play_count INTEGER DEFAULT 0,
    is_video BOOLEAN DEFAULT FALSE,
    images TEXT[],
    content_type TEXT,
    profile_picture_url TEXT,
    logo_url TEXT,
    company_name TEXT,
    followers_count INTEGER DEFAULT 0,
    following_count INTEGER DEFAULT 0,
    posts_count INTEGER DEFAULT 0,
    latest_comments JSONB,
    dimensions_width INTEGER,
    dimensions_height INTEGER,
    posted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    CONSTRAINT organization_social_media_organique_instagram_org_post_url_key UNIQUE (organization_id, post_url)
);

ALTER TABLE public.organization_social_media_organique_instagram ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Organization members can view their instagram posts"
ON public.organization_social_media_organique_instagram
FOR SELECT
USING (
    organization_id IN (
        SELECT om.organization_id FROM public.organization_members om
        WHERE om.user_id = auth.uid()
    )
    OR public.is_super_admin(auth.uid())
);

CREATE POLICY "Admins can insert instagram posts"
ON public.organization_social_media_organique_instagram
FOR INSERT
WITH CHECK (
    organization_id IN (
        SELECT om.organization_id FROM public.organization_members om
        WHERE om.user_id = auth.uid() AND om.role IN ('super_admin', 'org_admin')
    )
    OR public.is_super_admin(auth.uid())
);

CREATE POLICY "Admins can update instagram posts"
ON public.organization_social_media_organique_instagram
FOR UPDATE
USING (
    organization_id IN (
        SELECT om.organization_id FROM public.organization_members om
        WHERE om.user_id = auth.uid() AND om.role IN ('super_admin', 'org_admin')
    )
    OR public.is_super_admin(auth.uid())
);

CREATE POLICY "Admins can delete instagram posts"
ON public.organization_social_media_organique_instagram
FOR DELETE
USING (
    organization_id IN (
        SELECT om.organization_id FROM public.organization_members om
        WHERE om.user_id = auth.uid() AND om.role IN ('super_admin', 'org_admin')
    )
    OR public.is_super_admin(auth.uid())
);

CREATE TRIGGER update_organization_social_media_organique_instagram_updated_at
BEFORE UPDATE ON public.organization_social_media_organique_instagram
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_instagram_posts_organization_id ON public.organization_social_media_organique_instagram(organization_id);
CREATE INDEX idx_instagram_posts_posted_at ON public.organization_social_media_organique_instagram(posted_at DESC);
