
ALTER TABLE organization_articles 
ADD CONSTRAINT organization_articles_organization_id_link_key UNIQUE (organization_id, link);

ALTER TABLE competitor_articles 
ADD CONSTRAINT competitor_articles_organization_id_agency_id_link_key UNIQUE (organization_id, agency_id, link);
