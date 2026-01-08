-- Add unique constraint on (user_id, name) for upsert support
ALTER TABLE public.competitor_agencies 
ADD CONSTRAINT competitor_agencies_user_id_name_unique UNIQUE (user_id, name);

-- Create competitor_articles table linked to competitor_agencies
CREATE TABLE public.competitor_articles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  agency_id UUID NOT NULL REFERENCES public.competitor_agencies(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  link TEXT NOT NULL,
  thumbnail TEXT,
  thumbnail_small TEXT,
  source_name TEXT,
  source_icon TEXT,
  authors TEXT[],
  article_date TEXT,
  article_iso_date TIMESTAMP WITH TIME ZONE,
  snippet TEXT,
  position INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT competitor_articles_link_agency_unique UNIQUE (agency_id, link)
);

-- Enable RLS
ALTER TABLE public.competitor_articles ENABLE ROW LEVEL SECURITY;

-- RLS policies for competitor_articles
CREATE POLICY "Users can view their own articles"
ON public.competitor_articles
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own articles"
ON public.competitor_articles
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own articles"
ON public.competitor_articles
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own articles"
ON public.competitor_articles
FOR DELETE
USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_competitor_articles_updated_at
BEFORE UPDATE ON public.competitor_articles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();