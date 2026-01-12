
UPDATE organization_articles 
SET organization_id = 'bd54397b-72af-40a8-aa45-8cab34232254'
WHERE organization_id IS NULL;

UPDATE competitor_articles 
SET organization_id = 'bd54397b-72af-40a8-aa45-8cab34232254'
WHERE organization_id IS NULL;

UPDATE competitor_agencies 
SET organization_id = 'bd54397b-72af-40a8-aa45-8cab34232254'
WHERE organization_id IS NULL;

UPDATE journalists 
SET organization_id = 'bd54397b-72af-40a8-aa45-8cab34232254'
WHERE organization_id IS NULL;

UPDATE communique_presse 
SET organization_id = 'bd54397b-72af-40a8-aa45-8cab34232254'
WHERE organization_id IS NULL;

ALTER TABLE organization_articles ALTER COLUMN organization_id SET NOT NULL;
ALTER TABLE competitor_articles ALTER COLUMN organization_id SET NOT NULL;
ALTER TABLE competitor_agencies ALTER COLUMN organization_id SET NOT NULL;
ALTER TABLE journalists ALTER COLUMN organization_id SET NOT NULL;

DROP TABLE IF EXISTS socialy_articles;
