
ALTER TABLE public.competitor_articles 
RENAME COLUMN agency_id TO competitor_id;

DROP INDEX IF EXISTS idx_competitor_articles_unique;

ALTER TABLE public.competitor_articles
DROP CONSTRAINT IF EXISTS competitor_articles_organization_id_agency_id_link_key;

ALTER TABLE public.competitor_articles
ADD CONSTRAINT competitor_articles_org_link_unique UNIQUE (organization_id, link);
