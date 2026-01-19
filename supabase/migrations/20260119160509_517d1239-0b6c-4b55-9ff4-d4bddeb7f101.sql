ALTER TABLE public.organization_social_media_organique_facebook 
DROP CONSTRAINT IF EXISTS organization_social_media_organique_facebook_organization_id_facebook_url_key;

ALTER TABLE public.organization_social_media_organique_facebook 
RENAME COLUMN facebook_url TO page_url;

ALTER TABLE public.organization_social_media_organique_facebook 
ADD COLUMN post_url TEXT NOT NULL DEFAULT '';

ALTER TABLE public.organization_social_media_organique_facebook 
ALTER COLUMN post_url DROP DEFAULT;

ALTER TABLE public.organization_social_media_organique_facebook 
ADD CONSTRAINT organization_social_media_organique_facebook_org_post_url_key 
UNIQUE(organization_id, post_url);