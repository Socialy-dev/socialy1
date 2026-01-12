
ALTER TABLE public.competitor_articles
DROP CONSTRAINT IF EXISTS competitor_articles_org_link_unique;

ALTER TABLE public.competitor_articles
ADD CONSTRAINT competitor_articles_org_competitor_link_unique 
UNIQUE (organization_id, competitor_id, link);
