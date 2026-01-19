CREATE TABLE IF NOT EXISTS public.organization_social_media_organique_facebook (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    post_id TEXT NOT NULL,
    facebook_url TEXT NOT NULL,
    posted_at TIMESTAMP WITH TIME ZONE,
    scraped_at TIMESTAMP WITH TIME ZONE,
    caption TEXT,
    post_type TEXT,
    likes_count INTEGER DEFAULT 0,
    shares_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    views_count INTEGER DEFAULT 0,
    image_url TEXT,
    video_url TEXT,
    page_name TEXT,
    page_id TEXT,
    page_profile_url TEXT,
    page_profile_pic TEXT,
    has_collaborators BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(organization_id, facebook_url)
);

ALTER TABLE public.organization_social_media_organique_facebook ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Organization members can view their Facebook posts"
ON public.organization_social_media_organique_facebook
FOR SELECT
USING (
    is_super_admin(auth.uid()) OR
    user_belongs_to_org(organization_id, auth.uid())
);

CREATE POLICY "Super admins and org admins can manage Facebook posts"
ON public.organization_social_media_organique_facebook
FOR ALL
USING (
    is_super_admin(auth.uid()) OR
    get_user_org_role(organization_id, auth.uid()) IN ('super_admin', 'org_admin')
);

CREATE TRIGGER update_organization_facebook_posts_updated_at
BEFORE UPDATE ON public.organization_social_media_organique_facebook
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();