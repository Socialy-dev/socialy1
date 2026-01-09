-- Add media_specialty column to journalists table
ALTER TABLE public.journalists
ADD COLUMN media_specialty text;

-- Add comment for documentation
COMMENT ON COLUMN public.journalists.media_specialty IS 'Specialty of the media outlet (e.g., Tech, Fashion, Business, etc.)';