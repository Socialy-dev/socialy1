ALTER TABLE public.generated_posts_linkedin 
ADD COLUMN generated_content_v1 text,
ADD COLUMN generated_content_v2 text;

ALTER TABLE public.generated_posts_linkedin 
DROP COLUMN IF EXISTS generated_content;