ALTER TABLE public.competitor_agencies
ADD COLUMN IF NOT EXISTS category text NOT NULL DEFAULT 'organic_social_media';

COMMENT ON COLUMN public.competitor_agencies.category IS 'Category of competitor: organic_social_media, presse, ads, etc.';