ALTER TABLE public.competitor_agencies
ADD COLUMN IF NOT EXISTS logo_url text,
ADD COLUMN IF NOT EXISTS tiktok_url text,
ADD COLUMN IF NOT EXISTS instagram_url text,
ADD COLUMN IF NOT EXISTS facebook_url text;