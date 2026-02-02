-- Create socialy_articles table (similar to competitor_articles but for Socialy brand monitoring)
CREATE TABLE public.socialy_articles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  link TEXT NOT NULL,
  snippet TEXT,
  thumbnail TEXT,
  thumbnail_small TEXT,
  source_name TEXT,
  source_icon TEXT,
  authors TEXT,
  article_date TEXT,
  article_iso_date TIMESTAMP WITH TIME ZONE,
  position INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
  
  -- Unique constraint for UPSERT strategy (same article link per user)
  CONSTRAINT socialy_articles_user_link_unique UNIQUE (user_id, link)
);

-- Enable Row Level Security
ALTER TABLE public.socialy_articles ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own socialy articles" 
ON public.socialy_articles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own socialy articles" 
ON public.socialy_articles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own socialy articles" 
ON public.socialy_articles 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own socialy articles" 
ON public.socialy_articles 
FOR DELETE 
USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_socialy_articles_updated_at
BEFORE UPDATE ON public.socialy_articles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();