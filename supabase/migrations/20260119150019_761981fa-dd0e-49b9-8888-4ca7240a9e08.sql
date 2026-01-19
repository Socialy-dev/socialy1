CREATE TABLE IF NOT EXISTS public.user_tiktok_favorites (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    tiktok_post_id UUID NOT NULL REFERENCES public.organization_social_media_organique_tiktok(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'favorite',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(user_id, organization_id, tiktok_post_id)
);

ALTER TABLE public.user_tiktok_favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own TikTok favorites"
ON public.user_tiktok_favorites
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own TikTok favorites"
ON public.user_tiktok_favorites
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own TikTok favorites"
ON public.user_tiktok_favorites
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own TikTok favorites"
ON public.user_tiktok_favorites
FOR DELETE
USING (auth.uid() = user_id);

CREATE TRIGGER update_user_tiktok_favorites_updated_at
BEFORE UPDATE ON public.user_tiktok_favorites
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();