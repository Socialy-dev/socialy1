ALTER TABLE public.meta_connections 
ADD COLUMN IF NOT EXISTS ad_account_details JSONB DEFAULT '[]'::jsonb;