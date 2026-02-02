-- Drop the journalists table (causes RLS warnings)
DROP TABLE IF EXISTS public.journalists;

-- Add competitor_name column to competitor_articles for convenience
ALTER TABLE public.competitor_articles 
ADD COLUMN competitor_name TEXT;