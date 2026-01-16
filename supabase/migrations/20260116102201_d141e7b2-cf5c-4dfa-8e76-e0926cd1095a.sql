ALTER TABLE public.client_articles
ADD CONSTRAINT client_articles_org_client_link_unique 
UNIQUE (organization_id, client_id, link);