-- Change authors from TEXT[] to TEXT (plain text for easier n8n integration)
ALTER TABLE public.competitor_articles 
ALTER COLUMN authors TYPE TEXT;