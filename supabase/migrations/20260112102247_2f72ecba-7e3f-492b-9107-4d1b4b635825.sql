ALTER TABLE public.socialy_articles 
ADD COLUMN IF NOT EXISTS hidden boolean NOT NULL DEFAULT false;

ALTER TABLE public.competitor_articles 
ADD COLUMN IF NOT EXISTS hidden boolean NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_socialy_articles_hidden ON public.socialy_articles(hidden);
CREATE INDEX IF NOT EXISTS idx_competitor_articles_hidden ON public.competitor_articles(hidden);