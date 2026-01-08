-- Create journalists table
CREATE TABLE public.journalists (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    name TEXT NOT NULL,
    media TEXT,
    linkedin TEXT,
    email TEXT,
    phone TEXT,
    notes TEXT,
    source_article_id UUID,
    source_type TEXT, -- 'socialy' or 'competitor'
    competitor_name TEXT, -- For competitor articles, store which agency
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
    UNIQUE(user_id, name, media) -- Avoid duplicates for same journalist
);

-- Enable RLS
ALTER TABLE public.journalists ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view their own journalists"
ON public.journalists FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own journalists"
ON public.journalists FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own journalists"
ON public.journalists FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own journalists"
ON public.journalists FOR DELETE
USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_journalists_updated_at
BEFORE UPDATE ON public.journalists
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Function to extract journalists from socialy_articles
CREATE OR REPLACE FUNCTION public.extract_journalist_from_socialy_article()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
    -- Only process if authors field is not null/empty
    IF NEW.authors IS NOT NULL AND NEW.authors != '' THEN
        INSERT INTO public.journalists (user_id, name, media, source_article_id, source_type)
        VALUES (NEW.user_id, TRIM(NEW.authors), NEW.source_name, NEW.id, 'socialy')
        ON CONFLICT (user_id, name, media) DO NOTHING;
    END IF;
    RETURN NEW;
END;
$$;

-- Function to extract journalists from competitor_articles
CREATE OR REPLACE FUNCTION public.extract_journalist_from_competitor_article()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
    -- Only process if authors field is not null/empty
    IF NEW.authors IS NOT NULL AND NEW.authors != '' THEN
        INSERT INTO public.journalists (user_id, name, media, source_article_id, source_type, competitor_name)
        VALUES (NEW.user_id, TRIM(NEW.authors), NEW.source_name, NEW.id, 'competitor', NEW.competitor_name)
        ON CONFLICT (user_id, name, media) DO NOTHING;
    END IF;
    RETURN NEW;
END;
$$;

-- Trigger on socialy_articles
CREATE TRIGGER extract_journalist_from_socialy
AFTER INSERT ON public.socialy_articles
FOR EACH ROW
EXECUTE FUNCTION public.extract_journalist_from_socialy_article();

-- Trigger on competitor_articles
CREATE TRIGGER extract_journalist_from_competitor
AFTER INSERT ON public.competitor_articles
FOR EACH ROW
EXECUTE FUNCTION public.extract_journalist_from_competitor_article();

-- Populate journalists from existing articles (one-time migration)
INSERT INTO public.journalists (user_id, name, media, source_article_id, source_type)
SELECT DISTINCT user_id, TRIM(authors), source_name, id, 'socialy'
FROM public.socialy_articles
WHERE authors IS NOT NULL AND authors != ''
ON CONFLICT (user_id, name, media) DO NOTHING;

INSERT INTO public.journalists (user_id, name, media, source_article_id, source_type, competitor_name)
SELECT DISTINCT user_id, TRIM(authors), source_name, id, 'competitor', competitor_name
FROM public.competitor_articles
WHERE authors IS NOT NULL AND authors != ''
ON CONFLICT (user_id, name, media) DO NOTHING;