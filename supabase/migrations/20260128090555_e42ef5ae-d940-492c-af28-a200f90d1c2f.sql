-- Create unified media_assets bucket for all persistent media storage
INSERT INTO storage.buckets (id, name, public)
VALUES ('media_assets', 'media_assets', false)
ON CONFLICT (id) DO NOTHING;

-- RLS policies for media_assets bucket
CREATE POLICY "Organization members can view media assets"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'media_assets' AND
  EXISTS (
    SELECT 1 FROM public.organization_members om
    WHERE om.user_id = auth.uid()
    AND om.organization_id::text = (storage.foldername(name))[1]
  )
);

CREATE POLICY "Admins can upload media assets"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'media_assets' AND
  EXISTS (
    SELECT 1 FROM public.organization_members om
    WHERE om.user_id = auth.uid()
    AND om.organization_id::text = (storage.foldername(name))[1]
    AND om.role IN ('super_admin', 'org_admin')
  )
);

CREATE POLICY "Admins can update media assets"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'media_assets' AND
  EXISTS (
    SELECT 1 FROM public.organization_members om
    WHERE om.user_id = auth.uid()
    AND om.organization_id::text = (storage.foldername(name))[1]
    AND om.role IN ('super_admin', 'org_admin')
  )
);

CREATE POLICY "Admins can delete media assets"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'media_assets' AND
  EXISTS (
    SELECT 1 FROM public.organization_members om
    WHERE om.user_id = auth.uid()
    AND om.organization_id::text = (storage.foldername(name))[1]
    AND om.role IN ('super_admin', 'org_admin')
  )
);

-- Add storage_path columns to all relevant tables

-- Articles tables
ALTER TABLE public.organization_articles 
ADD COLUMN IF NOT EXISTS storage_path TEXT,
ADD COLUMN IF NOT EXISTS original_thumbnail TEXT;

ALTER TABLE public.competitor_articles 
ADD COLUMN IF NOT EXISTS storage_path TEXT,
ADD COLUMN IF NOT EXISTS original_thumbnail TEXT;

ALTER TABLE public.client_articles 
ADD COLUMN IF NOT EXISTS storage_path TEXT,
ADD COLUMN IF NOT EXISTS original_thumbnail TEXT;

ALTER TABLE public.market_watch_topics 
ADD COLUMN IF NOT EXISTS storage_path TEXT,
ADD COLUMN IF NOT EXISTS original_thumbnail TEXT;

-- Social media organic tables (own organization)
ALTER TABLE public.organization_social_media_organique_instagram
ADD COLUMN IF NOT EXISTS storage_path TEXT,
ADD COLUMN IF NOT EXISTS original_image_url TEXT;

ALTER TABLE public.organization_social_media_organique_facebook
ADD COLUMN IF NOT EXISTS storage_path TEXT,
ADD COLUMN IF NOT EXISTS original_image_url TEXT;

ALTER TABLE public.organization_social_media_organique_linkedin
ADD COLUMN IF NOT EXISTS storage_path TEXT,
ADD COLUMN IF NOT EXISTS original_media_url TEXT;

ALTER TABLE public.organization_social_media_organique_tiktok
ADD COLUMN IF NOT EXISTS storage_path TEXT,
ADD COLUMN IF NOT EXISTS original_cover_url TEXT;

-- Competitor social media tables
ALTER TABLE public.organization_social_media_organique_competitor_instagram
ADD COLUMN IF NOT EXISTS storage_path TEXT,
ADD COLUMN IF NOT EXISTS original_image_url TEXT;

ALTER TABLE public.organization_social_media_organique_competitor_facebook
ADD COLUMN IF NOT EXISTS storage_path TEXT,
ADD COLUMN IF NOT EXISTS original_image_url TEXT;

ALTER TABLE public.organization_social_media_organique_competitor_linkedin
ADD COLUMN IF NOT EXISTS storage_path TEXT,
ADD COLUMN IF NOT EXISTS original_media_url TEXT;

ALTER TABLE public.organization_social_media_organique_competitor_tiktok
ADD COLUMN IF NOT EXISTS storage_path TEXT,
ADD COLUMN IF NOT EXISTS original_cover_url TEXT;

-- Add indexes for efficient queries on storage_path
CREATE INDEX IF NOT EXISTS idx_org_articles_storage ON public.organization_articles(storage_path) WHERE storage_path IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_comp_articles_storage ON public.competitor_articles(storage_path) WHERE storage_path IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_client_articles_storage ON public.client_articles(storage_path) WHERE storage_path IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_market_watch_storage ON public.market_watch_topics(storage_path) WHERE storage_path IS NOT NULL;